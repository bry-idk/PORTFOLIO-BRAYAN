/**
 * Real-Time GPU Ping-Pong FBO Fluid & Ripple Advection Shader
 *
 * State packing in RGBA (compatible with both HalfFloatType and UnsignedByteType fallbacks):
 *   R, G : Velocity field (vx, vy) mapped from [-1.0, 1.0] -> [0.0, 1.0] (0.5 = zero velocity)
 *   B    : Advected ink / luminous energy density [0.0, 1.0]
 *   A    : Capillary ripple / caustic wave crest potential [0.0, 1.0]
 */

export const FLUID_SIM_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

export const FLUID_SIM_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uPrevState;
  uniform vec2 uTexelSize;
  uniform float uDelta;
  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uMouse;
  uniform vec2 uMouseVel;
  uniform float uScrollVel;
  uniform float uPulse;
  uniform float uFirstFrame;

  vec2 decodeVel(vec4 s) {
    return s.rg * 2.0 - 1.0;
  }

  void main() {
    // Clean neutral state initialization on frame 0 or context restore
    if (uFirstFrame > 0.5) {
      gl_FragColor = vec4(0.5, 0.5, 0.0, 0.0);
      return;
    }

    float dtScale = clamp(uDelta * 60.0, 0.25, 2.0);
    vec4 centerState = texture2D(uPrevState, vUv);
    vec2 centerVel = decodeVel(centerState);

    // Semi-Lagrangian backtrace combining fluid velocity + gentle scroll stream
    vec2 scrollStream = vec2(0.0, -uScrollVel * 0.0055);
    vec2 backUv = clamp(
      vUv - (centerVel * 0.017 + scrollStream) * dtScale,
      uTexelSize,
      1.0 - uTexelSize
    );

    vec4 advected = texture2D(uPrevState, backUv);
    vec2 vel = decodeVel(advected);
    float density = advected.b;
    float ripple = advected.a;

    // 4-neighbor stencil around advected coordinate for diffusion, curl & pressure relaxation
    vec4 sL = texture2D(uPrevState, clamp(backUv - vec2(uTexelSize.x, 0.0), uTexelSize, 1.0 - uTexelSize));
    vec4 sR = texture2D(uPrevState, clamp(backUv + vec2(uTexelSize.x, 0.0), uTexelSize, 1.0 - uTexelSize));
    vec4 sB = texture2D(uPrevState, clamp(backUv - vec2(0.0, uTexelSize.y), uTexelSize, 1.0 - uTexelSize));
    vec4 sT = texture2D(uPrevState, clamp(backUv + vec2(0.0, uTexelSize.y), uTexelSize, 1.0 - uTexelSize));

    vec2 vL = decodeVel(sL);
    vec2 vR = decodeVel(sR);
    vec2 vB = decodeVel(sB);
    vec2 vT = decodeVel(sT);

    // Viscous smoothing + gentle incompressible divergence correction
    vec2 avgVel = (vL + vR + vB + vT) * 0.25;
    vel = mix(vel, avgVel, 0.12 * dtScale);

    vec2 densityGrad = vec2(sR.b - sL.b, sT.b - sB.b);
    vel -= densityGrad * 0.065 * dtScale;

    // Subtle vorticity confinement so swirls maintain crisp calligraphic eddies
    float curl = (vR.y - vL.y) - (vT.x - vB.x);
    vec2 curlForce = vec2(
      abs(vT.x - vB.x) - abs(vR.y - vL.y),
      (vR.x - vL.x) - (vT.y - vB.y)
    );
    float curlLen = length(curlForce) + 0.0001;
    vel += (curlForce / curlLen) * curl * 0.045 * dtScale;

    // Diffuse dye density and propagate capillary wave ripples via Laplacian
    float avgDensity = (sL.b + sR.b + sB.b + sT.b) * 0.25;
    density = mix(density, avgDensity, 0.14 * dtScale);

    float avgRipple = (sL.a + sR.a + sB.a + sT.a) * 0.25;
    float rippleLaplacian = avgRipple - ripple;
    ripple = clamp(ripple + rippleLaplacian * 0.42 * dtScale, 0.0, 1.0);

    // Smooth dissipation so the field returns to tranquil obsidian stillness when idle
    vel *= pow(0.952, dtScale);
    density *= pow(0.966, dtScale);
    ripple *= pow(0.935, dtScale);

    // Cursor / touch velocity splat injection
    vec2 aspectScale = vec2(uAspect, 1.0);
    vec2 toCursor = (vUv - uMouse) * aspectScale;
    float distSq = dot(toCursor, toCursor);
    float tightSplat = exp(-distSq * 105.0);
    float ringSplat = exp(-distSq * 30.0);

    float pointerSpeed = length(uMouseVel);
    vec2 impulseVel = clamp(uMouseVel * 1.55, vec2(-1.2), vec2(1.2));

    // Tangential swirl around cursor when moving swiftly
    vec2 tangent = vec2(-toCursor.y, toCursor.x) / (sqrt(distSq) + 0.08);
    float swirlDir = sign(uMouseVel.x + uMouseVel.y + 0.0001);

    vel += impulseVel * tightSplat;
    vel += tangent * swirlDir * ringSplat * min(pointerSpeed * 0.28, 0.22);

    float pointerEnergy = min(pointerSpeed * 1.65, 0.85);
    density += tightSplat * (pointerEnergy * 0.85 + uPulse * 0.18);
    ripple += (tightSplat - ringSplat * 0.28) * (pointerEnergy * 1.15 + uPulse * 0.35);

    // Scroll velocity current injection (organic horizontal shear waves as user scrolls)
    float scrollMag = min(abs(uScrollVel), 1.8);
    if (scrollMag > 0.002) {
      float shearWave = sin(vUv.x * 7.5 + uTime * 1.4) * 0.5 + 0.5;
      float bandMask = exp(-pow(vUv.y - fract(0.5 - uScrollVel * 0.25 + sin(uTime * 0.5) * 0.15), 2.0) * 14.0);
      float scrollSign = sign(uScrollVel);
      vel += vec2(cos(vUv.y * 6.283 + uTime) * 0.06 * scrollMag, -scrollSign * 0.11 * scrollMag) * (0.25 + 0.75 * bandMask);
      density += scrollMag * 0.085 * shearWave * (0.35 + 0.65 * bandMask);
      ripple += scrollMag * 0.12 * bandMask * shearWave;
    }

    // Soft screen-border damping to eliminate boundary reflections/clumping
    vec2 border = min(vUv, 1.0 - vUv);
    float edgeFade = smoothstep(0.0, 0.045, min(border.x, border.y));
    vel *= edgeFade;

    vec2 encodedVel = clamp(vel * 0.5 + 0.5, 0.0, 1.0);
    gl_FragColor = vec4(encodedVel, clamp(density, 0.0, 1.0), clamp(ripple, 0.0, 1.0));
  }
`
