'use strict';

/**
 * /api/counter  —  đếm tim (like) và lượt xem cho trang bio, chạy trên Vercel.
 *
 * Lưu dữ liệu bằng Upstash Redis (Vercel Marketplace), gọi qua REST nên KHÔNG cần cài gói nào.
 * Biến môi trường (Vercel tự thêm khi bạn connect Upstash Redis vào project):
 *   KV_REST_API_URL  +  KV_REST_API_TOKEN          (hoặc UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
 *
 * Biến tuỳ chọn:
 *   COUNTER_START_LIKES  số tim ban đầu           (mặc định 2  — khớp số đang ghi sẵn trong HTML)
 *   COUNTER_START_VIEWS  số lượt xem ban đầu      (mặc định 57 — khớp số đang ghi sẵn trong HTML)
 *   OWNER_KEY            khoá chủ trang: mở web với ?owner=<khoá> thì lượt của bạn không bị tính
 *   COUNTER_RATE_LIMIT   số request tối đa / phút / IP (mặc định 40)
 *   COUNTER_PREFIX       tiền tố key trong Redis (mặc định "bio")
 *
 * Quy tắc đếm:
 *   - view   : khách mới +1 ngay; cùng một khách chỉ được +1 lại sau 24 giờ.
 *   - like   : mỗi khách tối đa 1 tim (bấm lại không cộng dồn); unlike thì trừ tim của chính khách đó.
 *   - stats  : chỉ đọc số liệu, không đếm gì.
 *
 * Giao thức (khớp với trang index.html):
 *   POST /api/counter   { action: 'view'|'like'|'unlike'|'stats', vid: '<id khách>', owner: '<khoá>' }
 *   =>  { likes: number, views: number, liked: boolean }
 */

const crypto = require('crypto');

const DAY_SECONDS = 24 * 60 * 60;
const ACTIONS = ['view', 'like', 'unlike', 'stats'];
const VID_RE = /^[A-Za-z0-9_-]{8,64}$/;

// Đọc cấu hình mỗi lần gọi (dễ test, và đổi biến môi trường là có hiệu lực ngay sau khi redeploy)
function cfg() {
    const num = (name, fallback) => {
        const n = parseInt(process.env[name], 10);
        return Number.isFinite(n) && n >= 0 ? n : fallback;
    };
    return {
        url: (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/+$/, ''),
        token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '',
        startLikes: num('COUNTER_START_LIKES', 2),
        startViews: num('COUNTER_START_VIEWS', 57),
        rateLimit: num('COUNTER_RATE_LIMIT', 40),
        ownerKey: process.env.OWNER_KEY || '',
        prefix: process.env.COUNTER_PREFIX || 'bio',
    };
}

// Gửi 1 loạt lệnh Redis trong một request (chạy tuần tự), trả về mảng kết quả
async function redis(c, commands) {
    const r = await fetch(c.url + '/pipeline', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + c.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(commands),
    });
    if (!r.ok) throw new Error('Redis HTTP ' + r.status);
    const out = await r.json();
    return out.map((x) => {
        if (x && x.error) throw new Error('Redis: ' + x.error);
        return x ? x.result : null;
    });
}

function send(res, status, body) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(body));
}

async function readBody(req) {
    let raw;
    try { raw = req.body; } catch (e) { return {}; } // Vercel tự parse JSON; body hỏng thì coi như rỗng
    if (raw !== undefined && raw !== null) {
        if (typeof raw === 'string') {
            try { return JSON.parse(raw) || {}; } catch (e) { return {}; }
        }
        return typeof raw === 'object' ? raw : {};
    }
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
        size += chunk.length;
        if (size > 10000) return {};
        chunks.push(chunk);
    }
    try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') || {}; } catch (e) { return {}; }
}

function safeEqual(a, b) {
    const x = Buffer.from(String(a));
    const y = Buffer.from(String(b));
    return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function clientIp(req) {
    const h = req.headers || {};
    const raw = h['x-vercel-forwarded-for'] || h['x-forwarded-for'] || h['x-real-ip'] || (req.socket && req.socket.remoteAddress) || '';
    return String(raw).split(',')[0].trim() || 'unknown';
}

const toInt = (v) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
};

module.exports = async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        res.setHeader('Allow', 'GET, POST');
        return send(res, 405, { error: 'method not allowed' });
    }

    const c = cfg();
    if (!c.url || !c.token) {
        // Chưa connect Redis: trang sẽ tự chuyển sang chế độ lưu trong trình duyệt
        return send(res, 500, { error: 'Redis chưa được cấu hình' });
    }

    try {
        const body = req.method === 'POST' ? await readBody(req) : {};
        let action = String(body.action || 'stats');
        if (!ACTIONS.includes(action)) return send(res, 400, { error: 'invalid action' });

        const vid = typeof body.vid === 'string' ? body.vid : '';
        const vidOk = VID_RE.test(vid);
        if (action !== 'stats' && !vidOk) return send(res, 400, { error: 'invalid vid' });

        // Chủ trang: không bao giờ làm thay đổi số liệu
        if (c.ownerKey && typeof body.owner === 'string' && body.owner && safeEqual(body.owner, c.ownerKey)) {
            action = 'stats';
        }

        const p = c.prefix;
        const viewsKey = p + ':views';
        const likersKey = p + ':likers';

        // Chống spam: tối đa N request / phút / IP (IP được băm, chỉ lưu 60 giây)
        const ipHash = crypto.createHash('sha256').update(clientIp(req) + ':' + p).digest('hex').slice(0, 24);
        const rlKey = p + ':rl:' + ipHash;
        const [hits] = await redis(c, [['INCR', rlKey], ['EXPIRE', rlKey, 60]]);
        if (toInt(hits) > c.rateLimit) {
            res.setHeader('Retry-After', '60');
            return send(res, 429, { error: 'too many requests' });
        }

        // Lệnh thay đổi dữ liệu (nếu có), sau đó đọc số liệu — gộp trong 1 request
        const pre = [];
        if (action === 'view') pre.push(['SET', p + ':seen:' + vid, '1', 'NX', 'EX', DAY_SECONDS]); // đã đếm trong 24h qua => trả null
        if (action === 'like') pre.push(['SADD', likersKey, vid]);
        if (action === 'unlike') pre.push(['SREM', likersKey, vid]);

        const reads = [['GET', viewsKey], ['SCARD', likersKey]];
        if (vidOk) reads.push(['SISMEMBER', likersKey, vid]);

        const out = await redis(c, pre.concat(reads));
        const tail = out.slice(pre.length);

        let views = toInt(tail[0]);
        const likeCount = toInt(tail[1]);
        const liked = vidOk ? toInt(tail[2]) === 1 : false;

        if (action === 'view' && out[0] === 'OK') {
            const [n] = await redis(c, [['INCR', viewsKey]]); // khách mới / đã qua 24h
            views = toInt(n);
        }

        return send(res, 200, {
            likes: c.startLikes + likeCount,
            views: c.startViews + views,
            liked,
        });
    } catch (err) {
        console.error('[counter]', err && err.message ? err.message : err);
        return send(res, 500, { error: 'counter error' });
    }
};
