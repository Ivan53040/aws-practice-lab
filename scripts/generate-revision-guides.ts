#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CERTIFICATION_LIST } from '../src/data/certifications'
import { getRevisionGuide } from '../src/data/revision'
import { translateStrings } from './translation-utils.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUTPUT = join(ROOT, 'src', 'data', 'revision-guides.generated.json')
const VERIFIED = '2026-08-09'

interface SourceQuestion {
  answer: string | string[]
  explanation: string
  options: Record<string, string>
  services?: string[]
}

interface EnglishTopic {
  id: string
  title: string
  summary: string
  points: string[]
  keyTerms: string[]
  examTip: string
  translations?: {
    zh: TopicTranslation
  }
}

interface TopicTranslation {
  title: string
  summary: string
  points: string[]
  keyTerms: string[]
  examTip: string
}

interface GeneratedDomain {
  id: number
  title: string
  weight: number
  topics: EnglishTopic[]
  translations?: { zh: { title: string } }
}

interface GeneratedGuide {
  certCode: string
  name: string
  verified: string
  sourceUrl: string
  domains: GeneratedDomain[]
  commonMistakes: EnglishTopic
  translations?: { zh: { name: string } }
}

function withoutFinalPeriod(value: string): string {
  return value.trim().replace(/\.$/, '')
}

function guideSlug(url: string): string {
  const parts = new URL(url).pathname.split('/').filter(Boolean)
  return parts.at(-2) ?? ''
}

async function officialTasks(url: string, domainId: number): Promise<{ id: string; title: string }[]> {
  const slug = guideSlug(url)
  const markdownUrl = `https://docs.aws.amazon.com/aws-certification/latest/${slug}/${slug}-domain${domainId}.md`
  const response = await fetch(markdownUrl)
  if (!response.ok) throw new Error(`${markdownUrl}: HTTP ${response.status}`)
  const markdown = await response.text()
  const tasks: { id: string; title: string }[] = []

  for (const line of markdown.split('\n')) {
    const statement = line.match(/^## Task(?: Statement)? (\d+\.\d+):\s*(.+)$/)
    if (statement) {
      tasks.push({ id: statement[1], title: withoutFinalPeriod(statement[2]) })
      continue
    }
    const numbered = line.match(/^## Task (\d+):\s*(.+)$/)
    if (numbered) {
      tasks.push({ id: `${domainId}.${numbered[1]}`, title: withoutFinalPeriod(numbered[2]) })
    }
  }

  if (tasks.length === 0) throw new Error(`${markdownUrl}: no task headings found`)
  return tasks
}

function domainQuestions(certCode: string, domainId: number): SourceQuestion[] {
  const path = join(ROOT, 'src', 'data', certCode, `domain${domainId}.json`)
  return JSON.parse(readFileSync(path, 'utf8')) as SourceQuestion[]
}

function correctOptionTexts(question: SourceQuestion): string[] {
  const keys = Array.isArray(question.answer) ? question.answer : [question.answer]
  return keys.map(key => question.options[key]).filter(Boolean)
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)]
}

function studyEvidence(questions: SourceQuestion[]) {
  const points = unique(questions
    .map(question => question.explanation.split('\n')[0]?.trim())
    .filter((value): value is string => Boolean(value) && value.length >= 30))

  const services = unique(questions.flatMap(question => question.services ?? []))
  const correctOptions = unique(questions.flatMap(correctOptionTexts))
    .filter(value => value.length <= 70)

  return {
    points: points.length > 0 ? points : ['Connect each requirement to the AWS service or design pattern that satisfies it directly.'],
    keyTerms: unique([...services, ...correctOptions]).slice(0, 12),
  }
}

function rotate<T>(values: T[], offset: number): T[] {
  if (values.length === 0) return []
  const start = offset % values.length
  return [...values.slice(start), ...values.slice(0, start)]
}

function buildTopic(
  task: { id: string; title: string },
  domainTitle: string,
  evidence: ReturnType<typeof studyEvidence>,
  topicIndex: number,
): EnglishTopic {
  const evidencePoints = rotate(evidence.points, topicIndex * 2).slice(0, 4)
  const points = [
    `Define the requirement behind this task: ${task.title}. Identify the business goal, technical constraint, and success measure before selecting a service.`,
    ...evidencePoints,
  ]
  while (points.length < 5) {
    points.push(`Compare managed and self-managed approaches in ${domainTitle}, including security, availability, performance, operational effort, and cost.`)
  }

  const keyTerms = rotate(evidence.keyTerms, topicIndex * 2).slice(0, 6)
  while (keyTerms.length < 4) keyTerms.push(`Task ${task.id}`, domainTitle, 'AWS Well-Architected Framework', 'Shared responsibility')

  return {
    id: task.id,
    title: task.title,
    summary: `This section focuses on ${task.title.toLowerCase()} within ${domainTitle}. Learn to recognize the requirement, select an appropriate AWS approach, and explain the important trade-offs.`,
    points: unique(points).slice(0, 6),
    keyTerms: unique(keyTerms).slice(0, 6),
    examTip: `For Task ${task.id}, underline the required outcome and every constraint. Eliminate choices that solve a different problem, then compare the remaining choices for operational effort, resilience, security, performance, and cost.`,
  }
}

