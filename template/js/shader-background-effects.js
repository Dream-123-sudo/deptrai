import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';

export const ZYO_SHADER_BACKGROUND_OFFSET = 8;

export const zyoShaderBackgroundPresets = {
    1: { name: 'Chroma Waves', color: '#ffffff', brightness: 1, speed: 0.55, frequency: 0.75, amplitude: 0.45, previewTime: 1.4 },
    2: { name: 'Luminous Flow', color: '#ffffff', brightness: 1.02, speed: 0.58, frequency: 0.8, amplitude: 0.62, previewTime: 2.2 },
    3: { name: 'Aurora Silk', color: '#ffffff', brightness: 0.9, speed: 0.42, frequency: 0.55, amplitude: 0.75, previewTime: 1.8 },
    4: { name: 'Velvet Waves', color: '#ffffff', brightness: 0.98, speed: 0.46, frequency: 0.72, amplitude: 0.58, previewTime: 2.5 },
    5: { name: 'Nebula Drift', color: '#ffffff', brightness: 0.96, speed: 0.42, frequency: 0.68, amplitude: 0.78, previewTime: 2.1 },
    6: { name: 'Soft Horizon', color: '#ffffff', brightness: 0.92, speed: 0.34, frequency: 0.64, amplitude: 0.72, previewTime: 1.9 },
    7: { name: 'Liquid Flow', color: '#ffffff', brightness: 1, speed: 1, frequency: 1, amplitude: 1, previewTime: 9.4969 },
    8: { name: 'Spectrum Warp', color: '#ffffff', brightness: 1, speed: 1, frequency: 1, amplitude: 1, previewTime: 18.03 },
    9: { name: 'Aurora Lines', color: '#ffffff', brightness: 1, speed: 1, frequency: 1, amplitude: 1, previewTime: 11.9922 },
    10: { name: 'Chromatic Pulse', color: '#ffffff', brightness: 1, speed: 0.5, frequency: 1, amplitude: 1, previewTime: 3.9267 },
    11: { name: 'Glitter Warp', color: '#B19EEF', brightness: 1, speed: 1, frequency: 1, amplitude: 1, previewTime: 17.6231 },
    12: { name: 'Light Droplets', color: '#5227FF', brightness: 1, speed: 0.3, frequency: 1, amplitude: 1, previewTime: 388.537 },
    13: { name: 'Lightspeed', color: '#5227FF', brightness: 1, speed: 1, frequency: 1, amplitude: 1, previewTime: 7.339 },
    14: { name: 'Liquid Lines', color: '#ffffff', brightness: 1, speed: 1, frequency: 1, amplitude: 1, previewTime: 34.2111 },
    15: { name: 'Metallic Swirl', color: '#ffffff', brightness: 1, speed: 1, frequency: 1, amplitude: 1, previewTime: 8.385 },
    16: { name: 'Topography', color: '#5227FF', brightness: 1, speed: 1, frequency: 1, amplitude: 1, previewTime: 5.4807 },
    18: { name: 'Gradient Waves', color: '#5227FF', brightness: 1, speed: 0.4, frequency: 1, amplitude: 2.5, previewTime: 6.0531 },
};

export const zyoChromaWavesProps = Object.freeze({
    color: '#ffffff',
    brightness: 1,
    speed: 0.55,
    frequency: 0.75,
    amplitude: 0.45,
    contrast: 1,
    grain: 0.12,
    opacity: 0.82,
});

function normalizeHexColor(value, fallback = '#ffffff') {
    const input = String(value || '').trim();
    if (/^#[0-9a-f]{6}$/i.test(input)) return input.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(input)) {
        return `#${input.slice(1).split('').map((char) => char + char).join('').toLowerCase()}`;
    }
    return fallback;
}

function normalizeChromaWavesProps(props = {}) {
    const input = props && typeof props === 'object' ? props : {};
    const color = normalizeHexColor(input.color, zyoChromaWavesProps.color);
    const clamp = (value, min, max, fallback) => {
        const number = Number(value);
        return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
    };
    return {
        color,
        brightness: clamp(input.brightness, 0, 2, zyoChromaWavesProps.brightness),
        speed: clamp(input.speed, 0.05, 2, zyoChromaWavesProps.speed),
        frequency: clamp(input.frequency, 0.1, 2, zyoChromaWavesProps.frequency),
        amplitude: clamp(input.amplitude, 0, 1, zyoChromaWavesProps.amplitude),
        contrast: clamp(input.contrast, 0.25, 2, zyoChromaWavesProps.contrast),
        grain: clamp(input.grain, 0, 0.3, zyoChromaWavesProps.grain),
        opacity: clamp(input.opacity, 0, 1, zyoChromaWavesProps.opacity),
    };
}

function uniformSnapshot(value) {
    if (typeof value === 'number') return value;
    if (value?.isColor) return `#${value.getHexString()}`;
    if (value?.isVector2 || value?.isVector3 || value?.isVector4) return value.toArray();
    if (Array.isArray(value)) return value.map((item) => uniformSnapshot(item));
    return null;
}

function uniformType(value) {
    if (typeof value === 'number') return 'number';
    if (value?.isColor) return 'color';
    if (value?.isVector2 || value?.isVector3 || value?.isVector4) return 'vector';
    if (Array.isArray(value)) return 'array';
    return 'unsupported';
}

