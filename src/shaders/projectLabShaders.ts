export const LAB_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

/**
 * Unified bespoke multi-mode GLSL fragment shader supporting all 5 projects'
 * interactive physical/computational mechanics cleanly in real time.
 */
export const LAB_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uTexture;
  uniform float uHasTexture;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform int uMode; // 0: Palenque, 1: Kane, 2: Sogno, 3: Notas, 4: TADC2
  uniform float uParamA; // Ultrasonic distance / Glitch intensity / Scan radius / Pulse energy
  uniform vec4 uBeatLanes; // Notas y Colores 4-lane triggers

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  vec3 sampleCover(vec2 uv) {
    if (uHasTexture < 0.5) {
      return vec3(0.08, 0.1, 0.15);
    }
    return texture2D(uTexture, clamp(uv, 0.001, 0.999)).rgb;
  }

  void main() {
    vec2 uv = vUv;
    vec2 m = clamp(uMouse, 0.0, 1.0);
    float distM = length((uv - m) * vec2(uResolution.x / max(uResolution.y, 1.0), 1.0));

    // MODE 0: Crónicas de Palenque — Volumetric Ray-Tracing & Bioluminescent Canopy
    if (uMode == 0) {
      vec2 waveUv = uv + vec2(sin(uv.y * 8.0 + uTime) * 0.004, cos(uv.x * 7.0 + uTime * 0.8) * 0.004) * exp(-distM * 2.5);
      vec3 base = sampleCover(waveUv);

      // Volumetric god-rays radiating from cursor/sun origin
      vec2 rayDir = normalize(uv - m + vec2(0.0001));
      float angle = atan(rayDir.y, rayDir.x);
      float rays = pow(max(0.0, sin(angle * 10.0 + uTime * 0.9) * 0.5 + 0.5), 3.0);
      float rays2 = pow(max(0.0, cos(angle * 6.0 - uTime * 0.6) * 0.5 + 0.5), 2.0);
      float radialFalloff = exp(-distM * 1.75);
      vec3 godRay = vec3(1.0, 0.72, 0.24) * (rays * 0.45 + rays2 * 0.3) * radialFalloff;

      // Floating bioluminescent memory spores
      float spores = 0.0;
      for (int i = 0; i < 6; i++) {
        float fi = float(i);
        vec2 sp = vec2(
          fract(0.17 * fi + uTime * (0.03 + 0.008 * fi) + sin(uTime + fi) * 0.05),
          fract(0.29 * fi + cos(uTime * 0.6 + fi) * 0.12)
        );
        spores += exp(-length((uv - sp) * vec2(1.6, 1.0)) * 42.0);
      }
      vec3 sporeCol = mix(vec3(0.18, 0.95, 0.62), vec3(0.98, 0.75, 0.25), 0.5) * spores * 0.85;

      vec3 col = base * (0.72 + radialFalloff * 0.45) + godRay + sporeCol;
      gl_FragColor = vec4(col, 1.0);
      return;
    }

    // MODE 1: Kane no Hibiki — Ultrasonic Proximity Projection Mapping Simulator
    if (uMode == 1) {
      // uParamA is proximity (0 = far 6.0m, 1 = close 0.4m)
      float prox = clamp(uParamA, 0.0, 1.0);
      float rippleFreq = mix(10.0, 26.0, prox);
      float rippleAmp = mix(0.003, 0.016, prox);
      vec2 waveUv = uv + vec2(
        sin(uv.y * rippleFreq + uTime * (1.8 + prox * 3.0)) * rippleAmp,
        cos(uv.x * rippleFreq * 0.7 - uTime * 1.4) * rippleAmp * 0.6
      );

      // Subtle architectural brick relief modulation
      float brick = step(0.92, fract(uv.y * 48.0)) + step(0.96, fract(uv.x * 24.0 + 0.5 * step(0.5, fract(uv.y * 24.0))));
      vec3 base = sampleCover(waveUv);

      // Ultrasonic sonar wave rings emanating from cursor foot-traffic position
      float sonar = sin(distM * 36.0 - uTime * 5.0) * 0.5 + 0.5;
      float sonarMask = exp(-distM * (3.2 - prox * 1.5)) * pow(sonar, 6.0);

      // Sakura brilliance + palette shift from calm gold/ink to vivid crimson/violet
      vec3 sakuraGlow = mix(vec3(0.98, 0.75, 0.24), vec3(0.99, 0.38, 0.58), prox);
      vec3 petalField = sakuraGlow * smoothstep(0.68, 0.96, noise(uv * 18.0 + vec2(uTime * 0.35, -uTime * 0.55))) * (0.25 + prox * 0.65);

      vec3 col = base * (0.88 + prox * 0.25) + petalField + sakuraGlow * sonarMask * (0.3 + prox * 0.55) - vec3(brick * 0.025);
      gl_FragColor = vec4(col, 1.0);
      return;
    }

    // MODE 2: SOGNO — LiDAR Spatial Depth-Scan & AR Holographic Wireframe Lens
    if (uMode == 2) {
      vec3 base = sampleCover(uv);
      float radius = 0.24 + uParamA * 0.14;
      float insideLens = smoothstep(radius + 0.02, radius - 0.02, distM);
      float ring = smoothstep(0.016, 0.0, abs(distM - radius));

      // Edge-detection / LiDAR point-cloud wireframe simulation inside lens
      vec2 texel = 2.0 / max(uResolution, vec2(1.0));
      float lumaC = dot(sampleCover(uv), vec3(0.299, 0.587, 0.114));
      float lumaR = dot(sampleCover(uv + vec2(texel.x, 0.0)), vec3(0.299, 0.587, 0.114));
      float lumaU = dot(sampleCover(uv + vec2(0.0, texel.y)), vec3(0.299, 0.587, 0.114));
      float edge = clamp(abs(lumaC - lumaR) + abs(lumaC - lumaU), 0.0, 1.0) * 5.5;

      // LiDAR dot matrix + sweeping laser line
      vec2 grid = fract(uv * vec2(48.0, 28.0)) - 0.5;
      float lidarDot = smoothstep(0.22, 0.08, length(grid));
      float sweep = exp(-abs(fract(uTime * 0.32) - uv.y) * 28.0);

      vec3 holo = mix(vec3(0.13, 0.83, 0.93), vec3(0.66, 0.33, 0.97), uv.x);
      vec3 lidarView = base * 0.32 + holo * (edge * 0.9 + lidarDot * lumaC * 0.85 + sweep * 0.45);

      vec3 col = mix(base, lidarView, insideLens) + vec3(0.18, 0.92, 0.98) * ring * 0.9;
      gl_FragColor = vec4(col, 1.0);
      return;
    }

    // MODE 3: Notas y Colores — Synesthetic 4-Lane Audio-Reactive Chromatic Wave
    if (uMode == 3) {
      float laneIdx = floor(uv.x * 4.0);
      float pulse = 0.0;
      vec3 laneCol = vec3(1.0);
      if (laneIdx < 0.5) {
        pulse = uBeatLanes.x;
        laneCol = vec3(0.22, 0.95, 0.45); // Lime Green
      } else if (laneIdx < 1.5) {
        pulse = uBeatLanes.y;
        laneCol = vec3(0.95, 0.25, 0.65); // Hot Pink
      } else if (laneIdx < 2.5) {
        pulse = uBeatLanes.z;
        laneCol = vec3(0.99, 0.82, 0.12); // Solar Yellow
      } else {
        pulse = uBeatLanes.w;
        laneCol = vec3(0.08, 0.78, 0.96); // Electric Cyan
      }

      float totalEnergy = (uBeatLanes.x + uBeatLanes.y + uBeatLanes.z + uBeatLanes.w) * 0.25 + uParamA * 0.2;
      vec2 warpUv = uv + vec2(0.0, sin(uv.x * 16.0 + uTime * 6.0) * 0.012 * (0.15 + totalEnergy));
      vec3 base = sampleCover(warpUv);

      // Travelling harmonic wave bars per lane
      float localX = fract(uv.x * 4.0);
      float laneBorder = smoothstep(0.025, 0.0, min(localX, 1.0 - localX));
      float waveY = sin(uv.y * 20.0 - uTime * 8.0 + laneIdx * 1.4) * 0.5 + 0.5;
      float beatRibbon = exp(-abs(uv.y - (0.2 + 0.6 * waveY)) * (12.0 - pulse * 7.0)) * (0.18 + pulse * 0.85);

      vec3 col = base * (0.68 + pulse * 0.45) + laneCol * (beatRibbon + pulse * 0.35 + laneBorder * 0.25);
      gl_FragColor = vec4(col, 1.0);
      return;
    }

    // MODE 4: The Amazing Digital Circus 2 — Retro-Digital CRT & Glitch LookDev Shader
    vec2 centered = uv - 0.5;
    float r2 = dot(centered, centered);
    float barrel = 1.0 + r2 * (0.12 + uParamA * 0.15);
    vec2 crtUv = centered * barrel + 0.5;

    float glitchStrength = uParamA * 0.045 + exp(-distM * 3.0) * 0.018;
    float rowGlitch = step(0.84 - uParamA * 0.22, hash(vec2(floor(uv.y * 34.0), floor(uTime * 12.0))));
    float xShift = (hash(vec2(floor(uv.y * 22.0), floor(uTime * 18.0))) - 0.5) * glitchStrength * (1.0 + rowGlitch * 3.5);

    vec2 rUv = crtUv + vec2(xShift + glitchStrength * 0.4, 0.0);
    vec2 gUv = crtUv + vec2(xShift * 0.4, 0.0);
    vec2 bUv = crtUv + vec2(xShift - glitchStrength * 0.4, 0.0);

    float r = sampleCover(rUv).r;
    float g = sampleCover(gUv).g;
    float b = sampleCover(bUv).b;
    vec3 col = vec3(r, g, b);

    // Subtle CRT scanlines + spotlight around pointer
    float scan = 0.9 + 0.1 * sin(uv.y * uResolution.y * 1.4);
    float spot = 0.82 + 0.35 * exp(-distM * 3.2);
    col = col * scan * spot;

    // Vignette at barrel border
    float vig = smoothstep(0.95, 0.45, length(centered));
    gl_FragColor = vec4(col * (0.75 + 0.25 * vig), 1.0);
  }
`
