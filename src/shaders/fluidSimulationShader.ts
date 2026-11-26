/**
 * Real-Time GPU Ping-Pong FBO Fluid & Iridescent Caustic Advection Shader
 *
 * State packing in RGBA (compatible with both HalfFloatType and UnsignedByteType fallbacks):
 *   R, G : Velocity field (vx, vy) mapped from [-1.0, 1.0] -> [0.0, 1.0] (0.5 = zero velocity)
 *   B    : Advected velvet-smoke / luminous energy density [0.0, 1.0]
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
  uniform float uHeroFocus;
  uniform float uFirstFrame;

  vec2 decodeVel(vec4 s) {
    vec2 result = s.rg * 2.0 - 1.0;
    return result;
  }

  float sampleCurl(sampler2D stateTex, vec2 uvCoord, vec2 texel) {
    vec2 vL = decodeVel(texture2D(stateTex, clamp(uvCoord - vec2(texel.x, 0.0), texel, 1.0 - texel)));
    vec2 vR = decodeVel(texture2D(stateTex, clamp(uvCoord + vec2(texel.x, 0.0), texel, 1.0 - texel)));
    vec2 vB = decodeVel(texture2D(stateTex, clamp(uvCoord - vec2(0.0, texel.y), texel, 1.0 - texel)));
    vec2 vT = decodeVel(texture2D(stateTex, clamp(uvCoord + vec2(0.0, texel.y), texel, 1.0 - texel)));
    float result = (vR.y - vL.y) - (vT.x - vB.x);
    return result;
  }

  void main() {
    if (uFirstFrame > 0.5) {
      gl_FragColor = vec4(0.5, 0.5, 0.0, 0.0);
    } else {
      float dtScale = clamp(uDelta * 60.0, 0.25, 2.0);
      vec4 centerState = texture2D(uPrevState, vUv);
      vec2 centerVel = decodeVel(centerState);

      // Semi-Lagrangian backtrace combining fluid velocity + silky scroll stream
      vec2 scrollStream = vec2(0.0, -uScrollVel * 0.0068);
      vec2 backUv = clamp(
        vUv - (centerVel * 0.0195 + scrollStream) * dtScale,
        uTexelSize,
        1.0 - uTexelSize
      );

      vec4 advected = texture2D(uPrevState, backUv);
      vec2 vel = decodeVel(advected);
      float density = advected.b;
      float ripple = advected.a;

      // 4-neighbor stencil around advected coordinate for diffusion & pressure relaxation
      vec2 uvL = clamp(backUv - vec2(uTexelSize.x, 0.0), uTexelSize, 1.0 - uTexelSize);
      vec2 uvR = clamp(backUv + vec2(uTexelSize.x, 0.0), uTexelSize, 1.0 - uTexelSize);
      vec2 uvB = clamp(backUv - vec2(0.0, uTexelSize.y), uTexelSize, 1.0 - uTexelSize);
      vec2 uvT = clamp(backUv + vec2(0.0, uTexelSize.y), uTexelSize, 1.0 - uTexelSize);

      vec4 sL = texture2D(uPrevState, uvL);
      vec4 sR = texture2D(uPrevState, uvR);
      vec4 sB = texture2D(uPrevState, uvB);
      vec4 sT = texture2D(uPrevState, uvT);

      vec2 vL = decodeVel(sL);
      vec2 vR = decodeVel(sR);
      vec2 vB = decodeVel(sB);
      vec2 vT = decodeVel(sT);

      // Viscous velocity smoothing + gentle pressure-like gradient relaxation
      vec2 avgVel = (vL + vR + vB + vT) * 0.25;
      vel = mix(vel, avgVel, 0.095 * dtScale);

      vec2 densityGrad = vec2(sR.b - sL.b, sT.b - sB.b);
      vel -= densityGrad * 0.055 * dtScale;

      // True vorticity confinement using curl magnitude gradient for silky calligraphic eddies
      float cC = (vR.y - vL.y) - (vT.x - vB.x);
      float cL = sampleCurl(uPrevState, uvL, uTexelSize);
      float cR = sampleCurl(uPrevState, uvR, uTexelSize);
      float cB = sampleCurl(uPrevState, uvB, uTexelSize);
      float cT = sampleCurl(uPrevState, uvT, uTexelSize);

      vec2 eta = vec2(abs(cR) - abs(cL), abs(cT) - abs(cB));
      float etaLen = length(eta) + 0.0005;
      vec2 vortForce = vec2(eta.y, -eta.x) / etaLen * cC;
      vel += vortForce * 0.088 * dtScale;

      // Silky dye diffusion and capillary caustic wave propagation via Laplacian
      float avgDensity = (sL.b + sR.b + sB.b + sT.b) * 0.25;
      density = mix(density, avgDensity, 0.115 * dtScale);

      float avgRipple = (sL.a + sR.a + sB.a + sT.a) * 0.25;
      float rippleLaplacian = avgRipple - ripple;
      ripple = clamp(ripple + rippleLaplacian * 0.48 * dtScale, 0.0, 1.0);

      // Smooth velvety dissipation so silk ribbons linger and dissolve gracefully
      vel *= pow(0.962, dtScale);
      density *= pow(0.975, dtScale);
      ripple *= pow(0.948, dtScale);

      // Subtle living right-stage studio plume near the hero sculpture (keeps left typography tranquil)
      float heroAmbient = clamp(uHeroFocus, 0.0, 1.0);
      if (heroAmbient > 0.02) {
        vec2 aspectScaleAmb = vec2(uAspect, 1.0);
        vec2 orbitCenter = vec2(
          0.70 + sin(uTime * 0.34) * 0.075,
          0.50 + cos(uTime * 0.27) * 0.095
        );
        vec2 toOrbit = (vUv - orbitCenter) * aspectScaleAmb;
        float orbitDistSq = dot(toOrbit, toOrbit);
        float orbitPlume = exp(-orbitDistSq * 22.0);
        vec2 orbitTangent = vec2(-toOrbit.y, toOrbit.x) / (sqrt(orbitDistSq) + 0.14);
        vel += orbitTangent * orbitPlume * 0.016 * heroAmbient * dtScale;
        density += orbitPlume * 0.018 * heroAmbient * dtScale;
        ripple += exp(-orbitDistSq * 42.0) * 0.015 * heroAmbient * dtScale;
      }

      // Cursor / touch silk-jet + tangential vortex swirl splat injection
      vec2 aspectScale = vec2(uAspect, 1.0);
      vec2 toCursor = (vUv - uMouse) * aspectScale;
      float distSq = dot(toCursor, toCursor);
      float coreSplat = exp(-distSq * 92.0);
      float velvetSplat = exp(-distSq * 24.0);
      float ringSplat = exp(-distSq * 36.0);

      float pointerSpeed = length(uMouseVel);
      vec2 impulseVel = clamp(uMouseVel * 1.75, vec2(-1.35), vec2(1.35));

      vec2 tangent = vec2(-toCursor.y, toCursor.x) / (sqrt(distSq) + 0.075);
      float swirlDir = sign(uMouseVel.x - uMouseVel.y + 0.0001);

      vel += impulseVel * (coreSplat * 0.85 + velvetSplat * 0.28);
      vel += tangent * swirlDir * ringSplat * min(pointerSpeed * 0.42, 0.34);

      float pointerEnergy = min(pointerSpeed * 1.85, 0.96);
      density += coreSplat * (pointerEnergy * 0.92 + uPulse * 0.24) + velvetSplat * pointerEnergy * 0.24;
      ripple += (coreSplat * 1.18 - ringSplat * 0.30) * (pointerEnergy * 1.28 + uPulse * 0.42);

      // Scroll velocity laminar shear currents & harmonic eddies
      float scrollMag = min(abs(uScrollVel), 1.9);
      if (scrollMag > 0.002) {
        float shearWave = sin(vUv.x * 8.2 + uTime * 1.55) * 0.5 + 0.5;
        float bandCenter = fract(0.52 - uScrollVel * 0.22 + sin(uTime * 0.45) * 0.16);
        float bandDelta = vUv.y - bandCenter;
        float bandMask = exp(-(bandDelta * bandDelta) * 12.0);
        float scrollSign = sign(uScrollVel);
        vel += vec2(
          cos(vUv.y * 6.28318 + uTime * 1.2) * 0.085 * scrollMag,
          -scrollSign * 0.135 * scrollMag
        ) * (0.28 + 0.72 * bandMask);
        density += scrollMag * 0.115 * shearWave * (0.35 + 0.65 * bandMask);
        ripple += scrollMag * 0.155 * bandMask * shearWave;
      }

      // Soft screen-border damping to eliminate boundary reflections/clumping
      vec2 border = min(vUv, 1.0 - vUv);
      float edgeFade = smoothstep(0.0, 0.05, min(border.x, border.y));
      vel = clamp(vel * edgeFade, vec2(-1.0), vec2(1.0));

      vec2 encodedVel = clamp(vel * 0.5 + 0.5, 0.0, 1.0);
      gl_FragColor = vec4(encodedVel, clamp(density, 0.0, 1.0), clamp(ripple, 0.0, 1.0));
    }
  }
`
