function zyoPowSolve(input) {
    var K = new Uint32Array([
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ]);

    var W = new Uint32Array(64);
    var block = new Uint8Array(128);
    var out = new Uint32Array(8);

    function digest(length) {
        var blocks = ((length + 8) >> 6) + 1;
        var total = blocks << 6;
        for (var p = length; p < total; p++) block[p] = 0;
        block[length] = 0x80;
        var bits = length * 8;
        block[total - 4] = (bits >>> 24) & 0xff;
        block[total - 3] = (bits >>> 16) & 0xff;
        block[total - 2] = (bits >>> 8) & 0xff;
        block[total - 1] = bits & 0xff;

        var a = 0x6a09e667, b = 0xbb67ae85, c = 0x3c6ef372, d = 0xa54ff53a;
        var e = 0x510e527f, f = 0x9b05688c, g = 0x1f83d9ab, h = 0x5be0cd19;

        for (var i = 0; i < blocks; i++) {
            var o = i << 6;
            for (var j = 0; j < 16; j++) {
                var k = o + (j << 2);
                W[j] = (block[k] << 24) | (block[k + 1] << 16) | (block[k + 2] << 8) | block[k + 3];
            }
            for (var j2 = 16; j2 < 64; j2++) {
                var x = W[j2 - 15], y = W[j2 - 2];
                var s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
                var s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
                W[j2] = (W[j2 - 16] + s0 + W[j2 - 7] + s1) | 0;
            }
            var A = a, B = b, C = c, D = d, E = e, F = f, G = g, H = h;
            for (var r = 0; r < 64; r++) {
                var S1 = ((E >>> 6) | (E << 26)) ^ ((E >>> 11) | (E << 21)) ^ ((E >>> 25) | (E << 7));
                var t1 = (H + S1 + ((E & F) ^ (~E & G)) + K[r] + W[r]) | 0;
                var S0 = ((A >>> 2) | (A << 30)) ^ ((A >>> 13) | (A << 19)) ^ ((A >>> 22) | (A << 10));
                var t2 = (S0 + ((A & B) ^ (A & C) ^ (B & C))) | 0;
                H = G; G = F; F = E; E = (D + t1) | 0;
                D = C; C = B; B = A; A = (t1 + t2) | 0;
            }
            a = (a + A) | 0; b = (b + B) | 0; c = (c + C) | 0; d = (d + D) | 0;
            e = (e + E) | 0; f = (f + F) | 0; g = (g + G) | 0; h = (h + H) | 0;
        }
        out[0] = a; out[1] = b; out[2] = c; out[3] = d;
        out[4] = e; out[5] = f; out[6] = g; out[7] = h;
    }

    var seed = String(input.seed);
    var difficulty = Number(input.difficulty);
    var prefixLength = 0;
    for (var s = 0; s < seed.length; s++) block[prefixLength++] = seed.charCodeAt(s) & 0xff;
    block[prefixLength++] = 58;

    var fullWords = difficulty >> 5;
    var restBits = difficulty & 31;
    var digits = new Uint8Array(16);

    for (var nonce = 0; nonce < 4294967295; nonce++) {
        var length = prefixLength;
        if (nonce === 0) {
            block[length++] = 48;
        } else {
            var count = 0;
            for (var v = nonce; v > 0; v = (v / 10) | 0) digits[count++] = 48 + (v % 10);
            while (count > 0) block[length++] = digits[--count];
        }

        digest(length);

        var ok = true;
        for (var w = 0; w < fullWords; w++) {
            if (out[w] !== 0) { ok = false; break; }
        }
        if (ok && restBits > 0 && (out[fullWords] >>> (32 - restBits)) !== 0) ok = false;

        if (ok) {
            self.postMessage({ nonce: String(nonce) });
            return;
        }

        if ((nonce & 0x3ffff) === 0x3ffff) {
            self.postMessage({ progress: Math.round((nonce / Math.pow(2, difficulty)) * 60) });
        }
    }

    self.postMessage({ nonce: null });
}

self.onmessage = function (event) {
    zyoPowSolve(event.data);
};
