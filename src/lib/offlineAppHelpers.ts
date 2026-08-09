import { GLOSSARY_TERMS } from '../data/glossary'
import type { GlossaryTerm } from '../data/glossary'

type AppMode = 'mock' | 'revision' | 'glossary'
type ExamScreen = 'home' | 'loading' | 'exam' | 'results'

export function screenAfterModeChange(nextMode: AppMode, currentScreen: ExamScreen): ExamScreen {
  return nextMode === 'mock' ? 'home' : currentScreen
}

const INLINE_GLOSSARY_ALIASES = GLOSSARY_TERMS.flatMap(term => {
  const acronym = term.name.match(/\(([A-Z0-9]+)\)/)?.[1]
  const translatedPrefix = term.translations.zh.name.match(/^[\p{ASCII}]+/u)?.[0].trim()
  const shortId = term.id.length <= 5 ? term.id.replaceAll('-', ' ') : ''
  return [...new Set([
    term.name,
    term.name.replace(/\s*\([^)]*\)/g, ''),
    term.translations.zh.name,
    translatedPrefix,
    acronym,
    shortId,
  ].filter((alias): alias is string => {
    if (!alias || alias.length < 2) return false
    const normalized = alias.trim().toLocaleLowerCase()
    if (['aws', 'amazon', 'amazon web services', 'cloud', 'service'].includes(normalized)) return false
    return !(/^[a-z]+$/i.test(alias) && alias.length < 3)
  }))]
    .map(alias => ({ alias, term }))
}).sort((a, b) => b.alias.length - a.alias.length)

function isWordCharacter(value: string | undefined): boolean {
  return Boolean(value && /[a-z0-9]/i.test(value))
}

export function splitInlineGlossaryText(text: string): { text: string; term?: GlossaryTerm }[] {
  const parts: { text: string; term?: GlossaryTerm }[] = []
  const lowerText = text.toLocaleLowerCase()
  let cursor = 0

  while (cursor < text.length) {
    let match: { index: number; alias: string; term: GlossaryTerm } | null = null
    for (const entry of INLINE_GLOSSARY_ALIASES) {
      const lowerAlias = entry.alias.toLocaleLowerCase()
      let index = lowerText.indexOf(lowerAlias, cursor)
      while (index >= 0) {
        const before = text[index - 1]
        const after = text[index + entry.alias.length]
        const startsWithWord = isWordCharacter(entry.alias[0])
        const endsWithWord = isWordCharacter(entry.alias[entry.alias.length - 1])
        if ((!startsWithWord || !isWordCharacter(before)) && (!endsWithWord || !isWordCharacter(after))) break
        index = lowerText.indexOf(lowerAlias, index + 1)
      }
      if (index >= 0 && (!match || index < match.index || (index === match.index && entry.alias.length > match.alias.length))) {
        match = { index, alias: text.slice(index, index + entry.alias.length), term: entry.term }
      }
    }

    if (!match) {
      parts.push({ text: text.slice(cursor) })
      break
    }
    if (match.index > cursor) parts.push({ text: text.slice(cursor, match.index) })
    parts.push({ text: match.alias, term: match.term })
    cursor = match.index + match.alias.length
  }

  return parts
}
