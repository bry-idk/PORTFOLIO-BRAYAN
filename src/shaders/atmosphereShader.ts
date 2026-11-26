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
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform sampler2D uFluidTex;
  uniform float uHasFluid;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = rot * p * 2.02 + vec2(13.1, 7.7);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0);

    // Sample live ping-pong GPU fluid simulation + local gradient for optical refraction
    vec4 fluidC = texture2D(uFluidTex, uv);
    vec4 fluidR = texture2D(uFluidTex, clamp(uv + vec2(0.0045, 0.0), 0.0, 1.0));
    vec4 fluidU = texture2D(uFluidTex, clamp(uv + vec2(0.0, 0.0045), 0.0, 1.0));

    vec2 fluidVel = (fluidC.rg * 2.0 - 1.0) * uHasFluid;
    float fluidEnergy = fluidC.b * uHasFluid;
    float fluidRipple = fluidC.a * uHasFluid;

    vec2 fluidGrad = vec2(
      (fluidR.b - fluidC.b) + (fluidR.a - fluidC.a) * 1.4,
      (fluidU.b - fluidC.b) + (fluidU.a - fluidC.a) * 1.4
    ) * uHasFluid;

    float distMouse = length(p - m);
    float mouseInfluence = exp(-distMouse * 3.1) * (0.22 + min(uPointerSpeed * 0.35, 0.42));

    // Domain-warped organic studio atmosphere advected by the live fluid field
    float t = uTime * 0.13 + uScroll * 1.35;
    vec2 advectedP = p - fluidVel * 0.28 + fluidGrad * 0.42;

    vec2 q = vec2(
      fbm(advectedP * 1.55 + vec2(t * 0.55, -t * 0.28)),
      fbm(advectedP * 1.55 + vec2(-t * 0.36, t * 0.48) + vec2(5.2, 1.3))
    );

    vec2 dir = normalize(p - m + vec2(0.0001));
    vec2 warp = advectedP + q * 0.52 + dir * mouseInfluence * 0.12;

    // Chromatic dispersion across fluid refraction gradients (caustic split)
    vec2 chromaOffset = fluidGrad * 0.65 + fluidVel * 0.045;
    float fR = fbm((warp + chromaOffset) * 1.85 + vec2(t * 0.32));
    float fG = fbm(warp * 1.85 + vec2(t * 0.32));
    float fB = fbm((warp - chromaOffset) * 1.85 + vec2(t * 0.32));
    float f2 = fbm(warp * 2.55 - q * 1.35 - vec2(t * 0.22));

    // Slightly calmer backdrop intensity during deep reading chapters for maximum text contrast
    float chapterCalm = mix(0.76, 1.0, clamp(uHeroFocus, 0.0, 1.0));

    // Deep obsidian studio backdrop
    vec3 baseBg = vec3(0.020, 0.023, 0.039);
    vec3 auraA = uColorA * smoothstep(0.32, 0.92, fG) * (0.21 * chapterCalm);
    vec3 auraB = uColorB * smoothstep(0.38, 0.95, f2) * (0.19 * chapterCalm);
    vec3 auraC = uColorC * smoothstep(0.45, 0.96, fG * f2 * 1.75) * (0.16 * chapterCalm);

    // Chromatic liquid caustics along advected fluid ripples & velocity crests
    float gradMag = length(fluidGrad);
    vec3 causticSplit = vec3(
      smoothstep(0.46, 0.92, fR),
      smoothstep(0.46, 0.92, fG),
      smoothstep(0.46, 0.92, fB)
    );
    vec3 fluidTint = mix(uColorA, uColorB, clamp(fluidRipple * 1.15 + 0.25, 0.0, 1.0));
    vec3 caustics =
      (causticSplit * mix(fluidTint, uColorC, 0.35) * (fluidEnergy * 0.32 + fluidRipple * 0.28)) +
      mix(uColorA, vec3(0.95, 0.97, 1.0), 0.35) * clamp(gradMag * 3.8, 0.0, 0.65) * (0.18 + uAmbientPulse * 0.14);

    // Soft cursor luminous halo
    vec3 cursorGlow = mix(uColorA, uColorB, 0.5) * exp(-distMouse * 4.0) * (0.13 + fluidEnergy * 0.08);

    // Subtle editorial halftone dot modulation near periphery (displaced gently by fluid ripple)
    vec2 halftoneCoord = gl_FragCoord.xy + fluidVel * 4.0;
    vec2 gridUv = fract(halftoneCoord / 14.0) - 0.5;
    float dotDist = length(gridUv);
    float edgeMask = smoothstep(0.30, 0.80, length(uv - 0.5));
    float halftone = smoothstep(0.14, 0.055, dotDist) * edgeMask * (0.04 + fluidRipple * 0.025);

    // Organic fine editorial film grain
    float grain = (hash(gl_FragCoord.xy + fract(uTime * 19.3) * 100.0) - 0.5) * 0.024;

    vec3 col = baseBg + auraA + auraB + auraC + caustics + cursorGlow + vec3(halftone) + grain;
    gl_FragColor = vec4(col, 1.0);
  }
