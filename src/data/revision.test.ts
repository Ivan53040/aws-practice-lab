import { describe, expect, it } from 'vitest'
import { CERTIFICATIONS, CERTIFICATION_LIST } from './certifications'
import { getRevisionGuide, REVISION_GUIDES } from './revision'

describe('revision guides', () => {
  it('uses certification codes from the registry', () => {
    for (const certCode of Object.keys(REVISION_GUIDES)) {
      expect(CERTIFICATIONS[certCode]).toBeDefined()
    }
  })

  it('keeps every active AWS certification selectable even when its guide is planned', () => {
    const activeCodes = CERTIFICATION_LIST
      .filter(cert => cert.status === 'active' && cert.provider === 'aws')
      .map(cert => cert.code)

    expect(activeCodes).toHaveLength(12)
    expect(activeCodes).toContain('clf-c02')
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

  it('matches CLF-C02 domain titles and weights from the certification registry', () => {
    const guide = getRevisionGuide('clf-c02')
    const cert = CERTIFICATIONS['clf-c02']

    expect(guide?.domains).toHaveLength(cert.domains.length)
    for (const domain of guide?.domains ?? []) {
      const registered = cert.domains.find(item => item.id === domain.id)
      expect(registered?.name).toBe(domain.title)
      expect(registered?.weight).toBe(domain.weight)
    }
  })

  it('gives every CLF-C02 topic useful study content', () => {
    const topics = getRevisionGuide('clf-c02')?.domains.flatMap(domain => domain.topics) ?? []

    for (const topic of topics) {
      expect(topic.summary.length).toBeGreaterThan(40)
      expect(topic.points.length).toBeGreaterThanOrEqual(5)
      expect(topic.keyTerms.length).toBeGreaterThanOrEqual(4)
      expect(topic.examTip.length).toBeGreaterThan(30)
    }
  })

  it('returns null for a certification whose revision guide is not written yet', () => {
    expect(getRevisionGuide('aif-c01')).toBeNull()
  })
})

