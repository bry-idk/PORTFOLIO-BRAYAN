export const LAB_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const LAB_SHADER_COMMON = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uTexture;
  uniform sampler2D uPrevTexture;
  uniform float uHasTexture;
  uniform float uHasPrevTexture;
  uniform float uMix;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uPointerVel;
  uniform vec2 uResolution;
  uniform int uMode;
  uniform float uParamA;
  uniform vec4 uBeatLanes;

  float hash(vec2 p) {
    float result = fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    return result;
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float result = mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
    return result;
  }

  float fbm2(vec2 p) {
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    float v = 0.62 * noise(p);
    p = rot * p * 2.05 + vec2(7.3, 11.1);
    v += 0.38 * noise(p);
    return v;
  }

  float invSmoothstep(float lo, float hi, float x) {
    float result = 1.0 - smoothstep(lo, hi, x);
    return result;
  }

  float lumaOf(vec3 c) {
    float result = dot(c, vec3(0.2126, 0.7152, 0.0722));
    return result;
  }

  vec3 toLinear(vec3 c) {
    vec3 result = pow(max(c, vec3(0.00001)), vec3(2.2));
    return result;
  }

  vec3 toSrgb(vec3 c) {
    vec3 result = pow(max(c, vec3(0.00001)), vec3(0.45454545));
    return result;
  }

  // ACES Filmic Tone Mapping (Narkowicz fitted curve)
  vec3 acesFilm(vec3 x) {
    vec3 a = x * (2.51 * x + 0.03);
    vec3 b = x * (2.43 * x + 0.59) + 0.14;
    vec3 result = clamp(a / max(b, vec3(0.0001)), 0.0, 1.0);
    return result;
  }

  // Crossfade-aware cover sampler (sRGB output)
  vec3 sampleCover(vec2 uv) {
    vec2 clamped = clamp(uv, 0.001, 0.999);
    vec3 result = uHasTexture > 0.5
      ? texture2D(uTexture, clamped).rgb
      : vec3(0.06, 0.08, 0.13);

    if (uHasPrevTexture > 0.5 && uMix < 0.999) {
      vec3 prev = texture2D(uPrevTexture, clamped).rgb;
      float t = smoothstep(0.0, 1.0, uMix);
      result = mix(prev, result, t);
    }
    return result;
  }

  // Fast 2-tap screen-space surface normal estimation reusing center luminance
  vec3 estimateNormal(vec2 uv, vec2 texel, float centerLuma, float strength) {
    float hR = lumaOf(sampleCover(uv + vec2(texel.x, 0.0)));
    float hU = lumaOf(sampleCover(uv + vec2(0.0, texel.y)));
    vec3 result = normalize(vec3((centerLuma - hR) * strength, (centerLuma - hU) * strength, 1.0));
    return result;
  }

  // Cursor-steered directional diffuse, Blinn-Phong specular & grazing rim light
  vec3 cursorLightSpecRim(vec3 N, vec2 uv, vec2 m, float aspect, float shininess, float rimPower) {
    vec3 L = normalize(vec3((m.x - uv.x) * aspect * 2.1, (m.y - uv.y) * 2.1, 0.56));
    vec3 V = vec3(0.0, 0.0, 1.0);
    vec3 H = normalize(L + V);
    float diff = clamp(dot(N, L), 0.0, 1.0);
    float spec = pow(clamp(dot(N, H), 0.0001, 1.0), shininess);
    float fresnel = pow(clamp(1.0 - max(dot(N, V), 0.0), 0.0001, 1.0), rimPower);
    float rim = fresnel * (0.30 + 0.70 * diff);
    vec3 result = vec3(diff, spec, rim);
    return result;
  }

  // Fast 4-tap diagonal optical bloom / halation around bright highlights
  vec3 sampleOpticalBloom(vec2 uv, vec2 texel, float threshold) {
    vec2 r = texel * 5.0;
    vec3 s0 = sampleCover(uv + vec2( r.x,  r.y));
    vec3 s1 = sampleCover(uv + vec2(-r.x,  r.y));
    vec3 s2 = sampleCover(uv + vec2( r.x, -r.y));
    vec3 s3 = sampleCover(uv + vec2(-r.x, -r.y));

    vec3 accum =
      toLinear(s0) * smoothstep(threshold, threshold + 0.36, lumaOf(s0)) +
      toLinear(s1) * smoothstep(threshold, threshold + 0.36, lumaOf(s1)) +
      toLinear(s2) * smoothstep(threshold, threshold + 0.36, lumaOf(s2)) +
      toLinear(s3) * smoothstep(threshold, threshold + 0.36, lumaOf(s3));

    vec3 result = accum * 0.25;
    return result;
  }

  // Soft circular bokeh particle with luminous optical ring
  float bokehDisc(float dist, float radius) {
    float core = invSmoothstep(radius * 0.25, radius, dist);
    float ring = exp(-abs(dist - radius * 0.72) * (14.0 / max(radius, 0.005))) * 0.55;
    float result = core * 0.65 + ring * invSmoothstep(radius * 0.6, radius * 1.15, dist);
    return result;
  }

  // Final cinema grade: ACES filmic tone map, sRGB encode, optical vignette & micro-grain
  vec3 cinemaFinish(vec3 hdrCol, vec2 uv, float aspect, float vigStrength, float grainStrength, float exposure) {
    vec3 mapped = toSrgb(acesFilm(max(hdrCol, vec3(0.0)) * exposure));
    float vigDist = length((uv - 0.5) * vec2(aspect * 0.78, 1.0));
    float vignette = 1.0 - smoothstep(0.42, 1.18, vigDist) * vigStrength;
    float grain = (hash(gl_FragCoord.xy + fract(uTime * 19.37) * 256.0) - 0.5) * grainStrength;
    vec3 result = clamp(mapped * vignette + vec3(grain), 0.0, 1.0);
    return result;
  }
