#!/usr/bin/env node

/**
 * Structural difficulty audit for the non-foundational AWS banks.
 *
 * This does not claim to reproduce confidential live exam questions. It checks
 * observable characteristics from the public AWS exam guides: production-role
 * scenarios, plausible same-domain choices, and the response formats that each
 * current guide lists. Content correctness remains covered by the question-bank
 * validator and manual guide review.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const DATA = join(ROOT, 'src', 'data')

const SPECS = {
  'saa-c03': { level: 'associate', minAverageWords: 38, allowed: ['single', 'multi'], minComplexPercent: 5 },
  'soa-c03': { level: 'associate', minAverageWords: 42, allowed: ['single', 'multi'], minComplexPercent: 10 },
  'dea-c01': { level: 'associate', minAverageWords: 42, allowed: ['single', 'multi'], minComplexPercent: 10 },
  'dva-c02': { level: 'associate', minAverageWords: 42, allowed: ['single', 'multi'], minComplexPercent: 10 },
  'mla-c01': { level: 'associate', minAverageWords: 42, allowed: ['single', 'multi', 'matching'], minComplexPercent: 15 },
  'dop-c02': { level: 'professional', minAverageWords: 48, allowed: ['single', 'multi'], minComplexPercent: 10 },
  'aip-c01': { level: 'professional', minAverageWords: 48, allowed: ['single', 'multi'], minComplexPercent: 10 },
  'sap-c02': { level: 'professional', minAverageWords: 48, allowed: ['single', 'multi'], minComplexPercent: 10 },
  'ans-c01': { level: 'specialty', minAverageWords: 52, allowed: ['multi', 'matching'], minComplexPercent: 100 },
  'scs-c03': { level: 'specialty', minAverageWords: 46, allowed: ['single', 'multi', 'matching'], minComplexPercent: 15 },
}

function loadQuestions(cert) {
  return readdirSync(join(DATA, cert))
    .filter(file => /^domain\d+\.json$/.test(file))
    .sort()
    .flatMap(file => JSON.parse(readFileSync(join(DATA, cert, file), 'utf8')))
}

function wordCount(value) {
  return value.trim().split(/\s+/).filter(Boolean).length
}

function percent(count, total) {
  return Math.round((count / total) * 100)
}

const failures = []
const rows = []

for (const [cert, spec] of Object.entries(SPECS)) {
  const questions = loadQuestions(cert)
  const typeCounts = { single: 0, multi: 0, ordering: 0, matching: 0 }
  let totalWords = 0
  let short = 0
  let constrained = 0

  for (const question of questions) {
    const type = question.type ?? (question.isMultiAnswer ? 'multi' : 'single')
    typeCounts[type] += 1
    const words = wordCount(question.question)
    totalWords += words
    if (words < 32) short += 1
    if (/(must|while|without|least|most|availability|audit|operational|cost|latency|recovery|scale)/i.test(question.question)) {
      constrained += 1
    }
    if (!spec.allowed.includes(type)) failures.push(`${cert}/${question.id}: response type ${type} is outside the current practice-format target`)
  }

  const averageWords = Number((totalWords / questions.length).toFixed(1))
  const complex = questions.length - typeCounts.single
  const complexPercent = percent(complex, questions.length)
  const shortPercent = percent(short, questions.length)
  const constraintPercent = percent(constrained, questions.length)

  if (averageWords < spec.minAverageWords) failures.push(`${cert}: average stem length ${averageWords} is below ${spec.minAverageWords}`)
  if (complexPercent < spec.minComplexPercent) failures.push(`${cert}: complex response coverage ${complexPercent}% is below ${spec.minComplexPercent}%`)
  if (shortPercent > 5) failures.push(`${cert}: ${shortPercent}% of stems have fewer than 32 words`)
  if (constraintPercent < 80) failures.push(`${cert}: only ${constraintPercent}% of stems contain an explicit decision constraint`)

  rows.push({
    Exam: cert.toUpperCase(),
    Level: spec.level,
    Questions: questions.length,
    'Avg words': averageWords,
    'Short %': shortPercent,
    'Constraint %': constraintPercent,
    Single: typeCounts.single,
    Multi: typeCounts.multi,
    Matching: typeCounts.matching,
  })
}

console.table(rows)

if (failures.length > 0) {
  console.error('\nDifficulty audit failed:')
  failures.forEach(failure => console.error(`  - ${failure}`))
  process.exit(1)
}

console.log('\nDifficulty audit passed for all 10 non-foundational banks.')
