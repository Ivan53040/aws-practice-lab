import { describe, expect, it } from 'vitest'
import { EXAM_KEYWORD_HINTS, STUDY_COMPARISONS } from './study-tools'

describe('revision study tools', () => {
  it('provides bilingual service comparison tables', () => {
    expect(STUDY_COMPARISONS.length).toBeGreaterThanOrEqual(8)
    for (const comparison of STUDY_COMPARISONS) {
      expect(comparison.items.length).toBeGreaterThanOrEqual(2)
      expect(comparison.translations.zh.title.length).toBeGreaterThan(4)
      for (const item of comparison.items) {
        expect(item.purpose.length).toBeGreaterThan(20)
        expect(item.remember.length).toBeGreaterThan(15)
        expect(item.translations.zh.purpose.length).toBeGreaterThan(8)
        expect(item.translations.zh.remember.length).toBeGreaterThan(6)
      }
    }
  })

  it('provides bilingual exam keyword hints', () => {
    expect(EXAM_KEYWORD_HINTS.length).toBeGreaterThanOrEqual(20)
    expect(new Set(EXAM_KEYWORD_HINTS.map(item => item.id)).size).toBe(EXAM_KEYWORD_HINTS.length)
    for (const hint of EXAM_KEYWORD_HINTS) {
      expect(hint.thinkOf.length).toBeGreaterThan(3)
      expect(hint.reason.length).toBeGreaterThan(20)
      expect(hint.translations.zh.thinkOf.length).toBeGreaterThan(2)
      expect(hint.translations.zh.reason.length).toBeGreaterThan(8)
    }
  })
})
