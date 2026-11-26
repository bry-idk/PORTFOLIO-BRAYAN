import { ProfileData } from '../types/portfolio'

/**
 * Official profile data sourced from "portfolio pag 1.pdf"
 * and exact Behance URL from "link behance.txt".
 */
export const BEHANCE_EXACT_URL =
  'https://www.behance.net/gallery/254153935/PORTFOLIO-DIGITAL-INTERACTION-2026'

export const PROFILE_DATA: ProfileData = {
  fullName: 'Brayan Marín Ampudia',
  brandTitle: 'DIGITAL INTERACTION',
  year: '2026',
  greeting: {
    en: "HOLA! HELLO! I'M BRAYAN",
    es: '¡HOLA! HELLO! SOY BRAYAN',
  },
  headlineTag: {
    en: 'CREATIVE TECHNOLOGIST · XR / PROJECTION MAPPING / REAL-TIME 3D',
    es: 'TECNÓLOGO CREATIVO · XR / PROJECTION MAPPING / 3D EN TIEMPO REAL',
  },
  portraitUrl: '/media/profile/brayan-portrait.webp',
  bioStatement: {
    en: 'My artistic practice explores individual and collective memory as a dynamic phenomenon in constant reconstruction, conceiving technology and code not as mere tools, but as a poetic medium capable of evoking emotion, nostalgia, and a sense of belonging. Through an interdisciplinary methodology that integrates Extended Reality (VR/AR), projection mapping, physical sensors, and real-time programming, I transform physical space into a dynamic canvas where the tangible engages in a fluid dialogue with computational logic. In this way, the audience ceases to be a passive observer and becomes a co-author of the experience, activating latent narratives and actively redefining the work through their presence and physical interaction.',
    es: 'Mi práctica artística explora la memoria individual y colectiva como un fenómeno dinámico en constante reconstrucción, concibiendo la tecnología y el código no como meras herramientas, sino como un medio poético capaz de evocar emoción, nostalgia y sentido de pertenencia. A través de una metodología interdisciplinaria que integra Realidad Extendida (VR/AR), projection mapping, sensores físicos y programación en tiempo real, transformo el espacio físico en un lienzo dinámico donde lo tangible entabla un diálogo fluido con la lógica computacional. De este modo, el espectador deja de ser un observador pasivo para convertirse en coautor de la experiencia, activando narrativas latentes y redefiniendo activamente la obra mediante su presencia e interacción física.',
  },
  contact: {
    email: 'brayan1310_@outlook.com',
    location: 'Medellín, CO.',
    instagramHandle: '@bry_vfx',
    instagramUrl: 'https://www.instagram.com/bry_vfx/',
    linkedinLabel: 'Brayan Marín A.',
    linkedinUrl:
      'https://www.linkedin.com/search/results/all/?keywords=Brayan%20Mar%C3%ADn%20A.',
    behanceLabel: 'Brayan Marín A.',
    behanceUrl: BEHANCE_EXACT_URL,
  },
  careerOverview: [
    // 2026
    {
      year: '2026',
      role: {
        en: 'Spatial Experience Director',
        es: 'Director de Experiencias Espaciales',
      },
      organization: 'EPM - Medellín',
    },
    {
      year: '2026',
      role: {
        en: 'Lead Creative Technologist',
        es: 'Tecnólogo Creativo Líder',
      },
      organization: 'EAFIT University - IMA Research Lab - Medellín',
    },
    {
      year: '2026',
      role: {
        en: 'Interactive Tech Lead',
        es: 'Líder de Tecnología Interactiva',
      },
      organization: 'Design I/O - Brooklyn, New York, EE.UU',
    },
    {
      year: '2026',
      role: {
        en: 'Lead Systems Architect',
        es: 'Arquitecto Líder de Sistemas',
      },
      organization: 'Vanguard Digital - Québec, Canada',
    },
    {
      year: '2026',
      role: {
        en: 'Lead Creative Technologist (XR & Interactive Installations)',
        es: 'Tecnólogo Creativo Líder (XR e Instalaciones Interactivas)',
      },
      organization: 'Sogno Studios',
    },
    {
      year: '2026',
      role: {
        en: 'VFX Director',
        es: 'Director de VFX',
      },
      organization: 'Nova Studios - CDMX, México',
    },
    // 2025
    {
      year: '2025',
      role: {
        en: 'Creative Technologist — Projection Mapping',
        es: 'Tecnólogo Creativo — Projection Mapping',
      },
      organization: 'LUMYNEX Festival Medellín',
    },
    {
      year: '2025',
      role: {
        en: 'Real-Time 3D Developer (Unity / Unreal Engine)',
        es: 'Desarrollador 3D en Tiempo Real (Unity / Unreal Engine)',
      },
      organization: 'INCIDELAB - Envigado',
    },
    {
      year: '2025',
      role: {
        en: 'Real-Time Graphics Developer',
        es: 'Desarrollador de Gráficos en Tiempo Real',
      },
      organization: 'Débora Transtemporal PPI - Envigado',
    },
    {
      year: '2025',
      role: {
        en: 'Mobile AR Software Developer',
        es: 'Desarrollador de Software AR Móvil',
      },
      organization: 'Sogno Studios',
    },
    // 2024
    {
      year: '2024',
      role: {
        en: 'Tech Lead - Interactive Mapping Installation',
        es: 'Líder Técnico - Instalación de Mapping Interactivo',
      },
      organization: 'EAFIT University',
    },
    {
      year: '2024',
      role: {
        en: 'VFX and 3D Designer',
        es: 'Diseñador 3D y de VFX',
      },
      organization: 'TSK Studio',
    },
    {
      year: '2024',
      role: {
        en: 'Gameplay & Systems Programmer',
        es: 'Programador de Gameplay y Sistemas',
      },
      organization: 'Nexia Studios',
    },
  ],
  education: [
    {
      year: '2026',
      degree: {
        en: 'Associate Degree in Content Management for Digital Interaction',
        es: 'Tecnología en Gestión de Contenidos para la Interacción Digital',
      },
      institution: 'Tecnológico de Artes Débora Arango',
    },
    {
      year: '2025',
      degree: {
        en: 'AI-Based Project Developer With Agentic Workflows',
        es: 'Desarrollador de Proyectos Basados en IA con Flujos Agénticos',
      },
      institution: 'Google Cloud AI',
    },
    {
      year: '2025',
      degree: {
        en: 'Professional Technician in Digital Interaction Object Production',
        es: 'Técnico Profesional en Producción de Objetos para la Interacción Digital',
      },
      institution: 'Tecnológico de Artes Débora Arango',
    },
    {
      year: '2024',
      degree: {
        en: 'Interactive Software Developer and Installation Designer',
        es: 'Desarrollador de Software Interactivo y Diseñador de Instalaciones',
      },
      institution: 'CFAMM',
    },
    {
      year: '2023',
      degree: {
        en: 'Front-End & Back-End Software Developer',
        es: 'Desarrollador de Software Front-End y Back-End',
      },
      institution: 'ONE — Oracle Next Education',
    },
    {
      year: '2023',
      degree: {
        en: 'English C1 Advanced Certification (MET — Michigan English Test)',
        es: 'Certificación Avanzada de Inglés C1 (MET — Michigan English Test)',
      },
      institution: 'SMART Academy, Cambridge University',
    },
    {
      year: '2022',
      degree: {
        en: 'Specialized Coursework & Technical Training',
        es: 'Formación Técnica y Cursos Especializados',
      },
      institution: 'Strata Systems',
    },
  ],
  languages: {
    en: 'Spanish (Native) | English C1 | French B2',
    es: 'Español (Nativo) | Inglés C1 | Francés B2',
  },
  softwareSkills: [
    {
      id: '3d',
      category: { en: '3D', es: '3D' },
      items: [
        'Maya',
        'Blender',
        'Adobe Substance 3D Painter',
        'Unity',
        'Unreal Engine',
      ],
    },
    {
      id: 'post-production',
      category: { en: 'Post-production', es: 'Postproducción' },
      items: [
        'Adobe Photoshop',
        'Adobe After Effects',
        'Adobe Lightroom',
        'Adobe Premiere',
        'Resolume Arena',
        'Davinci Resolve',
      ],
    },
    {
      id: 'code-scripting',
      category: { en: 'Code & Scripting', es: 'Código y Scripting' },
      items: [
        'VS Code (C#, C++)',
        'Python, Rust, Swift, Java',
        'TouchDesigner',
        'Blueprint',
        'Arduino IDE',
      ],
    },
    {
      id: 'ai',
      category: { en: 'AI', es: 'IA' },
      items: [
        'Antigravity IDE / CLI',
        'Openclaw / Nemoclaw',
        'Nano Banana, Omni, Midjourney',
        'Claude Code, Codex, Hermes',
        'Ollama',
      ],
    },
  ],
  awards: [
    {
      id: 'lithium-2026',
      title: {
        en: 'Most Innovative Software Project Award | 2026',
        es: 'Premio al Proyecto de Software Más Innovador | 2026',
      },
      year: '2026',
      project: 'LITHIUM',
      venue: 'NextGen Software Awards - New Jersey - EE.UU.',
    },
    {
      id: 'symbiosis-2026',
      title: {
        en: 'Best Project & Installation Award | 2026',
        es: 'Premio a Mejor Proyecto e Instalación | 2026',
      },
      year: '2026',
      project: 'Symbiosis',
      venue: 'LUMYNEX Festival Medellín',
    },
    {
      id: 'palenque-2026',
      title: {
        en: 'Exhibition Recognition And Best Technical Implementation | 2026',
        es: 'Reconocimiento de Exhibición y Mejor Implementación Técnica | 2026',
      },
      year: '2026',
      project: 'Crónicas de Palenque',
      venue: 'Digital Interaction Final Showcase - Casa de la Cultura de Envigado',
    },
    {
      id: 'sogno2-2025',
      title: {
        en: 'Best Interactivity Award | 2025',
        es: 'Premio a la Mejor Interactividad | 2025',
      },
      year: '2025',
      project: 'Sogno 2',
      venue:
        'Audiovisual and Immersive Experiences Festival - Bellas Artes University',
    },
    {
      id: 'sogno-2025',
      title: {
        en: 'Best Project & Main Exhibitor | 2025',
        es: 'Mejor Proyecto y Expositor Principal | 2025',
      },
      year: '2025',
      project: 'Sogno',
      venue: 'Digital Interaction Final Showcase - Casa de la Cultura de Envigado',
    },
  ],
}
