export const LAB_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

/**
 * Unified bespoke multi-mode GLSL fragment shader supporting all 7 portfolio projects'
 * interactive physical/computational mechanics with smooth 350ms preset texture crossfade.
 */
export const LAB_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uTexture;
  uniform sampler2D uPrevTexture;
  uniform float uHasTexture;
  uniform float uHasPrevTexture;
  uniform float uMix;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform int uMode; // 0: Palenque, 1: Kane, 2: Sogno, 3: Notas, 4: TADC2, 5: Reminiscencia, 6: Vestigio
  uniform float uParamA;
  uniform vec4 uBeatLanes;

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

  float fbm3(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 3; i++) {
      v += a * noise(p);
      p = rot * p * 2.05 + vec2(7.3, 11.1);
      a *= 0.5;
    }
    return v;
  }

  float lumaOf(vec3 c) {
    return dot(c, vec3(0.299, 0.587, 0.114));
  }

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

  void main() {
    vec2 uv = vUv;
    vec2 m = clamp(uMouse, 0.0, 1.0);
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 deltaM = (uv - m) * vec2(aspect, 1.0);
    float distM = length(deltaM);

    // =========================================================================
    // MODE 0: Crónicas de Palenque — Volumetric Ray-Tracing & Layered Spores
    // =========================================================================
    if (uMode == 0) {
      float sunIntensity = clamp(uParamA, 0.0, 1.0);
      float heatWave = exp(-distM * 2.4) * (0.002 + sunIntensity * 0.004);
      vec2 waveUv = uv + vec2(
        sin(uv.y * 9.0 + uTime * 1.1) * heatWave,
        cos(uv.x * 7.5 + uTime * 0.85) * heatWave
      );
      vec3 base = sampleCover(waveUv);

      // Smooth multi-shaft volumetric god-rays radiating from cursor sun origin
      vec2 rayDir = deltaM / (distM + 0.0001);
      float angle = atan(rayDir.y, rayDir.x);
      float rayNoiseA = fbm3(vec2(angle * 3.8 + uTime * 0.12, distM * 1.6 - uTime * 0.25));
      float rayNoiseB = fbm3(vec2(angle * 7.2 - uTime * 0.18, distM * 2.4));
      float shafts = pow(clamp(rayNoiseA * 0.7 + rayNoiseB * 0.45, 0.0, 1.0), 2.2);
      float radialFalloff = exp(-distM * (2.1 - sunIntensity * 0.75));
      float sunCore = exp(-distM * 7.5) * (0.35 + sunIntensity * 0.55);

      vec3 sunGold = mix(vec3(1.0, 0.66, 0.20), vec3(1.0, 0.88, 0.52), sunCore);
      vec3 canopyEmerald = vec3(0.14, 0.90, 0.58);
      vec3 godRay = sunGold * (shafts * (0.45 + sunIntensity * 0.85) * radialFalloff + sunCore * 0.65);

      // Layered depth bioluminescent memory spores (distant fireflies + near bokeh)
      float nearSpores = 0.0;
      float farSpores = 0.0;
      for (int i = 0; i < 8; i++) {
        float fi = float(i);
        float layer = step(3.5, fi);
        float speed = mix(0.025, 0.055, layer);
        vec2 sp = vec2(
          fract(0.13 * fi + sin(uTime * (0.35 + 0.07 * fi) + fi * 2.1) * 0.08 + (m.x - 0.5) * (0.04 + layer * 0.08)),
          fract(0.19 * fi + uTime * speed + cos(uTime * 0.5 + fi) * 0.04)
        );
        float sd = length((uv - sp) * vec2(aspect, 1.0));
        float twinkle = 0.55 + 0.45 * sin(uTime * (2.4 + fi * 0.6) + fi * 1.7);
        if (layer < 0.5) {
          farSpores += exp(-sd * 56.0) * twinkle;
        } else {
          nearSpores += exp(-sd * 28.0) * twinkle;
        }
      }
      vec3 sporeCol =
        canopyEmerald * farSpores * (0.55 + sunIntensity * 0.45) +
        mix(canopyEmerald, sunGold, 0.58) * nearSpores * (0.65 + sunIntensity * 0.5);

      float vignette = smoothstep(1.25, 0.35, length((uv - 0.5) * vec2(aspect, 1.0)));
      vec3 col = base * (0.68 + radialFalloff * (0.36 + sunIntensity * 0.28)) * (0.85 + 0.15 * vignette) + godRay + sporeCol;
      gl_FragColor = vec4(col, 1.0);
      return;
    }

    // =========================================================================
    // MODE 1: Kane no Hibiki — Ultrasonic Projection Mapping & Falling Sakura
    // =========================================================================
    if (uMode == 1) {
      float prox = clamp(uParamA, 0.0, 1.0);
      float rippleFreq = mix(10.0, 26.0, prox);
      float rippleAmp = mix(0.0025, 0.015, prox);
      vec2 waveUv = uv + vec2(
        sin(uv.y * rippleFreq + uTime * (1.8 + prox * 3.2)) * rippleAmp,
        cos(uv.x * rippleFreq * 0.75 - uTime * 1.5) * rippleAmp * 0.65
      );

      // Architectural brick facade projection relief
      float rowOffset = 0.5 * step(0.5, fract(uv.y * 22.0));
      float mortarY = smoothstep(0.90, 0.98, fract(uv.y * 44.0));
      float mortarX = smoothstep(0.94, 0.99, fract(uv.x * 22.0 + rowOffset));
      float brickMask = clamp(mortarY + mortarX, 0.0, 1.0);

      vec3 base = sampleCover(waveUv);

      // Ultrasonic sonar interference waves radiating from visitor position
      float sonarWave1 = pow(sin(distM * (28.0 + prox * 16.0) - uTime * (4.5 + prox * 2.5)) * 0.5 + 0.5, 6.0);
      float sonarWave2 = pow(sin(distM * 16.0 - uTime * 3.1) * 0.5 + 0.5, 8.0);
      float sonarMask = exp(-distM * (3.1 - prox * 1.45)) * (sonarWave1 * 0.8 + sonarWave2 * 0.45);

      // Falling sakura petals (anisotropic rotated SDF blossoms drifting on diagonal wind)
      float petals = 0.0;
      for (int i = 0; i < 8; i++) {
        float fi = float(i);
        vec2 pPos = vec2(
          fract(0.14 * fi + uTime * (0.045 + 0.01 * mod(fi, 3.0)) + sin(uTime * 1.2 + fi * 2.3) * 0.04),
          fract(0.88 - 0.13 * fi - uTime * (0.065 + 0.015 * mod(fi, 4.0)))
        );
        vec2 d = (uv - pPos) * vec2(aspect, 1.0);
        float a = uTime * (1.1 + 0.25 * fi) + fi * 1.9;
        float ca = cos(a);
        float sa = sin(a);
        vec2 rd = vec2(ca * d.x - sa * d.y, sa * d.x + ca * d.y);
        float petalDist = length(rd * vec2(1.0, 2.2));
        petals += smoothstep(0.022, 0.005, petalDist) * (0.55 + 0.45 * prox);
      }

      vec3 lanternGold = vec3(0.98, 0.76, 0.28);
      vec3 sakuraRose = vec3(1.0, 0.36, 0.58);
      vec3 shrineViolet = vec3(0.62, 0.28, 0.96);
      vec3 sakuraPalette = mix(lanternGold, sakuraRose, prox);
      vec3 sonarColor = mix(sakuraPalette, shrineViolet, clamp(distM * 1.4, 0.0, 1.0));

      float ambientDrift = smoothstep(0.66, 0.95, noise(uv * 16.0 + vec2(uTime * 0.3, -uTime * 0.45)));
      vec3 col =
        base * (0.86 + prox * 0.24) +
        sakuraPalette * (ambientDrift * (0.18 + prox * 0.42) + petals * 0.72) +
        sonarColor * sonarMask * (0.35 + prox * 0.65) -
        vec3(brickMask * 0.032);

      gl_FragColor = vec4(col, 1.0);
      return;
    }

    // =========================================================================
    // MODE 2: SOGNO — 3x3 Sobel LiDAR Edge Detection & AR Targeting Reticle
    // =========================================================================
    if (uMode == 2) {
      vec3 base = sampleCover(uv);
      float radius = 0.20 + clamp(uParamA, 0.0, 1.0) * 0.22;
      float insideLens = smoothstep(radius + 0.015, radius - 0.015, distM);

      // True 3x3 Sobel edge operator on image luminance
      vec2 texel = 1.6 / max(uResolution, vec2(1.0));
      float tl = lumaOf(sampleCover(uv + vec2(-texel.x,  texel.y)));
      float tc = lumaOf(sampleCover(uv + vec2(0.0,       texel.y)));
      float tr = lumaOf(sampleCover(uv + vec2( texel.x,  texel.y)));
      float ml = lumaOf(sampleCover(uv + vec2(-texel.x,  0.0)));
      float mc = lumaOf(base);
      float mr = lumaOf(sampleCover(uv + vec2( texel.x,  0.0)));
      float bl = lumaOf(sampleCover(uv + vec2(-texel.x, -texel.y)));
      float bc = lumaOf(sampleCover(uv + vec2(0.0,      -texel.y)));
      float br = lumaOf(sampleCover(uv + vec2( texel.x, -texel.y)));

      float gx = -tl - 2.0 * ml - bl + tr + 2.0 * mr + br;
      float gy = -tl - 2.0 * tc - tr + bl + 2.0 * bc + br;
      float sobelEdge = clamp(length(vec2(gx, gy)) * 2.4, 0.0, 1.0);

      // Depth-elevation LiDAR point cloud matrix
      vec2 grid = fract(uv * vec2(54.0, 32.0)) - 0.5;
      float dotRadius = mix(0.11, 0.24, mc);
      float lidarDot = smoothstep(dotRadius + 0.06, dotRadius - 0.04, length(grid));

      // Sweeping LiDAR scan beam + radial calibration pulse
      float sweepY = exp(-abs(fract(uTime * 0.28) - uv.y) * 34.0);
      float radialPulse = exp(-abs(distM - fract(uTime * 0.45) * radius) * 42.0);

      // Holographic depth ramp (cyan -> electric violet -> white edge peaks)
      vec3 holoCyan = vec3(0.13, 0.86, 0.96);
      vec3 holoViolet = vec3(0.66, 0.34, 0.98);
      vec3 depthCol = mix(holoCyan, holoViolet, clamp(mc * 0.85 + uv.x * 0.25, 0.0, 1.0));
      vec3 edgePeak = mix(depthCol, vec3(0.94, 0.99, 1.0), pow(sobelEdge, 2.0));

      vec3 lidarView =
        base * 0.24 +
        edgePeak * sobelEdge * 1.15 +
        depthCol * (lidarDot * (0.28 + mc * 0.65) + sweepY * 0.42 + radialPulse * 0.38);

      // Animated AR targeting reticle (outer solid ring, rotating ticks, center crosshairs)
      float angle = atan(deltaM.y, deltaM.x);
      float outerRing = smoothstep(0.009, 0.001, abs(distM - radius));
      float innerDashed = smoothstep(0.006, 0.001, abs(distM - radius * 0.72)) *
        step(0.0, sin(angle * 16.0 + uTime * 1.4));
      float cardinalTicks = smoothstep(0.018, 0.0, abs(distM - radius * 1.06)) *
        pow(max(abs(cos(angle * 2.0)), abs(sin(angle * 2.0))), 24.0);
      float crosshair =
        (smoothstep(0.004, 0.0, abs(deltaM.x)) * step(0.012, abs(deltaM.y)) * step(abs(deltaM.y), 0.045)) +
        (smoothstep(0.004, 0.0, abs(deltaM.y)) * step(0.012, abs(deltaM.x)) * step(abs(deltaM.x), 0.045));

      float reticle = clamp(outerRing + innerDashed * 0.55 + cardinalTicks * 0.85 + crosshair * 0.8, 0.0, 1.0);
      vec3 col = mix(base, lidarView, insideLens) + vec3(0.24, 0.94, 1.0) * reticle * 0.92;
      gl_FragColor = vec4(col, 1.0);
      return;
    }

    // =========================================================================
    // MODE 3: Notas y Colores — Synesthetic 4-Lane Harmonic Spectrum Ribbons
    // =========================================================================
    if (uMode == 3) {
      float laneIdx = floor(uv.x * 4.0);
      float pulse = 0.0;
      vec3 laneCol = vec3(1.0);
      if (laneIdx < 0.5) {
        pulse = uBeatLanes.x;
        laneCol = vec3(0.29, 0.87, 0.50); // Lime #4ADE80
      } else if (laneIdx < 1.5) {
        pulse = uBeatLanes.y;
        laneCol = vec3(0.93, 0.28, 0.60); // Hot Pink #EC4899
      } else if (laneIdx < 2.5) {
        pulse = uBeatLanes.z;
        laneCol = vec3(0.98, 0.80, 0.08); // Solar Yellow #FACC15
      } else {
        pulse = uBeatLanes.w;
        laneCol = vec3(0.13, 0.83, 0.93); // Electric Cyan #22D3EE
      }

      float totalEnergy = (uBeatLanes.x + uBeatLanes.y + uBeatLanes.z + uBeatLanes.w) * 0.25;
      vec2 warpUv = uv + vec2(
        sin(uv.y * 14.0 - uTime * 5.0) * 0.005 * totalEnergy,
        sin(uv.x * 16.0 + uTime * 6.5) * 0.012 * (0.12 + totalEnergy)
      );
      vec3 base = sampleCover(warpUv);

      float localX = fract(uv.x * 4.0);
      float laneBorder = smoothstep(0.022, 0.0, min(localX, 1.0 - localX));

      // Layered harmonic spectrum ribbons (fundamental + 2nd & 3rd overtone waves)
      float f1 = sin(uv.y * 18.0 - uTime * 7.5 + laneIdx * 1.57) * 0.5 + 0.5;
      float f2 = sin(uv.y * 34.0 - uTime * 11.0 + laneIdx * 2.3) * 0.5 + 0.5;
      float ribbonCenter = 0.5 + (f1 - 0.5) * (0.28 + pulse * 0.42) + (f2 - 0.5) * (0.1 + pulse * 0.16);
      float harmonicRibbon = exp(-abs(localX - ribbonCenter) * (15.0 - pulse * 7.5)) * (0.22 + pulse * 0.95);
      float overtoneRibbon = exp(-abs(localX - (1.0 - ribbonCenter)) * 20.0) * (0.1 + pulse * 0.55);

      // Rising rhythmic spectrum EQ bars from bottom per lane
      float barCount = 5.0;
      float barCell = fract(localX * barCount);
      float barId = floor(localX * barCount);
      float barGap = step(0.16, barCell) * step(barCell, 0.84);
      float barHeight = (0.07 + 0.06 * sin(uTime * 6.0 + barId * 1.4 + laneIdx * 2.0)) +
        pulse * (0.34 + 0.18 * sin(barId * 1.9 + uTime * 12.0));
      float eqBar = barGap * smoothstep(barHeight + 0.02, barHeight - 0.02, uv.y) * (0.32 + pulse * 0.72);

      // Horizontal beat shockwave rising upward on pad trigger
      float beatRing = exp(-abs(uv.y - (1.0 - pulse) * 0.85) * 18.0) * pulse * 0.65;

      vec3 col =
        base * (0.62 + pulse * 0.38 + totalEnergy * 0.12) +
        laneCol * (harmonicRibbon + overtoneRibbon + eqBar * 0.75 + beatRing + laneBorder * (0.18 + pulse * 0.35)) +
        vec3(0.96, 0.98, 1.0) * (harmonicRibbon * pulse * 0.35);

      gl_FragColor = vec4(col, 1.0);
      return;
    }

    // =========================================================================
    // MODE 4: The Amazing Digital Circus 2 — Phosphor RGB CRT & Sync-Bar Glitch
    // =========================================================================
    if (uMode == 4) {
      float glitchAmt = clamp(uParamA, 0.0, 1.0);
      vec2 centered = uv - 0.5;
      float r2 = dot(centered, centered);
      float barrel = 1.0 + r2 * (0.15 + glitchAmt * 0.16);
      vec2 crtUv = centered * barrel + 0.5;

      // Rolling vertical sync hum bar + localized digital tear blocks
      float syncBarPos = fract(uTime * 0.18);
      float syncBand = exp(-abs(uv.y - syncBarPos) * 24.0);
      float syncShear = syncBand * (0.008 + glitchAmt * 0.028) * sin(uTime * 38.0);

      float rowBucket = floor(uv.y * 36.0);
      float timeStep = floor(uTime * 13.0);
      float rowRnd = hash(vec2(rowBucket, timeStep));
      float rowGlitch = step(0.86 - glitchAmt * 0.24, rowRnd);
      float cursorBoost = exp(-distM * 3.2) * 0.018;
      float glitchStrength = glitchAmt * 0.042 + cursorBoost;
      float xShift = ((rowRnd - 0.5) * glitchStrength * (1.0 + rowGlitch * 3.4)) + syncShear;

      float chroma = 0.002 + glitchStrength * 0.42 + syncBand * 0.008;
      float r = sampleCover(crtUv + vec2(xShift + chroma, 0.0)).r;
      float g = sampleCover(crtUv + vec2(xShift * 0.45, 0.0)).g;
      float b = sampleCover(crtUv + vec2(xShift - chroma, 0.0)).b;
      vec3 col = vec3(r, g, b);

      // Phosphor RGB aperture grille subpixel triad mask
      float subX = mod(floor(gl_FragCoord.x), 3.0);
      vec3 phosphorMask = vec3(
        mix(0.82, 1.18, step(abs(subX - 0.0), 0.5)),
        mix(0.82, 1.18, step(abs(subX - 1.0), 0.5)),
        mix(0.82, 1.18, step(abs(subX - 2.0), 0.5))
      );
      col *= mix(vec3(1.0), phosphorMask, 0.42 + glitchAmt * 0.25);

      // Fine horizontal scanlines + subtle sync bar glow + curved glass specular
      float scan = 0.88 + 0.12 * sin(crtUv.y * uResolution.y * 1.5);
      float glassGlint = exp(-length((centered - vec2(-0.22, 0.24)) * vec2(1.4, 2.2)) * 4.5) * 0.12;
      float spot = 0.84 + 0.28 * exp(-distM * 3.2);
      col = col * scan * spot + vec3(0.95, 0.35, 0.35) * syncBand * (0.06 + glitchAmt * 0.12) + vec3(glassGlint);

      // Rounded CRT bezel vignette
      vec2 edgeDist = abs(crtUv - 0.5) * 2.0;
      float bezel = smoothstep(1.04, 0.90, max(edgeDist.x, edgeDist.y));
      float cornerVig = smoothstep(1.05, 0.42, length(centered));
      gl_FragColor = vec4(col * bezel * (0.72 + 0.28 * cornerVig), 1.0);
      return;
    }

    // =========================================================================
    // MODE 5: Reminiscencia — Angled Halftone, VHS Head-Switch & Memory Echo
    // =========================================================================
    if (uMode == 5) {
      float corrupt = clamp(uParamA, 0.0, 1.0);
      float proximity = exp(-distM * 3.1);

      // Authentic VHS bottom head-switch jitter (bottom 7% tape skew + static snow)
      float headSwitchMask = smoothstep(0.085, 0.01, uv.y);
      float headJitter = (hash(vec2(floor(uv.y * 180.0), floor(uTime * 24.0))) - 0.5) *
        headSwitchMask * (0.045 + corrupt * 0.065);
      float headSnow = hash(gl_FragCoord.xy + fract(uTime * 41.7) * 200.0) * headSwitchMask * (0.28 + corrupt * 0.35);

      // Horizontal tracking tear bands
      float bandNoise = hash(vec2(floor(uv.y * 44.0), floor(uTime * 10.5)));
      float tear = step(0.88 - corrupt * 0.22, bandNoise) * (corrupt * 0.032 + proximity * 0.018);
      vec2 memUv = uv + vec2(
        (bandNoise - 0.5) * tear + headJitter,
        sin(uv.x * 16.0 + uTime * 2.8) * 0.003 * proximity
      );

      float chroma = 0.0035 + corrupt * 0.015 + proximity * 0.012;
      vec3 primary = vec3(
        sampleCover(memUv + vec2(chroma, 0.0)).r,
        sampleCover(memUv).g,
        sampleCover(memUv - vec2(chroma, 0.0)).b
      );

      // Delayed horizontal memory ghost echo
      float echoOffset = 0.022 + corrupt * 0.035 + proximity * 0.025;
      vec3 ghostSample = sampleCover(memUv + vec2(echoOffset * sin(uTime * 0.9 + 0.6), 0.004));
      vec3 ghostTint = mix(vec3(0.66, 0.33, 0.97), vec3(0.98, 0.80, 0.16), 0.38);
      vec3 col = mix(primary, primary * 0.78 + ghostSample * ghostTint * 0.62, 0.25 + proximity * 0.35 + corrupt * 0.22);

      // Angled 28-degree editorial print halftone screen inside memory anomaly
      float ca = 0.8829; // cos(28 deg)
      float sa = 0.4695; // sin(28 deg)
      vec2 rotUv = mat2(ca, -sa, sa, ca) * (uv * vec2(aspect, 1.0) * 68.0);
      float dotDist = length(fract(rotUv) - 0.5);
      float imgLuma = lumaOf(primary);
      float dotThreshold = mix(0.14, 0.42, imgLuma);
      float halftone = smoothstep(dotThreshold + 0.06, dotThreshold - 0.06, dotDist);

      float ring = exp(-abs(distM - (0.16 + 0.035 * sin(uTime * 2.8))) * 30.0);
      vec3 violetGold = mix(vec3(0.66, 0.33, 0.97), vec3(0.98, 0.82, 0.16), ring);
      float scan = 0.93 + 0.07 * sin(uv.y * uResolution.y * 1.15 + uTime * 5.0);

      col = col * scan +
        violetGold * (ring * 0.5 + halftone * proximity * (0.20 + corrupt * 0.26)) +
        vec3(headSnow);

      gl_FragColor = vec4(col, 1.0);
      return;
    }

    // =========================================================================
    // MODE 6: Vestigio (ALFAR) — Normal-Lit Terracotta Lathe, Engraved Bands & Embers
    // =========================================================================
    float sculpt = clamp(uParamA, 0.0, 1.0);
    float radial = exp(-distM * 2.6);

    // Rotational pottery lathe warp around pointer
    vec2 toMouse = uv - m;
    float latheGrooves = sin(uv.y * 115.0 + uTime * (1.2 + sculpt * 2.0)) * 0.5 + 0.5;
    float spinWave = sin((uv.y - m.y) * 26.0 - uTime * (2.0 + sculpt * 4.2)) * 0.011 * radial * (0.35 + sculpt);
    vec2 clayUv = uv + vec2(spinWave + toMouse.x * radial * 0.045 * (sculpt - 0.3), 0.0);
    vec3 base = sampleCover(clayUv);

    // Engraved ancestral geometric terracotta bands (step-fret / diamond motif along horizontal bands)
    float bandZone = smoothstep(0.18, 0.24, abs(uv.y - 0.5)) * smoothstep(0.46, 0.36, abs(uv.y - 0.5));
    float diamondPattern = abs(fract(uv.x * 18.0 + uTime * (0.08 + sculpt * 0.15)) - 0.5) +
      abs(fract(uv.y * 10.0) - 0.5);
    float engravedGroove = smoothstep(0.48, 0.42, diamondPattern) * bandZone;

    // Derive surface height & normal map from image luma + lathe rings + engraved bands
    vec2 texel = 2.0 / max(uResolution, vec2(1.0));
    float hC = lumaOf(base) + latheGrooves * 0.045 * (0.3 + sculpt) - engravedGroove * 0.14;
    float hR = lumaOf(sampleCover(clayUv + vec2(texel.x, 0.0))) + latheGrooves * 0.045 * (0.3 + sculpt);
    float hU = lumaOf(sampleCover(clayUv + vec2(0.0, texel.y))) + sin((uv.y + texel.y) * 115.0 + uTime * (1.2 + sculpt * 2.0)) * 0.0225 * (0.3 + sculpt);

    float reliefScale = 2.6 + sculpt * 3.8;
    vec3 N = normalize(vec3((hC - hR) * reliefScale, (hC - hU) * reliefScale, 1.0));
    vec3 L = normalize(vec3((m.x - uv.x) * aspect * 2.4, (m.y - uv.y) * 2.4, 0.62));
    vec3 V = vec3(0.0, 0.0, 1.0);
    vec3 H = normalize(L + V);

    float diff = clamp(dot(N, L), 0.0, 1.0);
    float spec = pow(clamp(dot(N, H), 0.0, 1.0), 34.0) * (0.45 + sculpt * 0.55);

    // Concentric potter's wheel guide contours
    float contour = pow(sin(distM * 40.0 - uTime * 3.2) * 0.5 + 0.5, 5.0) * exp(-distM * 3.0);
    vec3 terracotta = mix(vec3(0.84, 0.36, 0.12), vec3(1.0, 0.78, 0.36), diff);

    // Rising kiln embers & ancestral clay dust
    float embers = 0.0;
    for (int i = 0; i < 8; i++) {
      float fi = float(i);
      vec2 ep = vec2(
        fract(0.15 * fi + sin(uTime * (0.45 + 0.08 * fi) + fi * 1.9) * 0.08 + (m.x - 0.5) * 0.14),
        fract(0.12 * fi + uTime * (0.04 + 0.012 * mod(fi, 4.0)))
      );
      float ed = length((uv - ep) * vec2(aspect, 1.0));
      embers += exp(-ed * (34.0 + mod(fi, 3.0) * 12.0)) * (0.65 + 0.35 * sin(uTime * 4.0 + fi));
    }

    vec3 litClay = base * (0.66 + diff * 0.52) - vec3(engravedGroove * 0.09);
    vec3 col =
      litClay +
      terracotta * (spec * 0.62 + contour * (0.24 + sculpt * 0.38) + engravedGroove * diff * 0.22) +
      vec3(1.0, 0.72, 0.28) * embers * (0.65 + sculpt * 0.45);

    gl_FragColor = vec4(col, 1.0);
  }
`