const fragmentShaders = {
    1: `
        precision highp float;
        uniform vec2 uResolution;
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uAccent;
        uniform float uBrightness;
        uniform float uSpeed;
        uniform float uFrequency;
        uniform float uAmplitude;
        uniform float uContrast;
        uniform float uGrain;
        uniform float uOpacity;
        float grain(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
        void main() {
            vec2 uv = gl_FragCoord.xy / uResolution.xy;
            vec2 p = (uv - .5) * vec2(uResolution.x / uResolution.y, 1.0);
            float t = uTime * uSpeed;
            float wave = 0.0;
            wave += sin((p.x * 7.0 + p.y * 3.0) * uFrequency + t * 1.3);
            wave += sin((p.x * -4.0 + p.y * 9.0) * uFrequency - t * 1.7);
            wave += sin(length(p + vec2(.22, -.16)) * 12.0 * uFrequency - t * 2.0);
            wave = smoothstep(.08, .88, wave * .22 * uContrast + .52);
            float highlight = pow(wave, 2.4 + uAmplitude * 2.0);
            vec3 color = mix(vec3(.015, .012, .03), uAccent * .7, wave);
            color = mix(color, uColor, highlight);
            color += (grain(gl_FragCoord.xy + t) - .5) * uGrain;
            float alpha = clamp((wave * .22 + highlight * .78) * uOpacity, 0.0, 1.0);
            gl_FragColor = vec4(color * uBrightness, alpha);
        }
    `,
    2: `
        precision highp float;
        uniform vec2 uResolution;
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uAccent;
        uniform float uBrightness;
        uniform float uFrequency;
        uniform float uAmplitude;
        float flow(vec2 p, float offset, float phase, float width) {
            float x = p.x * uFrequency;
            float y = offset
                + sin(x * 1.45 + phase) * .18
                + sin(x * 2.75 - phase * .72) * .07;
            float d = abs(p.y - y);
            float fade = smoothstep(-1.35, -.55, p.x) * (1.0 - smoothstep(.72, 1.34, p.x));
            return exp(-d * width) * fade;
        }
        void main() {
            vec2 uv = gl_FragCoord.xy / uResolution.xy;
            vec2 p = (uv - .5) * vec2(uResolution.x / uResolution.y, 1.0);
            float t = uTime * .46;
            float soft = 0.0;
            float bright = 0.0;
            for (int i = 0; i < 6; i++) {
                float fi = float(i);
                float offset = -.42 + fi * .16;
                float phase = t * (1.0 + fi * .07) + fi * .95;
                soft += flow(p, offset, phase, 7.0 + uAmplitude * 3.0);
                bright += flow(p, offset, phase, 22.0 + uAmplitude * 10.0);
            }
            float bloom = exp(-length((p - vec2(-.24, -.03)) * vec2(.92, 1.28)) * 1.75);
            float vignette = smoothstep(1.45, .18, length(p));
            vec3 base = vec3(.012, .012, .014);
            vec3 color = base;
            color += mix(uColor, uAccent, .35) * soft * .20;
            color += uColor * bright * .32;
            color += mix(uColor, uAccent, .55) * bloom * vignette * .18;
            float alpha = clamp((soft * .12 + bright * .46 + bloom * vignette * .24) * .82, 0.0, 0.82);
            gl_FragColor = vec4(color * uBrightness, alpha);
        }
    `,
    3: `
        precision highp float;
        uniform vec2 uResolution;
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uAccent;
        uniform float uBrightness;
        uniform float uFrequency;
        uniform float uAmplitude;
        void main() {
            vec2 uv = gl_FragCoord.xy / uResolution.xy;
            vec2 p = uv * 2.0 - 1.0;
            p.x *= uResolution.x / uResolution.y;
            float t = uTime * .42;
            float band = sin((p.y + sin(p.x * 2.4 * uFrequency + t) * .28) * 10.0 * uFrequency - t * 3.0);
            float mist = sin((p.x * 3.0 - p.y * 1.8) * uFrequency + t * 2.0);
            float aurora = smoothstep(.18, .94, band * .28 + mist * .18 + .55);
            float veil = smoothstep(.85, -.25, abs(p.y + sin(p.x * 1.6 + t) * .18));
            vec3 color = mix(vec3(.01, .012, .018), uAccent * .52, veil);
            color += mix(uAccent, uColor, aurora) * aurora * veil * (1.0 + uAmplitude);
            float alpha = clamp((veil * .18 + aurora * veil * .72) * .82, 0.0, 0.82);
            gl_FragColor = vec4(color * uBrightness, alpha);
        }
    `,
    4: `
        precision highp float;
        uniform vec2 uResolution;
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uAccent;
        uniform float uBrightness;
        uniform float uFrequency;
        uniform float uAmplitude;
        void main() {
            vec2 uv = gl_FragCoord.xy / uResolution.xy;
            vec2 p = (uv - .5) * vec2(uResolution.x / uResolution.y, 1.0);
            float t = uTime * .42;
            float folds = 0.0;
            folds += sin((p.x * 2.1 + p.y * .72) * uFrequency + t);
            folds += sin((p.x * -1.35 + p.y * 2.45) * uFrequency - t * 1.18) * .72;
            folds += sin((p.x + sin(p.y * 1.8 + t) * .42) * 4.1 * uFrequency + t * .65) * .38;
            float satin = smoothstep(-.12, .92, folds * .24 + .48);
            float crease = pow(smoothstep(.58, .96, satin), 2.7 + uAmplitude);
            float shadow = smoothstep(.88, -.14, length(p - vec2(.18, -.06)));
            vec3 base = vec3(.011, .010, .015);
            vec3 color = mix(base, uAccent * .22, satin * .45);
            color += uColor * crease * .36;
            color += mix(uColor, uAccent, .52) * shadow * .10;
            float alpha = clamp((satin * .16 + crease * .64 + shadow * .12) * .82, 0.0, 0.82);
            gl_FragColor = vec4(color * uBrightness, alpha);
        }
    `,
    5: `
        precision highp float;
        uniform vec2 uResolution;
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uAccent;
        uniform float uBrightness;
        uniform float uFrequency;
        uniform float uAmplitude;
        float ribbon(vec2 p, float offset, float phase, float width) {
            float y = offset
                + sin(p.x * 1.55 * uFrequency + phase) * .16
                + sin(p.x * 3.25 * uFrequency - phase * .7) * .055;
            float d = abs(p.y - y);
            return exp(-d * width);
        }
        void main() {
            vec2 uv = gl_FragCoord.xy / uResolution.xy;
            vec2 p = (uv - .5) * vec2(uResolution.x / uResolution.y, 1.0);
            float t = uTime * .42;
            float r1 = ribbon(p, -.16, t, 5.0 + uAmplitude * 2.5);
            float r2 = ribbon(p, .08, -t * .82 + 1.7, 4.0 + uAmplitude * 2.0);
            float r3 = ribbon(p, .30, t * .58 + 3.1, 6.5);
            float h1 = ribbon(p, -.16, t, 18.0);
            float h2 = ribbon(p, .08, -t * .82 + 1.7, 16.0);
            float center = exp(-length((p - vec2(.16, -.06)) * vec2(.85, 1.25)) * 1.9);
            float veil = smoothstep(.92, -.2, abs(p.y + sin(p.x * 1.1 + t) * .18));
            vec3 color = vec3(.010, .008, .020);
            color += uAccent * r1 * .44;
            color += uColor * r2 * .40;
            color += mix(uColor, uAccent, .5) * r3 * .26;
            color += uColor * (h1 + h2) * .18;
            color += mix(uColor, uAccent, .35) * center * veil * .24;
            float alpha = clamp((r1 * .18 + r2 * .18 + r3 * .12 + (h1 + h2) * .22 + center * veil * .18) * .82, 0.0, 0.82);
            gl_FragColor = vec4(color * uBrightness, alpha);
        }
    `,
    6: `
        precision highp float;
        uniform vec2 uResolution;
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uAccent;
        uniform float uBrightness;
        uniform float uFrequency;
        uniform float uAmplitude;
        void main() {
            vec2 uv = gl_FragCoord.xy / uResolution.xy;
            vec2 p = (uv - .5) * vec2(uResolution.x / uResolution.y, 1.0);
            float t = uTime * .38;
            float horizon = -.1 + sin(p.x * 1.35 * uFrequency + t) * .11;
            float band = exp(-abs(p.y - horizon) * (3.4 + uAmplitude * 2.6));
            float thin = exp(-abs(p.y - horizon) * 42.0);
            float upperMist = smoothstep(.75, -.18, p.y) * smoothstep(-.7, .28, p.y);
            float lowerMist = smoothstep(.55, -.72, abs(p.y + .34));
            vec3 color = vec3(.006, .01, .014);
            color += uAccent * band * .34;
            color += uColor * thin * .42;
            color += mix(uColor, uAccent, .55) * upperMist * .12;
            color += uColor * lowerMist * .05;
            float alpha = clamp((band * .32 + thin * .50 + upperMist * .08 + lowerMist * .04) * .82, 0.0, 0.82);
            gl_FragColor = vec4(color * uBrightness, alpha);
        }
    `,
    7: `
        precision highp float;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform float uSpeed;
        uniform float uScale;
        uniform float uDistortion;
        uniform float uCurve;
        uniform float uContrast;
        uniform float uRotation;
        uniform float uOffsetX;
        uniform float uOffsetY;
        uniform float uBrightness;
        uniform float uOpacity;
        uniform float uComplexity;
        uniform float uFrequency;
        uniform vec3 uC1;
        uniform vec3 uC2;
        uniform vec3 uC3;
        uniform vec3 uC4;
        uniform vec3 uC5;
        uniform vec3 uC6;
        uniform vec3 uC7;
        uniform vec3 uC8;
        varying vec2 vUv;

        vec2 rotate2D(vec2 p, float angle) {
            float s = sin(angle);
            float c = cos(angle);
            return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
        }

        void main() {
            vec2 pos = vUv * uScale;
            float aspect = uResolution.x / uResolution.y;
            pos.x *= aspect;

            pos.x += uOffsetX;
            pos.y += uOffsetY;

            vec2 center = vec2(aspect * 0.5 * uScale, 0.5 * uScale);
            pos = rotate2D(pos - center, uRotation) + center;

            float iterations = 10.0 + uComplexity * 10.0;

            for (float i = 1.0; i < 30.0; i++) {
                if (i > iterations) break;
                float timeOffset = uTime * uSpeed * 0.1 * i;
                float amp = 0.8 * uDistortion;
                float shift = 0.3 * uCurve;

                pos.x += amp / i * sin(i * pos.y + timeOffset + shift * i) + 1.6;
                pos.y += (amp * 2.0) / i * sin(pos.x + timeOffset + shift * i + 1.6) - 0.8;
            }

            float wave = cos((pos.x + pos.y) * uFrequency) * 0.5 + 0.5;

            vec3 finalColor = vec3(0.0);
            if (wave < 0.15) {
                finalColor = mix(uC1, uC2, wave * 6.667);
            } else if (wave < 0.35) {
                finalColor = mix(uC2, uC3, (wave - 0.15) * 5.0);
            } else if (wave < 0.55) {
                finalColor = mix(uC3, uC4, (wave - 0.35) * 5.0);
            } else if (wave < 0.7) {
                finalColor = mix(uC4, uC5, (wave - 0.55) * 6.667);
            } else if (wave < 0.82) {
                finalColor = mix(uC5, uC6, (wave - 0.7) * 8.333);
            } else if (wave < 0.92) {
                finalColor = mix(uC6, uC7, (wave - 0.82) * 10.0);
            } else {
                finalColor = mix(uC7, uC8, (wave - 0.92) * 12.5);
            }

            finalColor *= uBrightness;
            float alpha = smoothstep(0.01, 1.0, pow(wave, 2.5 * uContrast)) * uOpacity;
            gl_FragColor = vec4(finalColor, alpha);
        }
    `,
    8: `
        #define MAX_COLORS 8
        uniform vec2 uCanvas;
        uniform float uTime;
        uniform float uSpeed;
        uniform vec2 uRot;
        uniform int uColorCount;
        uniform vec3 uColors[MAX_COLORS];
        uniform int uTransparent;
        uniform float uScale;
        uniform float uFrequency;
        uniform float uWarpStrength;
        uniform vec2 uPointer;
        uniform float uMouseInfluence;
        uniform float uParallax;
        uniform float uNoise;
        uniform int uIterations;
        uniform float uIntensity;
        uniform float uBandWidth;
        varying vec2 vUv;

        void main() {
            float t = uTime * uSpeed;
            vec2 p = vUv * 2.0 - 1.0;
            p += uPointer * uParallax * 0.1;
            vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
            vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
            q /= max(uScale, 0.0001);
            q /= 0.5 + 0.2 * dot(q, q);
            q += 0.2 * cos(t) - 7.56;
            vec2 toward = uPointer - rp;
            q += toward * uMouseInfluence * 0.2;

            for (int j = 0; j < 5; j++) {
                if (j >= uIterations - 1) break;
                vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));
                q += (rr - q) * 0.15;
            }

            vec2 s = q;
            vec3 sumCol = vec3(0.0);
            float cover = 0.0;
            for (int i = 0; i < MAX_COLORS; ++i) {
                if (i >= uColorCount) break;
                s -= 0.01;
                vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
                float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
                float kBelow = clamp(uWarpStrength, 0.0, 1.0);
                float kMix = pow(kBelow, 0.3);
                float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
                vec2 disp = (r - s) * kBelow;
                vec2 warped = s + disp * gain;
                float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
                float m = mix(m0, m1, kMix);
                float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
                sumCol += uColors[i] * w;
                cover = max(cover, w);
            }

            vec3 col = clamp(sumCol, 0.0, 1.0) * uIntensity;
            float alpha = uTransparent > 0 ? cover : 1.0;

            if (uNoise > 0.0001) {
                float noise = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
                col = clamp(col + (noise - 0.5) * uNoise, 0.0, 1.0);
            }

            vec3 rgb = uTransparent > 0 ? col * alpha : col;
            gl_FragColor = vec4(rgb, alpha);
        }
    `,
    9: `
        precision highp float;
        uniform float iTime;
        uniform vec3 iResolution;
        uniform float animationSpeed;
        uniform bool enableTop;
        uniform bool enableMiddle;
        uniform bool enableBottom;
        uniform int topLineCount;
        uniform int middleLineCount;
        uniform int bottomLineCount;
        uniform float topLineDistance;
        uniform float middleLineDistance;
        uniform float bottomLineDistance;
        uniform vec3 topWavePosition;
        uniform vec3 middleWavePosition;
        uniform vec3 bottomWavePosition;
        uniform vec2 iMouse;
        uniform bool interactive;
        uniform float bendRadius;
        uniform float bendStrength;
        uniform float bendInfluence;
        uniform bool parallax;
        uniform vec2 parallaxOffset;
        uniform vec3 lineGradient[8];
        uniform int lineGradientCount;

        mat2 rotate(float angle) {
            return mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
        }

        vec3 getLineColor(float t) {
            if (lineGradientCount == 1) return lineGradient[0] * 0.5;
            float scaled = clamp(t, 0.0, 0.9999) * float(lineGradientCount - 1);
            int index = int(floor(scaled));
            float amount = fract(scaled);
            int nextIndex = min(index + 1, lineGradientCount - 1);
            return mix(lineGradient[index], lineGradient[nextIndex], amount) * 0.5;
        }

        float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
            float time = iTime * animationSpeed;
            float amplitude = sin(offset + time * 0.2) * 0.3;
            float y = sin(uv.x + offset + time * 0.1) * amplitude;
            if (shouldBend) {
                vec2 delta = screenUv - mouseUv;
                float influence = exp(-dot(delta, delta) * bendRadius);
                y += (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
            }
            float distanceToLine = uv.y - y;
            return 0.0175 / max(abs(distanceToLine) + 0.01, 0.001) + 0.01;
        }

        void main() {
            vec2 baseUv = (2.0 * gl_FragCoord.xy - iResolution.xy) / iResolution.y;
            baseUv.y *= -1.0;
            if (parallax) baseUv += parallaxOffset;

            vec2 mouseUv = vec2(0.0);
            if (interactive) {
                mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
                mouseUv.y *= -1.0;
            }

            vec3 color = vec3(0.0);

            if (enableBottom) {
                for (int i = 0; i < bottomLineCount; ++i) {
                    float fi = float(i);
                    float t = fi / max(float(bottomLineCount - 1), 1.0);
                    float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
                    vec2 rotatedUv = baseUv * rotate(angle);
                    color += getLineColor(t) * wave(
                        rotatedUv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y),
                        1.5 + 0.2 * fi, baseUv, mouseUv, interactive
                    ) * 0.2;
                }
            }

            if (enableMiddle) {
                for (int i = 0; i < middleLineCount; ++i) {
                    float fi = float(i);
                    float t = fi / max(float(middleLineCount - 1), 1.0);
                    float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
                    vec2 rotatedUv = baseUv * rotate(angle);
                    color += getLineColor(t) * wave(
                        rotatedUv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y),
                        2.0 + 0.15 * fi, baseUv, mouseUv, interactive
                    );
                }
            }

            if (enableTop) {
                for (int i = 0; i < topLineCount; ++i) {
                    float fi = float(i);
                    float t = fi / max(float(topLineCount - 1), 1.0);
                    float angle = topWavePosition.z * log(length(baseUv) + 1.0);
                    vec2 rotatedUv = baseUv * rotate(angle);
                    rotatedUv.x *= -1.0;
                    color += getLineColor(t) * wave(
                        rotatedUv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y),
                        1.0 + 0.2 * fi, baseUv, mouseUv, interactive
                    ) * 0.1;
                }
            }

            float lineOpacity = smoothstep(0.025, 0.55, max(max(color.r, color.g), color.b));
            gl_FragColor = vec4(color, lineOpacity);
        }
    `,
    10: `
        precision mediump float;

        uniform float iTime;
        uniform vec3 iResolution;
        uniform vec3 uColor;
        uniform vec3 uBackgroundColor;
        uniform float uWaveFrequency;
        uniform float uWaveAmplitude;
        uniform float uDistortion;
        uniform float uChromaShift;
        uniform float uNoiseLevel;
        uniform float uFlatness;
        uniform float uOpacity;

        vec4 permute(vec4 x) {
            return mod(((x * 34.0) + 1.0) * x, 289.0);
        }

        vec4 taylorInvSqrt(vec4 r) {
            return 1.79284291400159 - 0.85373472095314 * r;
        }

        vec3 fade(vec3 t) {
            return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
        }

        float cnoise(vec3 P) {
            vec3 Pi0 = floor(P);
            vec3 Pi1 = Pi0 + vec3(1.0);
            Pi0 = mod(Pi0, 289.0);
            Pi1 = mod(Pi1, 289.0);
            vec3 Pf0 = fract(P);
            vec3 Pf1 = Pf0 - vec3(1.0);
            vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
            vec4 iy = vec4(Pi0.yy, Pi1.yy);
            vec4 iz0 = Pi0.zzzz;
            vec4 iz1 = Pi1.zzzz;
            vec4 ixy = permute(permute(ix) + iy);
            vec4 ixy0 = permute(ixy + iz0);
            vec4 ixy1 = permute(ixy + iz1);
            vec4 gx0 = ixy0 / 7.0;
            vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
            gx0 = fract(gx0);
            vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
            vec4 sz0 = step(gz0, vec4(0.0));
            gx0 -= sz0 * (step(0.0, gx0) - 0.5);
            gy0 -= sz0 * (step(0.0, gy0) - 0.5);
            vec4 gx1 = ixy1 / 7.0;
            vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
            gx1 = fract(gx1);
            vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
            vec4 sz1 = step(gz1, vec4(0.0));
            gx1 -= sz1 * (step(0.0, gx1) - 0.5);
            gy1 -= sz1 * (step(0.0, gy1) - 0.5);
            vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
            vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
            vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
            vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
            vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
            vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
            vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
            vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);
            vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
            g000 *= norm0.x;
            g010 *= norm0.y;
            g100 *= norm0.z;
            g110 *= norm0.w;
            vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
            g001 *= norm1.x;
            g011 *= norm1.y;
            g101 *= norm1.z;
            g111 *= norm1.w;
            float n000 = dot(g000, Pf0);
            float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
            float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
            float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
            float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
            float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
            float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
            float n111 = dot(g111, Pf1);
            vec3 fadeXYZ = fade(Pf0);
            vec4 nZ = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fadeXYZ.z);
            vec2 nYZ = mix(nZ.xy, nZ.zw, fadeXYZ.y);
            return 2.2 * mix(nYZ.x, nYZ.y, fadeXYZ.x);
        }

        float rand(vec2 co) {
            return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / iResolution.xy;
            vec2 center = vec2(0.5);
            float baseTime = iTime * 0.1;
            float timeDelay = uChromaShift * 0.08;
            float bSquared = uFlatness * uFlatness;
            float numerator = 1.0 + bSquared;
            vec3 intensity;

            for (int i = 0; i < 3; i++) {
                float timeOffset = float(i) * timeDelay;
                vec2 distortedUv = uv;
                distortedUv.x += cnoise(vec3(1.8 * uv, baseTime + timeOffset)) * uDistortion * 0.8;
                float normalizedDistance = 1.0 - length(distortedUv - center) / 0.70710678;
                float x = uWaveFrequency * 100.0 * normalizedDistance * uWaveAmplitude;
                float cosX = cos(x);
                float denominator = 1.0 + bSquared * cosX * cosX;
                float waveValue = sqrt(numerator / denominator) * cosX * 0.5 + 0.5;
                if (uNoiseLevel > 0.01) {
                    float noise = rand(distortedUv * 1000.0);
                    waveValue = mix(waveValue, noise, uNoiseLevel);
                }
                intensity[i] = waveValue;
            }

            vec3 finalColor = mix(uBackgroundColor, uColor, intensity);
            float alpha = (intensity.r + intensity.g + intensity.b) * 0.333333 * uOpacity;
            gl_FragColor = vec4(finalColor, alpha);
        }
    `,
    11: `
        precision highp float;
        uniform float iTime;
        uniform vec3 iResolution;
        uniform vec3 uColor;
        uniform float uDensity;
        uniform float uBrightness;
        uniform float uStarSize;
        uniform float uFocalDepth;
        uniform float uTurbulence;

        void main() {
            vec2 screenPos = gl_FragCoord.xy;
            vec2 centerOffset = screenPos - (iResolution.xy * 0.5);
            vec2 normalizedCoords = centerOffset / iResolution.y;

            vec3 viewDirection = normalize(vec3(normalizedCoords, uFocalDepth));
            vec3 travelOffset = vec3(0.0, 0.0, iTime);
            vec3 spacePosition = (viewDirection * uDensity) + travelOffset;

            if (uTurbulence > 0.0) {
                spacePosition.x += sin(spacePosition.z * 0.5 + iTime) * uTurbulence;
                spacePosition.y += cos(spacePosition.z * 0.3 + iTime * 0.7) * uTurbulence;
            }

            vec3 gridCell = floor(spacePosition);
            vec3 cellOffset = fract(spacePosition);
            vec3 hashVector = vec3(2.154, -6.21, 0.42);
            vec3 starPosition = fract(cross(gridCell, hashVector));
            starPosition = (starPosition * 0.5) + 0.25;

            float distToStar = distance(cellOffset, starPosition);
            float intensityFalloff = uStarSize - distToStar;
            float starIntensity = max(0.0, intensityFalloff * 10.0 * uBrightness);
            starIntensity = starIntensity * starIntensity;

            if (starIntensity < 0.01) {
                gl_FragColor = vec4(0.0);
                return;
            }

            vec3 finalColor = uColor * starIntensity;
            gl_FragColor = vec4(finalColor, starIntensity);
        }
    `,
    12: `
        precision highp float;
        uniform float iTime;
        uniform vec2 iResolution;
        uniform vec3 uColor;
        uniform float uColumnCount;
        uniform float uStretch;
        uniform float uTrailLength;
        uniform float uRotationSpeed;
        uniform float uRotation;
        uniform float uIntensity;
        uniform float uThickness;
        uniform float uEnableRotation;
        uniform float uTransparent;

        const float TWO_PI = 6.28318530718;
        const float HALF_PI = 1.57079632679;

        mat2 createRotationMatrix(float angle) {
            float cosA = cos(angle);
            float sinA = sin(angle);
            return mat2(cosA, sinA, -sinA, cosA);
        }

        void main() {
            vec2 coord = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
            float distanceFromCenter = length(coord * 0.2);

            if (uEnableRotation > 0.5) {
                float rotationAngle = distanceFromCenter + fract(iTime * 0.025 * uRotationSpeed) * TWO_PI;
                coord *= createRotationMatrix(rotationAngle);
            } else if (abs(uRotation) > 0.001) {
                float rotationAngle = distanceFromCenter + uRotation;
                coord *= createRotationMatrix(rotationAngle);
            } else {
                coord *= createRotationMatrix(distanceFromCenter);
            }

            coord.x *= uColumnCount;
            float columnFraction = fract(coord.x);
            float columnIndex = floor(coord.x);
            float animTime = iTime * 0.4;
            coord.y *= uStretch;
            float randomOffset = sin(columnIndex * 215.4);
            float speedVariation = cos(columnIndex * 33.1) * 0.3 + 0.7;
            float dynamicTrail = mix(uTrailLength * 1.5, uTrailLength * 0.5, speedVariation);
            float verticalPos = fract(coord.y + animTime * speedVariation + randomOffset) * dynamicTrail;
            verticalPos = 1.0 / verticalPos;
            verticalPos = smoothstep(0.0, 1.0, verticalPos * verticalPos);
            verticalPos = sin(verticalPos * HALF_PI * 2.0) * (speedVariation * 5.0);
            float horizontalFade = sin(columnFraction * HALF_PI * 2.0);
            horizontalFade = pow(horizontalFade, 1.0 / max(uThickness, 0.1));
            verticalPos *= horizontalFade * horizontalFade;
            vec3 finalColor = uColor * verticalPos * uIntensity;

            if (uTransparent > 0.5) {
                float alpha = max(max(finalColor.r, finalColor.g), finalColor.b);
                gl_FragColor = vec4(finalColor, alpha);
            } else {
                gl_FragColor = vec4(finalColor, 1.0);
            }
        }
    `,
    13: `
        precision highp float;
        #define PI 3.14159265359

        uniform float iTime;
        uniform vec2 iResolution;
        uniform vec4 iMouse;
        uniform float uCompression;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform float uStreakCount;
        uniform float uStretchFactor;
        uniform float uIntensity;
        uniform float uSpeed;
        uniform float uRotation;
        uniform float uFadePower;
        uniform float uOpacity;

        float computeStreak(vec2 coord, float timeOffset) {
            coord.x *= uStreakCount;
            float horizontalPos = fract(coord.x);
            float columnIndex = floor(coord.x);
            coord.y *= uStretchFactor;
            float randomOffset = sin(columnIndex * 215.4);
            float speedVariation = cos(columnIndex * 33.1) * 0.3 + 0.7;
            float dynamicTrail = mix(95.0, 35.0, speedVariation);
            float animatedY = fract(coord.y + timeOffset * speedVariation + randomOffset);
            float streakValue = animatedY * dynamicTrail;
            streakValue = 1.0 / streakValue;
            streakValue = smoothstep(0.0, 1.0, streakValue * streakValue);
            streakValue = sin(streakValue * PI) * (speedVariation * 5.0);
            float horizontalFalloff = sin(horizontalPos * PI);
            return streakValue * horizontalFalloff * horizontalFalloff;
        }

        void main() {
            vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution) / iResolution.y;
            float distFromCenter = length(uv) + 0.1;
            float angle = atan(uv.x, uv.y) / PI + uRotation;
            float radius = 2.5 / distFromCenter;
            vec2 polarCoord = vec2(angle, radius);
            polarCoord.y *= mix(1.0, 0.5, uCompression);
            float animTime = iTime * 0.4 * uSpeed;
            vec3 finalColor = vec3(0.0);
            finalColor += uColor1 * computeStreak(polarCoord, animTime);
            finalColor += uColor2 * computeStreak(polarCoord, animTime + 0.33);
            finalColor += uColor3 * computeStreak(polarCoord, animTime + 0.66);
            finalColor *= uIntensity * pow(distFromCenter, uFadePower) * uOpacity;
            float alpha = max(max(finalColor.r, finalColor.g), finalColor.b);
            gl_FragColor = vec4(finalColor, alpha);
        }
    `,
    14: `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform float u_speed;
        uniform int u_iterations;
        uniform float u_waveFrequency;
        uniform float u_depthStep;
        uniform float u_lineThickness;
        uniform float u_waveAmplitude;
        uniform vec3 u_lineColor;
        uniform vec3 u_backgroundColor;
        uniform float u_brightness;
        uniform float u_contrast;
        uniform float u_offsetX;
        uniform float u_offsetY;
        uniform float u_scale;
        uniform float u_opacity;
        varying vec2 vUv;

        void main() {
            float time = u_time * u_speed;
            vec3 accumulator = vec3(0.0);
            float depth = time;
            float magnitude = 0.0;
            vec2 baseCoord = (vUv - 0.5) * 2.0;
            baseCoord.x *= u_resolution.x / u_resolution.y;
            baseCoord *= u_scale;
            baseCoord += vec2(u_offsetX, u_offsetY);

            for (int i = 0; i < 100; i++) {
                if (i >= u_iterations) break;
                vec2 coord = baseCoord;
                vec2 waveCoord = coord;
                coord -= waveCoord.x + 0.1;
                coord.x *= u_resolution.x / u_resolution.y;
                depth += u_depthStep;
                magnitude = length(coord);
                float phase1 = depth * 0.7;
                float phase2 = depth * 1.3;
                float wave1 = sin(phase1) * 0.5 + cos(phase2) * 0.5 + 1.5;
                float wave2 = sin(magnitude * u_waveFrequency - depth) * 0.7
                    + cos(magnitude * u_waveFrequency * 0.5 + depth * 0.3) * 0.3;
                waveCoord += coord / max(magnitude, 0.01) * wave1 * wave2 * u_waveAmplitude;
                vec2 gridPos = mod(waveCoord, 1.0) - 0.5;
                float lineIntensity = u_lineThickness / length(gridPos);
                if (i == 0) accumulator.r = lineIntensity;
                else if (i == 1) accumulator.g = lineIntensity;
                else if (i == 2) accumulator.b = lineIntensity;
                else accumulator += vec3(lineIntensity) * 0.01;
            }

            accumulator /= max(magnitude, 0.001);
            accumulator = (accumulator - 0.5) * u_contrast + 0.5;
            accumulator *= u_brightness;
            float lineValue = clamp((accumulator.r + accumulator.g + accumulator.b) / 3.0, 0.0, 1.0);
            vec3 finalColor = lineValue * u_lineColor;
            float alpha = clamp(lineValue * u_opacity, 0.0, 1.0);
            finalColor = mix(u_backgroundColor, finalColor, alpha);
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `,
    15: `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uRes;
        uniform float uSpeed;
        uniform float uZoom;
        uniform int uIter;
        uniform float uEps;
        uniform float uTangent;
        uniform float uGrad;
        uniform vec3 uPhase;
        uniform float uRange;
        uniform float uBias;
        uniform float uBright;
        uniform vec3 uBg;
        uniform vec3 uTint;
        uniform float uAlpha;
        uniform vec2 uPointer;
        uniform float uCursorActive;
        uniform float uCursorIntensity;

        float wave(vec2 p, float t) {
            return sin(p.x + sin(p.y + t * 0.1)) * sin(p.y * p.x * 0.1 + t * 0.2);
        }

        void main() {
            vec2 st = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * uZoom;
            float t = uTime * uSpeed;
            vec2 pointerUv = (uPointer - 0.5) * vec2(uRes.x / uRes.y, 1.0) * uZoom;
            float cursorInfluence = smoothstep(3.0, 0.0, length(st - pointerUv)) * uCursorActive * uCursorIntensity;
            vec2 ep = vec2(uEps, 0.0);
            vec2 p = st;
            vec2 outV = vec2(0.0);
            float localTangent = uTangent + cursorInfluence * 0.5;
            float localGrad = uGrad + cursorInfluence * 0.1;
            for (int i = 0; i < 12; i++) {
                if (i >= uIter) break;
                float s0 = wave(p, t);
                float sx = wave(p + ep, t);
                float sy = wave(p + ep.yx, t);
                vec2 g = vec2(sx - s0, sy - s0) / ep.xx;
                vec2 tangent = vec2(-g.y, g.x);
                p += localTangent * tangent + g * localGrad;
                outV = tangent;
            }
            float val = outV.x - outV.y;
            vec3 col = sin(uPhase + val) * uRange + uBias;
            col *= uBright;
            col += cursorInfluence * 0.06 * uBright;
            float lum = dot(col, vec3(0.299, 0.587, 0.114));
            vec3 result = mix(uBg, col, clamp(lum * 4.0, 0.0, 1.0));
            result *= uTint;
            gl_FragColor = vec4(result, uAlpha);
        }
    `,
    16: `
        precision highp float;
        uniform vec2 iResolution;
        uniform float iTime;
        uniform float uMorphAmount;
        uniform float uBands;
        uniform float uThickness;
        uniform float uScale;
        uniform float uPixelSize;
        uniform float uGlow;
        uniform float uColorMode;
        uniform float uContrast;
        uniform float uBrightness;
        uniform float uFillBands;
        uniform float uOpacity;
        uniform vec3 uLow;
        uniform vec3 uMid;
        uniform vec3 uHigh;
        uniform vec2 uMouse;
        uniform float uMouseEnabled;
        uniform float uMouseRadius;
        uniform float uMouseStrength;
        uniform float uMouseActive;
        uniform float uGrain;
        uniform float uGrainIntensity;
        uniform vec4 uCtrlA;
        uniform vec4 uCtrlB;
        uniform vec4 uCtrlC;
        uniform vec4 uCtrlD;

        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
                u.y
            );
        }

        float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            for (int i = 0; i < 5; i++) {
                value += noise(p) * amplitude;
                p = mat2(1.62, 1.18, -1.18, 1.62) * p + 0.17;
                amplitude *= 0.52;
            }
            return value;
        }

        vec2 bezier(float t, vec4 a, vec4 b) {
            vec2 p0 = a.xy;
            vec2 p1 = a.zw;
            vec2 p2 = b.xy;
            vec2 p3 = b.zw;
            float invT = 1.0 - t;
            return invT * invT * invT * p0
                + 3.0 * invT * invT * t * p1
                + 3.0 * invT * t * t * p2
                + t * t * t * p3;
        }

        void main() {
            vec2 frag = gl_FragCoord.xy;
            if (uPixelSize > 1.0) frag = floor(frag / uPixelSize) * uPixelSize;

            vec2 uv = frag / iResolution.xy;
            vec2 p = (uv - 0.5) * vec2(iResolution.x / iResolution.y, 1.0) * uScale;
            float t = iTime * 0.12;

            vec2 pathA = bezier(fract(t * 0.09), uCtrlA, uCtrlB) * 0.12;
            vec2 pathB = bezier(fract(t * 0.07 + 0.5), uCtrlC, uCtrlD) * 0.10;
            vec2 warp = vec2(
                fbm(p * 0.75 + pathA + t),
                fbm(p * 0.82 - pathB - t * 0.8)
            ) - 0.5;
            p += warp * uMorphAmount * 0.22;

            if (uMouseEnabled > 0.5) {
                vec2 mouseUv = (uMouse - 0.5) * vec2(iResolution.x / iResolution.y, 1.0) * uScale;
                float mouseFalloff = smoothstep(uMouseRadius, 0.0, length(p - mouseUv)) * uMouseActive;
                p += normalize(p - mouseUv + 0.0001) * mouseFalloff * uMouseStrength * 0.16;
            }

            float field = fbm(p * 1.35 + vec2(t, -t * 0.7));
            field += 0.22 * sin(p.x * 1.7 + t + field * 2.0);
            field += 0.18 * cos(p.y * 2.2 - t * 1.3);

            float contour = fract(field * max(uBands, 0.1));
            float line = 1.0 - smoothstep(0.0, max(uThickness, 0.0001), min(contour, 1.0 - contour));
            float glow = 1.0 - smoothstep(0.0, max(uThickness * (8.0 + uGlow * 18.0), 0.0001), min(contour, 1.0 - contour));
            float fill = uFillBands > 0.5 ? smoothstep(0.18, 0.92, contour) * 0.18 : 0.0;

            float tone = clamp(pow(line + glow * uGlow * 0.22 + fill, max(uContrast, 0.01)), 0.0, 1.0);
            vec3 palette = mix(uLow, uMid, smoothstep(0.05, 0.72, field));
            palette = mix(palette, uHigh, smoothstep(0.66, 1.18, field));
            vec3 mono = mix(vec3(0.0), uHigh, tone);
            vec3 color = mix(palette * tone, mono, step(0.5, uColorMode));

            if (uGrain > 0.5) {
                float g = hash(frag + iTime * 19.0) - 0.5;
                color += g * uGrainIntensity;
            }

            float vignette = smoothstep(1.35, 0.25, length((uv - 0.5) * vec2(iResolution.x / iResolution.y, 1.0)));
            color *= mix(0.72, 1.0, vignette) * uBrightness;
            gl_FragColor = vec4(color, clamp(tone * uOpacity, 0.0, 1.0));
        }
    `,
    18: `
        precision highp float;
        uniform bool uEnableMouse;
        uniform vec2 iResolution;
        uniform float iTime;
        uniform float uSpeed;
        uniform float uAmplitude;
        uniform float uWaveScale;
        uniform float uWaveRatio;
        uniform float uSwell;
        uniform float uTurbulence;
        uniform float uTilt;
        uniform float uZoom;
        uniform float uHeight;
        uniform float uFogDepth;
        uniform float uSteps;
        uniform float uBrightness;
        uniform float uOpacity;
        uniform float uGrain;
        uniform float uGrainIntensity;
        uniform vec2 uMouse;
        uniform float uParallax;
        uniform vec3 uHorizonColor;
        uniform vec3 uWaveColor;
        uniform vec3 uCrestColor;

        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float waveHeight(vec2 p, float time) {
            float w = 0.0;
            w += sin(p.x * uWaveScale + time) * uAmplitude;
            w += sin((p.x * uWaveRatio + p.y * 0.42) * 1.7 - time * 1.25) * uAmplitude * 0.45;
            w += sin(length(p) * 0.35 * uTurbulence - time * 0.72) * 0.18;
            return w;
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / iResolution.xy;
            vec2 p = (uv - 0.5) * vec2(iResolution.x / iResolution.y, 1.0);
            vec2 mouseOffset = (uMouse - 0.5) * uParallax * float(uEnableMouse);
            p = (p + mouseOffset * 0.14) * uZoom;
            p = mat2(cos(uTilt), -sin(uTilt), sin(uTilt), cos(uTilt)) * p;

            float time = iTime * uSpeed;
            vec3 color = vec3(0.0);
            float alpha = 0.0;
            float steps = max(8.0, min(uSteps, 90.0));
            for (float i = 0.0; i < 90.0; i++) {
                if (i >= steps) break;
                float z = i / steps;
                vec2 samplePos = p * (1.0 + z * uFogDepth * 0.035) + vec2(z * uSwell * 0.015, z * uHeight * 0.02);
                float h = waveHeight(samplePos, time + z * 2.4);
                float line = exp(-abs(p.y + 0.38 - z * 0.018 - h * 0.045) * (28.0 + z * 22.0));
                float fog = exp(-z * 2.8);
                vec3 bandColor = mix(uHorizonColor, uWaveColor, z);
                bandColor = mix(bandColor, uCrestColor, line * 0.55);
                color += bandColor * line * fog;
                alpha += line * fog;
            }

            color *= uBrightness / max(1.0, steps * 0.12);
            alpha = clamp(alpha / max(1.0, steps * 0.14), 0.0, 1.0) * uOpacity;
            if (uGrain > 0.5) {
                color += (hash(gl_FragCoord.xy + iTime * 17.0) - 0.5) * uGrainIntensity;
            }
            gl_FragColor = vec4(color, alpha);
        }
    `,
};

