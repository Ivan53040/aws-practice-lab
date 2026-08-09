import { describe, expect, it } from 'vitest'
import { screenAfterModeChange, splitInlineGlossaryText } from '../lib/offlineAppHelpers'

describe('inline revision glossary links', () => {
  it('finds AWS service names inside a normal sentence and preserves the text', () => {
    const sentence = 'AWS WAF filters web requests using rules. AWS Shield provides managed protection against distributed denial of service attacks.'
    const parts = splitInlineGlossaryText(sentence)

    expect(parts.map(part => part.text).join('')).toBe(sentence)
    expect(parts.filter(part => part.term).map(part => part.term?.name)).toEqual(['AWS WAF', 'AWS Shield'])
  })

  it('does not link an alias embedded inside a longer word', () => {
    const parts = splitInlineGlossaryText('AWS WAFish is not the AWS WAF service name.')

    expect(parts.filter(part => part.term).map(part => part.text)).toEqual(['AWS WAF'])
  })
})

describe('top-left home navigation', () => {
  it('returns every exam screen to the Mock Exam home when mock mode is selected', () => {
    expect(screenAfterModeChange('mock', 'exam')).toBe('home')
    expect(screenAfterModeChange('mock', 'results')).toBe('home')
  })

  it('keeps the current screen when opening a study mode', () => {
    expect(screenAfterModeChange('revision', 'results')).toBe('results')
  })
})
