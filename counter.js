// Vercel serverless function: views + likes counter stored in Redis (Upstash).
// Env vars needed: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
//   (Vercel's Upstash integration may name them KV_REST_API_URL / KV_REST_API_TOKEN - both work)
// Optional: OWNER_KEY (your secret, not counted), BASE_LIKES, BASE_VIEWS (start numbers)

const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

async function redis(cmd) {
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (!URL_ || !TOKEN) {
    return res.status(500).json({ error: 'Redis is not configured' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  const q = req.query || {};
  const isPost = req.method === 'POST';

  const action = isPost ? String(body.action || 'stats') : 'stats';
  const vid = String((isPost ? body.vid : q.vid) || '');
  const ownerGiven = String((isPost ? body.owner : q.owner) || '');
  const isOwner = !!process.env.OWNER_KEY && ownerGiven === process.env.OWNER_KEY;
  const validVid = /^[A-Za-z0-9-]{8,64}$/.test(vid);

  try {
    if (!isOwner && validVid) {
      if (action === 'view') {
        // one view per visitor per 6 hours
        const ok = await redis(['SET', 'zyo:view:' + vid, '1', 'NX', 'EX', '21600']);
        if (ok === 'OK') await redis(['INCR', 'zyo:views']);
      } else if (action === 'like') {
        await redis(['SADD', 'zyo:likers', vid]);
      } else if (action === 'unlike') {
        await redis(['SREM', 'zyo:likers', vid]);
      }
    }

    const [views, likes, liked] = await Promise.all([
      redis(['GET', 'zyo:views']),
      redis(['SCARD', 'zyo:likers']),
      validVid ? redis(['SISMEMBER', 'zyo:likers', vid]) : Promise.resolve(0),
    ]);

    return res.status(200).json({
      views: Number(process.env.BASE_VIEWS || 0) + Number(views || 0),
      likes: Number(process.env.BASE_LIKES || 0) + Number(likes || 0),
      liked: Number(liked) === 1,
    });
  } catch (e) {
    return res.status(500).json({ error: 'counter failed' });
  }
};
