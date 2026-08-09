import { describe, expect, it } from 'vitest'
import { CERTIFICATIONS, CERTIFICATION_LIST } from './certifications'
import { getRevisionGuide, REVISION_GUIDES } from './revision'

describe('revision guides', () => {
  it('uses certification codes from the registry', () => {
    for (const certCode of Object.keys(REVISION_GUIDES)) {
      expect(CERTIFICATIONS[certCode]).toBeDefined()
    }
  })

  it('provides a revision guide for every active AWS certification', () => {
    const activeCodes = CERTIFICATION_LIST
      .filter(cert => cert.status === 'active' && cert.provider === 'aws')
      .map(cert => cert.code)

    expect(activeCodes).toHaveLength(12)
    expect(Object.keys(REVISION_GUIDES).sort()).toEqual([...activeCodes].sort())
    for (const certCode of activeCodes) expect(getRevisionGuide(certCode)).not.toBeNull()
  })

  it('covers every CLF-C02 task statement exactly once', () => {
    const guide = getRevisionGuide('clf-c02')
    const expectedIds = CERTIFICATIONS['clf-c02'].taskStatements?.map(task => task.id) ?? []
    const actualTopics = guide?.domains.flatMap(domain => domain.topics) ?? []
    const actualIds = actualTopics.map(topic => topic.id)

    expect(actualIds).toHaveLength(expectedIds.length)
    expect(new Set(actualIds).size).toBe(actualIds.length)
    expect([...actualIds].sort()).toEqual([...expectedIds].sort())
  })

  it('matches every domain title and weight from the certification registry', () => {
    for (const [certCode, guide] of Object.entries(REVISION_GUIDES)) {
      const cert = CERTIFICATIONS[certCode]
      expect(guide.domains).toHaveLength(cert.domains.length)
      for (const domain of guide.domains) {
        const registered = cert.domains.find(item => item.id === domain.id)
        expect(registered?.name).toBe(domain.title)
        expect(registered?.weight).toBe(domain.weight)
      }
    }
  })

  it('gives every topic useful bilingual study content', () => {
    for (const guide of Object.values(REVISION_GUIDES)) {
      const topics = guide.domains.flatMap(domain => domain.topics)
      expect(topics.length).toBeGreaterThan(0)
      for (const domain of guide.domains) expect(domain.translations.zh.title.length).toBeGreaterThanOrEqual(2)
      for (const topic of topics) {
        expect(topic.summary.length).toBeGreaterThan(40)
        expect(topic.points.length).toBeGreaterThanOrEqual(5)
        expect(topic.keyTerms.length).toBeGreaterThanOrEqual(4)
        expect(topic.examTip.length).toBeGreaterThan(30)
        expect(topic.translations.zh.title.length).toBeGreaterThan(2)
        expect(topic.translations.zh.summary.length).toBeGreaterThan(15)
        expect(topic.translations.zh.points).toHaveLength(topic.points.length)
        expect(topic.translations.zh.keyTerms).toHaveLength(topic.keyTerms.length)
        expect(topic.translations.zh.examTip.length).toBeGreaterThan(10)
      }
    }
  })

  it('adds bilingual common mistakes to every revision map', () => {
    for (const guide of Object.values(REVISION_GUIDES)) {
      expect(guide.commonMistakes.id).toBe('common-mistakes')
      expect(guide.commonMistakes.points.length).toBeGreaterThanOrEqual(5)
      expect(guide.commonMistakes.translations.zh.title).toBe('常見錯誤')
      expect(guide.commonMistakes.translations.zh.points).toHaveLength(guide.commonMistakes.points.length)
    }
  })
})
