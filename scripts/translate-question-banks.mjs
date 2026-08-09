#!/usr/bin/env node

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { translateStrings } from './translation-utils.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DATA_ROOT = join(ROOT, 'src', 'data')
const selectedCert = process.argv.find(argument => argument.startsWith('--cert='))?.split('=')[1]
const selectedDomain = process.argv.find(argument => argument.startsWith('--domain='))?.split('=')[1]
const force = process.argv.includes('--force')

function hasCompleteTranslation(question) {
  const zh = question.translations?.zh
  if (!zh?.question || !zh.explanation) return false
  const optionKeys = Object.keys(question.options).filter(key => question.options[key])
  if (!optionKeys.every(key => zh.options?.[key])) return false
  const targetKeys = Object.keys(question.targets ?? {}).filter(key => question.targets[key])
  return targetKeys.every(key => zh.targets?.[key])
}

function collectFields(question) {
  const fields = [{ kind: 'question', value: question.question }]
  for (const [key, value] of Object.entries(question.options)) {
    if (value) fields.push({ kind: 'option', key, value })
  }
  question.explanation.split('\n').forEach((value, index) => {
    fields.push({ kind: 'explanation', key: String(index), value })
  })
  for (const [key, value] of Object.entries(question.targets ?? {})) {
    if (value) fields.push({ kind: 'target', key, value })
  }
  return fields
}

function applyFields(question, fields, translations) {
  const zh = { question: '', options: {}, explanation: '', targets: {} }
  const explanationParts = []

  fields.forEach((field, index) => {
    const translated = translations[index]
    if (field.kind === 'question') zh.question = translated
    if (field.kind === 'option') zh.options[field.key] = translated
    if (field.kind === 'explanation') explanationParts[Number(field.key)] = translated
    if (field.kind === 'target') zh.targets[field.key] = translated
  })
  zh.explanation = explanationParts.join('\n')
  if (Object.keys(zh.targets).length === 0) delete zh.targets
  question.translations = { zh }
}

const certDirectories = readdirSync(DATA_ROOT, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .filter(name => !selectedCert || name === selectedCert)
  .filter(name => readdirSync(join(DATA_ROOT, name)).some(file => /^domain\d+\.json$/.test(file)))
  .sort()

for (const certCode of certDirectories) {
  const domainFiles = readdirSync(join(DATA_ROOT, certCode))
    .filter(file => /^domain\d+\.json$/.test(file))
    .filter(file => !selectedDomain || file === `domain${selectedDomain}.json`)
    .sort()
  for (const file of domainFiles) {
    const path = join(DATA_ROOT, certCode, file)
    const questions = JSON.parse(readFileSync(path, 'utf8'))
    const pending = questions.filter(question => force || !hasCompleteTranslation(question))
    if (pending.length === 0) {
      console.log(`${certCode}/${file}: already bilingual`)
      continue
    }

    const fieldGroups = pending.map(collectFields)
    const source = fieldGroups.flat().map(field => field.value)
    console.log(`${certCode}/${file}: translating ${pending.length} questions, ${source.length} text fields`)
    const translated = await translateStrings(source)
    let offset = 0
    pending.forEach((question, index) => {
      const fields = fieldGroups[index]
      applyFields(question, fields, translated.slice(offset, offset + fields.length))
      offset += fields.length
    })
    writeFileSync(path, `${JSON.stringify(questions, null, 2)}\n`, 'utf8')
    console.log(`${certCode}/${file}: saved`)
  }
}

console.log('Question bank translations complete.')
