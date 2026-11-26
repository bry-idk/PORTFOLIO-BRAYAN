// ============================================================================
// 1. REACTIVE DOMAIN-WARPED FLUID BACKGROUND (PORTFOLIO AR DNA) + FBO WAKE
// ============================================================================

export const ATMOSPHERE_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

export const ATMOSPHERE_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uPointerSpeed;
  uniform float uScroll;
  uniform float uHeroFocus;
  uniform float uAmbientPulse;
  uniform float uLowPower;
  uniform float uReducedMotion;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform sampler2D uFluidTex;
  uniform float uHasFluid;

  float hash12(vec2 p) {
    float result = fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    return result;
  }

  // 2D Gradient Perlin-style hash & noise (silky organic liquid ribbons from Portfolio AR)
  vec2 gradHash(vec2 p) {
    vec2 q = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    vec2 result = -1.0 + 2.0 * fract(sin(q) * 43758.5453123);
    return result;
  }

  float gradNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = dot(gradHash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
    float b = dot(gradHash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
    float c = dot(gradHash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
    float d = dot(gradHash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
    float result = mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    return result;
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
    for (int i = 0; i < 4; i++) {
      if (i == 3 && uLowPower > 0.5) {
        break;
      }
      v += a * gradNoise(p);
      p = rot * p * 2.03;
      a *= 0.5;
    }
    return v;
  }

  // Triple-stage recursive domain warping (ferrofluid / liquid marble filaments)
  float fluidField(vec2 p, float t) {
    vec2 q = vec2(
      fbm(p + vec2(0.0, t * 0.16)),
      fbm(p + vec2(4.2, -t * 0.12))
    );
    vec2 r = vec2(
      fbm(p + 3.2 * q + vec2(1.7, 9.2) + 0.14 * t),
      fbm(p + 3.2 * q + vec2(8.3, 2.8) - 0.11 * t)
    );
    float result = fbm(p + 2.6 * r);
    return result;
  }

  vec3 acesFilm(vec3 x) {
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    vec3 result = clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
    return result;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    vec2 ptr = (uMouse - 0.5) * vec2(aspect, 1.0);

    float t = uTime * mix(1.0, 0.15, clamp(uReducedMotion, 0.0, 1.0));

    // Sample live ping-pong FBO fluid velocity & trailing energy wake
    vec2 stepUv = vec2(0.0042, 0.0042);
    vec4 fluidC = texture2D(uFluidTex, uv);
    vec4 fluidL = texture2D(uFluidTex, clamp(uv - vec2(stepUv.x, 0.0), 0.0, 1.0));
    vec4 fluidR = texture2D(uFluidTex, clamp(uv + vec2(stepUv.x, 0.0), 0.0, 1.0));
    vec4 fluidB = texture2D(uFluidTex, clamp(uv - vec2(0.0, stepUv.y), 0.0, 1.0));
    vec4 fluidT = texture2D(uFluidTex, clamp(uv + vec2(0.0, stepUv.y), 0.0, 1.0));

    vec2 fluidVel = (fluidC.rg * 2.0 - 1.0) * uHasFluid;
    float fluidEnergy = fluidC.b * uHasFluid;
    float fluidRipple = fluidC.a * uHasFluid;
    vec2 fluidGrad = vec2(
      (fluidR.b - fluidL.b) + (fluidR.a - fluidL.a) * 1.45,
      (fluidT.b - fluidB.b) + (fluidT.a - fluidB.a) * 1.45
    ) * 0.5 * uHasFluid;

    // Exact tactile mouse distortion + lingering FBO wake & subtle scroll drift
    vec2 toPtr = p - ptr;
    float dist = length(toPtr);
    float velNorm = clamp(uPointerSpeed, 0.0, 1.2);
    float influence = exp(-dist * 3.2) * (0.14 + velNorm * 0.45);
    vec2 scrollOffset = vec2(0.0, -uScroll * 0.65);

    vec2 warpedUv =
      (p + scrollOffset) * 1.55 -
      normalize(toPtr + vec2(0.0001)) * influence -
      fluidVel * 0.24 +
      fluidGrad * 0.30;

    // Prismatic RGB chromatic refraction split around mouse distortion & fluid wake
    float chroma = 0.014 + influence * 0.16 + fluidEnergy * 0.045;
    float fR = fluidField(warpedUv + vec2(chroma, 0.0), t);
    float fG = fluidField(warpedUv, t);
    float fB = fluidField(warpedUv - vec2(chroma, 0.0), t);

    // Theme-reactive palette anchored to Portfolio AR's obsidian / violet / neon-emerald / silver DNA
    vec3 colObsidian = vec3(0.02, 0.025, 0.032);
    vec3 colDeepFluid = mix(uColorC, uColorB * 0.38, 0.42);
    vec3 colNeon = uColorA;
    vec3 colSilver = mix(vec3(0.84, 0.96, 0.91), vec3(0.96, 0.97, 1.0), 0.22);

    float nR = smoothstep(-0.35, 0.65, fR);
    float nG = smoothstep(-0.35, 0.65, fG);
    float nB = smoothstep(-0.35, 0.65, fB);

    float heroAmt = clamp(uHeroFocus, 0.0, 1.0);
    // Full vivid Portfolio AR fluid in Hero; slightly calmer contrast inside project chapters for crisp reading
    float intensityScale = mix(0.58, 1.0, heroAmt);

    vec3 color = colObsidian;
    color = mix(color, colDeepFluid, smoothstep(0.15, 0.85, nB) * (0.76 * intensityScale));

    // Luminous topographic liquid-neon ridges + chromatic dispersion fringes
    float ridgeR = pow(max(clamp(1.0 - abs(fR * 2.2), 0.0, 1.0), 0.0001), 4.0);
    float ridgeG = pow(max(clamp(1.0 - abs(fG * 2.2), 0.0, 1.0), 0.0001), 4.0);
    float ridgeB = pow(max(clamp(1.0 - abs(fB * 2.2), 0.0, 1.0), 0.0001), 4.0);

    float ridgeBoost = (0.36 + influence * 1.15 + fluidEnergy * 0.38 + uAmbientPulse * 0.16) * intensityScale;
    color += colNeon * ridgeG * ridgeBoost;

    // Subtle RGB chromatic dispersion edge glow along perturbed ridges
    vec3 chromaFringe = vec3(
      max(ridgeR - ridgeG, 0.0),
      0.0,
      max(ridgeB - ridgeG, 0.0)
    );
    color += mix(uColorB, colSilver, 0.35) * (chromaFringe.r + chromaFringe.b) * (0.28 + influence * 0.75) * intensityScale;

    // Silvery specular silk crests & FBO capillary caustic shimmer
    float silverCrest = pow(max(clamp(nR * nG, 0.0, 1.0), 0.0001), 3.0);
    color += colSilver * silverCrest * (0.22 + fluidRipple * 0.16) * intensityScale;

    float gradMag = length(fluidGrad);
    float causticWake = pow(max(clamp(gradMag * 4.8, 0.0, 1.0), 0.0001), 1.5);
    color += mix(colNeon, colSilver, 0.4) * causticWake * (0.18 + fluidRipple * 0.24) * intensityScale;

    // Immediate luminous cursor / touch field glow
    float touchGlow = exp(-dist * 4.5) * (0.22 + velNorm * 0.16);
    color += colNeon * touchGlow * intensityScale;

    // Cinema vignette matching Portfolio AR framing
    float vig = smoothstep(1.25, 0.20, length((uv - 0.5) * vec2(1.15, 1.0)));
    color *= mix(0.45, 1.0, vig);

    // Smooth ACES Filmic highlight roll-off so neon ridges stay vivid without harsh clipping
    vec3 finalCol = acesFilm(color * 1.12);

    // Subtle editorial halftone dot modulation near periphery + fine organic grain
    vec2 halftoneCoord = gl_FragCoord.xy + fluidVel * 4.0;
    vec2 gridUv = fract(halftoneCoord / 14.0) - 0.5;
    float dotDist = length(gridUv);
    float edgeMask = smoothstep(0.36, 0.86, length(uv - 0.5));
    float halftone = smoothstep(0.14, 0.055, dotDist) * edgeMask * (0.028 + fluidRipple * 0.018);
    float grain = (hash12(gl_FragCoord.xy + fract(uTime * 19.3) * 100.0) - 0.5) * 0.018;

    gl_FragColor = vec4(clamp(finalCol + vec3(halftone) + grain, 0.0, 1.0), 1.0);
  }
`

// ============================================================================
// 2. HERO SCULPTURE: OPTICAL LIQUID OBSIDIAN & DICHROIC CRYSTAL (PBR + IBL)
// ============================================================================

export const PRISM_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScroll;
  uniform float uPulse;

  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying float vDisplace;
  varying float vCrease;
  varying float vCavity;

  float gyroid(vec3 p) {
    float result = dot(sin(p), cos(p.yzx));
    return result;
  }

  // Sculptural liquid-obsidian & folded crystal displacement field
  float prismField(vec3 p, float t, vec2 mouseNdc, float pulse) {
    float g1 = gyroid(p * 2.02 + vec3(t * 0.40, -t * 0.30, t * 0.25));
    // Abs-folded secondary gyroid carves crisp volcanic-glass ridges & luminous cavities
    float g2 = 1.0 - abs(gyroid(p * 3.55 - vec3(t * 0.48, t * 0.34, -t * 0.22)));
    float g3 = gyroid(p * 5.2 + vec3(-t * 0.22, t * 0.38, t * 0.19)) * 0.018;
    float mousePull = smoothstep(1.95, 0.0, length(mouseNdc - p.xy));
    float scrollRipple = sin(p.y * 3.4 + uScroll * 5.4 - t * 0.85) * 0.036;
    float result = (g1 * 0.145 + g2 * 0.072 + g3) + scrollRipple + mousePull * (0.082 + pulse * 0.05) * sin(t * 2.1 + p.y * 3.3);
    return result;
  }

  void main() {
    vec3 pos = position;
    float radius = length(pos);
    vec3 baseNormal = normalize(pos + vec3(0.00001));
    float t = uTime * 0.58;
    vec2 mouseNdc = (uMouse - 0.5) * 2.2;

    float d0 = prismField(pos, t, mouseNdc, uPulse);
    vec3 p0 = pos + baseNormal * d0;

    // Finite-difference tangent-frame perturbation for razor-sharp recomputed normals
    vec3 refAxis = abs(baseNormal.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 tangent = normalize(cross(refAxis, baseNormal));
    vec3 bitangent = cross(baseNormal, tangent);

    float eps = 0.020;
    vec3 baseT = normalize(pos + tangent * eps) * radius;
    vec3 baseB = normalize(pos + bitangent * eps) * radius;

    vec3 nT = normalize(baseT);
    vec3 nB = normalize(baseB);

    float dT = prismField(baseT, t, mouseNdc, uPulse);
    float dB = prismField(baseB, t, mouseNdc, uPulse);

    vec3 pT = baseT + nT * dT;
    vec3 pB = baseB + nB * dB;

    vec3 perturbedNormal = normalize(cross(pT - p0, pB - p0) + vec3(0.00001));
    if (dot(perturbedNormal, baseNormal) < 0.0) {
      perturbedNormal = -perturbedNormal;
    }

    // Separate raised volcanic-glass ridges (vCrease) from deep luminous folds (vCavity)
    vCrease = clamp((abs(dT - d0) + abs(dB - d0)) * 7.2, 0.0, 1.0);
    vCavity = smoothstep(0.05, -0.145, d0);
    vDisplace = d0;

    vec4 worldPosition = modelMatrix * vec4(p0, 1.0);
    vWorldPos = worldPosition.xyz;
    vWorldNormal = normalize((modelMatrix * vec4(perturbedNormal, 0.0)).xyz + vec3(0.00001));

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

export const PRISM_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uOpacity;
  uniform float uPulse;

  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying float vDisplace;
  varying float vCrease;
  varying float vCavity;

  vec3 acesFilm(vec3 x) {
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    vec3 result = clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
    return result;
  }

  // Trowbridge-Reitz GGX normal distribution function
  float ggxDistribution(float NdotH, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float denom = (NdotH * NdotH) * (a2 - 1.0) + 1.0;
    float result = a2 / max(3.14159265 * denom * denom, 0.0001);
    return result;
  }

  vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    float f = pow(max(1.0 - cosTheta, 0.0001), 5.0);
    vec3 result = F0 + (1.0 - F0) * f;
    return result;
  }

  // Analytical 3-Point Studio IBL + Softbox Environment Reflections
  vec3 sampleStudioIBL(vec3 R, vec3 cA, vec3 cB, vec3 cC) {
    // 1. Key overhead-right studio softbox (crisp rectangular specular panel)
    vec3 keyDir = normalize(vec3(0.54, 0.68, 0.49));
    float keyAlign = max(dot(R, keyDir), 0.0);
    float keySoftbox = smoothstep(0.76, 0.96, keyAlign) * 1.45 + pow(max(keyAlign, 0.0001), 22.0) * 0.85;
    vec3 keyCol = vec3(1.0, 0.985, 0.96) * keySoftbox;

    // 2. Cool architectural fill panel (left-lower studio bounce)
    vec3 fillDir = normalize(vec3(-0.76, 0.18, 0.62));
    float fillAlign = max(dot(R, fillDir), 0.0);
    float fillPanel = smoothstep(0.55, 0.90, fillAlign) * 0.65 + pow(max(fillAlign, 0.0001), 9.0) * 0.45;
    vec3 fillCol = mix(cC, vec3(0.62, 0.84, 1.0), 0.55) * fillPanel;

    // 3. Dramatic edge rim strip light
    vec3 rimDir = normalize(vec3(-0.62, -0.45, -0.64));
    float rimAlign = max(dot(R, rimDir), 0.0);
    float rimStrip = pow(max(rimAlign, 0.0001), 12.0) * 1.05;
    vec3 rimCol = mix(cA, cB, 0.45) * rimStrip;

    // 4. Curved gallery horizon cyclorama specular band
    float waveHorizon = sin(R.x * 3.4 + R.z * 2.1) * 0.14;
    float horizonBand = exp(-abs(R.y - waveHorizon) * 11.0) * 0.72;
    float upperDome = smoothstep(-0.25, 0.85, R.y) * 0.24;
    vec3 horizonCol = mix(cB, vec3(0.88, 0.94, 1.0), 0.42) * horizonBand + mix(cC, vec3(0.18, 0.22, 0.34), 0.5) * upperDome;

    vec3 result = keyCol + fillCol + rimCol + horizonCol;
    return result;
  }

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(cameraPosition - vWorldPos + vec3(0.00001));
    float NdotV = clamp(dot(N, V), 0.001, 1.0);

    float fresnelBroad = pow(max(1.0 - NdotV, 0.0001), 2.5);
    float razorRim = pow(max(1.0 - NdotV, 0.0001), 5.0);

    // Chromatic RGB dispersion via offset reflective/refractive environment rays
    vec3 reflDir = reflect(-V, N);
    vec3 refrR = refract(-V, N, 1.0 / 1.38);
    vec3 refrG = refract(-V, N, 1.0 / 1.48);
    vec3 refrB = refract(-V, N, 1.0 / 1.60);

    float envMix = clamp(fresnelBroad * 0.82 + 0.24, 0.0, 1.0);
    vec3 dirR = length(refrR) > 0.001 ? normalize(mix(refrR, reflDir, envMix)) : reflDir;
    vec3 dirG = length(refrG) > 0.001 ? normalize(mix(refrG, reflDir, envMix)) : reflDir;
    vec3 dirB = length(refrB) > 0.001 ? normalize(mix(refrB, reflDir, envMix)) : reflDir;

    vec3 iblR = sampleStudioIBL(dirR, uColorA, uColorB, uColorC);
    vec3 iblG = sampleStudioIBL(dirG, uColorA, uColorB, uColorC);
    vec3 iblB = sampleStudioIBL(dirB, uColorA, uColorB, uColorC);
    vec3 dispersedIBL = vec3(iblR.r, iblG.g, iblB.b);

    // Physical Thin-Film Iridescent Interference (R/G/B optical path phase shift)
    float filmThickness = 1.65 * NdotV + vDisplace * 3.4 + vCrease * 0.65 + uTime * 0.085;
    vec3 thinFilm = 0.5 + 0.5 * cos(6.28318 * filmThickness + vec3(0.0, 2.094, 4.188));
    vec3 themeGradient = mix(uColorA, uColorB, clamp(fresnelBroad * 0.78 + (vDisplace * 2.2 + 0.5) * 0.42, 0.0, 1.0));
    vec3 iridescent = mix(themeGradient, mix(themeGradient, uColorC, 0.35) + thinFilm * 0.48, 0.54);

    // Dual-lobe GGX Specular + Clearcoat across 3-Point Studio Lights
    vec3 keyLight = normalize(vec3(2.5, 3.3, 3.8));
    vec3 fillLight = normalize(vec3(-2.8, 0.8, 2.4));
    vec3 rimLight = normalize(vec3(-2.6, -1.5, -2.0));

    vec3 Hkey = normalize(keyLight + V);
    vec3 Hfill = normalize(fillLight + V);
    vec3 Hrim = normalize(rimLight + V);

    float NdotHKey = max(dot(N, Hkey), 0.0);
    float NdotLKey = max(dot(N, keyLight), 0.0);
    float NdotHFill = max(dot(N, Hfill), 0.0);
    float NdotLFill = max(dot(N, fillLight), 0.0);
    float NdotHRim = max(dot(N, Hrim), 0.0);

    // Lobe 1: Razor-sharp polished obsidian Clearcoat (roughness 0.075)
    float ccKey = ggxDistribution(NdotHKey, 0.075) * NdotLKey * 0.048;
    float ccFill = ggxDistribution(NdotHFill, 0.11) * NdotLFill * 0.022;
    vec3 clearcoatF = fresnelSchlick(NdotV, vec3(0.06));
    vec3 clearcoatSpec = vec3(1.0, 0.99, 0.97) * ccKey * (0.65 + clearcoatF.r * 1.4) +
                         mix(uColorC, vec3(0.76, 0.92, 1.0), 0.6) * ccFill;

    // Lobe 2: Satin Liquid-Mercury Metallic Sheen (roughness 0.29)
    float metKey = ggxDistribution(NdotHKey, 0.29) * NdotLKey * 0.36;
    float metRim = ggxDistribution(NdotHRim, 0.24) * 0.42;
    vec3 metallicF = fresnelSchlick(NdotV, mix(vec3(0.28), iridescent, 0.68));
    vec3 satinMetallic = metallicF * metKey + mix(uColorB, uColorA, 0.38) * metRim;

    // Liquid Obsidian dark chrome base (raised ridges gleam dark mercury; deep trenches glow)
    float ridgeMask = clamp(1.0 - vCavity * 0.85, 0.15, 1.0);
    vec3 obsidianBase = vec3(0.018, 0.021, 0.036) + uColorC * 0.05;

    // Luminous Emissive Cavity Veins glowing inside deep sculptural folds
    float veinWave = 0.68 + 0.32 * sin(vWorldPos.y * 4.4 - uTime * 2.0 + vDisplace * 10.5);
    float safeCavity = max(clamp(vCavity, 0.0, 1.0), 0.0001);
    float cavityStrength = pow(safeCavity, 1.65) * veinWave;
    vec3 cavityColor = mix(uColorA, uColorB, clamp(0.35 + 0.5 * sin(vWorldPos.x * 2.5 + uTime * 0.9), 0.0, 1.0));
    vec3 emissiveVeins = cavityColor * cavityStrength * (0.95 + uPulse * 0.55) +
                         vec3(0.95, 0.98, 1.0) * pow(safeCavity, 3.6) * 0.38 * veinWave;

    // Assemble HDR museum-grade optical obsidian surface
    vec3 col = mix(obsidianBase, iridescent * 0.62, clamp(fresnelBroad * 0.62 + vCrease * 0.24, 0.0, 1.0));
    col += dispersedIBL * mix(vec3(0.75, 0.82, 0.95), iridescent, 0.55) * (0.44 + fresnelBroad * 0.72) * ridgeMask;
    col += clearcoatSpec * ridgeMask + satinMetallic;
    col += emissiveVeins;
    col += mix(uColorA, uColorB, 0.5) * razorRim * (0.85 + uPulse * 0.42);
    col += thinFilm * vCrease * ridgeMask * 0.20;

    // ACES Filmic Tone Mapping for silky cinema highlight roll-off
    vec3 toneMapped = acesFilm(col * 1.05);

    // Semi-translucent dark-glass center lets the nested inner crystalline core shimmer through
    float alpha = clamp(0.60 + fresnelBroad * 0.36 + cavityStrength * 0.16, 0.0, 0.96) * clamp(uOpacity, 0.0, 1.0);
    gl_FragColor = vec4(toneMapped, alpha);
  }
`

// ============================================================================
// 3. NESTED INNER CRYSTALLINE CORE (FACETED REFRACTIVE HEART + GEODESIC LATTICE)
// ============================================================================

export const CRYSTAL_CORE_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uPulse;

  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying vec3 vLocalPos;

  void main() {
    float breathe = 1.0 + sin(uTime * 1.6 + position.y * 2.4) * 0.025 + uPulse * 0.03;
    vec3 p = position * breathe;
    vLocalPos = p;
    vec4 worldPos = modelMatrix * vec4(p, 1.0);
    vWorldPos = worldPos.xyz;
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz + vec3(0.00001));
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

export const CRYSTAL_CORE_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uOpacity;
  uniform float uPulse;
  uniform float uWireMode;

  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying vec3 vLocalPos;

  vec3 acesFilm(vec3 x) {
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    vec3 result = clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
    return result;
  }

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(cameraPosition - vWorldPos + vec3(0.00001));
    float NdotV = abs(dot(N, V));
    float fresnel = pow(max(1.0 - NdotV, 0.0001), 2.1);

    float facetWave = 0.5 + 0.5 * sin(vLocalPos.y * 6.5 - uTime * 2.2 + vLocalPos.x * 4.0);
    vec3 coreTint = mix(uColorA, uColorB, clamp(facetWave * 0.75 + fresnel * 0.35, 0.0, 1.0));
    vec3 edgeHighlight = mix(coreTint, vec3(0.95, 0.98, 1.0), 0.45);

    // Wireframe lattice mode glows sharply on edges; solid crystal mode glows softly inside
    vec3 solidCol = mix(uColorC * 0.35, coreTint, 0.55 + fresnel * 0.45) * (0.45 + fresnel * 0.95 + uPulse * 0.35);
    vec3 wireCol = edgeHighlight * (0.75 + 0.45 * facetWave + uPulse * 0.45);

    vec3 col = acesFilm(mix(solidCol, wireCol, uWireMode));
    float baseAlpha = mix(0.26 + fresnel * 0.42, 0.38 + fresnel * 0.44, uWireMode);
    float alpha = clamp(baseAlpha, 0.0, 0.88) * clamp(uOpacity, 0.0, 1.0);

    gl_FragColor = vec4(col, alpha);
  }
`

// ============================================================================
// 4. VOLUMETRIC ORBITAL HALO RINGS (FRESNEL LIGHT-RIBBONS + COMETS + TICKS)
// ============================================================================

export const HALO_RING_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz + vec3(0.00001));
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

export const HALO_RING_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uOpacity;
  uniform float uPulse;
  uniform float uScrollPhase;
  uniform float uPhaseOffset;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  vec3 acesFilm(vec3 x) {
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    vec3 result = clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
    return result;
  }

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(cameraPosition - vWorldPos + vec3(0.00001));
    float NdotV = clamp(abs(dot(N, V)), 0.0, 1.0);

    // Volumetric optical ribbon profile: glowing filament core + luminous Fresnel edge aura
    float coreBeam = pow(max(NdotV, 0.0001), 0.72);
    float edgeGlow = pow(max(1.0 - NdotV, 0.0001), 1.8) * 0.65;
    float ribbonProfile = coreBeam * 0.78 + edgeGlow;

    // Traveling luminous orbital comets racing along torus azimuth
    float angleU = vUv.x;
    float travel1 = fract(angleU - uTime * 0.14 - uScrollPhase * 0.12 + uPhaseOffset);
    float travel2 = fract(angleU + uTime * 0.095 + uScrollPhase * 0.08 + uPhaseOffset + 0.52);

    float cometHead1 = exp(-travel1 * 22.0);
    float cometTail1 = exp(-travel1 * 4.4) * 0.68;
    float comet1 = cometHead1 + cometTail1;

    float cometHead2 = exp(-travel2 * 18.0) * 0.85;
    float cometTail2 = exp(-travel2 * 5.2) * 0.45;
    float comet2 = cometHead2 + cometTail2;

    // Fine architectural dashed calibration ticks along orbital circumference
    float fineTicks = smoothstep(0.58, 0.92, sin(angleU * 6.28318 * 56.0));
    float macroArc = 0.55 + 0.45 * sin(angleU * 6.28318 * 4.0 + uPhaseOffset * 6.28318);
    float baseTrack = 0.16 + fineTicks * 0.22 * macroArc;

    float energy = (baseTrack + comet1 * 1.15 + comet2 * 0.78) * (1.0 + uPulse * 0.45);
    vec3 baseTint = mix(uColorA, uColorB, 0.5 + 0.5 * sin(angleU * 6.28318 + uTime * 0.45 + uPhaseOffset * 3.14));
    vec3 col = mix(baseTint, uColorC, 0.18) * energy * ribbonProfile;
    col += vec3(0.96, 0.99, 1.0) * (cometHead1 * 1.1 + cometHead2 * 0.75) * coreBeam;

    vec3 mapped = acesFilm(col);
    float alpha = clamp((baseTrack * 0.65 + comet1 * 0.95 + comet2 * 0.68) * ribbonProfile, 0.0, 1.0) * clamp(uOpacity, 0.0, 1.0);

    gl_FragColor = vec4(mapped, alpha);
  }
`

// ============================================================================
// 5. 3-TIER CINEMATIC GPU PARTICLE SYSTEM
// ============================================================================

// Tier 1: Curl-Noise Micro-Motes & Starlight Sparks + Tangential Cursor Vortex
export const PARTICLES_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPointerSpeed;
  uniform float uScroll;
  uniform float uPixelRatio;
  uniform float uOpacity;

  attribute float aScale;
  attribute float aPhase;
  attribute vec3 aRandom;

  varying float vAlpha;
  varying float vColorMix;
  varying float vDof;
  varying float vSparkle;

  // Divergence-free 3D trigonometric curl flow field
  vec3 curlFlow(vec3 p, float t) {
    float fx = sin(p.y * 0.68 + t * 0.42) * cos(p.z * 0.62 - t * 0.31);
    float fy = sin(p.z * 0.72 + t * 0.36) * cos(p.x * 0.58 + t * 0.28);
    float fz = sin(p.x * 0.64 - t * 0.34) * cos(p.y * 0.66 + t * 0.25);
    vec3 result = vec3(fx, fy, fz);
    return result;
  }

  void main() {
    vec3 p = position;
    float t = uTime * (0.45 + aRandom.y * 0.35) + aPhase;

    // 3D curl-noise volumetric drift + subtle vertical scroll parallax
    vec3 flow = curlFlow(p * 0.55 + vec3(aPhase * 0.15), uTime * 0.55);
    p += flow * (0.34 + aRandom.z * 0.22);
    p.y += sin(t * 0.65) * 0.14 - uScroll * (0.42 + aRandom.y * 0.45);
    // Wrap Y softly so starfield never empties on deep scroll
    p.y = mod(p.y + 5.5, 11.0) - 5.5;

    // Tangential cursor vortex swirl + soft radial cushion
    vec2 mouseWorld = (uMouse - 0.5) * vec2(8.8, 5.4);
    vec2 diff = p.xy - mouseWorld;
    float dist = length(diff);
    float vortexRadius = 2.65;
    if (dist < vortexRadius) {
      float influence = (1.0 - dist / vortexRadius);
      float smoothInf = influence * influence;
      vec2 radialDir = diff / (dist + 0.04);
      vec2 tangentDir = vec2(-radialDir.y, radialDir.x);
      float swirlStrength = 0.58 + min(uPointerSpeed * 0.85, 1.15);
      p.xy += tangentDir * smoothInf * swirlStrength;
      p.xy += radialDir * smoothInf * (0.28 + min(uPointerSpeed * 0.22, 0.35));
    }

    vec4 mvPos = modelViewMatrix * vec4(p, 1.0);
    float camDist = max(-mvPos.z, 1.0);

    // Depth-of-field attenuation relative to focal plane at z ~ 5.4
    float dof = clamp(abs(camDist - 5.4) * 0.22, 0.0, 1.0);
    vDof = dof;

    float twinkle = 0.48 + 0.52 * sin(uTime * (1.8 + aRandom.y * 2.4) + aPhase * 3.1);
    vSparkle = aRandom.z * twinkle;
    vColorMix = aRandom.x;

    float pointSize = aScale * (1.0 + dof * 0.65) * uPixelRatio * (15.5 / camDist);
    gl_PointSize = clamp(pointSize, 1.2, 34.0 * uPixelRatio);

    float depthFade = smoothstep(11.5, 2.2, camDist) * smoothstep(0.6, 1.8, camDist);
    float dofAlpha = mix(1.0, 0.52, dof);
    vAlpha = depthFade * dofAlpha * (0.24 + 0.62 * twinkle) * uOpacity;

    gl_Position = projectionMatrix * mvPos;
  }
`

export const PARTICLES_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  varying float vAlpha;
  varying float vColorMix;
  varying float vDof;
  varying float vSparkle;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);

    // Softness scales with depth-of-field blur
    float coreSoftness = mix(0.05, 0.26, vDof);
    float disc = smoothstep(0.5, coreSoftness, d);
    float hotCore = exp(-d * mix(9.5, 4.8, vDof));

    // Crisp 4-point starlight diffraction cross on brightest in-focus sparks
    float starAxisH = exp(-abs(uv.y) * 24.0) * exp(-abs(uv.x) * 6.5);
    float starAxisV = exp(-abs(uv.x) * 24.0) * exp(-abs(uv.y) * 6.5);
    float starCross = (starAxisH + starAxisV) * smoothstep(0.55, 0.95, vSparkle) * (1.0 - vDof * 0.85) * 0.65;

    // Chromatic shimmer across active theme palette + starlight white core
    vec3 themeCol = mix(uColorA, uColorB, clamp(vColorMix + uv.x * 0.35, 0.0, 1.0));
    themeCol = mix(themeCol, uColorC, 0.22 * (1.0 - vSparkle));
    vec3 finalCol = mix(themeCol, vec3(0.97, 0.99, 1.0), clamp(hotCore * 0.62 + starCross * 0.5, 0.0, 0.85));

    float mask = clamp(disc * 0.68 + hotCore * 0.55 + starCross, 0.0, 1.0) * smoothstep(0.5, 0.44, d);
    gl_FragColor = vec4(finalCol, mask * vAlpha);
  }
`

// Tier 2: Orbital Sculpture Embers (Magnetic Torus / Helical Field Lines)
export const ORBIT_EMBERS_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uScrollPhase;
  uniform float uPulse;
  uniform vec3 uSculpturePos;
  uniform float uSculptureScale;
  uniform float uPixelRatio;
  uniform float uOpacity;

  attribute float aScale;
  attribute float aPhase;
  attribute vec3 aRandom;

  varying float vAlpha;
  varying float vColorMix;
  varying float vHeat;

  void main() {
    // position stores parametric orbital coordinates: x = majorRadius, y = baseAngle, z = tiltAngle
    float majorR = position.x;
    float baseAngle = position.y;
    float tilt = position.z;

    float speed = (0.34 + aRandom.x * 0.42) * (1.0 + uPulse * 0.28);
    float theta = baseAngle + uTime * speed + uScrollPhase * (0.48 + aRandom.x * 0.35);
    float helicalPhi = theta * 2.0 + aPhase;

    // Magnetic torus + helical field-line path around the liquid-obsidian sculpture
    float minorR = 0.22 + aRandom.y * 0.38;
    float r = majorR + cos(helicalPhi) * minorR;
    vec3 localPos = vec3(
      cos(theta) * r,
      sin(helicalPhi) * minorR * 1.15,
      sin(theta) * r
    );

    // Rotate orbital plane by per-ember inclination tilt
    float ct = cos(tilt);
    float st = sin(tilt);
    vec3 tiltedPos = vec3(
      localPos.x,
      localPos.y * ct - localPos.z * st,
      localPos.y * st + localPos.z * ct
    );

    // Secondary slow yaw precession
    float yaw = aPhase * 0.45 + uTime * 0.08;
    float cy = cos(yaw);
    float sy = sin(yaw);
    vec3 orbPos = vec3(
      tiltedPos.x * cy - tiltedPos.z * sy,
      tiltedPos.y,
      tiltedPos.x * sy + tiltedPos.z * cy
    );

    vec3 worldPos = uSculpturePos + orbPos * uSculptureScale;
    vec4 mvPos = modelViewMatrix * vec4(worldPos, 1.0);
    float camDist = max(-mvPos.z, 1.0);

    float pulseGlow = 0.55 + 0.45 * sin(uTime * 2.8 + aPhase * 4.0);
    vHeat = clamp(pulseGlow + uPulse * 0.35, 0.0, 1.0);
    vColorMix = aRandom.z;

    float size = aScale * uSculptureScale * uPixelRatio * (19.0 / camDist);
    gl_PointSize = clamp(size, 1.5, 36.0 * uPixelRatio);

    // Subtle depth fade when ember passes behind the sculpture center
    float frontBoost = smoothstep(-2.2, 1.4, orbPos.z);
    vAlpha = (0.28 + 0.72 * frontBoost) * (0.42 + 0.58 * pulseGlow) * uOpacity;

    gl_Position = projectionMatrix * mvPos;
  }
`

export const ORBIT_EMBERS_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  varying float vAlpha;
  varying float vColorMix;
  varying float vHeat;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);

    float core = exp(-d * 8.2);
    float corona = smoothstep(0.5, 0.06, d) * 0.52;

    vec3 emberBase = mix(uColorA, uColorB, vColorMix);
    emberBase = mix(emberBase, uColorC, 0.16);
    vec3 col = mix(emberBase, vec3(1.0, 0.98, 0.94), clamp(core * 0.75 * vHeat, 0.0, 0.85));

    float mask = clamp(core + corona, 0.0, 1.0) * smoothstep(0.5, 0.42, d);
    gl_FragColor = vec4(col, mask * vAlpha);
  }
`

// Tier 3: Cinematic Optical Aperture Bokeh Orbs (Foreground & Deep Background)
export const BOKEH_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScroll;
  uniform float uPixelRatio;
  uniform float uOpacity;

  attribute float aScale;
  attribute float aPhase;
  attribute vec3 aRandom;

  varying float vAlpha;
  varying float vColorMix;
  varying float vRingWeight;

  void main() {
    vec3 p = position;
    float depthWeight = aRandom.y;

    // Slow dreamy cinema drift + depth-weighted mouse & scroll parallax
    p.x += sin(uTime * 0.16 + aPhase) * 0.45 + (uMouse.x - 0.5) * (0.55 + depthWeight * 0.95);
    p.y += cos(uTime * 0.13 + aPhase * 1.2) * 0.38 - (uMouse.y - 0.5) * (0.42 + depthWeight * 0.75);
    p.y -= uScroll * (0.55 + depthWeight * 1.15);
    p.y = mod(p.y + 6.5, 13.0) - 6.5;

    vec4 mvPos = modelViewMatrix * vec4(p, 1.0);
    float camDist = max(-mvPos.z, 1.2);

    float breathe = 0.72 + 0.28 * sin(uTime * 0.65 + aPhase);
    float pointSize = aScale * uPixelRatio * (52.0 / camDist);
    gl_PointSize = clamp(pointSize, 16.0 * uPixelRatio, 136.0 * uPixelRatio);

    vColorMix = aRandom.x;
    vRingWeight = aRandom.z;
    vAlpha = breathe * mix(0.065, 0.125, depthWeight) * uOpacity;

    gl_Position = projectionMatrix * mvPos;
  }
`

export const BOKEH_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  varying float vAlpha;
  varying float vColorMix;
  varying float vRingWeight;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float r = length(uv);

    // Realistic optical aperture bokeh with spherical-aberration ring edge & chromatic R/B dispersion
    float discR = smoothstep(0.49, 0.41, r - 0.014);
    float discG = smoothstep(0.49, 0.41, r);
    float discB = smoothstep(0.49, 0.41, r + 0.014);

    float dRingR = (r - 0.375) / 0.055;
    float dRingG = (r - 0.362) / 0.055;
    float dRingB = (r - 0.348) / 0.055;
    float ringR = exp(-(dRingR * dRingR));
    float ringG = exp(-(dRingG * dRingG));
    float ringB = exp(-(dRingB * dRingB));

    float interior = smoothstep(0.46, 0.05, r) * 0.42;
    float ringStrength = mix(0.32, 0.72, vRingWeight);

    vec3 apertureProfile = vec3(
      discR * (interior + ringR * ringStrength),
      discG * (interior + ringG * ringStrength),
      discB * (interior + ringB * ringStrength)
    );

    vec3 warmCoolTint = mix(uColorA, uColorB, vColorMix);
    warmCoolTint = mix(warmCoolTint, uColorC, 0.26 * (1.0 - vColorMix));

    vec3 col = warmCoolTint * apertureProfile * 1.35;
    float alpha = max(apertureProfile.r, max(apertureProfile.g, apertureProfile.b)) * vAlpha;

    gl_FragColor = vec4(col, alpha);
  }
`