`

export const PRISM_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScroll;
  uniform float uPulse;

  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying float vDisplace;
  varying float vCrease;

  float gyroid(vec3 p) {
    return dot(sin(p), cos(p.yzx));
  }

  // Sculptural liquid-obsidian displacement field
  float prismField(vec3 p, float t, vec2 mouseNdc, float pulse) {
    float g1 = gyroid(p * 2.05 + vec3(t * 0.42, -t * 0.31, t * 0.26));
    // Abs-folded secondary gyroid creates crisp architectural volcanic-glass ridges
    float g2 = 1.0 - abs(gyroid(p * 3.65 - vec3(t * 0.52, t * 0.36, -t * 0.24)));
    float mousePull = smoothstep(1.9, 0.0, length(mouseNdc - p.xy));
    float scrollRipple = sin(p.y * 3.2 + uScroll * 5.0 - t * 0.9) * 0.035;
    return (g1 * 0.135 + g2 * 0.065) + scrollRipple + mousePull * (0.075 + pulse * 0.045) * sin(t * 2.2 + p.y * 3.4);
  }

  void main() {
    vec3 pos = position;
    float radius = length(pos);
    vec3 baseNormal = normalize(pos);
    float t = uTime * 0.62;
    vec2 mouseNdc = (uMouse - 0.5) * 2.2;

    float d0 = prismField(pos, t, mouseNdc, uPulse);
    vec3 p0 = pos + baseNormal * d0;

    // Finite-difference tangent-frame perturbation for razor-sharp recomputed normals
    vec3 refAxis = abs(baseNormal.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 tangent = normalize(cross(refAxis, baseNormal));
    vec3 bitangent = cross(baseNormal, tangent);

    float eps = 0.022;
    vec3 baseT = normalize(pos + tangent * eps) * radius;
    vec3 baseB = normalize(pos + bitangent * eps) * radius;

    vec3 nT = normalize(baseT);
    vec3 nB = normalize(baseB);

    float dT = prismField(baseT, t, mouseNdc, uPulse);
    float dB = prismField(baseB, t, mouseNdc, uPulse);

    vec3 pT = baseT + nT * dT;
    vec3 pB = baseB + nB * dB;

    vec3 perturbedNormal = normalize(cross(pT - p0, pB - p0));
    if (dot(perturbedNormal, baseNormal) < 0.0) {
      perturbedNormal = -perturbedNormal;
    }

    // Approximate surface curvature/crease highlight factor for obsidian rim glints
    vCrease = clamp(abs(dT - d0) + abs(dB - d0), 0.0, 0.15) * 6.5;
    vDisplace = d0;

    vec4 worldPosition = modelMatrix * vec4(p0, 1.0);
    vWorldPos = worldPosition.xyz;
    // Uniform scale on sculpture makes upper-left 3x3 rotation+scale exact when normalized
    vWorldNormal = normalize((modelMatrix * vec4(perturbedNormal, 0.0)).xyz);

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

  // Procedural gallery HDR softbox environment for refractive obsidian reflections
  float studioEnv(vec3 dir, vec3 keyDir, vec3 rimDir) {
    float horizon = smoothstep(-0.35, 0.65, dir.y);
    float softboxA = pow(max(dot(dir, keyDir), 0.0), 18.0);
    float softboxB = pow(max(dot(dir, rimDir), 0.0), 10.0) * 0.65;
    float strip = exp(-abs(dir.y - 0.18 * sin(dir.x * 3.0)) * 9.0) * 0.45;
    return horizon * 0.25 + softboxA + softboxB + strip;
  }

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(cameraPosition - vWorldPos);
    float NdotV = clamp(dot(N, V), 0.0, 1.0);

    float fresnel = pow(1.0 - NdotV, 2.75);
    float razorRim = pow(1.0 - NdotV, 5.4);

    vec3 keyLight = normalize(vec3(2.4, 3.2, 3.6));
    vec3 rimLight = normalize(vec3(-3.0, -1.2, 2.2));

    // Thin-film RGB chromatic dispersion via slightly offset refractive/reflective rays
    vec3 reflDir = reflect(-V, N);
    vec3 refrR = refract(-V, N, 1.0 / 1.38);
    vec3 refrG = refract(-V, N, 1.0 / 1.46);
    vec3 refrB = refract(-V, N, 1.0 / 1.56);

    // Fallback to reflection when total internal reflection occurs at grazing angles
    vec3 dirR = length(refrR) > 0.001 ? mix(refrR, reflDir, fresnel) : reflDir;
    vec3 dirG = length(refrG) > 0.001 ? mix(refrG, reflDir, fresnel) : reflDir;
    vec3 dirB = length(refrB) > 0.001 ? mix(refrB, reflDir, fresnel) : reflDir;

    vec3 dispersedEnv = vec3(
      studioEnv(normalize(dirR), keyLight, rimLight),
      studioEnv(normalize(dirG), keyLight, rimLight),
      studioEnv(normalize(dirB), keyLight, rimLight)
    );

    // Thin-film interference spectral phase aligned with active theme palette
    float phase = 6.28318 * (1.45 * NdotV + vDisplace * 2.8 + uTime * 0.09);
    vec3 thinFilm = 0.5 + 0.5 * cos(phase + vec3(0.0, 2.094, 4.188));
    vec3 themeBlend = mix(uColorA, uColorB, clamp(fresnel * 0.85 + (vDisplace * 2.0 + 0.5) * 0.35, 0.0, 1.0));
    vec3 iridescent = mix(themeBlend, mix(themeBlend, uColorC, 0.45) + thinFilm * 0.28, 0.48);

    // Liquid obsidian deep volcanic-glass core
    vec3 obsidianCore = vec3(0.024, 0.028, 0.048) + uColorC * 0.06;

    // Sharp key & colored secondary Blinn-Phong speculars along recomputed folds
    vec3 H1 = normalize(keyLight + V);
    vec3 H2 = normalize(rimLight + V);
    float specSharp = pow(max(dot(N, H1), 0.0), 96.0);
    float specBroad = pow(max(dot(N, H1), 0.0), 18.0) * 0.25;
    float specRim = pow(max(dot(N, H2), 0.0), 28.0) * 0.55;

    // Assemble sculptural obsidian surface + chromatic dispersion + razor crease glints
    vec3 col = mix(obsidianCore, iridescent, clamp(fresnel * 0.86 + vCrease * 0.28 + 0.08, 0.0, 1.0));
    col += dispersedEnv * mix(uColorA, uColorB, 0.5) * (0.42 + fresnel * 0.55);
    col += vec3(0.95, 0.98, 1.0) * (specSharp * 0.95 + specBroad);
    col += mix(uColorB, uColorA, 0.4) * (specRim + razorRim * (0.65 + uPulse * 0.35));
    col += iridescent * vCrease * 0.22;

    float alpha = clamp(0.58 + fresnel * 0.40, 0.0, 0.96) * clamp(uOpacity, 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`

export const PARTICLES_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixelRatio;
  uniform float uOpacity;

  attribute float aScale;
  attribute float aPhase;

  varying float vAlpha;

  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.32 + aPhase) * 0.24;
    p.y += cos(uTime * 0.26 + aPhase * 1.3) * 0.24;
    p.z += sin(uTime * 0.20 + aPhase * 0.7) * 0.14;

    vec2 mouseWorld = (uMouse - 0.5) * vec2(8.0, 5.0);
    vec2 diff = p.xy - mouseWorld;
    float d = length(diff);
    if (d < 1.9) {
      p.xy += normalize(diff + vec2(0.0001)) * (1.9 - d) * 0.42;
    }

    vec4 mvPos = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aScale * uPixelRatio * (17.0 / max(-mvPos.z, 1.0));
    vAlpha = smoothstep(10.0, 1.5, -mvPos.z) * (0.32 + 0.42 * sin(uTime + aPhase)) * uOpacity;
    gl_Position = projectionMatrix * mvPos;
  }
`

export const PARTICLES_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.04, d);
    vec3 col = mix(uColorA, uColorB, gl_PointCoord.x);
    gl_FragColor = vec4(col, glow * vAlpha);
  }
`
