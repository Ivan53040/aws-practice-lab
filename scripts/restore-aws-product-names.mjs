#!/usr/bin/env node

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DATA_ROOT = join(ROOT, 'src', 'data')
const REVISION_PATH = join(DATA_ROOT, 'revision-guides.generated.json')
const dryRun = process.argv.includes('--dry-run')
const connectors = new Set(['and', 'for', 'of', 'to'])
const awsMarkers = [
  'Application Load Balancer', 'Network Load Balancer', 'Gateway Load Balancer',
  'Elastic Load Balancing', 'EC2 Auto Scaling',
  'CloudFormation', 'CloudWatch', 'CloudTrail', 'CloudFront', 'CloudHSM',
  'CodeArtifact', 'CodeBuild', 'CodeCommit', 'CodeDeploy', 'CodePipeline',
  'DynamoDB', 'ElastiCache', 'OpenSearch', 'SageMaker', 'GuardDuty',
  'EventBridge', 'PrivateLink', 'AppSync', 'Cognito', 'Fargate', 'Kinesis',
  'QuickSight', 'Redshift', 'Athena', 'Aurora', 'Bedrock', 'Inspector',
  'Macie', 'Outposts', 'Lightsail', 'Lambda', 'Route 53', 'Transit Gateway',
  'Direct Connect', 'Global Accelerator', 'API Gateway', 'Step Functions',
  'Systems Manager', 'Secrets Manager', 'Security Hub', 'Control Tower',
  'IAM', 'KMS', 'WAF', 'S3', 'EC2', 'ECS', 'EKS', 'ECR', 'RDS', 'EBS',
  'EFS', 'FSx', 'SQS', 'SNS', 'SES', 'DMS', 'ACM',
]

function visiblePairs(question) {
  const zh = question.translations?.zh
  if (!zh) return []
  const pairs = [[question.question, zh.question]]
  for (const [key, value] of Object.entries(question.options)) {
    if (value && zh.options?.[key]) pairs.push([value, zh.options[key]])
  }
  for (const [key, value] of Object.entries(question.targets ?? {})) {
    if (value && zh.targets?.[key]) pairs.push([value, zh.targets[key]])
  }
  return pairs
}

function looksLikeProductName(value) {
  if (!value || value.length > 85 || /[?.!;:]/.test(value)) return false
  const normalized = value.replace(/^(?:A|An|The)\s+/, '').trim()
  const hasAwsIdentity = /^(?:Amazon|AWS)\s+/.test(normalized)
    || awsMarkers.some(marker => normalized === marker || normalized.startsWith(`${marker} `))
  if (!hasAwsIdentity) return false
  const tokens = normalized.split(/\s+/).map(token => token.replace(/^[([{]|[\])},]$/g, ''))
  return tokens.every(token => connectors.has(token) || /^[A-Z0-9][A-Za-z0-9()./-]*$/.test(token))
}

function transformStrings(value, replacements) {
  if (typeof value === 'string') {
    let result = value
    for (const [translated, official] of replacements) result = result.replaceAll(translated, official)
    return result
  }
  if (Array.isArray(value)) return value.map(item => transformStrings(item, replacements))
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) value[key] = transformStrings(value[key], replacements)
  }
  return value
}

const certDirectories = readdirSync(DATA_ROOT, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .filter(name => readdirSync(join(DATA_ROOT, name)).some(file => /^domain\d+\.json$/.test(file)))
  .sort()

const files = certDirectories.flatMap(certCode =>
  readdirSync(join(DATA_ROOT, certCode))
    .filter(file => /^domain\d+\.json$/.test(file))
    .sort()
    .map(file => join(DATA_ROOT, certCode, file)),
)
const banks = files.map(path => ({ path, questions: JSON.parse(readFileSync(path, 'utf8')) }))
const revisionGuides = JSON.parse(readFileSync(REVISION_PATH, 'utf8'))
const mappings = new Map()

for (const { questions } of banks) {
  for (const question of questions) {
    for (const [official, translated] of visiblePairs(question)) {
      if (looksLikeProductName(official) && official !== translated && /[\u3400-\u9fff]/.test(translated)) {
        mappings.set(translated, official.replace(/^(?:A|An|The)\s+/, ''))
      }
    }
  }
}

for (const guide of Object.values(revisionGuides)) {
  const topics = [...guide.domains.flatMap(domain => domain.topics), guide.commonMistakes]
  for (const topic of topics) {
    topic.keyTerms.forEach((official, index) => {
      const translated = topic.translations?.zh.keyTerms[index]
      if (looksLikeProductName(official) && translated && official !== translated && /[\u3400-\u9fff]/.test(translated)) {
        mappings.set(translated, official)
      }
    })
  }
}

const replacements = [...mappings.entries()].sort((left, right) => right[0].length - left[0].length)
console.log(`Found ${replacements.length} translated AWS product or feature names.`)
for (const [translated, official] of replacements.slice(0, 40)) console.log(`  ${translated} -> ${official}`)

if (!dryRun) {
  for (const { path, questions } of banks) {
    for (const question of questions) transformStrings(question.translations?.zh, replacements)
    writeFileSync(path, `${JSON.stringify(questions, null, 2)}\n`, 'utf8')
  }
  transformStrings(revisionGuides, replacements)
  writeFileSync(REVISION_PATH, `${JSON.stringify(revisionGuides, null, 2)}\n`, 'utf8')
  console.log(`Updated ${files.length} question bank files.`)
}
