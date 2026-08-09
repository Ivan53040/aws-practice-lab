#!/usr/bin/env node

/**
 * Audit the generated Professional and Specialty banks for two authoring risks:
 * shallow scenario inflation and semantic repetition. This is a deterministic
 * corpus check, not a claim that practice items reproduce confidential exams.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const DATA = join(ROOT, 'src', 'data')
const EXAMS = ['dop-c02', 'aip-c01', 'sap-c02', 'ans-c01', 'scs-c03']
const INTEGRATED_MIN = 20
const INTEGRATED_MAX = 30
const MAX_SEMANTIC_CLUSTER = 3
const MIN_UNIQUE_SEMANTIC_PERCENT = 55
const MAX_CONCEPT_CONCENTRATION = 45

const constraintPatterns = {
  audit: /audit|evidence|trace/i,
  availability: /availability|available|failure|failover|outage|resilien|recovery/i,
  cost: /cost|spend|price|overprovision/i,
  governance: /govern|delegat|organization|account/i,
  latency: /latency|performance|throughput/i,
  operations: /operational|managed|manual|automation|repeatable/i,
  scale: /scale|several|multiple|across/i,
  security: /security|least privilege|encrypt|blast radius|control/i,
}

function loadDomains(cert) {
  return readdirSync(join(DATA, cert))
    .filter(file => /^domain\d+\.json$/.test(file))
    .sort()
    .map(file => ({
      domain: Number(file.match(/domain(\d+)/)?.[1]),
      questions: JSON.parse(readFileSync(join(DATA, cert, file), 'utf8')),
    }))
}

function typeOf(question) {
  return question.type ?? (question.isMultiAnswer ? 'multi' : 'single')
}

function correctConcepts(question) {
  if (typeOf(question) === 'matching') {
    return Object.values(question.correctMatches ?? {})
      .map(key => question.targets?.[key])
      .filter(Boolean)
  }
  const answerKeys = Array.isArray(question.answer) ? question.answer : [question.answer]
  return answerKeys.map(key => question.options?.[key]).filter(Boolean)
}

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function percent(count, total) {
  return Number(((count / total) * 100).toFixed(1))
}

function constraints(question) {
  return Object.entries(constraintPatterns)
    .filter(([, pattern]) => pattern.test(question.question))
    .map(([name]) => name)
    .sort()
}

function semanticFingerprint(question) {
  const concepts = correctConcepts(question).map(normalize).sort()
  return [question.taskStatement ?? '', typeOf(question), concepts.join('+'), constraints(question).join('+')].join('|')
}

function exactContentFingerprint(question) {
  const visibleContent = [
    question.question,
    ...Object.values(question.options ?? {}),
    ...Object.values(question.targets ?? {}),
  ]
  return normalize(visibleContent.join(' '))
}

function isIntegrated(question) {
  return /integrated end-to-end/i.test(question.question)
}

function connectedActionCount(question) {
  const concepts = correctConcepts(question)
  if (typeOf(question) !== 'single') return concepts.length
  return /integrate it with|combine .+ with/i.test(concepts[0] ?? '') ? 2 : concepts.length
}

function duplicateGroups(values, keyFor) {
  const groups = new Map()
  for (const value of values) {
    const key = keyFor(value)
    const group = groups.get(key) ?? []
    group.push(value)
    groups.set(key, group)
  }
  return [...groups.entries()].filter(([, group]) => group.length > 1)
}

const failures = []
const rows = []

for (const cert of EXAMS) {
  const domains = loadDomains(cert)
  const questions = domains.flatMap(entry => entry.questions)
  const integrated = questions.filter(isIntegrated)
  const integratedPercent = percent(integrated.length, questions.length)
  const semanticGroups = duplicateGroups(questions, semanticFingerprint)
  const largestSemanticCluster = Math.max(1, ...semanticGroups.map(([, group]) => group.length))
  const uniqueSemanticPercent = percent(new Set(questions.map(semanticFingerprint)).size, questions.length)
  const exactStemDuplicates = duplicateGroups(questions, exactContentFingerprint)
  const conceptCounts = new Map()

  for (const question of questions) {
    for (const concept of new Set(correctConcepts(question).map(normalize))) {
      conceptCounts.set(concept, (conceptCounts.get(concept) ?? 0) + 1)
    }
  }
  const conceptConcentration = percent(Math.max(0, ...conceptCounts.values()), questions.length)

  if (integratedPercent < INTEGRATED_MIN || integratedPercent > INTEGRATED_MAX) {
    failures.push(`${cert}: integrated scenario coverage ${integratedPercent}% is outside ${INTEGRATED_MIN}% to ${INTEGRATED_MAX}%`)
  }
  for (const { domain, questions: domainQuestions } of domains) {
    const domainIntegrated = domainQuestions.filter(isIntegrated)
    const domainPercent = percent(domainIntegrated.length, domainQuestions.length)
    if (domainPercent < INTEGRATED_MIN || domainPercent > INTEGRATED_MAX) {
      failures.push(`${cert}/domain${domain}: integrated scenario coverage ${domainPercent}% is outside ${INTEGRATED_MIN}% to ${INTEGRATED_MAX}%`)
    }
  }
  for (const question of integrated) {
    const requiredTradeoffs = ['cost', 'security', 'availability']
    const present = constraints(question)
    if (connectedActionCount(question) < 2) failures.push(`${cert}/${question.id}: integrated scenario has fewer than two connected actions`)
    if (!requiredTradeoffs.every(value => present.includes(value))) {
      failures.push(`${cert}/${question.id}: integrated scenario does not test cost, security, and availability together`)
    }
  }
  if (largestSemanticCluster > MAX_SEMANTIC_CLUSTER) {
    const largest = semanticGroups.sort((left, right) => right[1].length - left[1].length)[0]
    failures.push(`${cert}: semantic cluster has ${largestSemanticCluster} items (${largest?.[1].map(question => question.id).join(', ')})`)
  }
  if (uniqueSemanticPercent < MIN_UNIQUE_SEMANTIC_PERCENT) {
    failures.push(`${cert}: only ${uniqueSemanticPercent}% of questions have a unique semantic fingerprint`)
  }
  if (conceptConcentration > MAX_CONCEPT_CONCENTRATION) {
    failures.push(`${cert}: one answer concept appears in ${conceptConcentration}% of the bank`)
  }
  if (exactStemDuplicates.length > 0) {
    failures.push(`${cert}: ${exactStemDuplicates.length} exact normalized stem duplicate group(s) found`)
  }

  rows.push({
    Exam: cert.toUpperCase(),
    Questions: questions.length,
    'Integrated %': integratedPercent,
    'Unique semantic %': uniqueSemanticPercent,
    'Largest cluster': largestSemanticCluster,
    'Top concept %': conceptConcentration,
    'Exact duplicate groups': exactStemDuplicates.length,
  })
}

console.table(rows)

if (failures.length > 0) {
  console.error('\nQuestion quality audit failed:')
  failures.forEach(failure => console.error(`  - ${failure}`))
  process.exit(1)
}

console.log('\nQuestion quality audit passed for all Professional and Specialty banks.')
