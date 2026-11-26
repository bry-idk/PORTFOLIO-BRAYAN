export type Lang = 'en' | 'es'

export interface LocalizedText {
  en: string
  es: string
}

export type ProjectId =
  | 'cronicas-de-palenque'
  | 'kane-no-hibiki'
  | 'sogno'
  | 'notas-y-colores'
  | 'the-amazing-digital-circus-2'

export type SoftwareId =
  | 'unity'
  | 'blender'
  | 'touchdesigner'
  | 'vscode'
  | 'aftereffects'
  | 'fmod'
  | 'photoshop'
  | 'audition'
  | 'substance'
  | 'resolume'
  | 'arduino'
  | 'procreate'
  | 'polycam'
  | 'maya'
  | 'premiere'

export interface MediaAsset {
  id: string
  src: string
  alt: LocalizedText
  caption: LocalizedText
  pdfPageRef?: string
  group: 'pdf-primary' | 'pdf-grid' | 'folder-extra'
  aspect?: 'landscape' | 'portrait' | 'square' | 'wide'
}

export interface VideoAsset {
  id: string
  src: string
  poster?: string
  title: LocalizedText
  caption: LocalizedText
  durationLabel: string
}

export interface HighlightBlock {
  title: LocalizedText
  bullets: LocalizedText[]
}

export interface ProjectChapterBlock {
  id: string
  title: LocalizedText
  body?: LocalizedText[]
  highlights?: HighlightBlock[]
  mediaIds?: string[]
  videoId?: string
}

export interface ProjectTheme {
  accentHex: string
  secondaryHex: string
  tertiaryHex: string
  glowRgba: string
  shaderPaletteA: [number, number, number]
  shaderPaletteB: [number, number, number]
  shaderPaletteC: [number, number, number]
  labMode: 'palenque' | 'kane' | 'sogno' | 'notas' | 'tadc2'
}

export interface ProjectData {
  order: number
  indexLabel: string
  id: ProjectId
  slug: string
  title: string
  nativeTitle?: string
  studioOrContext?: LocalizedText
  pdfPages: string
  projectType: LocalizedText
  technologies: LocalizedText
  platforms?: LocalizedText
  software: SoftwareId[]
  awardRefs?: string[]
  coverImage: string
  coverAlt: LocalizedText
  titleLogos?: {
    primary: string
    secondary?: string
  }
  characterCutouts?: string[]
  overviewParagraphs: LocalizedText[]
  closingQuote?: LocalizedText
  chapters: ProjectChapterBlock[]
  videos: VideoAsset[]
  gallery: MediaAsset[]
  theme: ProjectTheme
  interactiveLab: {
    title: LocalizedText
    subtitle: LocalizedText
    instructions: LocalizedText
  }
}

export interface CareerEntry {
  year: string
  role: LocalizedText
  organization: string
}

export interface EducationEntry {
  year: string
  degree: LocalizedText
  institution: string
}

export interface SkillGroup {
  id: string
  category: LocalizedText
  items: string[]
}

export interface AwardEntry {
  id: string
  title: LocalizedText
  year: string
  project: string
  venue: string
}

export interface ProfileData {
  fullName: string
  brandTitle: string
  year: string
  greeting: LocalizedText
  headlineTag: LocalizedText
  portraitUrl: string
  bioStatement: LocalizedText
  contact: {
    email: string
    location: string
    instagramHandle: string
    instagramUrl: string
    linkedinLabel: string
    linkedinUrl: string
    behanceLabel: string
    behanceUrl: string
  }
  careerOverview: CareerEntry[]
  education: EducationEntry[]
  languages: LocalizedText
  softwareSkills: SkillGroup[]
  awards: AwardEntry[]
}
