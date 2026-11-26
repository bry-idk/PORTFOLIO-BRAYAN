import { ProjectData, SoftwareId } from '../types/portfolio'

export const SOFTWARE_META: Record<
  SoftwareId,
  { name: string; short: string; color: string }
> = {
  unity: { name: 'Unity', short: 'U6', color: '#E4E4E7' },
  blender: { name: 'Blender', short: 'BL', color: '#FB923C' },
  touchdesigner: { name: 'TouchDesigner', short: 'TD', color: '#4ADE80' },
  vscode: { name: 'Visual Studio / Code', short: 'VS', color: '#A78BFA' },
  aftereffects: { name: 'Adobe After Effects', short: 'Ae', color: '#818CF8' },
  fmod: { name: 'FMOD', short: 'FM', color: '#F4F4F5' },
  photoshop: { name: 'Adobe Photoshop', short: 'Ps', color: '#38BDF8' },
  audition: { name: 'Adobe Audition', short: 'Au', color: '#6366F1' },
  substance: { name: 'Substance 3D Painter', short: 'Pt', color: '#A3E635' },
  resolume: { name: 'Resolume Arena', short: 'RA', color: '#34D399' },
  arduino: { name: 'Arduino IDE', short: 'AR', color: '#22D3EE' },
  procreate: { name: 'Procreate', short: 'PR', color: '#F472B6' },
  polycam: { name: 'Polycam (LiDAR)', short: 'LD', color: '#E2E8F0' },
  maya: { name: 'Autodesk Maya', short: 'MY', color: '#38BDF8' },
  premiere: { name: 'Adobe Premiere Pro', short: 'Pr', color: '#C084FC' },
}

/**
 * 5 Projects strictly ordered according to "pdf portfolio completo.pdf" (pages 4–29).
 * Image presentation respects the exact PDF sequence, with folder extras clearly organized
 * within each corresponding project without mixing assets across projects.
 */
