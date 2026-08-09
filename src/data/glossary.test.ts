import { describe, expect, it } from 'vitest'
import { GLOSSARY_CATEGORIES, GLOSSARY_TERMS, getGlossaryTerms } from './glossary'

describe('AWS glossary', () => {
  it('provides useful bilingual categories', () => {
    expect(GLOSSARY_CATEGORIES).toHaveLength(9)
    for (const category of GLOSSARY_CATEGORIES) {
      expect(category.name.length).toBeGreaterThan(2)
      expect(category.description.length).toBeGreaterThan(20)
      expect(category.translations.zh.name.length).toBeGreaterThan(1)
      expect(category.translations.zh.description.length).toBeGreaterThan(5)
      expect(getGlossaryTerms(category.id).length).toBeGreaterThanOrEqual(5)
    }
  })

  it('gives every term a unique id and bilingual explanation', () => {
    expect(GLOSSARY_TERMS.length).toBeGreaterThanOrEqual(70)
    expect(new Set(GLOSSARY_TERMS.map(item => item.id)).size).toBe(GLOSSARY_TERMS.length)
    for (const item of GLOSSARY_TERMS) {
      expect(GLOSSARY_CATEGORIES.some(category => category.id === item.categoryId)).toBe(true)
      expect(item.description.length).toBeGreaterThan(25)
      expect(item.translations.zh.name.length).toBeGreaterThan(1)
      expect(item.translations.zh.description.length).toBeGreaterThan(8)
    }
  })
})