const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const spectrumVertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
    }
`;

function colorPair(hex) {
    const primary = new THREE.Color(normalizeHexColor(hex));
    const accent = primary.clone();
    accent.offsetHSL(0.08, 0.18, -0.16);
    return { primary, accent };
}

const liquidReferencePalette = [
    [0.0203, 0.0976, 0.4072],
    [0.0203, 0.0976, 0.4020],
    [0.0194, 0.0953, 0.4020],
    [0.0284, 0.1559, 0.6654],
    [0.0382, 0.2346, 1.0000],
    [0.0802, 0.2918, 1.0000],
    [0.1413, 0.3515, 1.0000],
    [0.2423, 0.4508, 1.0000],
];

function liquidPalette(hex) {
    const selected = new THREE.Color(hex || '#ffffff');
    const selectedHsl = {};
    const referenceHsl = {};
    const referenceAnchorHsl = {};
    selected.getHSL(selectedHsl);
    new THREE.Color(...liquidReferencePalette[4]).getHSL(referenceAnchorHsl);
    const lightnessScale = referenceAnchorHsl.l > 0 ? selectedHsl.l / referenceAnchorHsl.l : 1;

    return liquidReferencePalette.map((rgb) => {
        const color = new THREE.Color(...rgb);
        color.getHSL(referenceHsl);
        color.setHSL(
            selectedHsl.h,
            Math.min(1, referenceHsl.s * selectedHsl.s),
            Math.min(1, referenceHsl.l * lightnessScale)
        );
        return new THREE.Vector3(color.r, color.g, color.b);
    });
}

const spectrumReferencePalette = [
    [0.0784, 0.3255, 0.1765],
    [0.1333, 0.7725, 0.3686],
    [0.5255, 0.9373, 0.6745],
];

function rawShaderColor(hex) {
    const normalized = String(hex || '#ffffff').replace('#', '').trim();
    const expanded = normalized.length === 3
        ? normalized.split('').map((char) => char + char).join('')
        : normalized;
    if (!/^[0-9a-f]{6}$/i.test(expanded)) return new THREE.Color(1, 1, 1);
    return new THREE.Color().setRGB(
        parseInt(expanded.slice(0, 2), 16) / 255,
        parseInt(expanded.slice(2, 4), 16) / 255,
        parseInt(expanded.slice(4, 6), 16) / 255
    );
}

function lightspeedPalette(hex) {
    const primary = rawShaderColor(hex);
    const normalized = String(hex || '').replace('#', '').trim().toLowerCase();
    if (normalized === '5227ff') {
        return [primary, rawShaderColor('#FF9FFC'), rawShaderColor('#B19EEF')];
    }

    const secondary = primary.clone();
    const tertiary = primary.clone();
    const hsl = {};
    primary.getHSL(hsl);
    secondary.setHSL((hsl.h + 0.88) % 1, Math.max(0.45, hsl.s * 0.7), Math.min(0.82, hsl.l + 0.24));
    tertiary.setHSL((hsl.h + 0.04) % 1, Math.max(0.35, hsl.s * 0.5), Math.min(0.76, hsl.l + 0.18));
    return [primary, secondary, tertiary];
}

function topographyPalette(hex) {
    const primary = rawShaderColor(hex);
    const hsl = {};
    primary.getHSL(hsl);

    const low = new THREE.Color().setHSL(
        hsl.h,
        Math.min(1, Math.max(0.28, hsl.s * 0.72)),
        Math.max(0.04, hsl.l * 0.22)
    );
    const mid = new THREE.Color().setHSL(
        (hsl.h + 0.035) % 1,
        Math.min(1, Math.max(0.38, hsl.s * 0.9)),
        Math.min(0.72, Math.max(0.18, hsl.l * 0.82))
    );
    const high = new THREE.Color().setHSL(
        (hsl.h + 0.075) % 1,
        Math.min(1, Math.max(0.18, hsl.s * 0.68)),
        Math.min(1, Math.max(0.68, hsl.l + 0.28))
    );

    return [
        new THREE.Vector3(low.r, low.g, low.b),
        new THREE.Vector3(mid.r, mid.g, mid.b),
        new THREE.Vector3(high.r, high.g, high.b),
    ];
}

function softTriPalette(hex) {
    const primary = rawShaderColor(hex);
    const normalized = String(hex || '').replace('#', '').trim().toLowerCase();
    if (normalized === '5227ff') {
        return [rawShaderColor('#5227FF'), rawShaderColor('#FF9FFC'), rawShaderColor('#FFFFFF')];
    }

    const hsl = {};
    primary.getHSL(hsl);
    const mid = new THREE.Color().setHSL(
        (hsl.h + 0.08) % 1,
        Math.min(1, Math.max(0.25, hsl.s * 0.72)),
        Math.min(0.85, Math.max(0.3, hsl.l + 0.18))
    );
    const high = new THREE.Color().setHSL(
        (hsl.h + 0.13) % 1,
        Math.min(1, Math.max(0.12, hsl.s * 0.42)),
        Math.min(1, Math.max(0.76, hsl.l + 0.34))
    );
    return [primary, mid, high];
}

function spectrumPalette(hex) {
    const selected = rawShaderColor(hex);
    const selectedHsl = {};
    const referenceHsl = {};
    const referenceAnchorHsl = {};
    selected.getHSL(selectedHsl);
    new THREE.Color(...spectrumReferencePalette[1]).getHSL(referenceAnchorHsl);
    const lightnessScale = referenceAnchorHsl.l > 0 ? selectedHsl.l / referenceAnchorHsl.l : 1;
    const colors = spectrumReferencePalette.map((rgb) => {
        const color = new THREE.Color(...rgb);
        color.getHSL(referenceHsl);
        color.setHSL(
            selectedHsl.h,
            Math.min(1, referenceHsl.s * selectedHsl.s),
            Math.min(1, referenceHsl.l * lightnessScale)
        );
        return new THREE.Vector3(color.r, color.g, color.b);
    });

    while (colors.length < 8) colors.push(new THREE.Vector3(0, 0, 0));
    return colors;
}

function auroraPalette(hex) {
    const primary = rawShaderColor(hex);
    const primaryHsl = {};
    primary.getHSL(primaryHsl);
    const accent = new THREE.Color().setHSL(
        (primaryHsl.h + 0.13) % 1,
        Math.min(1, primaryHsl.s * 1.05),
        Math.min(1, primaryHsl.l * 1.08)
    );
    const colors = [
        new THREE.Vector3(primary.r, primary.g, primary.b),
        new THREE.Vector3(accent.r, accent.g, accent.b),
    ];
    while (colors.length < 8) colors.push(new THREE.Vector3(1, 1, 1));
    return colors;
}

function chromaticPalette(hex) {
    const foreground = rawShaderColor(hex);
    const background = foreground.clone();
    const hsl = {};
    background.getHSL(hsl);
    background.setHSL(
        (hsl.h + 0.035) % 1,
        hsl.s > 0.02 ? Math.min(1, Math.max(0.28, hsl.s * 0.92)) : 0,
        Math.max(0.08, hsl.l * 0.48)
    );
    return { foreground, background };
}

let cachedWebGLRenderMode = null;

export function getShaderBackgroundRenderMode() {
    if (cachedWebGLRenderMode) return cachedWebGLRenderMode;
    if (typeof document === 'undefined') return 'none';

    const softwarePattern = /(swiftshader|llvmpipe|softpipe|software|microsoft basic render|mesa offscreen)/i;
    const canvas = document.createElement('canvas');
    let context = null;
    let relaxedContext = false;

    try {
        context = canvas.getContext('webgl2', {
            alpha: true,
            antialias: false,
            failIfMajorPerformanceCaveat: true,
            powerPreference: 'low-power',
        }) || canvas.getContext('webgl', {
            alpha: true,
            antialias: false,
            failIfMajorPerformanceCaveat: true,
            powerPreference: 'low-power',
        });

        if (!context) {
            relaxedContext = true;
            context = canvas.getContext('webgl2', { alpha: true, antialias: false })
                || canvas.getContext('webgl', { alpha: true, antialias: false });
        }

        if (!context) {
            cachedWebGLRenderMode = 'none';
            return cachedWebGLRenderMode;
        }

        const debugInfo = context.getExtension('WEBGL_debug_renderer_info');
        const rendererName = debugInfo
            ? String(context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '')
            : '';
        cachedWebGLRenderMode = relaxedContext || softwarePattern.test(rendererName) ? 'software' : 'hardware';
    } catch (error) {
        cachedWebGLRenderMode = 'none';
    } finally {
        context?.getExtension('WEBGL_lose_context')?.loseContext();
    }

    return cachedWebGLRenderMode;
}

export function getShaderBackgroundQuality(options = {}) {
    const requested = options.quality || 'auto';
    const renderMode = options.renderMode || getShaderBackgroundRenderMode();
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
    const memory = Number(navigator.deviceMemory || 0);
    const cores = Number(navigator.hardwareConcurrency || 0);
    const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches === true;

    let level = requested;
    if (requested === 'auto') {
        if (renderMode === 'none') level = 'fallback';
        else if (renderMode === 'software' || reducedMotion) level = 'static';
        else if ((memory > 0 && memory <= 2) || (cores > 0 && cores <= 2)) level = 'low';
        else if (coarsePointer || (memory > 0 && memory <= 4) || (cores > 0 && cores <= 4)) level = 'balanced';
        else level = 'high';
    }

    const profiles = {
        full: { renderScale: 1, maxDpr: 2, maxFPS: 60, animate: true },
        high: { renderScale: 0.9, maxDpr: 1.35, maxFPS: 45, animate: true },
        balanced: { renderScale: 0.74, maxDpr: 1.15, maxFPS: 30, animate: true },
        low: { renderScale: 0.62, maxDpr: 1, maxFPS: 30, animate: true },
        static: { renderScale: 0.6, maxDpr: 1, maxFPS: 30, animate: false },
        fallback: { renderScale: 0, maxDpr: 0, maxFPS: 0, animate: false },
    };

    return { level, renderMode, reducedMotion, coarsePointer, ...(profiles[level] || profiles.balanced) };
}

function createShaderFallback(container, color, options = {}) {
    const pair = chromaticPalette(color);
    let enabled = true;
    const effect = Number(options.effect || 1);
    const fallbackPosition = `${25 + ((effect * 17) % 50)}% ${35 + ((effect * 11) % 35)}%`;
    const previousBackground = container.style.background;
    const foreground = `rgb(${Math.round(pair.foreground.r * 255)} ${Math.round(pair.foreground.g * 255)} ${Math.round(pair.foreground.b * 255)} / 32%)`;
    const background = `rgb(${Math.round(pair.background.r * 255)} ${Math.round(pair.background.g * 255)} ${Math.round(pair.background.b * 255)})`;
    container.classList.add('zyo-shader-background-fallback');
    container.dataset.shaderQuality = 'fallback';
    container.style.visibility = 'visible';
    container.style.background = `radial-gradient(circle at ${fallbackPosition}, ${foreground}, transparent 58%), ${background}`;

    return {
        canvas: null,
        quality: 'fallback',
        getProps() { return {}; },
        getUniformControls() { return []; },
        getPerformance() {
            return { fps: 0, averageFps: 0, frameTime: 0, renderScale: 0, maxDpr: 0, pixelRatio: 0, width: 0, height: 0, targetFPS: 0, adaptiveDrops: 0, quality: 'fallback', renderMode: 'none', enabled };
        },
        setEnabled(nextEnabled) {
            enabled = nextEnabled !== false;
            container.style.visibility = enabled ? 'visible' : 'hidden';
        },
        setUniformValue() { return false; },
        setColor(nextColor) {
            const next = chromaticPalette(nextColor);
            const nextForeground = `rgb(${Math.round(next.foreground.r * 255)} ${Math.round(next.foreground.g * 255)} ${Math.round(next.foreground.b * 255)} / 32%)`;
            const nextBackground = `rgb(${Math.round(next.background.r * 255)} ${Math.round(next.background.g * 255)} ${Math.round(next.background.b * 255)})`;
            container.style.background = `radial-gradient(circle at ${fallbackPosition}, ${nextForeground}, transparent 58%), ${nextBackground}`;
        },
        destroy() {
            container.classList.remove('zyo-shader-background-fallback');
            delete container.dataset.shaderQuality;
            container.style.visibility = 'visible';
            if (!options.keepBackground) container.style.background = previousBackground;
        },
    };
}

function normalizeEffect(effect) {
    const id = Number(effect || 1);
    return zyoShaderBackgroundPresets[id] ? id : 1;
}

export function zyoShaderEffectFromBackgroundValue(value) {
    const id = Number(value || 0) - ZYO_SHADER_BACKGROUND_OFFSET;
    return zyoShaderBackgroundPresets[id] ? id : 0;
}

export function createShaderBackgroundEffect(target, options = {}) {
    const container = typeof target === 'string' ? document.querySelector(target) : target;
    if (!container) return null;

    const effect = normalizeEffect(options.effect);
    const preset = zyoShaderBackgroundPresets[effect];
    let chromaProps = effect === 1 && options.props ? normalizeChromaWavesProps(options.props) : null;
    const color = chromaProps?.color || options.color || preset.color;
    const requestedAnimation = options.animate !== false;
    const quality = getShaderBackgroundQuality(options);
    if (quality.level === 'fallback') return createShaderFallback(container, color, { effect });

    const isReferenceEffect = effect >= 7 && effect <= 18;
    const useReducedReferenceDetail = isReferenceEffect && (
        quality.renderMode === 'software'
        || quality.level === 'low'
        || quality.level === 'balanced'
    );
    const animate = requestedAnimation;
    const renderScale = requestedAnimation && isReferenceEffect
        ? (options.quality === 'full'
            ? Math.min(options.renderScale ?? 1, quality.renderScale)
            : (quality.renderMode === 'software'
                ? 0.6
                : (quality.level === 'low' ? 0.64 : (quality.level === 'balanced' ? 0.74 : 0.9))))
        : Math.min(options.renderScale ?? 1, quality.renderScale);
    let activeMaxDpr = requestedAnimation && isReferenceEffect
        ? (options.quality === 'full'
            ? Math.min(options.maxDpr ?? 2, quality.maxDpr)
            : (quality.renderMode === 'software' || quality.level === 'low'
                ? 1
                : (quality.level === 'balanced' ? 1.15 : 1.35)))
        : Math.min(options.maxDpr ?? 2, quality.maxDpr);
    const time = options.time ?? preset.previewTime ?? 1.5;
    const className = options.className || '';
    const canvas = options.canvas || document.createElement('canvas');

    container.style.pointerEvents = 'none';
    container.style.zIndex = options.zIndex ?? '-1';
    const effectiveQuality = quality.renderMode === 'software'
        ? 'software-animated'
        : (useReducedReferenceDetail ? `${quality.level}-optimized` : quality.level);
    container.dataset.shaderQuality = requestedAnimation ? effectiveQuality : 'preview';
    canvas.classList.add('zyo-shader-background-canvas');
    if (className) canvas.classList.add(className);
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.background = 'transparent';
    canvas.style.pointerEvents = 'none';
    canvas.style.position = 'relative';
    canvas.style.zIndex = '0';
    if (effect === 9) canvas.style.mixBlendMode = 'screen';

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: effect === 11,
            alpha: true,
            powerPreference: isReferenceEffect && !useReducedReferenceDetail
                ? 'high-performance'
                : (options.powerPreference || 'low-power'),
            preserveDrawingBuffer: options.preserveDrawingBuffer === true || (requestedAnimation && !animate),
        });
    } catch (error) {
        return createShaderFallback(container, color, { effect });
    }
    if (!options.canvas) container.appendChild(canvas);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    let basePixelRatio = Math.min(window.devicePixelRatio || 1, activeMaxDpr);
    let activeRenderScale = renderScale;
    renderer.setPixelRatio(basePixelRatio * activeRenderScale);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const pair = colorPair(color);
    const liquidColors = liquidPalette(color);
    const spectrumColors = spectrumPalette(color);
    const auroraColors = auroraPalette(color);
    const chromaticColors = chromaticPalette(color);
    const referenceColor = rawShaderColor(color);
    const lightspeedColors = lightspeedPalette(color);
    const topographyColors = topographyPalette(color);
    const triColors = softTriPalette(color);
    const darkReferenceColor = rawShaderColor('#0A0A0A');
    const uniforms = {
        uResolution: { value: new THREE.Vector2(1, 1) },
        uCanvas: { value: new THREE.Vector2(1, 1) },
        uTime: { value: time },
        iTime: { value: time },
        iResolution: { value: new THREE.Vector3(1, 1, 1) },
        uColor: { value: effect === 10
            ? chromaticColors.foreground
            : (effect === 11 || effect === 12 ? referenceColor : pair.primary) },
        uAccent: { value: pair.accent },
        uBrightness: { value: chromaProps?.brightness ?? preset.brightness },
        uSpeed: { value: chromaProps?.speed ?? preset.speed },
        uFrequency: { value: chromaProps?.frequency ?? preset.frequency },
        uAmplitude: { value: chromaProps?.amplitude ?? preset.amplitude },
        uContrast: { value: chromaProps?.contrast ?? 1 },
        uGrain: { value: effect >= 16 ? 1 : (chromaProps?.grain ?? 0.12) },
        uSpeed: { value: effect === 8 ? 0.1 : (effect === 13 ? 0.5 : (effect === 18 ? 0.4 : 1)) },
        uScale: { value: effect === 8 ? 1 : 2 },
        uDistortion: { value: effect === 10 ? (useReducedReferenceDetail ? 1.2 : 1.5) : 1 },
        uCurve: { value: 1 },
        uContrast: { value: effect === 16 ? 3 : 1 },
        uRotation: { value: effect === 12 ? 1.5708 : 0 },
        uOffsetX: { value: 0 },
        uOffsetY: { value: 0 },
        uOpacity: { value: chromaProps?.opacity ?? 1 },
        uComplexity: { value: useReducedReferenceDetail ? 0.35 : 1 },
        uC1: { value: liquidColors[0] },
        uC2: { value: liquidColors[1] },
        uC3: { value: liquidColors[2] },
        uC4: { value: liquidColors[3] },
        uC5: { value: liquidColors[4] },
        uC6: { value: liquidColors[5] },
        uC7: { value: liquidColors[6] },
        uC8: { value: liquidColors[7] },
        uRot: { value: new THREE.Vector2(0, 1) },
        uColorCount: { value: 3 },
        uColors: { value: spectrumColors },
        uTransparent: { value: 1 },
        uWarpStrength: { value: 1 },
        uPointer: { value: effect === 15
            ? new THREE.Vector2(0.5, 0.5)
            : new THREE.Vector2(0.9955, -0.4011) },
        uMouseInfluence: { value: 1 },
        uParallax: { value: 0.5 },
        uNoise: { value: useReducedReferenceDetail ? 0 : 0.15 },
        uIterations: { value: 1 },
        uIntensity: { value: effect === 12 || effect === 13 ? 1 : 1.5 },
        uBandWidth: { value: 6 },
        animationSpeed: { value: 1 },
        enableTop: { value: true },
        enableMiddle: { value: true },
        enableBottom: { value: true },
        interactive: { value: true },
        parallax: { value: true },
        topLineCount: { value: useReducedReferenceDetail ? 4 : 6 },
        middleLineCount: { value: useReducedReferenceDetail ? 4 : 6 },
        bottomLineCount: { value: useReducedReferenceDetail ? 4 : 6 },
        topLineDistance: { value: 0.05 },
        middleLineDistance: { value: 0.001 },
        bottomLineDistance: { value: 0.001 },
        topWavePosition: { value: new THREE.Vector3(10, 0.5, -0.4) },
        middleWavePosition: { value: new THREE.Vector3(5, 0, 0.2) },
        bottomWavePosition: { value: new THREE.Vector3(2, -0.7, -1) },
        iMouse: { value: effect === 13 ? new THREE.Vector4(0, 0, 0, 0) : new THREE.Vector2(1, 1) },
        bendRadius: { value: 5 },
        bendStrength: { value: -0.5 },
        bendInfluence: { value: 0 },
        parallaxOffset: { value: new THREE.Vector2(0.0998, 0.0566) },
        lineGradient: { value: auroraColors },
        lineGradientCount: { value: 2 },
        uBackgroundColor: { value: chromaticColors.background },
        uWaveFrequency: { value: 0.2 },
        uWaveAmplitude: { value: 0.3 },
        uChromaShift: { value: 0.25 },
        uNoiseLevel: { value: useReducedReferenceDetail ? 0 : 0.1 },
        uFlatness: { value: 1 },
        uDensity: { value: useReducedReferenceDetail ? 15 : 20 },
        uStarSize: { value: 0.1 },
        uFocalDepth: { value: 0.05 },
        uTurbulence: { value: effect === 18 ? 20 : 0 },
        uColumnCount: { value: useReducedReferenceDetail ? 40 : 64 },
        uStretch: { value: 0.25 },
        uTrailLength: { value: 50 },
        uRotationSpeed: { value: 1 },
        uThickness: { value: effect === 16 ? 0.01 : 0.25 },
        uEnableRotation: { value: 0 },
        uCompression: { value: 0 },
        uColor1: { value: effect === 13 ? lightspeedColors[0] : referenceColor },
        uColor2: { value: effect === 13 ? lightspeedColors[1] : darkReferenceColor.clone() },
        uColor3: { value: lightspeedColors[2] },
        uStreakCount: { value: useReducedReferenceDetail ? 80 : 128 },
        uStretchFactor: { value: 0.05 },
        uFadePower: { value: 2 },
        u_time: { value: time },
        u_resolution: { value: new THREE.Vector2(1, 1) },
        u_speed: { value: 0.4 },
        u_iterations: { value: useReducedReferenceDetail ? 2 : 3 },
        u_waveFrequency: { value: 49 },
        u_depthStep: { value: 0.05 },
        u_lineThickness: { value: 0.009 },
        u_waveAmplitude: { value: 0.6 },
        u_lineColor: { value: pair.primary.clone() },
        u_backgroundColor: { value: rawShaderColor('#080808') },
        u_brightness: { value: 2.5 },
        u_contrast: { value: 1.1 },
        u_offsetX: { value: 0 },
        u_offsetY: { value: 0 },
        u_scale: { value: 0.3 },
        u_opacity: { value: 1 },
        uRes: { value: new THREE.Vector2(1, 1) },
        uZoom: { value: 6 },
        uIter: { value: useReducedReferenceDetail ? 8 : 12 },
        uEps: { value: 0.095 },
        uTangent: { value: 0.75 },
        uGrad: { value: 0.15 },
        uPhase: { value: new THREE.Vector3(3.11, 3.11, 3.11) },
        uRange: { value: 0.75 },
        uBias: { value: 0.5 },
        uBright: { value: 1 },
        uBg: { value: darkReferenceColor.clone() },
        uTint: { value: effect === 15 && String(color).toLowerCase() === '#ffffff'
            ? new THREE.Vector3(1, 1, 1)
            : referenceColor.clone() },
        uAlpha: { value: 1 },
        uCursorActive: { value: 0 },
        uCursorIntensity: { value: 1 },
        uMorphAmount: { value: useReducedReferenceDetail ? 2 : 3 },
        uBands: { value: 2 },
        uPixelSize: { value: 1 },
        uGlow: { value: 0.5 },
        uColorMode: { value: 0 },
        uFillBands: { value: 0 },
        uLow: { value: topographyColors[0] },
        uMid: { value: topographyColors[1] },
        uHigh: { value: topographyColors[2] },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uMouseEnabled: { value: 1 },
        uMouseRadius: { value: 0.3 },
        uMouseStrength: { value: 0.4 },
        uMouseActive: { value: 0 },
        uGrainIntensity: { value: useReducedReferenceDetail ? 0.025 : 0.05 },
        uCtrlA: { value: new THREE.Vector4(2.6680, -2.4404, -0.4337, 2.8369) },
        uCtrlB: { value: new THREE.Vector4(-1.1947, -1.8812, 2.9424, -0.8397) },
        uCtrlC: { value: new THREE.Vector4(-2.1700, 2.4404, -2.1700, 2.1700) },
        uCtrlD: { value: new THREE.Vector4(-2.6680, 0.4337, 1.8812, -1.1947) },
        uEnableMouse: { value: effect === 18 ? true : 1 },
        uWaveScale: { value: 0.6 },
        uWaveRatio: { value: 0.9 },
        uSwell: { value: 35 },
        uTilt: { value: 1.11 },
        uZoom: { value: 1 },
        uHeight: { value: 5.5 },
        uFogDepth: { value: 15 },
        uSteps: { value: 70 },
        uHorizonColor: { value: triColors[0] },
        uWaveColor: { value: triColors[1] },
        uCrestColor: { value: triColors[2] },
    };
    const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: [8, 10, 11, 12, 13, 16, 18].includes(effect) ? spectrumVertexShader : vertexShader,
        fragmentShader: fragmentShaders[effect],
        depthTest: false,
        depthWrite: false,
        transparent: ![14, 16, 18].includes(effect),
        premultipliedAlpha: effect === 8 || effect === 11,
        blending: effect === 11
            ? THREE.CustomBlending
            : (effect === 12 || effect === 13
                ? THREE.AdditiveBlending
                : ([14, 16, 18].includes(effect) ? THREE.NoBlending : THREE.NormalBlending)),
        blendEquation: THREE.AddEquation,
        blendSrc: effect === 11 ? THREE.OneFactor : THREE.SrcAlphaFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    let frameId = 0;
    let stopped = false;
    let enabled = true;
    let lastFrame = 0;
    let renderedWidth = 0;
    let renderedHeight = 0;
    let resizeObserver = null;
    let intersectionObserver = null;
    let staticImage = null;
    let rendererReleased = false;
    let pageVisible = !document.hidden;
    let isIntersecting = true;
    const referenceMaxFPS = useReducedReferenceDetail ? 30 : 45;
    let targetFPS = requestedAnimation && isReferenceEffect
        ? referenceMaxFPS
        : Math.max(1, Math.min(options.maxFPS || quality.maxFPS, quality.maxFPS));
    let minFrameMs = 1000 / targetFPS;
    const minimumAdaptiveScale = isReferenceEffect
        ? (quality.renderMode === 'software'
            ? 0.52
            : (quality.level === 'low' ? 0.56 : (quality.level === 'balanced' ? 0.64 : 0.72)))
        : Math.max(0.5, renderScale * 0.8);
    const clock = new THREE.Clock();
    let performanceSampleStartedAt = performance.now();
    let performanceSampleFrames = 0;
    let adaptiveScaleDrops = 0;
    let currentFPS = 0;
    let averageFPS = 0;
    let lastRenderedAt = 0;
    let lastFrameTime = 0;
    const spectrumTargetPointer = uniforms.uPointer.value.clone();
    const spectrumCurrentPointer = uniforms.uPointer.value.clone();
    const auroraTargetMouse = uniforms.iMouse.value.clone();
    const auroraCurrentMouse = uniforms.iMouse.value.clone();
    const auroraTargetParallax = uniforms.parallaxOffset.value.clone();
    const auroraCurrentParallax = uniforms.parallaxOffset.value.clone();
    let auroraTargetInfluence = 0;
    let auroraCurrentInfluence = 0;
    let auroraPointerMoved = false;
    let lightspeedTargetCompression = 0;
    let lightspeedCurrentCompression = 0;

    function releaseRenderer() {
        if (rendererReleased) return;
        rendererReleased = true;
        material.dispose();
        mesh.geometry.dispose();
        renderer.forceContextLoss();
        renderer.dispose();
    }

    function freezeStaticFrame() {
        try {
            staticImage = document.createElement('img');
            staticImage.className = 'zyo-shader-background-static';
            staticImage.alt = '';
            staticImage.setAttribute('aria-hidden', 'true');
            staticImage.src = canvas.toDataURL('image/webp', 0.82);
            staticImage.style.cssText = 'display:block;width:100%;height:100%;object-fit:cover;pointer-events:none;';
            canvas.insertAdjacentElement('afterend', staticImage);
            if (!options.canvas) canvas.remove();
            releaseRenderer();
        } catch (error) {
            // Keeping the already-rendered canvas is still a safe static fallback.
        }
    }

    function handlePointerMove(event) {
        const rect = container.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const localX = event.clientX - rect.left;
        const localY = event.clientY - rect.top;
        const isInside = localX >= 0 && localX <= rect.width && localY >= 0 && localY <= rect.height;
        if (effect === 8 && isInside) {
            spectrumTargetPointer.set(
                (localX / rect.width) * 2 - 1,
                -((localY / rect.height) * 2 - 1)
            );
        }
        if (effect === 9) {
            auroraTargetInfluence = isInside ? 1 : 0;
            if (!isInside) return;
            auroraPointerMoved = true;
            const pixelRatio = renderer.getPixelRatio();
            auroraTargetMouse.set(localX * pixelRatio, (rect.height - localY) * pixelRatio);
            auroraTargetParallax.set(
                ((localX - rect.width * 0.5) / rect.width) * 0.2,
                -((localY - rect.height * 0.5) / rect.height) * 0.2
            );
        }
        if (effect === 16) {
            uniforms.uMouseActive.value = isInside ? 1 : 0;
            if (!isInside) return;
            uniforms.uMouse.value.set(localX / rect.width, 1 - localY / rect.height);
        }
        if (effect === 18) {
            uniforms.uMouseActive.value = isInside ? 1 : 0;
            if (!isInside) return;
            uniforms.uMouse.value.set(localX / rect.width, 1 - localY / rect.height);
        }
    }

    function handlePointerDown() {
        lightspeedTargetCompression = 1;
    }

    function handlePointerUp() {
        lightspeedTargetCompression = 0;
    }

    function resize() {
        const rect = container.getBoundingClientRect();
        const optionWidth = typeof options.width === 'function' ? options.width() : options.width;
        const optionHeight = typeof options.height === 'function' ? options.height() : options.height;
        const width = Math.max(1, Math.floor(optionWidth || rect.width || 240));
        const height = Math.max(1, Math.floor(optionHeight || rect.height || 140));
        if (width === renderedWidth && height === renderedHeight) return;
        renderedWidth = width;
        renderedHeight = height;
        renderer.setSize(width, height, false);
        uniforms.uResolution.value.set(width * renderer.getPixelRatio(), height * renderer.getPixelRatio());
        uniforms.uCanvas.value.set(width, height);
        uniforms.iResolution.value.set(width * renderer.getPixelRatio(), height * renderer.getPixelRatio(), 1);
        uniforms.u_resolution.value.set(width * renderer.getPixelRatio(), height * renderer.getPixelRatio());
        uniforms.uRes.value.set(width * renderer.getPixelRatio(), height * renderer.getPixelRatio());
        if (effect === 9 && !auroraPointerMoved) {
            auroraTargetMouse.set(width * renderer.getPixelRatio() * 0.998, height * renderer.getPixelRatio() * 0.783);
            auroraCurrentMouse.copy(auroraTargetMouse);
            uniforms.iMouse.value.copy(auroraCurrentMouse);
        }
    }

    function adaptRenderScale(now) {
        if (!animate || now <= 0 || adaptiveScaleDrops >= 2) return;
        performanceSampleFrames++;
        const sampleDuration = now - performanceSampleStartedAt;
        if (sampleDuration < 3000) return;

        const measuredFPS = performanceSampleFrames * 1000 / sampleDuration;
        averageFPS = measuredFPS;
        if (measuredFPS < targetFPS * 0.62 && activeRenderScale > minimumAdaptiveScale + 0.01) {
            activeRenderScale = Math.max(minimumAdaptiveScale, activeRenderScale * 0.88);
            renderer.setPixelRatio(basePixelRatio * activeRenderScale);
            renderedWidth = 0;
            renderedHeight = 0;
            resize();
            adaptiveScaleDrops++;
            container.dataset.shaderAdaptive = 'reduced';
        }

        performanceSampleStartedAt = now;
        performanceSampleFrames = 0;
    }

    function render(now = 0) {
        if (stopped) return;
        if (!enabled) {
            frameId = 0;
            return;
        }
        if (animate) {
            frameId = 0;
            if (!pageVisible || !isIntersecting) {
                performanceSampleStartedAt = now || performance.now();
                performanceSampleFrames = 0;
                return;
            }
            frameId = requestAnimationFrame(render);
            const elapsed = now - lastFrame;
            if (now > 0 && elapsed < minFrameMs * 0.9) return;
            lastFrame = now > 0 ? now - (elapsed % minFrameMs) : 0;
            const delta = Math.min(clock.getDelta(), 0.05);
            uniforms.uTime.value += delta * (effect === 1 ? 1 : preset.speed);
            uniforms.iTime.value += delta * preset.speed;
            uniforms.u_time.value += delta * preset.speed;
            if (effect === 8) {
                spectrumCurrentPointer.lerp(spectrumTargetPointer, Math.min(1, delta * 8));
                uniforms.uPointer.value.copy(spectrumCurrentPointer);
            }
            if (effect === 9) {
                auroraCurrentMouse.lerp(auroraTargetMouse, 0.05);
                uniforms.iMouse.value.copy(auroraCurrentMouse);
                auroraCurrentInfluence += (auroraTargetInfluence - auroraCurrentInfluence) * 0.05;
                uniforms.bendInfluence.value = auroraCurrentInfluence;
                auroraCurrentParallax.lerp(auroraTargetParallax, 0.05);
                uniforms.parallaxOffset.value.copy(auroraCurrentParallax);
            }
            if (effect === 13) {
                lightspeedCurrentCompression += (lightspeedTargetCompression - lightspeedCurrentCompression)
                    * Math.min(1, delta * 9);
                uniforms.uCompression.value = lightspeedCurrentCompression;
            }
            adaptRenderScale(now);
        }
        const renderStartedAt = performance.now();
        if (lastRenderedAt > 0) {
            const frameInterval = Math.max(0.1, renderStartedAt - lastRenderedAt);
            currentFPS = Math.min(targetFPS, 1000 / frameInterval);
        }
        lastRenderedAt = renderStartedAt;
        renderer.render(scene, camera);
        lastFrameTime = performance.now() - renderStartedAt;
    }

    try {
        resize();
        render();
    } catch (error) {
        releaseRenderer();
        if (!options.canvas) canvas.remove();
        return createShaderFallback(container, color);
    }

    if (requestedAnimation && !animate) freezeStaticFrame();

    if (animate) {
        if ('ResizeObserver' in window) {
            resizeObserver = new ResizeObserver(resize);
            resizeObserver.observe(container);
        } else {
            window.addEventListener('resize', resize);
        }
        if ([8, 9, 16, 18].includes(effect)) window.addEventListener('pointermove', handlePointerMove, { passive: true });
        if (effect === 13) {
            window.addEventListener('pointerdown', handlePointerDown, { passive: true });
            window.addEventListener('pointerup', handlePointerUp, { passive: true });
            window.addEventListener('pointercancel', handlePointerUp, { passive: true });
        }
        document.addEventListener('visibilitychange', handleVisibilityChange);
        if ('IntersectionObserver' in window) {
            intersectionObserver = new IntersectionObserver((entries) => {
                const wasIntersecting = isIntersecting;
                isIntersecting = entries[0]?.isIntersecting !== false;
                if (isIntersecting && !wasIntersecting && !frameId && !stopped && pageVisible) {
                    clock.getDelta();
                    frameId = requestAnimationFrame(render);
                }
            }, { rootMargin: '100px' });
            intersectionObserver.observe(container);
        }
    }

    function handleVisibilityChange() {
        pageVisible = !document.hidden;
        if (pageVisible && isIntersecting && animate && !frameId && !stopped) {
            clock.getDelta();
            frameId = requestAnimationFrame(render);
        }
    }

    const api = {
        canvas,
        quality: effectiveQuality,
        getUniformControls() {
            const readOnlyPattern = /(?:time|resolution|canvas|mouse|pointer)/i;
            return Object.entries(uniforms)
                .map(([name, uniform]) => ({
                    name,
                    type: uniformType(uniform.value),
                    value: uniformSnapshot(uniform.value),
                    readOnly: readOnlyPattern.test(name),
                }))
                .filter((control) => control.type !== 'unsupported');
        },
        setUniformValue(name, nextValue) {
            if (rendererReleased || !uniforms[name]) return false;
            const target = uniforms[name].value;
            if (typeof target === 'number') {
                const parsed = Number(nextValue);
                if (!Number.isFinite(parsed)) return false;
                uniforms[name].value = parsed;
            } else if (target?.isColor && typeof nextValue === 'string') {
                target.set(nextValue);
            } else if (target?.isVector2 || target?.isVector3 || target?.isVector4) {
                const values = Array.isArray(nextValue) ? nextValue.map(Number) : [];
                if (values.length !== target.toArray().length || values.some((value) => !Number.isFinite(value))) return false;
                target.fromArray(values);
            } else if (Array.isArray(target) && Array.isArray(nextValue)) {
                nextValue.forEach((value, index) => {
                    if (target[index]?.isColor && typeof value === 'string') target[index].set(value);
                    else if (target[index]?.fromArray && Array.isArray(value)) target[index].fromArray(value.map(Number));
                    else if (typeof target[index] === 'number' && Number.isFinite(Number(value))) target[index] = Number(value);
                });
            } else {
                return false;
            }
            if (effect === 1 && chromaProps && ['uBrightness', 'uSpeed', 'uFrequency', 'uAmplitude', 'uContrast', 'uGrain', 'uOpacity'].includes(name)) {
                const propName = { uBrightness: 'brightness', uSpeed: 'speed', uFrequency: 'frequency', uAmplitude: 'amplitude', uContrast: 'contrast', uGrain: 'grain', uOpacity: 'opacity' }[name];
                chromaProps[propName] = Number(uniforms[name].value);
            }
            render();
            return true;
        },
        getProps() {
            return chromaProps ? { ...chromaProps } : {};
        },
        setColor(nextColor) {
            if (rendererReleased) return;
            if (chromaProps) chromaProps.color = String(nextColor || chromaProps.color).toLowerCase();
            const nextPair = colorPair(nextColor);
            const nextChromaticColors = chromaticPalette(nextColor);
            const nextReferenceColor = rawShaderColor(nextColor);
            const nextLightspeedColors = lightspeedPalette(nextColor);
            uniforms.uColor.value.copy(effect === 10
                ? nextChromaticColors.foreground
                : (effect === 11 || effect === 12 ? nextReferenceColor : nextPair.primary));
            uniforms.uAccent.value.copy(nextPair.accent);
            uniforms.uBackgroundColor.value.copy(nextChromaticColors.background);
            uniforms.uColor1.value.copy(effect === 13 ? nextLightspeedColors[0] : nextReferenceColor);
            uniforms.uColor2.value.copy(effect === 13 ? nextLightspeedColors[1] : darkReferenceColor);
            uniforms.uColor3.value.copy(nextLightspeedColors[2]);
            uniforms.u_lineColor.value.copy(nextPair.primary);
            uniforms.uTint.value.copy(effect === 15 && String(nextColor).toLowerCase() === '#ffffff'
                ? new THREE.Vector3(1, 1, 1)
                : nextReferenceColor);
            const nextTopographyColors = topographyPalette(nextColor);
            uniforms.uLow.value.copy(nextTopographyColors[0]);
            uniforms.uMid.value.copy(nextTopographyColors[1]);
            uniforms.uHigh.value.copy(nextTopographyColors[2]);
            const nextTriColors = softTriPalette(nextColor);
            uniforms.uHorizonColor.value.copy(nextTriColors[0]);
            uniforms.uWaveColor.value.copy(nextTriColors[1]);
            uniforms.uCrestColor.value.copy(nextTriColors[2]);
            const nextLiquidColors = liquidPalette(nextColor);
            for (let index = 0; index < nextLiquidColors.length; index++) {
                uniforms[`uC${index + 1}`].value.copy(nextLiquidColors[index]);
            }
            const nextSpectrumColors = spectrumPalette(nextColor);
            for (let index = 0; index < nextSpectrumColors.length; index++) {
                uniforms.uColors.value[index].copy(nextSpectrumColors[index]);
            }
            const nextAuroraColors = auroraPalette(nextColor);
            for (let index = 0; index < nextAuroraColors.length; index++) {
                uniforms.lineGradient.value[index].copy(nextAuroraColors[index]);
            }
            render();
        },
        setProps(nextProps = {}) {
            if (rendererReleased || effect !== 1) return;
            chromaProps = normalizeChromaWavesProps({ ...chromaProps, ...nextProps });
            uniforms.uBrightness.value = chromaProps.brightness;
            uniforms.uSpeed.value = chromaProps.speed;
            uniforms.uFrequency.value = chromaProps.frequency;
            uniforms.uAmplitude.value = chromaProps.amplitude;
            uniforms.uContrast.value = chromaProps.contrast;
            uniforms.uGrain.value = chromaProps.grain;
            uniforms.uOpacity.value = chromaProps.opacity;
            api.setColor(chromaProps.color);
            render();
        },
        setPerformance(nextPerformance = {}) {
            if (rendererReleased) return;
            const nextFPS = Number(nextPerformance.maxFPS);
            if (Number.isFinite(nextFPS)) {
                targetFPS = Math.min(60, Math.max(10, nextFPS));
                minFrameMs = 1000 / targetFPS;
            }
            const nextScale = Number(nextPerformance.renderScale);
            if (Number.isFinite(nextScale)) activeRenderScale = Math.min(1, Math.max(0.35, nextScale));
            const nextDpr = Number(nextPerformance.maxDpr);
            if (Number.isFinite(nextDpr)) {
                activeMaxDpr = Math.min(2, Math.max(0.5, nextDpr));
                basePixelRatio = Math.min(window.devicePixelRatio || 1, activeMaxDpr);
            }
            renderer.setPixelRatio(basePixelRatio * activeRenderScale);
            renderedWidth = 0;
            renderedHeight = 0;
            resize();
            render();
        },
        getPerformance() {
            return {
                fps: currentFPS,
                averageFps: averageFPS,
                frameTime: lastFrameTime,
                renderScale: activeRenderScale,
                maxDpr: activeMaxDpr,
                pixelRatio: renderer.getPixelRatio(),
                width: renderedWidth,
                height: renderedHeight,
                targetFPS,
                adaptiveDrops: adaptiveScaleDrops,
                quality: effectiveQuality,
                renderMode: quality.renderMode,
                enabled,
            };
        },
        setEnabled(nextEnabled) {
            if (rendererReleased) return;
            enabled = nextEnabled !== false;
            canvas.style.visibility = enabled ? 'visible' : 'hidden';
            if (!enabled && frameId) {
                cancelAnimationFrame(frameId);
                frameId = 0;
            }
            if (enabled && animate && !frameId && !stopped) {
                lastFrame = 0;
                clock.getDelta();
                frameId = requestAnimationFrame(render);
            }
        },
        destroy() {
            stopped = true;
            if (frameId) cancelAnimationFrame(frameId);
            resizeObserver?.disconnect();
            intersectionObserver?.disconnect();
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            releaseRenderer();
            container.style.visibility = 'visible';
            staticImage?.remove();
            delete container.dataset.shaderQuality;
            delete container.dataset.shaderAdaptive;
            if (!options.canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        },
    };
    return api;
}

export function renderShaderBackgroundPreviews(root = document, options = {}) {
    const color = options.color || '#ffffff';
    const instances = [];
    root.querySelectorAll('[data-zyo-shader-preview]').forEach((canvas) => {
        const effect = normalizeEffect(canvas.dataset.zyoShaderPreview);
        const instance = createShaderBackgroundEffect(canvas.parentElement || canvas, {
            canvas,
            effect,
            color,
            animate: options.animate !== false,
            quality: options.quality || 'low',
            renderMode: options.renderMode,
            renderScale: options.renderScale ?? 0.62,
            maxDpr: 1,
            maxFPS: Math.min(30, options.maxFPS || 30),
            time: zyoShaderBackgroundPresets[effect].previewTime,
        });
        if (instance) instances.push(instance);
    });
    return instances;
}

export function captureShaderBackgroundPreview(options = {}) {
    const effect = normalizeEffect(options.effect);
    const width = Math.max(1, Number(options.width || 320));
    const height = Math.max(1, Number(options.height || 180));
    const holder = document.createElement('div');
    holder.style.cssText = `position:fixed;left:-9999px;top:-9999px;width:${width}px;height:${height}px;overflow:hidden;pointer-events:none;`;
    document.body.appendChild(holder);

    const instance = createShaderBackgroundEffect(holder, {
        effect,
        color: options.color || '#ffffff',
        animate: false,
        quality: 'high',
        width,
        height,
        maxDpr: 1,
        renderScale: 1,
        preserveDrawingBuffer: true,
        time: options.time ?? zyoShaderBackgroundPresets[effect].previewTime,
    });

    const dataUrl = instance?.canvas?.toDataURL('image/png') || '';
    instance?.destroy?.();
    holder.remove();
    return dataUrl;
}