export const PROJECTS_DATA: ProjectData[] = [
  // =========================================================================
  // 01. CRÓNICAS DE PALENQUE (Pages 4–10)
  // =========================================================================
  {
    order: 1,
    indexLabel: '01',
    id: 'cronicas-de-palenque',
    slug: 'cronicas-de-palenque',
    title: 'Crónicas de Palenque',
    studioOrContext: {
      en: 'Sogno Studios · Exhibition Recognition 2026',
      es: 'Sogno Studios · Reconocimiento de Exhibición 2026',
    },
    pdfPages: 'Pages 04–10',
    projectType: {
      en: 'Videogame',
      es: 'Videojuego',
    },
    technologies: {
      en: 'Ray Tracing, PBR Shaders, 3D Audio, Voice Biometrics',
      es: 'Ray Tracing, Shaders PBR, Audio 3D, Biometría de Voz',
    },
    platforms: {
      en: 'Meta Quest 2 (VR) & PC (Desktop)',
      es: 'Meta Quest 2 (VR) y PC (Escritorio)',
    },
    software: [
      'unity',
      'blender',
      'touchdesigner',
      'vscode',
      'aftereffects',
      'fmod',
      'photoshop',
      'audition',
      'substance',
    ],
    awardRefs: ['palenque-2026'],
    coverImage: '/media/projects/palenque/portada.webp',
    coverAlt: {
      en: 'Crónicas de Palenque illustrated parchment cover art',
      es: 'Portada ilustrada en pergamino de Crónicas de Palenque',
    },
    overviewParagraphs: [
      {
        en: 'A project by Sogno Studios that pays tribute to San Basilio de Palenque—the first free town in the Americas—by combining historical memory and magical realism to bridge the cultural gap surrounding the abolition of slavery.',
        es: 'Un proyecto de Sogno Studios que rinde homenaje a San Basilio de Palenque —el primer pueblo libre de América— combinando memoria histórica y realismo mágico para cerrar la brecha cultural en torno a la abolición de la esclavitud.',
      },
      {
        en: 'Built in Unity 6, the video game fuses 2D cinematics with a 3D universe designed for both the sensory immersion of Virtual Reality (Meta Quest 2) and high-performance PC graphics (Ray Tracing, precision controls). It serves as a technical bridge between cutting-edge technology and cultural preservation.',
        es: 'Construido en Unity 6, el videojuego fusiona cinemáticas 2D con un universo 3D diseñado tanto para la inmersión sensorial de la Realidad Virtual (Meta Quest 2) como para gráficos de alto rendimiento en PC (Ray Tracing y controles de precisión). Funciona como un puente técnico entre la tecnología de vanguardia y la preservación cultural.',
      },
    ],
    closingQuote: {
      en: 'Preserving historical memory through interactive technology.',
      es: 'Preservando la memoria histórica mediante la tecnología interactiva.',
    },
    chapters: [
      {
        id: 'palenque-highlights',
        title: {
          en: 'DEVELOPMENT HIGHLIGHTS',
          es: 'HITOS DE DESARROLLO',
        },
        videoId: 'palenque-support',
        highlights: [
          {
            title: {
              en: 'Memory And Identity',
              es: 'Memoria e Identidad',
            },
            bullets: [
              {
                en: 'Mystical atmospheres and lighting that pay tribute to the first free town in the Americas.',
                es: 'Atmósferas místicas e iluminación que rinden tributo al primer pueblo libre de América.',
              },
              {
                en: 'Integration of cultural symbolism and magical realism into the settings.',
                es: 'Integración de simbolismo cultural y realismo mágico en los escenarios.',
              },
            ],
          },
          {
            title: {
              en: 'High-Fidelity Rendering',
              es: 'Renderizado de Alta Fidelidad',
            },
            bullets: [
              {
                en: 'Implementation of real-time ray tracing, advanced shadows and volumetric ambient lighting.',
                es: 'Implementación de ray tracing en tiempo real, sombras avanzadas e iluminación ambiental volumétrica.',
              },
              {
                en: 'High-resolution PBR materials and dense jungle vegetation, and support for 4K displays and ultrawide formats.',
                es: 'Materiales PBR de alta resolución, vegetación selvática densa y soporte para pantallas 4K y formatos ultrawide.',
              },
            ],
          },
          {
            title: {
              en: 'Game Architecture',
              es: 'Arquitectura del Juego',
            },
            bullets: [
              {
                en: 'Unlocked frame rate and support for AI upscaling technologies (DLSS / FSR / XeSS).',
                es: 'Tasa de fotogramas desbloqueada y soporte para tecnologías de reescalado con IA (DLSS / FSR / XeSS).',
              },
              {
                en: 'Refactored C# code for smooth data handling, physics, and ultra-fast load times.',
                es: 'Código C# refactorizado para un manejo fluido de datos, físicas y tiempos de carga ultrarrápidos.',
              },
            ],
          },
        ],
      },
    ],
    videos: [
      {
        id: 'palenque-main',
        src: '/media/projects/palenque/video-main.mp4',
        poster: '/media/projects/palenque/hero-hall.webp',
        title: {
          en: 'Gameplay & Atmospheric Reel (Unity 6)',
          es: 'Reel Atmosférico y Gameplay (Unity 6)',
        },
        caption: {
          en: 'Real-time volumetric lighting, exploration mechanics and 2D/3D narrative fusion (PDF Page 05).',
          es: 'Iluminación volumétrica en tiempo real, mecánicas de exploración y fusión narrativa 2D/3D (Página 05 del PDF).',
        },
        durationLabel: '01:09',
      },
      {
        id: 'palenque-support',
        src: '/media/projects/palenque/video-support.mp4',
        poster: '/media/projects/palenque/forest-sunlit.webp',
        title: {
          en: 'Multi-Biome Engine Study',
          es: 'Estudio Multibioma en Motor',
        },
        caption: {
          en: 'Parallel biome comparison featuring golden jungle foliage, interior ray-traced wood, and ritual fog (PDF Page 06).',
          es: 'Comparativa paralela de biomas con follaje dorado, madera con ray tracing y niebla ritual (Página 06 del PDF).',
        },
        durationLabel: '00:09',
      },
    ],
    gallery: [
      {
        id: 'pal-hero-hall',
        src: '/media/projects/palenque/hero-hall.webp',
        alt: {
          en: 'Crónicas de Palenque wet timber hall with volumetric light shafts',
          es: 'Salón de madera húmeda con haces de luz volumétrica en Crónicas de Palenque',
        },
        caption: {
          en: 'PDF Page 07 — Main hall with ray-traced reflections and lantern lighting.',
          es: 'Página 07 del PDF — Salón principal con reflejos ray-traced e iluminación de faroles.',
        },
        pdfPageRef: 'P07',
        group: 'pdf-primary',
        aspect: 'landscape',
      },
      {
        id: 'pal-forest-sunlit',
        src: '/media/projects/palenque/forest-sunlit.webp',
        alt: {
          en: 'Golden sunlit forest path in Crónicas de Palenque',
          es: 'Sendero del bosque iluminado por luz dorada en Crónicas de Palenque',
        },
        caption: {
          en: 'PDF Page 08 — Stylized golden canopy and atmospheric god rays.',
          es: 'Página 08 del PDF — Dosel dorado estilizado y rayos crepusculares atmosféricos.',
        },
        pdfPageRef: 'P08',
        group: 'pdf-primary',
        aspect: 'landscape',
      },
      {
        id: 'pal-hall-alt',
        src: '/media/projects/palenque/gallery-hall-alt.webp',
        alt: {
          en: 'Elevated isometric view of glowing pillars inside the wooden chamber',
          es: 'Vista elevada de pilares luminosos en la cámara de madera',
        },
        caption: {
          en: 'PDF Page 09 (1/5) — Volumetric pillar chamber overview.',
          es: 'Página 09 del PDF (1/5) — Vista general de la cámara con pilares volumétricos.',
        },
        pdfPageRef: 'P09',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'pal-night-forest',
        src: '/media/projects/palenque/gallery-night-forest.webp',
        alt: {
          en: 'Bioluminescent twilight trees with violet sky',
          es: 'Árboles bioluminiscentes bajo cielo crepuscular violeta',
        },
        caption: {
          en: 'PDF Page 09 (2/5) — Magical realism night-canopy shader pass.',
          es: 'Página 09 del PDF (2/5) — Pase de shader nocturno de realismo mágico.',
        },
        pdfPageRef: 'P09',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'pal-corridor',
        src: '/media/projects/palenque/gallery-corridor.webp',
        alt: {
          en: 'Narrow wooden corridor lit by cyan and warm red light shafts',
          es: 'Corredor estrecho de madera con haces de luz cian y rojo cálido',
        },
        caption: {
          en: 'PDF Page 09 (3/5) — Architectural corridor contrast lighting.',
          es: 'Página 09 del PDF (3/5) — Iluminación de contraste en corredor arquitectónico.',
        },
        pdfPageRef: 'P09',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'pal-pier-sunset',
        src: '/media/projects/palenque/gallery-pier-sunset.webp',
        alt: {
          en: 'Wooden pier overlooking turquoise coastal waters at sunset',
          es: 'Muelle de madera sobre aguas turquesas al atardecer',
        },
        caption: {
          en: 'PDF Page 09 (4/5) — Coastal pier sequence (executable build capture).',
          es: 'Página 09 del PDF (4/5) — Secuencia del muelle costero (captura en build ejecutable).',
        },
        pdfPageRef: 'P09',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'pal-pier-aerial',
        src: '/media/projects/palenque/gallery-pier-aerial.webp',
        alt: {
          en: 'Top-down aerial view of the wooden pier over clear coastal water',
          es: 'Vista cenital del muelle de madera sobre agua cristalina',
        },
        caption: {
          en: 'Folder Archive — Top-down pier geometry & water refraction test.',
          es: 'Archivo de carpeta — Geometría cenital del muelle y prueba de refracción del agua.',
        },
        group: 'folder-extra',
        aspect: 'landscape',
      },
      {
        id: 'pal-wip-hall',
        src: '/media/projects/palenque/wip-hall.webp',
        alt: {
          en: 'Unity engine work-in-progress capture of the main chamber',
          es: 'Captura de trabajo en progreso en Unity del salón principal',
        },
        caption: {
          en: 'Folder Archive — Sogno Studios engine WIP lighting pass.',
          es: 'Archivo de carpeta — Pase de iluminación WIP en motor de Sogno Studios.',
        },
        group: 'folder-extra',
        aspect: 'landscape',
      },
      {
        id: 'pal-wip-corridor',
        src: '/media/projects/palenque/wip-corridor.webp',
        alt: {
          en: 'Unity engine work-in-progress capture of the backlit corridor',
          es: 'Captura WIP en motor del corredor con contraluz',
        },
        caption: {
          en: 'Folder Archive — Sogno Studios corridor WIP study.',
          es: 'Archivo de carpeta — Estudio WIP del corredor en Sogno Studios.',
        },
        group: 'folder-extra',
        aspect: 'landscape',
      },
    ],
    theme: {
      accentHex: '#F59E0B',
      secondaryHex: '#10B981',
      tertiaryHex: '#6366F1',
      glowRgba: 'rgba(245, 158, 11, 0.35)',
      shaderPaletteA: [0.96, 0.62, 0.04],
      shaderPaletteB: [0.06, 0.72, 0.51],
      shaderPaletteC: [0.24, 0.19, 0.55],
      labMode: 'palenque',
    },
    interactiveLab: {
      title: {
        en: 'VOLUMETRIC RAY-TRACING & MEMORY SPORE FIELD',
        es: 'CAMPO VOLUMÉTRICO RAY-TRACED Y ESPORAS DE MEMORIA',
      },
      subtitle: {
        en: 'GLSL Interactive Atmospheric Lighting Shader',
        es: 'Shader GLSL Interactivo de Iluminación Atmosférica',
      },
      instructions: {
        en: 'Move your cursor or touch across the canvas to steer volumetric light shafts and awaken bioluminescent memory particles.',
        es: 'Mueve el cursor o desliza el dedo sobre el lienzo para dirigir los haces de luz volumétrica y despertar partículas bioluminiscentes.',
      },
    },
  },

  // =========================================================================
  // 02. KANE NO HIBIKI (鐘の響き) (Pages 11–14)
  // =========================================================================
  {
    order: 2,
    indexLabel: '02',
    id: 'kane-no-hibiki',
    slug: 'kane-no-hibiki',
    title: 'Kane no Hibiki',
    nativeTitle: '鐘の響き',
    studioOrContext: {
      en: 'Architectural Interactive Videomapping · Medellín, Colombia',
      es: 'Videomapping Arquitectónico Interactivo · Medellín, Colombia',
    },
    pdfPages: 'Pages 11–14',
    projectType: {
      en: 'Interactive Videomapping',
      es: 'Videomapping Interactivo',
    },
    technologies: {
      en: 'Ultrasound Sensing (Distance Tracking), Serial / OSC Data Protocol & Real-time Reactive Visuals',
      es: 'Sensado Ultrasónico (Rastreo de Distancia), Protocolo Serial / OSC y Visuales Reactivos en Tiempo Real',
    },
    software: [
      'touchdesigner',
      'resolume',
      'arduino',
      'procreate',
      'aftereffects',
      'photoshop',
      'audition',
    ],
    coverImage: '/media/projects/kane-no-hibiki/portada.webp',
    coverAlt: {
      en: 'Kane no Hibiki official vertical projection mapping poster',
      es: 'Póster oficial vertical del videomapping Kane no Hibiki',
    },
    titleLogos: {
      primary: '/media/projects/kane-no-hibiki/titulo.webp',
      secondary: '/media/projects/kane-no-hibiki/titulo-jp.webp',
    },
    overviewParagraphs: [
      {
        en: 'Kane no Hibiki (鐘の響き) is a large-scale interactive architectural projection project that blends digital art with traditional Japanese symbolism. Installed on the exterior of a cultural library, the project translates concepts from ukiyo-e—such as the perseverance symbolized by koi fish, the longevity of cranes, and the fleeting beauty of sakura—into a dynamic audiovisual experience tailored to the building’s geometry.',
        es: 'Kane no Hibiki (鐘の響き) es un proyecto de proyección arquitectónica interactiva a gran escala que fusiona arte digital con simbolismo tradicional japonés. Instalado en la fachada exterior de una biblioteca cultural, traduce conceptos del ukiyo-e —como la perseverancia de los peces koi, la longevidad de las grullas y la belleza efímera del sakura— en una experiencia audiovisual dinámica adaptada a la geometría del edificio.',
      },
      {
        en: 'The system incorporates ultrasonic sensors to detect proximity and track foot traffic in real time. This distance data directly modifies the projection’s graphic parameters and visual layers, allowing the architecture to actively respond to passersby. The project stands out for its convergence of interactive development, physical sensor logic, and immersive art direction.',
        es: 'El sistema incorpora sensores ultrasónicos para detectar proximidad y rastrear el flujo peatonal en tiempo real. Estos datos de distancia modifican directamente los parámetros gráficos y capas visuales de la proyección, permitiendo que la arquitectura responda activamente a los transeúntes. Destaca por su convergencia entre desarrollo interactivo, lógica de sensores físicos y dirección de arte inmersiva.',
      },
    ],
    chapters: [
      {
        id: 'kane-spatial-logic',
        title: {
          en: 'SPATIAL LOGIC & INTERACTION MECHANICS',
          es: 'LÓGICA ESPACIAL Y MECÁNICAS DE INTERACCIÓN',
        },
        body: [
          {
            en: "Kane no Hibiki's graphic design reinterprets ukiyo-e art using animated 2D/3D assets on separate layers. The greatest technical challenge was adapting this rich iconography to the building’s surface and linking it to the physical sensors. By mapping the readings from the ultrasonic sensors to the animation parameters, we were able to make the architecture respond to people’s proximity without losing the compositional rigor of traditional Japanese prints.",
            es: 'El diseño gráfico de Kane no Hibiki reinterpreta el arte ukiyo-e mediante recursos animados 2D/3D en capas separadas. El mayor reto técnico fue adaptar esta rica iconografía a la superficie del edificio y enlazarla con los sensores físicos. Al mapear las lecturas de los sensores ultrasónicos a los parámetros de animación, logramos que la arquitectura respondiera a la cercanía del público sin perder el rigor compositivo del grabado tradicional japonés.',
          },
          {
            en: 'To bring the library’s façade to life, we designed an interactive mechanism based on proximity layers. As people approach the building, a network of ultrasonic sensors measures the distance and directly influences the composition: the koi fish alter the fluidity of their swimming, the cherry blossoms intensify their brilliance, and the background tones transform. This section illustrates the relationship between foot traffic, sensor coverage, and the environment’s immediate visual response.',
            es: 'Para dar vida a la fachada de la biblioteca diseñamos un mecanismo interactivo basado en capas de proximidad. Conforme las personas se acercan al edificio, una red de sensores ultrasónicos mide la distancia e influye directamente en la composición: los peces koi alteran la fluidez de su nado, los cerezos intensifican su brillo y los tonos de fondo se transforman.',
          },
        ],
        mediaIds: ['knh-koi', 'knh-dragon-purple'],
      },
      {
        id: 'kane-symbolism',
        title: {
          en: 'JAPANESE SYMBOLISM AND VISUAL HERITAGE',
          es: 'SIMBOLISMO JAPONÉS Y PATRIMONIO VISUAL',
        },
        body: [
          {
            en: 'Kane no Hibiki pays homage to Japan’s visual heritage by interweaving elements rich in symbolism: the perseverance of the koi fish, the longevity of the tsuru cranes, and the fleeting beauty of the cherry blossom (sakura). This section highlights the illustrative details, the traditional calligraphic typography, and the variations in the color palette that the façade dynamically adopts as the public interacts with the space.',
            es: 'Kane no Hibiki rinde homenaje al patrimonio visual de Japón entrelazando elementos llenos de simbolismo: la perseverancia del pez koi, la longevidad de las grullas tsuru y la belleza efímera de la flor de cerezo (sakura). Esta sección destaca los detalles ilustrativos, la tipografía caligráfica tradicional y las variaciones de paleta cromática que la fachada adopta dinámicamente cuando el público interactúa con el espacio.',
          },
        ],
        mediaIds: [
          'knh-golden-cranes',
          'knh-sumie-dragon',
          'knh-frontal-pagoda',
          'knh-sakura-crane-angle',
          'knh-sakura-geisha',
        ],
      },
    ],
    videos: [
      {
        id: 'kane-video-main',
        src: '/media/projects/kane-no-hibiki/video-main.mp4',
        poster: '/media/projects/kane-no-hibiki/facade-sakura-geisha.webp',
        title: {
          en: 'Live Architectural Projection Mapping Sequence',
          es: 'Secuencia en Vivo del Videomapping Arquitectónico',
        },
        caption: {
          en: 'Multi-state projection mapping transitions across the library façade: golden cranes, ukiyo-e koi waves, and sakura blossoms.',
          es: 'Transiciones de videomapping sobre la fachada de la biblioteca: grullas doradas, olas con peces koi y flores de sakura.',
        },
        durationLabel: '00:26',
      },
    ],
    gallery: [
      {
        id: 'knh-koi',
        src: '/media/projects/kane-no-hibiki/facade-koi.webp',
        alt: {
          en: 'Koi fish and golden bamboo projection mapping across the library facade',
          es: 'Proyección de peces koi y bambú dorado sobre la fachada de la biblioteca',
        },
        caption: {
          en: 'PDF Page 12 — Proximity-reactive koi layer and emerald wave cadence.',
          es: 'Página 12 del PDF — Capa de peces koi reactiva a proximidad y cadencia de olas esmeralda.',
        },
        pdfPageRef: 'P12',
        group: 'pdf-primary',
        aspect: 'landscape',
      },
      {
        id: 'knh-dragon-purple',
        src: '/media/projects/kane-no-hibiki/facade-dragon-purple.webp',
        alt: {
          en: 'Golden dragon amidst violet clouds and calligraphic scroll projected onto facade',
          es: 'Dragón dorado entre nubes violetas y pergamino caligráfico proyectado en la fachada',
        },
        caption: {
          en: 'PDF Page 12 — High-contrast violet clouds and golden dragon layer.',
          es: 'Página 12 del PDF — Nubes violetas de alto contraste y capa del dragón dorado.',
        },
        pdfPageRef: 'P12',
        group: 'pdf-primary',
        aspect: 'landscape',
      },
      {
        id: 'knh-golden-cranes',
        src: '/media/projects/kane-no-hibiki/facade-golden-cranes.webp',
        alt: {
          en: 'Gold-leaf tsuru cranes, pagoda, and kanji calligraphy on brick facade',
          es: 'Grullas tsuru en hoja de oro, pagoda y caligrafía kanji sobre la fachada',
        },
        caption: {
          en: 'PDF Page 13 (1/5) — Tsuru crane longevity study & calligraphic emblem.',
          es: 'Página 13 del PDF (1/5) — Estudio de longevidad de grullas tsuru y emblema caligráfico.',
        },
        pdfPageRef: 'P13',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'knh-sumie-dragon',
        src: '/media/projects/kane-no-hibiki/facade-sumie-dragon.webp',
        alt: {
          en: 'Visitors gathered before the sumi-e ink dragon projection on the library facade',
          es: 'Visitantes frente a la proyección del dragón sumi-e en la fachada de la biblioteca',
        },
        caption: {
          en: 'PDF Page 13 (2/5) — Audience presence & sumi-e dragon state.',
          es: 'Página 13 del PDF (2/5) — Presencia del público y estado del dragón sumi-e.',
        },
        pdfPageRef: 'P13',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'knh-frontal-pagoda',
        src: '/media/projects/kane-no-hibiki/facade-frontal-pagoda.webp',
        alt: {
          en: 'Frontal view of golden pagoda, red sun, and flying cranes on the library building',
          es: 'Vista frontal de pagoda dorada, sol rojo y grullas en vuelo sobre el edificio',
        },
        caption: {
          en: 'PDF Page 13 (3/5) — Symmetrical frontal architectural alignment.',
          es: 'Página 13 del PDF (3/5) — Alineación arquitectónica frontal simétrica.',
        },
        pdfPageRef: 'P13',
        group: 'pdf-grid',
        aspect: 'portrait',
      },
      {
        id: 'knh-sakura-crane-angle',
        src: '/media/projects/kane-no-hibiki/facade-sakura-crane-angle.webp',
        alt: {
          en: 'Oblique architectural view of sakura blossoms and crane over ocean waves',
          es: 'Vista arquitectónica oblicua de flores de sakura y grulla sobre olas',
        },
        caption: {
          en: 'PDF Page 13 (4/5) — Brick-mapped sakura & ukiyo-e wave texture.',
          es: 'Página 13 del PDF (4/5) — Textura de sakura y olas ukiyo-e mapeada sobre ladrillo.',
        },
        pdfPageRef: 'P13',
        group: 'pdf-grid',
        aspect: 'portrait',
      },
      {
        id: 'knh-sakura-geisha',
        src: '/media/projects/kane-no-hibiki/facade-sakura-geisha.webp',
        alt: {
          en: 'Full wide-angle sakura, pagoda, crane, and geisha projection wrapping the corner of the library',
          es: 'Gran angular de proyección de sakura, pagoda, grulla y geisha envolviendo la esquina de la biblioteca',
        },
        caption: {
          en: 'PDF Page 13 (5/5) & Page 14 — Dual-wall corner projection wrap.',
          es: 'Página 13 (5/5) y Página 14 del PDF — Envolvente dual en esquina arquitectónica.',
        },
        pdfPageRef: 'P14',
        group: 'pdf-primary',
        aspect: 'landscape',
      },
      {
        id: 'knh-bts-1',
        src: '/media/projects/kane-no-hibiki/bts-test-1.webp',
        alt: {
          en: 'Black and white behind-the-scenes calibration grid projection test with crew',
          es: 'Prueba de calibración en blanco y negro con grilla de mapeo y equipo técnico',
        },
        caption: {
          en: 'Folder Archive — On-site geometric calibration grid & projector alignment.',
          es: 'Archivo de carpeta — Calibración geométrica en sitio y alineación de proyectores.',
        },
        group: 'folder-extra',
        aspect: 'portrait',
      },
      {
        id: 'knh-bts-2',
        src: '/media/projects/kane-no-hibiki/bts-test-2.webp',
        alt: {
          en: 'Black and white behind-the-scenes technical tower and facade test projection',
          es: 'Prueba técnica nocturna desde torre de proyección en blanco y negro',
        },
        caption: {
          en: 'Folder Archive — Projection tower calibration & multi-projector mask test.',
          es: 'Archivo de carpeta — Calibración desde torre y prueba de máscaras multiproyector.',
        },
        group: 'folder-extra',
        aspect: 'portrait',
      },
    ],
    theme: {
      accentHex: '#FB7185',
      secondaryHex: '#FBBF24',
      tertiaryHex: '#38BDF8',
      glowRgba: 'rgba(251, 113, 133, 0.34)',
      shaderPaletteA: [0.98, 0.44, 0.52],
      shaderPaletteB: [0.98, 0.75, 0.14],
      shaderPaletteC: [0.09, 0.14, 0.28],
      labMode: 'kane',
    },
    interactiveLab: {
      title: {
        en: 'ULTRASONIC PROXIMITY & OSC FAÇADE SIMULATOR',
        es: 'SIMULADOR ULTRASÓNICO DE PROXIMIDAD Y OSC EN FACHADA',
      },
      subtitle: {
        en: 'Simulated Serial / OSC Sensor Stream + Reactive GLSL Ukiyo-e Waves',
        es: 'Flujo Simulado Serial / OSC + Olas Ukiyo-e Reactivas en GLSL',
      },
      instructions: {
        en: 'Drag the ultrasonic distance slider or hover horizontally across the façade to simulate visitor proximity (0.4m – 6.0m), modulating wave frequency, sakura brilliance, and palette shift.',
        es: 'Desliza el control ultrasónico o mueve el puntero horizontalmente para simular cercanía del público (0.4m – 6.0m), modulando frecuencia de olas, brillo del sakura y paleta.',
      },
    },
  },

  // =========================================================================
  // 03. SOGNO (Pages 15–20)
  // =========================================================================
  {
    order: 3,
    indexLabel: '03',
    id: 'sogno',
    slug: 'sogno',
    title: 'SOGNO',
    studioOrContext: {
      en: 'Sogno / Sogno 2 · 2x Award Winner 2025',
      es: 'Sogno / Sogno 2 · Doble Ganador 2025',
    },
    pdfPages: 'Pages 15–20',
    projectType: {
      en: 'AR Mobile Experience & Spatial Gameplay / Narrative',
      es: 'Experiencia Móvil AR y Gameplay / Narrativa Espacial',
    },
    technologies: {
      en: 'Augmented Reality | Image & Model Targets | LiDAR',
      es: 'Realidad Aumentada | Image & Model Targets | LiDAR',
    },
    software: [
      'unity',
      'blender',
      'procreate',
      'photoshop',
      'audition',
      'aftereffects',
      'polycam',
    ],
    awardRefs: ['sogno2-2025', 'sogno-2025'],
    coverImage: '/media/projects/sogno/portada-alterna.webp',
    coverAlt: {
      en: 'SOGNO alternative editorial portrait illustration with smartphone bound over eyes',
      es: 'Ilustración editorial alternativa de SOGNO con teléfono adherido al rostro',
    },
    titleLogos: {
      primary: '/media/projects/sogno/titulo-1.webp',
      secondary: '/media/projects/sogno/titulo-2.webp',
    },
    overviewParagraphs: [
      {
        en: 'Redefining the relationship between matter and digital light. The Sogno saga unites two stages of innovation in Augmented Reality: 2D animation on paper and spatial projection onto physical forms digitized via LiDAR. It is a technical and aesthetic journey in which every surface—whether printed or sculpted—becomes a conduit for fantasy.',
        es: 'Redefiniendo la relación entre la materia y la luz digital. La saga Sogno une dos etapas de innovación en Realidad Aumentada: animación 2D sobre papel y proyección espacial sobre formas físicas digitalizadas mediante LiDAR. Es un viaje técnico y estético donde cada superficie —impresa o esculpida— se convierte en un conducto para la fantasía.',
      },
      {
        en: 'From flat illustration to tangible relief: an interactive ecosystem where words come to life on the page and sculptures transform into real-time play environments.',
        es: 'De la ilustración plana al relieve tangible: un ecosistema interactivo donde las palabras cobran vida en la página y las esculturas se transforman en entornos jugables en tiempo real.',
      },
    ],
    chapters: [
      {
        id: 'sogno-bridging',
        title: {
          en: 'BRIDGING ANALOG & DIGITAL INTERACTION',
          es: 'PUENTE ENTRE INTERACCIÓN ANALÓGICA Y DIGITAL',
        },
        body: [
          {
            en: "Sogno connects the printed object with the digital environment through a dual-interaction architecture. Using real-time image recognition, the book's illustrations act as visual markers that trigger 3D animations, sound effects, and touch-interactive layers on the mobile screen, enriching the reading experience without disrupting its flow.",
            es: 'Sogno conecta el objeto impreso con el entorno digital mediante una arquitectura de doble interacción. Mediante reconocimiento de imágenes en tiempo real, las ilustraciones del libro actúan como marcadores visuales que activan animaciones 3D, efectos de sonido y capas táctiles interactivas en la pantalla móvil, enriqueciendo la lectura sin interrumpir su fluidez.',
          },
        ],
        mediaIds: ['sog-ar-book', 'sog-ar-room-park', 'sog-ui-collage', 'sog-ui-sketches'],
      },
      {
        id: 'sogno-page-to-life',
        title: {
          en: 'THE ART OF BRINGING THE PAGE TO LIFE',
          es: 'EL ARTE DE DAR VIDA A LA PÁGINA',
        },
        body: [
          {
            en: 'Sogno transcends the boundaries of ink, transforming reading into an act of sensory magic. Each illustration acts as a portal where analog strokes come alive through movement, light, and spatial sound, turning the physical book into a living canvas where fantasy is not merely read, but contemplated and inhabited.',
            es: 'Sogno trasciende los límites de la tinta, transformando la lectura en un acto de magia sensorial. Cada ilustración actúa como un portal donde los trazos analógicos cobran vida a través del movimiento, la luz y el sonido espacial, convirtiendo el libro físico en un lienzo vivo donde la fantasía no solo se lee, sino que se contempla y se habita.',
          },
          {
            en: 'A mobile-optimized technical pipeline that fuses the precision of image tracking with the finesse of classic editorial art.',
            es: 'Un pipeline técnico optimizado para dispositivos móviles que fusiona la precisión del rastreo de imagen con la delicadeza del arte editorial clásico.',
          },
        ],
        videoId: 'sogno-cinematic',
      },
      {
        id: 'sogno-matte-to-stage',
        title: {
          en: 'FROM PHYSICAL MATTE TO DIGITAL STAGE',
          es: 'DE LA MAQUETA FÍSICA AL ESCENARIO DIGITAL',
        },
        highlights: [
          {
            title: {
              en: '360° Space Exploration',
              es: 'Exploración Espacial 360°',
            },
            bullets: [
              {
                en: 'The model becomes the game level; the user must move around and inspect the physical object to uncover secrets.',
                es: 'La maqueta se convierte en el nivel del juego; el usuario debe desplazarse e inspeccionar el objeto físico para descubrir secretos.',
              },
            ],
          },
          {
            title: {
              en: 'Surface-Integrated Mini-games',
              es: 'Minijuegos Integrados en Superficie',
            },
            bullets: [
              {
                en: "Touch-based mechanics and direct interactivity calibrated to respond to the sculpture's physical forms.",
                es: 'Mecánicas táctiles e interactividad directa calibradas para responder a las formas físicas de la escultura.',
              },
            ],
          },
          {
            title: {
              en: 'Tangible, Intuitive Interface',
              es: 'Interfaz Tangible e Intuitiva',
            },
            bullets: [
              {
                en: "Minimizing virtual buttons by using the model's structure itself as the primary navigation interface.",
                es: 'Minimizando los botones virtuales al usar la propia estructura del modelo como interfaz principal de navegación.',
              },
            ],
          },
        ],
        mediaIds: ['sog-ar-paint-canvas', 'sog-ar-room-surface', 'sog-ar-menu-sogno2'],
        videoId: 'sogno-gameplay',
      },
    ],
    videos: [
      {
        id: 'sogno-cinematic',
        src: '/media/projects/sogno/video-cinematic.mp4',
        poster: '/media/projects/sogno/portada-sogno2.webp',
        title: {
          en: 'AR Book Awakening Cinematic',
          es: 'Cinemática de Despertar AR del Libro',
        },
        caption: {
          en: 'PDF Page 19 — Real-time glowing spatial projection activated from physical printed art.',
          es: 'Página 19 del PDF — Proyección espacial luminosa en tiempo real activada desde arte impreso.',
        },
        durationLabel: '00:24',
      },
      {
        id: 'sogno-gameplay',
        src: '/media/projects/sogno/video-gameplay.mp4',
        poster: '/media/projects/sogno/ar-room-surface.webp',
        title: {
          en: 'Sogno 2 — LiDAR Surface AR Gameplay Split',
          es: 'Sogno 2 — Gameplay AR sobre Superficie LiDAR',
        },
        caption: {
          en: 'Multi-screen showcase of interactive canvas painting, sticker customization, and 360° AR diorama.',
          es: 'Muestra multipantalla de pintura interactiva en lienzo, stickers y diorama AR 360°.',
        },
        durationLabel: '00:08',
      },
    ],
    gallery: [
      {
        id: 'sog-ar-book',
        src: '/media/projects/sogno/ar-book.webp',
        alt: {
          en: 'Open physical book triggering AR character overlay on smartphone',
          es: 'Libro físico abierto activando superposición de personaje AR en móvil',
        },
        caption: {
          en: 'PDF Page 16 (1/3) — Printed book image target tracking.',
          es: 'Página 16 del PDF (1/3) — Rastreo de marcador impreso sobre libro físico.',
        },
        pdfPageRef: 'P16',
        group: 'pdf-primary',
        aspect: 'portrait',
      },
      {
        id: 'sog-ar-room-park',
        src: '/media/projects/sogno/ar-room-park.webp',
        alt: {
          en: 'Glowing 3D bedroom diorama projected into outdoor environment via AR',
          es: 'Diorama 3D luminoso de habitación proyectado en exterior mediante AR',
        },
        caption: {
          en: 'PDF Page 16 (3/3) — Outdoor spatial anchor & holographic memory room.',
          es: 'Página 16 del PDF (3/3) — Anclaje espacial exterior y habitación holográfica.',
        },
        pdfPageRef: 'P16',
        group: 'pdf-primary',
        aspect: 'portrait',
      },
      {
        id: 'sog-ui-collage',
        src: '/media/projects/sogno/ui-collage.webp',
        alt: {
          en: 'Sogno mobile UI collage with ripped paper, headphones, sketchbook, and AR room',
          es: 'Collage de interfaz móvil Sogno con papel rasgado, audífonos, libreta y habitación AR',
        },
        caption: {
          en: 'PDF Page 17 — Tactile mobile UI & analog-scrapbook visual system.',
          es: 'Página 17 del PDF — UI móvil táctil y sistema visual de cuaderno analógico.',
        },
        pdfPageRef: 'P17',
        group: 'pdf-primary',
        aspect: 'landscape',
      },
      {
        id: 'sog-ui-sketches',
        src: '/media/projects/sogno/ui-sketches.webp',
        alt: {
          en: 'Three smartphone screens presenting monochrome sketchbook frames and concept art',
          es: 'Tres pantallas móviles con bocetos monocromáticos y arte conceptual',
        },
        caption: {
          en: 'PDF Page 18 — In-app "Bocetos" archive & narrative stills.',
          es: 'Página 18 del PDF — Archivo in-app "Bocetos" y fotogramas narrativos.',
        },
        pdfPageRef: 'P18',
        group: 'pdf-primary',
        aspect: 'landscape',
      },
      {
        id: 'sog-ar-paint-canvas',
        src: '/media/projects/sogno/ar-paint-canvas.webp',
        alt: {
          en: 'AR diorama surface prompt "Toca el lienzo para pintar" with character card',
          es: 'Diorama AR con indicación "Toca el lienzo para pintar" y tarjeta de personaje',
        },
        caption: {
          en: 'PDF Page 20 (1/3) — Surface-integrated canvas painting mini-game.',
          es: 'Página 20 del PDF (1/3) — Minijuego de pintura integrado sobre la superficie.',
        },
        pdfPageRef: 'P20',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'sog-ar-room-surface',
        src: '/media/projects/sogno/ar-room-surface.webp',
        alt: {
          en: 'LiDAR-mapped physical miniature bedroom with AR glowing orb interaction',
          es: 'Maqueta física mapeada por LiDAR con interacción de orbe luminoso AR',
        },
        caption: {
          en: 'PDF Page 20 (2/3) — LiDAR model target registration onto sculpted room.',
          es: 'Página 20 del PDF (2/3) — Registro de model target LiDAR sobre escultura física.',
        },
        pdfPageRef: 'P20',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'sog-ar-menu-sogno2',
        src: '/media/projects/sogno/ar-menu-sogno2.webp',
        alt: {
          en: 'Sogno 2 start menu UI with Iniciar, Anteriormente, and Instrucciones',
          es: 'Menú de inicio de Sogno 2 con Iniciar, Anteriormente e Instrucciones',
        },
        caption: {
          en: 'PDF Page 20 (3/3) — Sogno 2 main launcher interface.',
          es: 'Página 20 del PDF (3/3) — Interfaz principal de lanzamiento de Sogno 2.',
        },
        pdfPageRef: 'P20',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'sog-portada-sogno2',
        src: '/media/projects/sogno/portada-sogno2.webp',
        alt: {
          en: 'Sogno 2 illustrated purple and neon yellow cover poster',
          es: 'Portada ilustrada de Sogno 2 en tonos púrpura y amarillo neón',
        },
        caption: {
          en: 'Folder Archive — Sogno 2 official illustrated key art.',
          es: 'Archivo de carpeta — Arte clave oficial ilustrado de Sogno 2.',
        },
        group: 'folder-extra',
        aspect: 'portrait',
      },
    ],
    theme: {
      accentHex: '#A855F7',
      secondaryHex: '#22D3EE',
      tertiaryHex: '#FACC15',
      glowRgba: 'rgba(168, 85, 247, 0.36)',
      shaderPaletteA: [0.66, 0.33, 0.97],
      shaderPaletteB: [0.13, 0.83, 0.93],
      shaderPaletteC: [0.98, 0.8, 0.08],
      labMode: 'sogno',
    },
    interactiveLab: {
      title: {
        en: 'LIDAR SPATIAL MESH & AR TRACKING LENS',
        es: 'ESCANEO ESPACIAL LIDAR Y LENTE AR',
      },
      subtitle: {
        en: 'Interactive GLSL Depth-Scan & Holographic Wireframe Lens',
        es: 'Lente GLSL Interactiva de Escaneo de Profundidad y Malla Holográfica',
      },
      instructions: {
        en: 'Hover or drag the circular AR scanner over the physical illustration to reveal the underlying LiDAR point-cloud depth sweep and spatial wireframe.',
        es: 'Pasa el cursor o arrastra el escáner AR sobre la ilustración física para revelar el barrido de profundidad LiDAR y la malla espacial.',
      },
    },
  },

  // =========================================================================
  // 04. NOTAS Y COLORES (Pages 21–25)
  // =========================================================================
  {
    order: 4,
    indexLabel: '04',
    id: 'notas-y-colores',
    slug: 'notas-y-colores',
    title: 'Notas y Colores',
    nativeTitle: 'Un viaje por la Música',
    pdfPages: 'Pages 21–25',
    projectType: {
      en: 'Rhythm Game',
      es: 'Juego de Ritmo',
    },
    technologies: {
      en: 'Rhythm & Dynamic Audio Tech',
      es: 'Tecnología Rítmica y Audio Dinámico',
    },
    software: ['unity', 'maya', 'procreate', 'photoshop', 'audition'],
    coverImage: '/media/projects/notas-y-colores/portada.webp',
    coverAlt: {
      en: 'Notas & Colores: Un viaje por la Música official cover art',
      es: 'Portada oficial de Notas & Colores: Un viaje por la Música',
    },
    titleLogos: {
      primary: '/media/projects/notas-y-colores/titulo.webp',
    },
    overviewParagraphs: [
      {
        en: 'Notas y Colores is a rhythm and precision game for PC that evolves classic mechanics by integrating them with real-time audio processing technologies. Designed for highly responsive keyboard and controller input, the project links musical precision with an art style rooted in synesthesia and chromatic reactivity.',
        es: 'Notas y Colores es un videojuego de ritmo y precisión para PC que evoluciona las mecánicas clásicas al integrarlas con tecnologías de procesamiento de audio en tiempo real. Diseñado para una respuesta inmediata con teclado y control, el proyecto vincula la precisión musical con un estilo visual arraigado en la sinestesia y la reactividad cromática.',
      },
    ],
    chapters: [
      {
        id: 'notas-audio-systems',
        title: {
          en: 'AUDIO SYSTEMS & RHYTHM MECHANICS',
          es: 'SISTEMAS DE AUDIO Y MECÁNICAS RÍTMICAS',
        },
        highlights: [
          {
            title: {
              en: 'Dynamic Audio & MIDI Processing',
              es: 'Audio Dinámico y Procesamiento MIDI',
            },
            bullets: [
              {
                en: 'Integration of MIDI files and frequency analysis to generate automatic charting and perfect note-by-note synchronization.',
                es: 'Integración de archivos MIDI y análisis de frecuencia para generar mapeo automático (charting) y sincronización perfecta nota por nota.',
              },
            ],
          },
          {
            title: {
              en: 'Synesthetic Visual Response',
              es: 'Respuesta Visual Sinestésica',
            },
            bullets: [
              {
                en: "Audio-reactive environments and shaders that shift color palettes and pulse in sync with the music's pitch, intensity, and tempo.",
                es: 'Entornos y shaders audiorreactivos que cambian de paleta cromática y pulsan en sincronía con el tono, intensidad y tempo de la música.',
              },
            ],
          },
          {
            title: {
              en: 'High-Precision Controls',
              es: 'Controles de Alta Precisión',
            },
            bullets: [
              {
                en: 'PC-calibrated mapping for keyboard & mouse and gamepads, designed with strict timing windows (judgement windows) for competitive play.',
                es: 'Mapeo calibrado en PC para teclado, ratón y gamepads, diseñado con ventanas de tiempo estrictas (judgement windows) para juego competitivo.',
              },
            ],
          },
        ],
        mediaIds: ['not-lane-runner', 'not-lane-topdown', 'not-town-sunset'],
      },
      {
        id: 'notas-color-visuals',
        title: {
          en: 'COLOR, RHYTHM, AND VISUALS',
          es: 'COLOR, RITMO Y VISUALES',
        },
        body: [
          {
            en: 'Notas y Colores is a rhythm and precision game for PC that evolves classic mechanics by integrating them with real-time audio processing technologies. Designed for highly responsive keyboard and controller input, the project links musical precision with an art style rooted in synesthesia and chromatic reactivity.',
            es: 'Notas y Colores conecta cada pulsación musical con una explosión cromática a lo largo de la pista de cuatro carriles, transformando la precisión rítmica en un recorrido visual sinestésico.',
          },
        ],
        videoId: 'notas-gameplay',
      },
    ],
    videos: [
      {
        id: 'notas-gameplay',
        src: '/media/projects/notas-y-colores/video-gameplay.mp4',
        poster: '/media/projects/notas-y-colores/gallery-hud-1425.webp',
        title: {
          en: 'PC Gameplay Capture — Combo & Judgement Windows',
          es: 'Captura de Gameplay en PC — Combos y Ventanas de Precisión',
        },
        caption: {
          en: 'PDF Page 23 — Live 4-lane rainbow track gameplay with score counter and "Perfecto" timing judgement.',
          es: 'Página 23 del PDF — Gameplay en vivo de 4 carriles arcoíris con contador y juicio de precisión "Perfecto".',
        },
        durationLabel: '00:09',
      },
    ],
    gallery: [
      {
        id: 'not-lane-runner',
        src: '/media/projects/notas-y-colores/lane-runner.webp',
        alt: {
          en: 'Character running along four glowing neon lanes through a musical town',
          es: 'Personaje corriendo por cuatro carriles neón en una ciudad musical',
        },
        caption: {
          en: 'PDF Page 22 (1/3) & Page 24 — Main 4-lane synesthetic perspective.',
          es: 'Página 22 (1/3) y Página 24 del PDF — Perspectiva principal de 4 carriles sinestésicos.',
        },
        pdfPageRef: 'P24',
        group: 'pdf-primary',
        aspect: 'landscape',
      },
      {
        id: 'not-lane-topdown',
        src: '/media/projects/notas-y-colores/lane-topdown.webp',
        alt: {
          en: 'Top-down orthographic shot of rainbow rhythm track and stylized town roofs',
          es: 'Vista cenital ortográfica de la pista arcoíris y tejados estilizados',
        },
        caption: {
          en: 'PDF Page 22 (2/3) — Top-down lane readability & colour zoning.',
          es: 'Página 22 del PDF (2/3) — Legibilidad cenital de carriles y zonificación cromática.',
        },
        pdfPageRef: 'P22',
        group: 'pdf-primary',
        aspect: 'landscape',
      },
      {
        id: 'not-town-sunset',
        src: '/media/projects/notas-y-colores/town-sunset.webp',
        alt: {
          en: 'Low horizon sunset glow framing the musical avenue and giant instruments',
          es: 'Resplandor de atardecer enmarcando la avenida musical e instrumentos gigantes',
        },
        caption: {
          en: 'PDF Page 22 (3/3) & Page 25 — Sunset bloom & giant instrument silhouettes.',
          es: 'Página 22 (3/3) y Página 25 del PDF — Bloom de atardecer y siluetas de instrumentos gigantes.',
        },
        pdfPageRef: 'P22',
        group: 'pdf-primary',
        aspect: 'landscape',
      },
      {
        id: 'not-accordion',
        src: '/media/projects/notas-y-colores/gallery-accordion.webp',
        alt: {
          en: 'Giant colorful accordion sculpture beside the rhythm street',
          es: 'Acordeón gigante colorido junto a la calle rítmica',
        },
        caption: {
          en: 'PDF Page 25 (1/6) — Monumental accordion environmental prop.',
          es: 'Página 25 del PDF (1/6) — Acordeón monumental integrado al escenario.',
        },
        pdfPageRef: 'P25',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'not-aerial',
        src: '/media/projects/notas-y-colores/gallery-aerial.webp',
        alt: {
          en: 'High-angle diagonal view across the neon rainbow rhythm lanes',
          es: 'Vista aérea diagonal sobre los carriles rítmicos neón',
        },
        caption: {
          en: 'PDF Page 25 (2/6) — Overhead level layout & visual pacing.',
          es: 'Página 25 del PDF (2/6) — Distribución superior del nivel y ritmo visual.',
        },
        pdfPageRef: 'P25',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'not-bear-cafe',
        src: '/media/projects/notas-y-colores/gallery-bear-cafe.webp',
        alt: {
          en: 'Giant teddy bear sitting beside a stylized cafe on the street corner',
          es: 'Oso de peluche gigante sentado junto a una cafetería estilizada',
        },
        caption: {
          en: 'PDF Page 25 (3/6) — Cozy town corner landmark & ambient lighting.',
          es: 'Página 25 del PDF (3/6) — Esquina urbana y dirección de iluminación ambiental.',
        },
        pdfPageRef: 'P25',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'not-feet-notes',
        src: '/media/projects/notas-y-colores/gallery-feet-notes.webp',
        alt: {
          en: 'Close-up of character sneakers stepping onto blue rhythmic note pads',
          es: 'Primer plano de zapatillas pisando plataformas azules de notas rítmicas',
        },
        caption: {
          en: 'PDF Page 25 (5/6) — Footwork contact & judgement trigger pads.',
          es: 'Página 25 del PDF (5/6) — Contacto de pasos y activadores de precisión.',
        },
        pdfPageRef: 'P25',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'not-coffee-cup',
        src: '/media/projects/notas-y-colores/gallery-coffee-cup.webp',
        alt: {
          en: 'Giant coffee cup rooftop prop overlooking the vibrant rhythm track',
          es: 'Taza de café gigante sobre azotea mirando hacia la pista rítmica',
        },
        caption: {
          en: 'PDF Page 25 (6/6) — Rooftop cafe landmark & warm/cool lighting contrast.',
          es: 'Página 25 del PDF (6/6) — Azotea temática y contraste cálido/frío.',
        },
        pdfPageRef: 'P25',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'not-hud-1425',
        src: '/media/projects/notas-y-colores/gallery-hud-1425.webp',
        alt: {
          en: 'In-game HUD showing 1425 pts, Combo 24 x2, and Perfecto judgement',
          es: 'Interfaz de juego mostrando 1425 pts, Combo 24 x2 y calificación Perfecto',
        },
        caption: {
          en: 'Folder Archive — Active HUD telemetry (Combo 24 x2 · Perfecto).',
          es: 'Archivo de carpeta — Telemetría HUD en partida (Combo 24 x2 · Perfecto).',
        },
        group: 'folder-extra',
        aspect: 'landscape',
      },
      {
        id: 'not-icecream',
        src: '/media/projects/notas-y-colores/gallery-icecream.webp',
        alt: {
          en: 'Stylized giant pink ice cream cone monument under pastel clouds',
          es: 'Monumento estilizado de cono de helado rosado bajo nubes pastel',
        },
        caption: {
          en: 'Folder Archive — 3D environmental landmark asset.',
          es: 'Archivo de carpeta — Recurso 3D de hito ambiental.',
        },
        group: 'folder-extra',
        aspect: 'landscape',
      },
    ],
    theme: {
      accentHex: '#EC4899',
      secondaryHex: '#06B6D4',
      tertiaryHex: '#84CC16',
      glowRgba: 'rgba(236, 72, 153, 0.36)',
      shaderPaletteA: [0.93, 0.28, 0.6],
      shaderPaletteB: [0.02, 0.71, 0.83],
      shaderPaletteC: [0.52, 0.8, 0.09],
      labMode: 'notas',
    },
    interactiveLab: {
      title: {
        en: 'SYNESTHETIC 4-LANE AUDIO & GLSL PULSE PAD',
        es: 'PAD SINESTÉSICO DE 4 CARRILES Y PULSO GLSL',
      },
      subtitle: {
        en: 'Web Audio Polyphonic Synth + Real-Time Chromatic Shader',
        es: 'Sintetizador Web Audio Polifónico + Shader Cromático en Tiempo Real',
      },
      instructions: {
        en: 'Tap the 4 chromatic lanes or press D · F · J · K keys on your keyboard to trigger harmonic notes and drive real-time GLSL frequency waves.',
        es: 'Pulsa los 4 carriles cromáticos o presiona las teclas D · F · J · K para disparar notas armónicas y ondas de frecuencia GLSL en tiempo real.',
      },
    },
  },

  // =========================================================================
  // 05. THE AMAZING DIGITAL CIRCUS 2 (Pages 26–29)
  // =========================================================================
  {
    order: 5,
    indexLabel: '05',
    id: 'the-amazing-digital-circus-2',
    slug: 'the-amazing-digital-circus-2',
    title: 'The Amazing Digital Circus 2',
    pdfPages: 'Pages 26–29',
    projectType: {
      en: 'Fan Animated Web Series — Work in Progress',
      es: 'Serie Web Animada Fan — Trabajo en Progreso',
    },
    technologies: {
      en: 'Stylized 3D Rendering, Dynamic Rigging & Digital Set Design',
      es: 'Renderizado 3D Estilizado, Rigging Dinámico y Escenografía Digital',
    },
    software: [
      'maya',
      'procreate',
      'photoshop',
      'audition',
      'aftereffects',
      'premiere',
      'substance',
    ],
    coverImage: '/media/projects/tadc2/portada.webp',
    coverAlt: {
      en: 'The Amazing Digital Circus 2 vertical poster key art',
      es: 'Póster vertical de The Amazing Digital Circus 2',
    },
    titleLogos: {
      primary: '/media/projects/tadc2/titulo.webp',
    },
    characterCutouts: [
      '/media/projects/tadc2/char-caine-left.webp',
      '/media/projects/tadc2/char-caine-right.webp',
      '/media/projects/tadc2/char-caine-glitch.webp',
    ],
    overviewParagraphs: [
      {
        en: 'A full-service independent audiovisual production and 3D animation studio. The project demonstrates the ability to take a narrative concept from storyboard to screen, encompassing environment creation, character rigging, and cinematic compositing.',
        es: 'Una producción audiovisual independiente integral y estudio de animación 3D. El proyecto demuestra la capacidad de llevar un concepto narrativo desde el storyboard hasta la pantalla, abarcando creación de entornos, rigging de personajes y composición cinematográfica.',
      },
      {
        en: 'A work-in-progress process addressing the end-to-end management of an animated miniseries, optimizing the rendering pipeline and the development of 3D performance tools that are constantly evolving.',
        es: 'Un proceso en desarrollo que aborda la gestión integral de una miniserie animada, optimizando el pipeline de renderizado y el desarrollo de herramientas de desempeño 3D en constante evolución.',
      },
    ],
    chapters: [
      {
        id: 'tadc2-scenography',
        title: {
          en: 'DIGITAL SCENOGRAPHY AND AUDIOVISUAL LANGUAGE',
          es: 'ESCENOGRAFÍA DIGITAL Y LENGUAJE AUDIOVISUAL',
        },
        body: [
          {
            en: "Recreating the digital circus universe required a detailed analysis of its animation and design principles. The process focuses on adapting the characters' extreme expressiveness through flexible facial rigs and creating three-dimensional environments that respond to theatrical and chaotic lighting.",
            es: 'Recrear el universo del circo digital requirió un análisis detallado de sus principios de animación y diseño. El proceso se centra en adaptar la expresividad extrema de los personajes mediante rigs faciales flexibles y crear entornos tridimensionales que respondan a una iluminación teatral y caótica.',
          },
        ],
        highlights: [
          {
            title: {
              en: '3D Rigging and Performance',
              es: 'Rigging 3D y Actuación',
            },
            bullets: [
              {
                en: 'Construction of advanced rigging systems featuring custom facial and body controls, specifically developed to support elastic deformations, extreme stretching (squash and stretch), and the exaggerated physicality characteristic of stylized animation.',
                es: 'Construcción de sistemas avanzados de rigging con controles faciales y corporales personalizados, desarrollados para soportar deformaciones elásticas, estiramientos extremos (squash and stretch) y la fisicalidad exagerada propia de la animación estilizada.',
              },
            ],
          },
          {
            title: {
              en: 'Shading and Texturing',
              es: 'Shading y Texturizado',
            },
            bullets: [
              {
                en: 'Creation of a lighting and materials pipeline (LookDev) focused on recreating a retro-digital aesthetic. Stylized shaders were developed to mimic the clean, slightly plastic finish of the original universe while maintaining color consistency across various lighting schemes.',
                es: 'Creación de un pipeline de iluminación y materiales (LookDev) enfocado en recrear una estética retro-digital. Se desarrollaron shaders estilizados para imitar el acabado limpio y ligeramente plástico del universo original manteniendo consistencia cromática.',
              },
            ],
          },
          {
            title: {
              en: 'Layout and Composition',
              es: 'Layout y Composición',
            },
            bullets: [
              {
                en: 'Detailed planning of audiovisual pacing through the layout of camera shots, cinematics, and expressive angles. Each frame is crafted to enhance comedic timing, visual dynamism, and the dramatic weight of the characters within the three-dimensional space.',
                es: 'Planificación detallada del ritmo audiovisual mediante el layout de cámaras, cinemáticas y ángulos expresivos. Cada cuadro está diseñado para potenciar el timing cómico, el dinamismo visual y el peso dramático en el espacio 3D.',
              },
            ],
          },
        ],
        mediaIds: ['tdc-void-hands'],
      },
    ],
    videos: [],
    gallery: [
      {
        id: 'tdc-void-hands',
        src: '/media/projects/tadc2/void-hands.webp',
        alt: {
          en: 'Cartoon gloved hands emerging from glowing pink glitch cross on checkered floor',
          es: 'Manos con guantes emergiendo de una grieta luminosa rosa sobre suelo ajedrezado',
        },
        caption: {
          en: 'PDF Page 28 — Iconic void emergence look-dev frame with chromatic aberration.',
          es: 'Página 28 del PDF — Fotograma LookDev de emergencia en el vacío con aberración cromática.',
        },
        pdfPageRef: 'P28',
        group: 'pdf-primary',
        aspect: 'landscape',
      },
      {
        id: 'tdc-circus-hall',
        src: '/media/projects/tadc2/scene-circus-hall.webp',
        alt: {
          en: '3D interior hall of the digital circus with colorful doors and dramatic lighting',
          es: 'Salón interior 3D del circo digital con puertas coloridas e iluminación dramática',
        },
        caption: {
          en: 'PDF Page 29 (1/9) — Digital set design & warm theatrical lighting.',
          es: 'Página 29 del PDF (1/9) — Diseño de set digital e iluminación teatral cálida.',
        },
        pdfPageRef: 'P29',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'tdc-kaufmo',
        src: '/media/projects/tadc2/scene-kaufmo.webp',
        alt: {
          en: 'Clown character dramatic low-key spotlight render',
          es: 'Render dramático de personaje payaso bajo foco puntual',
        },
        caption: {
          en: 'PDF Page 29 (2/9) — Dramatic key-light & elastic hand rigging pose.',
          es: 'Página 29 del PDF (2/9) — Luz principal dramática y pose de rigging elástico.',
        },
        pdfPageRef: 'P29',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'tdc-jax-rim',
        src: '/media/projects/tadc2/scene-jax-rim.webp',
        alt: {
          en: 'Stylized purple rabbit silhouette rim-lit in magenta and neon violet',
          es: 'Silueta estilizada de conejo con luz de recorte magenta y violeta neón',
        },
        caption: {
          en: 'PDF Page 29 (3/9) — Silhouette rim-lighting & subsurface LookDev.',
          es: 'Página 29 del PDF (3/9) — Luz de recorte de silueta y LookDev.',
        },
        pdfPageRef: 'P29',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'tdc-caine-notebook',
        src: '/media/projects/tadc2/scene-caine-notebook.webp',
        alt: {
          en: 'Caine writing in a red notebook outdoors with sunny stylized foliage',
          es: 'Caine escribiendo en libreta roja en exterior soleado estilizado',
        },
        caption: {
          en: 'PDF Page 29 (4/9) — Daylight exterior compositing & character performance.',
          es: 'Página 29 del PDF (4/9) — Composición en luz diurna y actuación de personaje.',
        },
        pdfPageRef: 'P29',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'tdc-glitch-shades',
        src: '/media/projects/tadc2/scene-glitch-shades.webp',
        alt: {
          en: 'Character holding glowing pink orb with red holographic glitch visors',
          es: 'Personaje sosteniendo orbe rosa luminoso con visor glitch rojo holográfico',
        },
        caption: {
          en: 'PDF Page 29 (5/9) — Retro-digital HUD glitch shader effect.',
          es: 'Página 29 del PDF (5/9) — Efecto shader glitch HUD retro-digital.',
        },
        pdfPageRef: 'P29',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'tdc-caine-indoor',
        src: '/media/projects/tadc2/scene-caine-indoor.webp',
        alt: {
          en: 'Warm orange interior close-up of Caine expression rig',
          es: 'Primer plano cálido en interior del rig expresivo de Caine',
        },
        caption: {
          en: 'PDF Page 29 (6/9) — Facial rig squash-and-stretch calibration.',
          es: 'Página 29 del PDF (6/9) — Calibración squash-and-stretch del rig facial.',
        },
        pdfPageRef: 'P29',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'tdc-pomni',
        src: '/media/projects/tadc2/scene-pomni.webp',
        alt: {
          en: 'Dramatic dark close-up of Pomni eyes reflecting circus pinwheels',
          es: 'Primer plano dramático oscuro de los ojos de Pomni',
        },
        caption: {
          en: 'PDF Page 29 (7/9) — Expressive eye shader & dramatic close-up framing.',
          es: 'Página 29 del PDF (7/9) — Shader expresivo de ojos y encuadre dramático.',
        },
        pdfPageRef: 'P29',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'tdc-wireframe-void',
        src: '/media/projects/tadc2/scene-wireframe-void.webp',
        alt: {
          en: 'Glowing cyan and red character silhouettes inside a wireframe grid void',
          es: 'Siluetas luminosas cian y roja dentro de un vacío de grilla wireframe',
        },
        caption: {
          en: 'PDF Page 29 (8/9) — Wireframe spatial void & emissive silhouette pass.',
          es: 'Página 29 del PDF (8/9) — Vacío espacial wireframe y pase emisivo.',
        },
        pdfPageRef: 'P29',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'tdc-caine-backlit',
        src: '/media/projects/tadc2/scene-caine-backlit.webp',
        alt: {
          en: 'Multi-armed Caine backlit by intense electric blue stage lights',
          es: 'Caine multibrazo con contraluz azul eléctrico intenso de escenario',
        },
        caption: {
          en: 'PDF Page 29 (9/9) — Theatrical bloom & multi-limb rig test.',
          es: 'Página 29 del PDF (9/9) — Bloom teatral y prueba de rig multimiembro.',
        },
        pdfPageRef: 'P29',
        group: 'pdf-grid',
        aspect: 'landscape',
      },
      {
        id: 'tdc-caine-stage',
        src: '/media/projects/tadc2/scene-caine-stage.webp',
        alt: {
          en: 'Caine with blue digital glitch display inside mouth on checkered circus floor',
          es: 'Caine con pantalla digital azul glitch sobre suelo ajedrezado de circo',
        },
        caption: {
          en: 'Folder Archive — Checkered stage & emissive glitch shader look-dev.',
          es: 'Archivo de carpeta — Escenario ajedrezado y LookDev de shader glitch emisivo.',
        },
        group: 'folder-extra',
        aspect: 'square',
      },
      {
        id: 'tdc-caine-glitch-cutout',
        src: '/media/projects/tadc2/char-caine-glitch.webp',
        alt: {
          en: 'Transparent Caine 3D character render with blue error screen mouth',
          es: 'Render 3D transparente de Caine con pantalla de error azul',
        },
        caption: {
          en: 'Folder Archive — Isolated 3D character rig render (Glitch variant).',
          es: 'Archivo de carpeta — Render aislado del rig 3D (variante Glitch).',
        },
        group: 'folder-extra',
        aspect: 'square',
      },
      {
        id: 'tdc-caine-pose-cutout',
        src: '/media/projects/tadc2/char-caine-pose.webp',
        alt: {
          en: 'Full-body Caine 3D pose turn-around render',
          es: 'Render de cuerpo completo de Caine en pose 3D',
        },
        caption: {
          en: 'Folder Archive — Full-body rig turnaround study.',
          es: 'Archivo de carpeta — Estudio de pose de cuerpo completo del rig.',
        },
        group: 'folder-extra',
        aspect: 'portrait',
      },
    ],
    theme: {
      accentHex: '#EF4444',
      secondaryHex: '#D946EF',
      tertiaryHex: '#3B82F6',
      glowRgba: 'rgba(239, 68, 68, 0.36)',
      shaderPaletteA: [0.94, 0.27, 0.27],
      shaderPaletteB: [0.85, 0.27, 0.94],
      shaderPaletteC: [0.23, 0.51, 0.96],
      labMode: 'tadc2',
    },
    interactiveLab: {
      title: {
        en: 'RETRO-DIGITAL CRT & GLITCH LOOKDEV SHADER',
        es: 'SHADER LOOKDEV RETRO-DIGITAL CRT Y GLITCH',
      },
      subtitle: {
        en: 'Real-Time GLSL Chromatic Split, Barrel Warp & Glitch Displacement',
        es: 'Separación Cromática GLSL, Curvatura CRT y Desplazamiento Glitch en Tiempo Real',
      },
      instructions: {
        en: 'Move across the 3D render or adjust glitch intensity to inspect real-time RGB chromatic aberration, CRT scanlines, and stylized retro-digital shaders.',
        es: 'Mueve el puntero sobre el render 3D o ajusta la intensidad glitch para inspeccionar aberración cromática RGB, scanlines CRT y shaders retro-digitales.',
      },
    },
  },
]