`

const MODE_MAIN_BODIES: Record<number, string> = {
  // MODE 0: Crónicas de Palenque — Volumetric Canopy God-Rays & 3-Layer Bokeh
  0: /* glsl */ `
    float sunIntensity = clamp(uParamA, 0.0, 1.0);
    float heatWave = exp(-distM * 2.2) * (0.0018 + sunIntensity * 0.0035 + velMag * 0.002);
    vec2 breezeOffset = vel * exp(-distM * 2.5) * 0.008;
    vec2 waveUv = uv + breezeOffset + vec2(
      sin(uv.y * 9.5 + uTime * 1.15) * heatWave,
      cos(uv.x * 7.8 + uTime * 0.90) * heatWave
    );

    vec3 baseSrgb = sampleCover(waveUv);
    vec3 baseLin = toLinear(baseSrgb);
    float baseLuma = lumaOf(baseSrgb);
    vec3 bloomLin = sampleOpticalBloom(waveUv, texel, 0.52);

    // Cursor-steered warm volumetric lantern illumination on estimated normals
    vec3 N = estimateNormal(waveUv, texel * 1.4, baseLuma, 3.4);
    vec3 lightData = cursorLightSpecRim(N, uv, m, aspect, 28.0, 2.6);
    float lanternFalloff = exp(-distM * (2.05 - sunIntensity * 0.72));

    // Wet-surface glossy specular reflection
    float wetness = invSmoothstep(0.15, 0.75, uv.y) * 0.65 + 0.35;
    vec3 wetSpec = mix(vec3(1.0, 0.80, 0.42), vec3(0.32, 0.96, 0.68), 0.22) *
      lightData.y * wetness * (0.45 + sunIntensity * 0.55) * lanternFalloff;
    vec3 rimBounce = vec3(0.18, 0.92, 0.58) * lightData.z * (0.28 + sunIntensity * 0.32);

    // Dramatic volumetric god-ray light shafts with dappled canopy occlusion
    vec2 rayDir = deltaM / (distM + 0.0001);
    float angle = atan(rayDir.y, rayDir.x);
    float canopySway = sin(uTime * 0.42) * 0.18 + vel.x * 0.25;
    float canopyOcclusion = smoothstep(
      0.20,
      0.84,
      fbm2(uv * vec2(4.0 * aspect, 4.0) + vec2(canopySway, -uTime * 0.06))
    );
    float rayNoise = fbm2(vec2(angle * 4.5 + uTime * 0.10 + canopySway * 0.35, distM * 1.6 - uTime * 0.22));
    float rayFine = 0.5 + 0.5 * sin(angle * 11.0 - uTime * 0.35 + rayNoise * 3.2);
    float shafts = pow(clamp(rayNoise * 0.72 + rayFine * 0.38, 0.0001, 1.0), 2.1) *
      mix(0.45, 1.18, canopyOcclusion);
    float sunCore = exp(-distM * 6.8) * (0.34 + sunIntensity * 0.56);

    vec3 sunGold = mix(vec3(1.0, 0.58, 0.14), vec3(1.0, 0.90, 0.58), clamp(sunCore * 1.4, 0.0, 1.0));
    vec3 canopyEmerald = vec3(0.10, 0.88, 0.52);
    vec3 godRay = sunGold * (shafts * (0.42 + sunIntensity * 0.92) * lanternFalloff + sunCore * 0.62);

    // Unified 3-depth-layer parallax particle loop (far fireflies, mid pollen, near bokeh)
    vec3 particles = vec3(0.0);
    for (int i = 0; i < 9; i++) {
      float fi = float(i);
      float isMid = step(2.5, fi) * (1.0 - step(5.5, fi));
      float isNear = step(5.5, fi);
      float parallax = mix(0.035, mix(0.095, 0.175, isNear), step(2.5, fi));
      float speed = mix(0.020, mix(0.044, 0.062, isNear), step(2.5, fi));

      vec2 pPos = vec2(
        fract(0.19 * fi + 0.07 + sin(uTime * (0.32 + 0.06 * fi) + fi * 2.1) * (0.06 + 0.04 * isNear) + (m.x - 0.5) * parallax - vel.x * parallax * 0.35),
        fract(0.23 * fi + uTime * speed + (m.y - 0.5) * parallax * 0.55)
      );
      float pd = length((uv - pPos) * vec2(aspect, 1.0));
      float twinkle = 0.55 + 0.45 * sin(uTime * (2.2 + fi * 0.45) + fi * 1.9);

      float farGlow = (1.0 - isMid - isNear) * (exp(-pd * 62.0) * 0.95 + exp(-pd * 18.0) * 0.20);
      float midGlow = isMid * (exp(-pd * 40.0) + exp(-pd * 14.0) * 0.25);
      float nearBokeh = isNear * bokehDisc(pd, 0.038 + 0.014 * mod(fi, 3.0)) * 0.52;

      vec3 pTint = mix(
        canopyEmerald,
        mix(mix(canopyEmerald, sunGold, 0.68), mix(sunGold, vec3(0.45, 1.0, 0.72), mod(fi, 2.0) * 0.45), isNear),
        step(2.5, fi)
      );
      particles += pTint * (farGlow + midGlow + nearBokeh) * twinkle * (0.50 + sunIntensity * 0.50);
    }

    vec3 lanternLit = baseLin * (0.64 + lanternFalloff * (0.42 + lightData.x * 0.48) * (0.72 + sunIntensity * 0.52));
    hdrCol = lanternLit + bloomLin * (0.36 + sunIntensity * 0.26) + godRay + wetSpec + rimBounce + particles;
    vigStrength = 0.34;
    grainStrength = 0.024;
    exposure = 0.90;
  `,

  // MODE 1: Kane no Hibiki — Subtle Brick Relief, Ukiyo-e Ink Ripples & Sakura/Ash
  1: /* glsl */ `
    float prox = clamp(uParamA, 0.0, 1.0);
    float rippleFreq = mix(10.0, 26.0, prox);
    float rippleAmp = mix(0.0022, 0.013, prox) + velMag * 0.0035;
    float inkFlow = fbm2(uv * vec2(4.5 * aspect, 4.5) + vec2(uTime * 0.22 - vel.x * 0.35, -uTime * 0.18));
    vec2 waveUv = uv + vec2(
      sin(uv.y * rippleFreq + uTime * (1.7 + prox * 3.1) + inkFlow * 2.4) * rippleAmp,
      cos(uv.x * rippleFreq * 0.78 - uTime * 1.45 + inkFlow * 2.0) * rippleAmp * 0.65
    );

    // Subtle architectural running-bond brick bump-normal relief (tuned so artwork stays crisp)
    float rowIdx = floor(uv.y * 22.0);
    float rowOffset = 0.5 * mod(rowIdx, 2.0);
    float brickU = fract(uv.x * 16.0 + rowOffset);
    float brickV = fract(uv.y * 22.0);
    float mortarX = smoothstep(0.93, 0.99, brickU) + invSmoothstep(0.01, 0.07, brickU);
    float mortarY = smoothstep(0.90, 0.98, brickV) + invSmoothstep(0.02, 0.10, brickV);
    float mortarMask = clamp(mortarX + mortarY, 0.0, 1.0);
    float bevelX = smoothstep(0.88, 0.97, brickU) - invSmoothstep(0.03, 0.12, brickU);
    float bevelY = smoothstep(0.85, 0.96, brickV) - invSmoothstep(0.04, 0.15, brickV);

    vec3 baseSrgb = sampleCover(waveUv);
    vec3 baseLin = toLinear(baseSrgb);
    float baseLuma = lumaOf(baseSrgb);
    vec3 bloomLin = sampleOpticalBloom(waveUv, texel, 0.56);

    vec3 imgN = estimateNormal(waveUv, texel * 1.4, baseLuma, 2.6);
    vec3 brickN = normalize(imgN + vec3(bevelX * 0.28, bevelY * 0.28, 0.0));
    vec3 lightData = cursorLightSpecRim(brickN, uv, m, aspect, 36.0, 2.4);

    // Luminous ukiyo-e golden ink-wash fluid currents
    float inkCrest = smoothstep(0.56, 0.88, fbm2(waveUv * vec2(7.0 * aspect, 7.0) + vec2(-uTime * 0.32, uTime * 0.24)));
    float inkRibbon = pow(max(sin((uv.x * 11.0 + uv.y * 7.0 + inkFlow * 4.5) - uTime * (1.8 + prox * 2.0)) * 0.5 + 0.5, 0.0001), 5.0);

    // Multi-ring ultrasonic sonar shockwaves with chromatic rim bloom
    float freqA = 28.0 + prox * 16.0;
    float speedA = 4.6 + prox * 2.4;
    float chromaShift = 0.012 + prox * 0.012 + velMag * 0.008;
    float sonarR = pow(max(sin((distM + chromaShift) * freqA - uTime * speedA) * 0.5 + 0.5, 0.0001), 6.0);
    float sonarG = pow(max(sin(distM * freqA - uTime * speedA) * 0.5 + 0.5, 0.0001), 6.0);
    float sonarB = pow(max(sin((distM - chromaShift) * freqA - uTime * speedA) * 0.5 + 0.5, 0.0001), 6.0);
    float sonarSub = pow(max(sin(distM * 14.5 - uTime * 3.0) * 0.5 + 0.5, 0.0001), 9.0);
    float sonarEnv = exp(-distM * (2.85 - prox * 1.35));
    vec3 sonarChroma = vec3(sonarR, sonarG * 0.85, sonarB * 1.15) * sonarEnv;

    vec3 lanternGold = vec3(1.0, 0.72, 0.22);
    vec3 sakuraRose = vec3(1.0, 0.30, 0.56);
    vec3 shrineViolet = vec3(0.58, 0.24, 0.98);
    vec3 sakuraPalette = mix(lanternGold, sakuraRose, prox);

    // Layered falling illuminated sakura petals (7 petals)
    vec3 petalLight = vec3(0.0);
    for (int i = 0; i < 7; i++) {
      float fi = float(i);
      float depth = mix(0.6, 1.25, mod(fi, 3.0) * 0.5);
      vec2 pPos = vec2(
        fract(0.14 * fi + uTime * (0.042 + 0.014 * depth) + sin(uTime * 1.3 + fi * 2.1) * 0.045 + vel.x * 0.05 * depth),
        fract(0.92 - 0.14 * fi - uTime * (0.055 + 0.022 * depth))
      );
      vec2 d = (uv - pPos) * vec2(aspect, 1.0);
      float ang = uTime * (1.15 + 0.28 * fi) + fi * 1.85;
      float ca = cos(ang);
      float sa = sin(ang);
      vec2 rd = vec2(ca * d.x - sa * d.y, sa * d.x + ca * d.y);
      float petalSize = 0.016 * depth;
      float notch = 1.0 + 0.22 * smoothstep(0.0, petalSize, rd.x);
      float pDist = length(rd * vec2(1.0, 2.15 * notch));
      float petalMask = invSmoothstep(petalSize * 0.22, petalSize, pDist);
      float cursorGlow = 0.55 + 0.75 * exp(-length((pPos - m) * vec2(aspect, 1.0)) * 3.0);
      vec3 pTint = mix(sakuraRose, vec3(1.0, 0.84, 0.88), 0.35 * cursorGlow);
      petalLight += pTint * petalMask * cursorGlow * (0.52 + 0.48 * prox);
    }

    // Golden floating shrine ash motes (6 embers)
    vec3 ashLight = vec3(0.0);
    for (int i = 0; i < 6; i++) {
      float fi = float(i) + 7.0;
      vec2 aPos = vec2(
        fract(0.17 * fi + sin(uTime * (0.65 + 0.09 * fi) + fi) * 0.07 + vel.x * 0.04),
        fract(0.19 * fi + uTime * (0.032 + 0.011 * mod(fi, 3.0)))
      );
      float ad = length((uv - aPos) * vec2(aspect, 1.0));
      float flicker = 0.55 + 0.45 * sin(uTime * (4.2 + fi * 0.7) + fi * 2.1);
      ashLight += lanternGold * (exp(-ad * 58.0) + exp(-ad * 20.0) * 0.22) * flicker * (0.45 + prox * 0.55);
    }

    float projBeam = exp(-distM * 1.9);
    vec3 brickSpec = mix(lanternGold, sakuraRose, prox * 0.65) * lightData.y * (0.36 + prox * 0.38) * (0.45 + 0.55 * projBeam);
    vec3 brickRim = shrineViolet * lightData.z * 0.26;
    vec3 litFacade = baseLin * (0.72 + lightData.x * 0.38 + prox * 0.20) * (1.0 - mortarMask * 0.075);

    hdrCol =
      litFacade +
      bloomLin * 0.40 +
      brickSpec +
      brickRim +
      lanternGold * (inkCrest * (0.14 + prox * 0.26) + inkRibbon * 0.15 * (0.35 + prox)) +
      mix(sakuraPalette, shrineViolet, clamp(distM * 1.25, 0.0, 1.0)) * (sonarChroma * 0.72 + vec3(sonarSub * sonarEnv * 0.52)) * (0.45 + prox * 0.70) +
      petalLight +
      ashLight;
    vigStrength = 0.30;
    grainStrength = 0.020;
    exposure = 0.88;
  `,

  // MODE 2: SOGNO — LiDAR 3x3 Sobel Hologram, Volumetric Laser & Refraction Rim
  2: /* glsl */ `
    float radius = 0.20 + clamp(uParamA, 0.0, 1.0) * 0.22;
    float insideLens = invSmoothstep(radius - 0.014, radius + 0.014, distM);

    // Chromatic aberration refraction rim along the glass LiDAR lens ring
    float rimBand = exp(-abs(distM - radius) * 34.0);
    vec2 radDir = deltaM / (distM + 0.0001);
    float rimDisp = rimBand * (0.010 + velMag * 0.008);
    vec3 baseSrgb = vec3(
      sampleCover(uv + radDir * rimDisp).r,
      sampleCover(uv).g,
      sampleCover(uv - radDir * rimDisp).b
    );
    vec3 baseLin = toLinear(baseSrgb);
    vec3 bloomLin = sampleOpticalBloom(uv, texel, 0.58);

    // True 3x3 Sobel edge operator on image luminance
    vec2 sobelTexel = 1.6 / max(uResolution, vec2(1.0));
    float tl = lumaOf(sampleCover(uv + vec2(-sobelTexel.x,  sobelTexel.y)));
    float tc = lumaOf(sampleCover(uv + vec2(0.0,            sobelTexel.y)));
    float tr = lumaOf(sampleCover(uv + vec2( sobelTexel.x,  sobelTexel.y)));
    float ml = lumaOf(sampleCover(uv + vec2(-sobelTexel.x,  0.0)));
    float mc = lumaOf(baseSrgb);
    float mr = lumaOf(sampleCover(uv + vec2( sobelTexel.x,  0.0)));
    float bl = lumaOf(sampleCover(uv + vec2(-sobelTexel.x, -sobelTexel.y)));
    float bc = lumaOf(sampleCover(uv + vec2(0.0,           -sobelTexel.y)));
    float br = lumaOf(sampleCover(uv + vec2( sobelTexel.x, -sobelTexel.y)));

    float gx = -tl - 2.0 * ml - bl + tr + 2.0 * mr + br;
    float gy = -tl - 2.0 * tc - tr + bl + 2.0 * bc + br;
    float sobelEdge = clamp(length(vec2(gx, gy)) * 2.45, 0.0, 1.0);

    vec3 N = normalize(vec3(-gx * 2.4, -gy * 2.4, 1.0));
    vec3 lightData = cursorLightSpecRim(N, uv, m, aspect, 48.0, 2.2);

    // Holographic 3D point-cloud elevation sparkles displaced by luminance depth
    vec2 parallaxUv = uv - deltaM * (mc - 0.4) * 0.045;
    vec2 gridCell = floor(parallaxUv * vec2(58.0, 34.0));
    vec2 grid = fract(parallaxUv * vec2(58.0, 34.0)) - 0.5;
    float dotRadius = mix(0.09, 0.24, mc);
    float lidarDot = invSmoothstep(dotRadius - 0.04, dotRadius + 0.05, length(grid));
    float cellRand = hash(gridCell);
    float sparkle = smoothstep(0.84, 0.99, sin(uTime * (3.5 + cellRand * 4.5) + cellRand * 18.0) * 0.5 + 0.5) *
      lidarDot * (0.35 + mc * 0.85 + sobelEdge * 0.75);

    // Animated volumetric laser scanline beam with anamorphic specular flare
    float sweepPos = fract(uTime * 0.26);
    float distSweep = uv.y - sweepPos;
    float laserCore = exp(-abs(distSweep) * 68.0);
    float laserTrail = exp(-max(distSweep, 0.0) * 11.0) * step(0.0, distSweep) * 0.42;
    float radialPulse = exp(-abs(distM - fract(uTime * 0.44) * radius) * 44.0);
    float anamorphicFlare = laserCore * exp(-abs(uv.x - m.x) * 3.8) * (0.55 + sobelEdge * 0.85);

    vec3 holoCyan = vec3(0.08, 0.88, 1.0);
    vec3 holoViolet = vec3(0.58, 0.26, 1.0);
    vec3 depthCol = mix(holoCyan, holoViolet, clamp(mc * 0.82 + uv.x * 0.28, 0.0, 1.0));
    vec3 edgePeak = mix(depthCol, vec3(0.96, 1.0, 1.0), pow(max(sobelEdge, 0.0001), 1.8));

    vec3 lidarView =
      baseLin * 0.16 +
      edgePeak * sobelEdge * (1.15 + lightData.y * 0.75) +
      depthCol * (lidarDot * (0.24 + mc * 0.65) + laserTrail + radialPulse * 0.42) +
      vec3(0.75, 0.98, 1.0) * (laserCore * 0.95 + anamorphicFlare * 0.85 + sparkle * 1.35) +
      holoCyan * lightData.z * 0.28;

    // Subtle ambient depth calibration dust (5 motes)
    vec3 depthDust = vec3(0.0);
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      vec2 dp = vec2(
        fract(0.21 * fi + uTime * (0.015 + 0.005 * mod(fi, 3.0)) + vel.x * 0.03),
        fract(0.23 * fi + sin(uTime * 0.45 + fi * 1.9) * 0.06)
      );
      float dd = length((uv - dp) * vec2(aspect, 1.0));
      float dTwinkle = 0.4 + 0.6 * sin(uTime * (2.5 + fi) + fi * 2.7);
      depthDust += mix(holoCyan, holoViolet, mod(fi, 2.0)) * exp(-dd * 62.0) * dTwinkle * 0.42;
    }

    // Animated AR targeting reticle + glossy lens rim highlight
    float angle = atan(deltaM.y, deltaM.x);
    float outerRing = invSmoothstep(0.001, 0.0085, abs(distM - radius));
    float innerDashed = invSmoothstep(0.001, 0.0055, abs(distM - radius * 0.72)) *
      step(0.0, sin(angle * 16.0 + uTime * 1.45));
    float cardinalTicks = invSmoothstep(0.0, 0.018, abs(distM - radius * 1.06)) *
      pow(max(abs(cos(angle * 2.0)), abs(sin(angle * 2.0))), 24.0);
    float crosshair =
      (invSmoothstep(0.0, 0.0038, abs(deltaM.x)) * step(0.012, abs(deltaM.y)) * step(abs(deltaM.y), 0.045)) +
      (invSmoothstep(0.0, 0.0038, abs(deltaM.y)) * step(0.012, abs(deltaM.x)) * step(abs(deltaM.x), 0.045));
    float glassRimSpec = rimBand * pow(max(dot(radDir, normalize(vec2(-0.6, 0.8))), 0.0001), 3.0) * 0.65;

    float reticle = clamp(outerRing + innerDashed * 0.55 + cardinalTicks * 0.85 + crosshair * 0.8, 0.0, 1.0);
    vec3 reticleCol = vec3(0.24, 0.96, 1.0) * reticle * 1.05 + vec3(0.85, 0.98, 1.0) * glassRimSpec;

    hdrCol = mix(baseLin + bloomLin * 0.25, lidarView + bloomLin * 0.45, insideLens) + reticleCol + depthDust;
    vigStrength = 0.26;
    grainStrength = 0.016;
    exposure = 0.88;
  `,

  // MODE 3: Notas y Colores — Synesthetic Stage, Radial Shockwaves & Polar Starlight Bursts
  3: /* glsl */ `
    float laneIdx = floor(uv.x * 4.0);
    float pulse = 0.0;
    vec3 laneCol = vec3(1.0);
    if (laneIdx < 0.5) {
      pulse = uBeatLanes.x;
      laneCol = vec3(0.14, 0.88, 0.42);
    } else if (laneIdx < 1.5) {
      pulse = uBeatLanes.y;
      laneCol = vec3(0.95, 0.18, 0.56);
    } else if (laneIdx < 2.5) {
      pulse = uBeatLanes.z;
      laneCol = vec3(1.0, 0.78, 0.06);
    } else {
      pulse = uBeatLanes.w;
      laneCol = vec3(0.08, 0.84, 0.98);
    }

    float totalEnergy = (uBeatLanes.x + uBeatLanes.y + uBeatLanes.z + uBeatLanes.w) * 0.25;
    vec2 warpUv = uv + vec2(
      sin(uv.y * 14.0 - uTime * 5.2) * (0.0045 * totalEnergy + vel.x * 0.004),
      sin(uv.x * 16.0 + uTime * 6.5) * 0.010 * (0.10 + totalEnergy)
    );
    vec3 baseSrgb = sampleCover(warpUv);
    vec3 baseLin = toLinear(baseSrgb);
    float baseLuma = lumaOf(baseSrgb);
    vec3 bloomLin = sampleOpticalBloom(warpUv, texel, 0.48);

    vec3 N = estimateNormal(warpUv, texel * 1.4, baseLuma, 2.4);
    vec3 lightData = cursorLightSpecRim(N, uv, m, aspect, 32.0, 2.4);

    float localX = fract(uv.x * 4.0);
    float laneBorder = invSmoothstep(0.0, 0.026, min(localX, 1.0 - localX));
    float glassSheen = invSmoothstep(0.0, 0.18, localX) * 0.09 * (0.4 + pulse);

    vec2 spotOrigin = vec2((laneIdx + 0.5) * 0.25, 1.08);
    vec2 toSpot = (uv - spotOrigin) * vec2(aspect, 1.0);
    float cone = exp(-abs(toSpot.x) / max(0.16 + (1.0 - uv.y) * 0.24, 0.05)) * (0.15 + pulse * 0.65);

    float f1 = sin(uv.y * 18.0 - uTime * 7.8 + laneIdx * 1.57) * 0.5 + 0.5;
    float f2 = sin(uv.y * 34.0 - uTime * 11.4 + laneIdx * 2.3) * 0.5 + 0.5;
    float ribbonCenter = 0.5 + (f1 - 0.5) * (0.28 + pulse * 0.44) + (f2 - 0.5) * (0.10 + pulse * 0.16);
    float harmonicRibbon = exp(-abs(localX - ribbonCenter) * (15.0 - pulse * 7.5)) * (0.20 + pulse * 1.05);
    float overtoneRibbon = exp(-abs(localX - (1.0 - ribbonCenter)) * 20.0) * (0.09 + pulse * 0.55);

    float barCount = 5.0;
    float barCell = fract(localX * barCount);
    float barId = floor(localX * barCount);
    float barGap = step(0.16, barCell) * step(barCell, 0.84);
    float barHeight = (0.07 + 0.06 * sin(uTime * 6.0 + barId * 1.4 + laneIdx * 2.0)) +
      pulse * (0.35 + 0.18 * sin(barId * 1.9 + uTime * 12.0));
    float eqBar = barGap * invSmoothstep(barHeight - 0.02, barHeight + 0.02, uv.y) * (0.28 + pulse * 0.72);
    float eqTip = barGap * exp(-abs(uv.y - barHeight) * 60.0) * (0.35 + pulse * 0.95);

    // Single-pass radial shockwave rings + polar 8-point starlight burst particles (zero nested loops!)
    vec3 burstLight = vec3(0.0);
    for (int l = 0; l < 4; l++) {
      float fl = float(l);
      float lp = l == 0 ? uBeatLanes.x : (l == 1 ? uBeatLanes.y : (l == 2 ? uBeatLanes.z : uBeatLanes.w));
      vec3 lc = l == 0
        ? vec3(0.14, 0.88, 0.42)
        : (l == 1 ? vec3(0.95, 0.18, 0.56) : (l == 2 ? vec3(1.0, 0.78, 0.06) : vec3(0.08, 0.84, 0.98)));
      vec2 anchor = vec2((fl + 0.5) * 0.25, 0.18);
      vec2 bd = (uv - anchor) * vec2(aspect, 1.0);
      float bDist = length(bd);
      float bAng = atan(bd.y, bd.x);
      float waveAge = 1.0 - lp;
      float ringR = 0.05 + waveAge * 0.54;
      float ringGlow = exp(-abs(bDist - ringR) * 32.0) * lp * 1.25;
      float starSpokes = pow(max(cos(bAng * 6.0 + fl * 1.1 + waveAge * 2.4) * 0.5 + 0.5, 0.0001), 16.0);
      float starRadial = exp(-abs(bDist - (0.04 + waveAge * 0.46)) * 22.0);
      burstLight += lc * ringGlow + mix(lc, vec3(1.0, 0.98, 0.94), 0.58) * starSpokes * starRadial * lp * 1.65;
    }

    float edgeDist = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
    float stageRim = exp(-edgeDist * 18.0) * (0.20 + totalEnergy * 0.85 + velMag * 0.25);

    hdrCol =
      baseLin * (0.56 + pulse * 0.42 + totalEnergy * 0.18 + lightData.x * 0.22) +
      bloomLin * (0.38 + totalEnergy * 0.45) +
      laneCol * (harmonicRibbon + overtoneRibbon + eqBar * 0.68 + cone * 0.45 + laneBorder * (0.20 + pulse * 0.45) + glassSheen + stageRim * 0.55) +
      vec3(0.96, 0.99, 1.0) * (harmonicRibbon * pulse * 0.42 + eqTip * 0.65 + lightData.y * 0.28) +
      burstLight;
    vigStrength = 0.26;
    grainStrength = 0.018;
    exposure = 0.88;
  `,

  // MODE 4: The Amazing Digital Circus 2 — Curved CRT Glass, Phosphor & Glitch
  4: /* glsl */ `
    float glitchAmt = clamp(uParamA, 0.0, 1.0);
    vec2 centered = uv - 0.5;
    float r2 = dot(centered, centered);
    float barrel = 1.0 + r2 * (0.16 + glitchAmt * 0.16);
    vec2 crtUv = centered * barrel + 0.5;

    float syncBarPos = fract(uTime * 0.19);
    float syncBand = exp(-abs(uv.y - syncBarPos) * 24.0);
    float syncShear = syncBand * (0.008 + glitchAmt * 0.030) * sin(uTime * 38.0);

    float rowBucket = floor(uv.y * 38.0);
    float timeStep = floor(uTime * 13.0);
    float rowRnd = hash(vec2(rowBucket, timeStep));
    float rowGlitch = step(0.86 - glitchAmt * 0.24, rowRnd);
    float cursorBoost = exp(-distM * 3.0) * 0.018;
    float glitchStrength = glitchAmt * 0.042 + cursorBoost + velMag * 0.016;
    float xShift = ((rowRnd - 0.5) * glitchStrength * (1.0 + rowGlitch * 3.4)) + syncShear;

    vec2 velDisp = vel * (0.007 + glitchAmt * 0.008);
    vec2 chromaVec = vec2(0.0022 + glitchStrength * 0.42 + syncBand * 0.009, 0.0) + velDisp;
    vec3 crtSample = vec3(
      sampleCover(crtUv + vec2(xShift, 0.0) + chromaVec).r,
      sampleCover(crtUv + vec2(xShift * 0.45, 0.0)).g,
      sampleCover(crtUv + vec2(xShift, 0.0) - chromaVec).b
    );
    vec3 colLin = toLinear(crtSample);

    vec3 phosphorBloom = sampleOpticalBloom(crtUv + vec2(xShift * 0.35, 0.0), texel * 1.2, 0.46);
    float subX = mod(floor(gl_FragCoord.x), 3.0);
    vec3 phosphorMask = vec3(
      mix(0.76, 1.24, step(abs(subX - 0.0), 0.5)),
      mix(0.76, 1.24, step(abs(subX - 1.0), 0.5)),
      mix(0.76, 1.24, step(abs(subX - 2.0), 0.5))
    );
    colLin *= mix(vec3(1.0), phosphorMask, 0.44 + glitchAmt * 0.26);

    float scan = 0.85 + 0.15 * sin(crtUv.y * uResolution.y * 1.5);
    float sparkCell = hash(vec2(floor(uv.x * 96.0), rowBucket + timeStep * 3.0));
    float glitchSparkle = step(0.982 - glitchAmt * 0.035, sparkCell) * (rowGlitch + syncBand * 0.85);
    vec3 sparkleCol = mix(vec3(1.0, 0.24, 0.36), vec3(0.22, 0.96, 1.0), step(0.5, fract(sparkCell * 37.0)));

    // Physical curved CRT glass dome reflection (studio overhead softbox + cursor specular)
    vec3 glassN = normalize(vec3(centered * vec2(aspect * 0.85, 0.95), sqrt(max(0.12, 1.0 - r2 * 1.55))));
    vec3 studioL = normalize(vec3(-0.35, 0.72, 0.85));
    vec3 V = vec3(0.0, 0.0, 1.0);
    vec3 studioH = normalize(studioL + V);
    float overheadSoftbox = pow(clamp(dot(glassN, studioH), 0.0001, 1.0), 18.0) * 0.15 +
      smoothstep(0.94, 0.985, dot(glassN, studioH)) * 0.12;
    vec3 cursorL = normalize(vec3((m.x - uv.x) * aspect * 1.6, (m.y - uv.y) * 1.6, 0.9));
    float cursorGlassSpec = pow(clamp(dot(glassN, normalize(cursorL + V)), 0.0001, 1.0), 42.0) * 0.16;
    float glassFresnel = pow(clamp(1.0 - dot(glassN, V), 0.0001, 1.0), 3.2) * 0.14;

    vec2 edgeDist = abs(crtUv - 0.5) * 2.0;
    float bezel = invSmoothstep(0.91, 1.03, max(edgeDist.x, edgeDist.y));
    float spot = 0.84 + 0.28 * exp(-distM * 3.0);

    hdrCol = (
      colLin * scan * spot +
      phosphorBloom * (0.48 + glitchAmt * 0.32) +
      vec3(1.0, 0.28, 0.32) * syncBand * (0.07 + glitchAmt * 0.14) +
      sparkleCol * glitchSparkle * 1.35 +
      vec3(0.88, 0.94, 1.0) * (overheadSoftbox + cursorGlassSpec) +
      vec3(0.42, 0.58, 0.85) * glassFresnel
    ) * bezel;
    vigStrength = 0.36;
    grainStrength = 0.028;
    exposure = 0.90;
  `,

  // MODE 5: Reminiscencia — Neo-Noir Bleed, 28° Halftone Relief & Digital Ash
  5: /* glsl */ `
    float corrupt = clamp(uParamA, 0.0, 1.0);
    float proximity = exp(-distM * 2.95);

    float headSwitchMask = invSmoothstep(0.01, 0.085, uv.y);
    float headJitter = (hash(vec2(floor(uv.y * 180.0), floor(uTime * 24.0))) - 0.5) *
      headSwitchMask * (0.045 + corrupt * 0.065);
    float headSnow = hash(gl_FragCoord.xy + fract(uTime * 41.7) * 200.0) * headSwitchMask * (0.24 + corrupt * 0.32);

    float bandNoise = hash(vec2(floor(uv.y * 44.0), floor(uTime * 10.5)));
    float tear = step(0.88 - corrupt * 0.22, bandNoise) * (corrupt * 0.034 + proximity * 0.018 + velMag * 0.012);
    vec2 memUv = uv + vec2(
      (bandNoise - 0.5) * tear + headJitter,
      sin(uv.x * 16.0 + uTime * 2.8) * 0.0028 * proximity
    );

    vec2 edgeDir = (uv - 0.5) * length(uv - 0.5);
    vec2 edgeChroma = edgeDir * (0.016 + corrupt * 0.014);
    float hChroma = 0.0032 + corrupt * 0.015 + proximity * 0.011 + velMag * 0.006;
    vec3 primarySrgb = vec3(
      sampleCover(memUv + vec2(hChroma, 0.0) + edgeChroma).r,
      sampleCover(memUv).g,
      sampleCover(memUv - vec2(hChroma, 0.0) - edgeChroma).b
    );
    vec3 primaryLin = toLinear(primarySrgb);
    float imgLuma = lumaOf(primarySrgb);
    vec3 noirBleed = sampleOpticalBloom(memUv, texel * 1.35, 0.48);

    vec3 N = estimateNormal(memUv, texel * 1.4, imgLuma, 2.6);
    vec3 lightData = cursorLightSpecRim(N, uv, m, aspect, 30.0, 2.5);

    float echoOffset = 0.022 + corrupt * 0.036 + proximity * 0.024 + velMag * 0.014;
    float echoDir = sin(uTime * 0.85 + 0.6) + vel.x * 0.4;
    vec3 ghostA = toLinear(sampleCover(memUv + vec2(echoOffset * echoDir, 0.003)));
    vec3 ghostB = toLinear(sampleCover(memUv + vec2(echoOffset * 1.9 * echoDir, -0.004)));
    vec3 violetNeon = vec3(0.66, 0.26, 1.0);
    vec3 amberGhost = vec3(1.0, 0.72, 0.14);
    vec3 persistence = ghostA * violetNeon * 0.55 + ghostB * amberGhost * 0.38;

    float ca = 0.8829;
    float sa = 0.4695;
    vec2 rotUv = mat2(ca, -sa, sa, ca) * (uv * vec2(aspect, 1.0) * 68.0);
    vec2 cellLocal = fract(rotUv) - 0.5;
    float dotDist = length(cellLocal);
    float dotThreshold = mix(0.14, 0.42, imgLuma);
    float halftone = invSmoothstep(dotThreshold - 0.06, dotThreshold + 0.06, dotDist);
    float dotBevel = invSmoothstep(dotThreshold * 0.55, dotThreshold, length(cellLocal - vec2(-0.08, 0.08))) * halftone;

    vec3 digitalAsh = vec3(0.0);
    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      vec2 ap = vec2(
        fract(0.17 * fi + sin(uTime * (0.32 + 0.06 * fi) + fi * 2.4) * 0.08 - vel.x * 0.04),
        fract(0.21 * fi + uTime * (0.024 + 0.009 * mod(fi, 3.0)))
      );
      float ad = length((uv - ap) * vec2(aspect, 1.0));
      float ashFlicker = 0.45 + 0.55 * sin(uTime * (3.2 + fi * 0.6) + fi * 1.7);
      vec3 ashTint = mix(violetNeon, amberGhost, mod(fi, 2.0));
      digitalAsh += ashTint * (exp(-ad * 60.0) + exp(-ad * 18.0) * 0.18) * ashFlicker * (0.45 + corrupt * 0.45);
    }

    float ring = exp(-abs(distM - (0.165 + 0.032 * sin(uTime * 2.6))) * 30.0);
    vec3 violetGold = mix(violetNeon, amberGhost, ring);
    float scan = 0.92 + 0.08 * sin(uv.y * uResolution.y * 1.15 + uTime * 5.0);

    vec3 mixedNoir = mix(primaryLin, primaryLin * 0.72 + persistence, 0.24 + proximity * 0.36 + corrupt * 0.24);
    hdrCol =
      mixedNoir * scan +
      noirBleed * mix(violetNeon, amberGhost, 0.35) * (0.55 + corrupt * 0.35) +
      violetGold * (ring * 0.58 + (halftone * 0.18 + dotBevel * 0.16) * proximity * (0.75 + corrupt * 0.85)) +
      amberGhost * lightData.y * proximity * 0.35 +
      violetNeon * lightData.z * 0.25 +
      digitalAsh +
      vec3(headSnow * 0.75);
    vigStrength = 0.38;
    grainStrength = 0.030;
    exposure = 0.92;
  `,

  // MODE 6: Vestigio (ALFAR) — Terracotta/Gold-Leaf Relief, Subtle Luminous Runes & Kiln Embers
  6: /* glsl */ `
    float sculpt = clamp(uParamA, 0.0, 1.0);
    float radial = exp(-distM * 2.5);

    vec2 toMouse = uv - m;
    float latheGrooves = sin(uv.y * 118.0 + uTime * (1.2 + sculpt * 2.0)) * 0.5 + 0.5;
    float wheelWave = sin(distM * 32.0 - uTime * (2.6 + sculpt * 3.4)) * 0.0050 * radial * (0.4 + sculpt);
    float spinWave = sin((uv.y - m.y) * 26.0 - uTime * (2.0 + sculpt * 4.0)) * 0.0095 * radial * (0.35 + sculpt);
    vec2 clayUv = uv + vec2(
      spinWave + toMouse.x * radial * 0.038 * (sculpt - 0.3) + vel.x * radial * 0.012,
      wheelWave
    );
    vec3 baseSrgb = sampleCover(clayUv);
    vec3 baseLin = toLinear(baseSrgb);
    float baseLuma = lumaOf(baseSrgb);
    vec3 bloomLin = sampleOpticalBloom(clayUv, texel, 0.56);

    // Subtle engraved ancestral pre-Columbian rune bands (balanced to showcase artwork)
    float bandZone = smoothstep(0.18, 0.26, abs(uv.y - 0.5)) * invSmoothstep(0.34, 0.44, abs(uv.y - 0.5));
    float bandScroll = uTime * (0.07 + sculpt * 0.14);
    float diamondPattern = abs(fract(uv.x * 18.0 + bandScroll) - 0.5) + abs(fract(uv.y * 10.0) - 0.5);
    float stepFret = abs(fract(uv.x * 36.0 + bandScroll * 2.0) - 0.5);
    float engravedGroove = invSmoothstep(0.40, 0.47, diamondPattern) * bandZone;
    float runeCore = invSmoothstep(0.36, 0.44, diamondPattern) * invSmoothstep(0.14, 0.32, stepFret) * bandZone;

    // Crisp normal map combining ceramic luma + lathe ridges + engraved runes
    vec2 bumpTexel = 1.9 / max(uResolution, vec2(1.0));
    float hC = baseLuma + latheGrooves * 0.045 * (0.3 + sculpt) - engravedGroove * 0.095;
    float hR = lumaOf(sampleCover(clayUv + vec2(bumpTexel.x, 0.0))) + latheGrooves * 0.045 * (0.3 + sculpt);
    float hU = lumaOf(sampleCover(clayUv + vec2(0.0, bumpTexel.y))) +
      sin((uv.y + bumpTexel.y) * 118.0 + uTime * (1.2 + sculpt * 2.0)) * 0.0225 * (0.3 + sculpt);

    float reliefScale = 2.8 + sculpt * 4.0;
    vec3 N = normalize(vec3((hC - hR) * reliefScale, (hC - hU) * reliefScale, 1.0));
    vec3 lightData = cursorLightSpecRim(N, uv, m, aspect, 42.0, 2.3);

    vec3 L = normalize(vec3((m.x - uv.x) * aspect * 2.2, (m.y - uv.y) * 2.2, 0.58));
    vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
    float broadClaySpec = pow(clamp(dot(N, H), 0.0001, 1.0), 12.0) * (0.28 + sculpt * 0.34);
    float wetGoldSpec = lightData.y * (0.65 + sculpt * 0.60);

    vec3 terracotta = mix(vec3(0.84, 0.32, 0.09), vec3(1.0, 0.78, 0.30), lightData.x);
    vec3 goldLeaf = vec3(1.0, 0.80, 0.32);
    float runePulse = 0.55 + 0.45 * sin(uTime * 2.4 + uv.x * 12.0);
    vec3 runeGlow = mix(vec3(1.0, 0.52, 0.12), goldLeaf, runePulse) *
      (runeCore * (0.24 + radial * 0.62) + engravedGroove * lightData.x * 0.18) * (0.42 + sculpt * 0.72);

    float contour = pow(max(sin(distM * 42.0 - uTime * 3.1) * 0.5 + 0.5, 0.0001), 5.5) * exp(-distM * 2.9);

    // Unified kiln embers & warm clay dust bokeh (9 particles: 3 bokeh + 6 embers)
    vec3 kilnParticles = vec3(0.0);
    for (int i = 0; i < 9; i++) {
      float fi = float(i);
      float isBokeh = 1.0 - step(2.5, fi);
      float speed = mix(0.038 + 0.016 * mod(fi, 4.0), 0.025 + 0.007 * mod(fi, 2.0), isBokeh);
      vec2 ep = vec2(
        fract(0.15 * fi + sin(uTime * (0.45 + 0.07 * fi) + fi * 1.9) * (0.08 + 0.02 * isBokeh) + (m.x - 0.5) * (0.12 + 0.05 * isBokeh) - vel.x * 0.05),
        fract(0.17 * fi + uTime * speed)
      );
      float ed = length((uv - ep) * vec2(aspect, 1.0));
      float flicker = 0.55 + 0.45 * sin(uTime * (4.2 + fi * 0.5) + fi * 1.3);
      float bLayer = isBokeh * bokehDisc(ed, 0.044 + 0.014 * mod(fi, 2.0)) * (0.20 + sculpt * 0.22);
      float eLayer = (1.0 - isBokeh) * (exp(-ed * (40.0 + mod(fi, 3.0) * 14.0)) + exp(-ed * 16.0) * 0.18) * flicker * (0.55 + sculpt * 0.55);
      vec3 tint = mix(mix(vec3(1.0, 0.42, 0.10), goldLeaf, mod(fi, 2.0) * 0.7), vec3(0.95, 0.58, 0.24), isBokeh);
      kilnParticles += tint * (bLayer + eLayer);
    }

    vec3 litClay = baseLin * (0.62 + lightData.x * 0.52) * (1.0 - engravedGroove * 0.11);
    hdrCol =
      litClay +
      bloomLin * 0.35 +
      terracotta * (broadClaySpec * 0.40 + contour * (0.20 + sculpt * 0.36)) +
      goldLeaf * (wetGoldSpec * 0.65 + lightData.z * (0.34 + sculpt * 0.34)) +
      runeGlow +
      kilnParticles;
    vigStrength = 0.34;
    grainStrength = 0.024;
    exposure = 0.90;
  `,
}

/**
 * Builds a lean per-mode GLSL fragment shader so ANGLE/D3D11 only compiles the
 * active project's mode instead of all 7 modes together — cutting initial link
 * time from ~6s down to <150ms while preserving identical film-grade visuals.
 */
export function getLabFragmentShader(modeIndex: number): string {
  const body = MODE_MAIN_BODIES[modeIndex] ?? MODE_MAIN_BODIES[0]
  return /* glsl */ `${LAB_SHADER_COMMON}
  void main() {
    vec2 uv = vUv;
    vec2 m = clamp(uMouse, 0.0, 1.0);
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 texel = 1.5 / max(uResolution, vec2(1.0));
    vec2 deltaM = (uv - m) * vec2(aspect, 1.0);
    float distM = length(deltaM);
    vec2 vel = clamp(uPointerVel, vec2(-2.2), vec2(2.2));
    float velMag = clamp(length(vel), 0.0, 2.2);

    vec3 hdrCol = vec3(0.0);
    float vigStrength = 0.28;
    float grainStrength = 0.022;
    float exposure = 0.88;

    ${body}

    vec3 finalCol = cinemaFinish(hdrCol, uv, aspect, vigStrength, grainStrength, exposure);
    gl_FragColor = vec4(finalCol, 1.0);
  }
`
}

// Backwards-compatible default export (Mode 0)
export const LAB_FRAGMENT_SHADER = getLabFragmentShader(0)
