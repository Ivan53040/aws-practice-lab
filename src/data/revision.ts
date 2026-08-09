import generatedGuides from './revision-guides.generated.json'

export interface RevisionTopicTranslation {
  title: string
  summary: string
  points: string[]
  keyTerms: string[]
  examTip: string
}

export interface RevisionTopic {
  id: string
  title: string
  summary: string
  points: string[]
  keyTerms: string[]
  examTip: string
  translations: {
    zh: RevisionTopicTranslation
  }
}

export interface RevisionDomain {
  id: number
  title: string
  weight: number
  topics: RevisionTopic[]
  translations: {
    zh: {
      title: string
    }
  }
}

export interface RevisionGuide {
  certCode: string
  name: string
  verified: string
  sourceUrl: string
  domains: RevisionDomain[]
  commonMistakes: RevisionTopic
  translations: {
    zh: {
      name: string
    }
  }
}

export const REVISION_GUIDES = generatedGuides as Record<string, RevisionGuide>

export function getRevisionGuide(certCode: string): RevisionGuide | null {
  return REVISION_GUIDES[certCode] ?? null
}