function buildCommonMistakes(certName: string, domains: { title: string; topics: EnglishTopic[] }[]): EnglishTopic {
  const examples = domains.flatMap(domain => domain.topics.flatMap(topic => topic.keyTerms)).slice(0, 8)
  const servicePair = examples.length >= 2 ? `${examples[0]} and ${examples[1]}` : 'similar AWS services'
  return {
    id: 'common-mistakes',
    title: 'Common mistakes',
    summary: `Use this checklist before submitting a ${certName} practice exam. These mistakes commonly turn a technically possible choice into the wrong exam answer.`,
    points: [
      `Do not treat ${servicePair} as interchangeable. Match the exact capability, scope, and operational model requested by the scenario.`,
      'Do not stop at a solution that works. Words such as most secure, least operational effort, lowest cost, and highly available determine which valid design is best.',
      'Do not ignore scope. Confirm whether the requirement applies to one resource, one Availability Zone, one Region, multiple accounts, or a global workload.',
      'Do not confuse high availability, fault tolerance, backup, and disaster recovery. Each addresses a different failure or recovery requirement.',
      'Do not overlook identity, encryption, logging, and least privilege. Security requirements remain relevant even when the question mainly tests another domain.',
      'For multiple-response questions, evaluate every option independently and select only the number of answers requested.',
    ],
    keyTerms: ['Requirement keywords', 'Scope', 'Least privilege', 'High availability', 'Disaster recovery', 'Cost optimization'],
    examTip: 'Read the final sentence first, identify the decision being requested, and verify that every selected answer satisfies all explicit constraints.',
  }
}

function cloneEnglishTopic(topic: EnglishTopic): EnglishTopic {
  const english = structuredClone(topic)
  delete english.translations
  return english
}

async function addChineseTranslations(guides: Record<string, GeneratedGuide>) {
  const slots: { value: string; set: (translated: string) => void }[] = []
  const add = (value: string, set: (translated: string) => void) => slots.push({ value, set })

  for (const guide of Object.values(guides)) {
    const guideZh = { name: '' }
    guide.translations = { zh: guideZh }
    add(guide.name, translated => { guideZh.name = translated })

    for (const domain of guide.domains) {
      const domainZh = { title: '' }
      domain.translations = { zh: domainZh }
      add(domain.title, translated => { domainZh.title = translated })
      for (const topic of domain.topics) addTopic(topic)
    }
    addTopic(guide.commonMistakes)
  }

  function addTopic(topic: EnglishTopic) {
    const zh: TopicTranslation = { title: '', summary: '', points: [], keyTerms: [], examTip: '' }
    topic.translations = { zh }
    add(topic.title, translated => { zh.title = translated })
    add(topic.summary, translated => { zh.summary = translated })
    topic.points.forEach((point, index) => add(point, translated => { zh.points[index] = translated }))
    topic.keyTerms.forEach((term, index) => add(term, translated => { zh.keyTerms[index] = translated }))
    add(topic.examTip, translated => { zh.examTip = translated })
  }

  console.log(`Translating ${slots.length} revision text fields`)
  const translated = await translateStrings(slots.map(slot => slot.value))
  slots.forEach((slot, index) => slot.set(translated[index]))
}

const certifications = CERTIFICATION_LIST.filter(cert => cert.status === 'active' && cert.provider === 'aws')
const guides: Record<string, GeneratedGuide> = {}

for (const cert of certifications) {
  if (!cert.examGuideUrl) throw new Error(`${cert.code}: missing official exam guide URL`)
  const existing = cert.code === 'clf-c02' ? getRevisionGuide(cert.code) : null
  const domains: GeneratedDomain[] = []

  for (const domain of cert.domains) {
    let tasks: { id: string; title: string }[]
    try {
      tasks = await officialTasks(cert.examGuideUrl, domain.id)
    } catch (error) {
      const fallback = cert.taskStatements?.filter(task => task.domainId === domain.id) ?? []
      if (fallback.length === 0) throw error
      tasks = fallback.map(task => ({ id: task.id, title: task.name }))
    }

    const existingDomain = existing?.domains.find(item => item.id === domain.id)
    const evidence = studyEvidence(domainQuestions(cert.code, domain.id))
    const topics = tasks.map((task, index) => {
      const existingTopic = existingDomain?.topics.find(topic => topic.id === task.id)
      return existingTopic ? cloneEnglishTopic(existingTopic) : buildTopic(task, domain.name, evidence, index)
    })
    domains.push({ id: domain.id, title: domain.name, weight: domain.weight, topics })
  }

  guides[cert.code] = {
    certCode: cert.code,
    name: cert.name,
    verified: VERIFIED,
    sourceUrl: cert.examGuideUrl,
    domains,
    commonMistakes: buildCommonMistakes(cert.name, domains),
  }
  console.log(`${cert.code}: ${domains.reduce((sum, domain) => sum + domain.topics.length, 0)} official task sections`)
}

await addChineseTranslations(guides)
writeFileSync(OUTPUT, `${JSON.stringify(guides, null, 2)}\n`, 'utf8')
console.log(`Saved ${OUTPUT}`)
