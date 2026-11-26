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
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  // Hash & 2D Simplex-like value noise
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

    float distMouse = length(p - m);
    float mouseInfluence = exp(-distMouse * 3.0) * (0.28 + min(uPointerSpeed * 0.4, 0.45));

    // Domain-warped organic fluid motion
    float t = uTime * 0.14 + uScroll * 1.4;
    vec2 q = vec2(
      fbm(p * 1.6 + vec2(t * 0.6, -t * 0.3)),
      fbm(p * 1.6 + vec2(-t * 0.4, t * 0.5) + vec2(5.2, 1.3))
    );

    // Subtle pointer ripple warp
    vec2 dir = normalize(p - m + vec2(0.0001));
    vec2 warp = p + q * 0.55 + dir * mouseInfluence * 0.16;

    float f1 = fbm(warp * 1.85 + vec2(t * 0.35));
    float f2 = fbm(warp * 2.6 - q * 1.4 - vec2(t * 0.25));

    // Base deep obsidian studio backdrop
    vec3 baseBg = vec3(0.022, 0.026, 0.043);
    vec3 auraA = uColorA * smoothstep(0.32, 0.92, f1) * 0.24;
    vec3 auraB = uColorB * smoothstep(0.38, 0.95, f2) * 0.22;
    vec3 auraC = uColorC * smoothstep(0.45, 0.96, f1 * f2 * 1.7) * 0.18;

    // Cursor luminous halo
    vec3 cursorGlow = mix(uColorA, uColorB, 0.5) * exp(-distMouse * 3.8) * 0.18;

    // Subtle editorial halftone dot modulation near edges (homage to Brayan's PDF motif)
    vec2 gridUv = fract(gl_FragCoord.xy / 14.0) - 0.5;
    float dotDist = length(gridUv);
    float edgeMask = smoothstep(0.28, 0.78, length(uv - 0.5));
    float halftone = smoothstep(0.14, 0.06, dotDist) * edgeMask * 0.045;

    // Organic film grain
    float grain = (hash(gl_FragCoord.xy + fract(uTime * 19.3) * 100.0) - 0.5) * 0.026;

    vec3 col = baseBg + auraA + auraB + auraC + cursorGlow + vec3(halftone) + grain;
    gl_FragColor = vec4(col, 1.0);
  }
`

export const PRISM_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScroll;

  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying float vDisplace;

  // Lightweight 3D trigonometric + pseudo-simplex organic displacement
  float gyroid(vec3 p) {
    return dot(sin(p), cos(p.yzx));
  }

  void main() {
    vec3 pos = position;
    float t = uTime * 0.65;
    float n = gyroid(pos * 2.2 + vec3(t * 0.7, -t * 0.5, t * 0.4));
    float n2 = gyroid(pos * 4.1 - vec3(t * 0.9));
    float mousePull = smoothstep(1.8, 0.0, length((uMouse - 0.5) * 2.0 - pos.xy));
    float disp = (n * 0.14 + n2 * 0.05) + mousePull * 0.09 * sin(uTime * 2.5 + pos.y * 3.0);

    vec3 displaced = pos + normal * disp;
    vDisplace = disp;

    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
    vWorldPos = worldPosition.xyz;
    vNormal = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

export const PRISM_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying float vDisplace;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorldPos);

    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.4);
    float band = sin(vDisplace * 26.0 + uTime * 1.6) * 0.5 + 0.5;

    vec3 irid = mix(uColorA, uColorB, clamp(fresnel * 0.9 + band * 0.35, 0.0, 1.0));
    vec3 core = vec3(0.05, 0.06, 0.11);

    // Specular highlight
    vec3 L = normalize(vec3(2.0, 3.0, 4.0));
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(N, H), 0.0), 42.0);

    vec3 col = mix(core, irid, fresnel * 0.92 + 0.16) + vec3(spec * 0.65);
    float alpha = clamp(0.45 + fresnel * 0.55, 0.0, 0.95);
    gl_FragColor = vec4(col, alpha);
  }
`

export const PARTICLES_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixelRatio;

  attribute float aScale;
  attribute float aPhase;

  varying float vAlpha;

  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.35 + aPhase) * 0.25;
    p.y += cos(uTime * 0.28 + aPhase * 1.3) * 0.25;
    p.z += sin(uTime * 0.22 + aPhase * 0.7) * 0.15;

    vec2 mouseWorld = (uMouse - 0.5) * vec2(8.0, 5.0);
    vec2 diff = p.xy - mouseWorld;
    float d = length(diff);
    if (d < 1.8) {
      p.xy += normalize(diff + vec2(0.0001)) * (1.8 - d) * 0.45;
    }

    vec4 mvPos = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aScale * uPixelRatio * (18.0 / max(-mvPos.z, 1.0));
    vAlpha = smoothstep(10.0, 1.5, -mvPos.z) * (0.35 + 0.45 * sin(uTime + aPhase));
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
    float glow = smoothstep(0.5, 0.05, d);
    vec3 col = mix(uColorA, uColorB, gl_PointCoord.x);
    gl_FragColor = vec4(col, glow * vAlpha);
  }
`
