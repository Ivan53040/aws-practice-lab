const TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single'
const LINGVA_URL = 'https://lingva.ml/api/graphql'
const provider = process.env.AWSPL_TRANSLATION_PROVIDER ?? 'google'

const STANDALONE_AWS_TERMS = [
  'Application Load Balancer', 'Network Load Balancer', 'Gateway Load Balancer',
  'Elastic Load Balancing', 'EC2 Auto Scaling', 'Route 53 Resolver', 'Route 53',
  'Transit Gateway', 'Direct Connect', 'Global Accelerator', 'API Gateway',
  'Step Functions', 'Systems Manager', 'Secrets Manager', 'Identity Center',
  'Security Hub', 'Control Tower', 'Service Catalog', 'Compute Optimizer',
  'Trusted Advisor', 'Well-Architected Framework', 'CloudFormation StackSets',
  'CloudFormation', 'CloudWatch', 'CloudTrail', 'CloudFront', 'CloudHSM',
  'Cloud Map', 'CodeArtifact', 'CodeBuild', 'CodeCommit', 'CodeDeploy',
  'CodePipeline', 'DynamoDB', 'ElastiCache', 'OpenSearch', 'SageMaker',
  'GuardDuty', 'EventBridge', 'PrivateLink', 'AppSync', 'Cognito', 'Fargate',
  'Kinesis', 'QuickSight', 'Redshift', 'Athena', 'Aurora', 'Bedrock',
  'Inspector', 'Macie', 'Outposts', 'Lightsail', 'Organizations', 'Artifact',
  'Auto Scaling', 'Elastic Beanstalk', 'Storage Gateway', 'VPC Flow Logs',
  'Network Firewall', 'Firewall Manager', 'Performance Insights',
  'Application Migration Service', 'Database Migration Service',
  'Elastic Disaster Recovery', 'DataSync', 'Transfer Family',
  'IAM', 'KMS', 'WAF', 'Shield', 'Lambda', 'VPC', 'VPN', 'NAT Gateway',
  'NAT gateway', 'S3', 'EC2', 'ECS', 'EKS', 'ECR', 'RDS', 'EBS', 'EFS',
  'FSx', 'SQS', 'SNS', 'SES', 'DMS', 'ACM', 'KMS', 'MFA',
].sort((left, right) => right.length - left.length)

const TRADITIONAL_CHINESE_REPLACEMENTS = [
  ['對象儲存', '物件儲存'],
  ['對象', '物件'],
  ['默認', '預設'],
  ['用戶', '使用者'],
  ['數據', '資料'],
  ['信息', '資訊'],
  ['服務器', '伺服器'],
  ['軟件', '軟體'],
  ['硬件', '硬體'],
  ['賬戶', '帳戶'],
  ['網絡', '網路'],
  ['應用程序', '應用程式'],
  ['訪問', '存取'],
  ['群集', '叢集'],
  ['隊列', '佇列'],
  ['負載均衡器', '負載平衡器'],
  ['負載均衡', '負載平衡'],
  ['無服務器', '無伺服器'],
  ['實例', '執行個體'],
]

function normalizeTraditionalChinese(value) {
  let result = value
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u00a0/g, ' ')
    .trim()

  for (const [from, to] of TRADITIONAL_CHINESE_REPLACEMENTS) {
    result = result.replaceAll(from, to)
  }
  return result
}

function protectAwsTerms(value) {
  const productToken = '[A-Z][A-Za-z0-9]*(?:[.-][A-Za-z0-9]+)*'
  const detected = value.match(new RegExp(`\\b(?:Amazon|AWS)\\s+${productToken}(?:\\s+${productToken}){0,4}`, 'g')) ?? []
  const candidates = [...new Set([...detected, ...STANDALONE_AWS_TERMS.filter(term => value.includes(term))])]
    .sort((left, right) => right.length - left.length)
  const terms = []
  let protectedValue = value

  for (const term of candidates) {
    if (!protectedValue.includes(term)) continue
    const marker = `[[[AWSTERM_${String(terms.length).padStart(4, '0')}]]]`
    protectedValue = protectedValue.replaceAll(term, marker)
    terms.push(term)
  }
  return { value: protectedValue, terms }
}

function restoreAwsTerms(value, terms) {
  return terms.reduce(
    (result, term, index) => result.replaceAll(`[[[AWSTERM_${String(index).padStart(4, '0')}]]]`, term),
    value,
  )
}

function chunksBySize(values, maxCharacters) {
  const batches = []
  let current = []
  let length = 0

  for (const value of values) {
    const nextLength = value.length + 30
    if (current.length > 0 && (length + nextLength > maxCharacters || current.length >= 24)) {
      batches.push(current)
      current = []
      length = 0
    }
    current.push(value)
    length += nextLength
  }
  if (current.length > 0) batches.push(current)
  return batches
}

function parseMarkedTranslation(value, expectedCount) {
  const marker = /\[\[\[AWSPL_(\d{4})\]\]\]/g
  const matches = [...value.matchAll(marker)]
  if (matches.length !== expectedCount) {
    throw new Error(`Translation marker mismatch: expected ${expectedCount}, received ${matches.length}`)
  }

  return matches.map((match, index) => {
    const start = match.index + match[0].length
    const end = matches[index + 1]?.index ?? value.length
    return normalizeTraditionalChinese(value.slice(start, end))
  })
}

async function translateBatch(values, attempt = 1) {
  const protectedValues = values.map(protectAwsTerms)
  const payload = protectedValues
    .map((item, index) => `[[[AWSPL_${String(index).padStart(4, '0')}]]]\n${item.value}`)
    .join('\n')

  try {
    let translated
    if (provider === 'lingva') {
      const response = await fetch(LINGVA_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          query: 'query Translate($source: String, $target: String, $query: String!) { translation(source: $source, target: $target, query: $query) { target { text } } }',
          variables: { source: 'en', target: 'zh_HANT', query: payload },
        }),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const json = await response.json()
      translated = json.data?.translation?.target?.text
      if (!translated) throw new Error(json.errors?.[0]?.message ?? 'Lingva returned no translation')
    } else {
      const body = new URLSearchParams({ client: 'gtx', sl: 'en', tl: 'zh-TW', dt: 't', q: payload })
      const response = await fetch(TRANSLATE_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body,
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const json = await response.json()
      translated = json[0].map(part => part[0]).join('')
    }
    return parseMarkedTranslation(translated, values.length)
      .map((value, index) => restoreAwsTerms(value, protectedValues[index].terms))
  } catch (error) {
    if (attempt >= 8) throw error
    const rateLimited = error instanceof Error && error.message.includes('HTTP 429')
    const delay = rateLimited ? Math.min(60000, attempt * 15000) : attempt * 2500
    await new Promise(resolve => setTimeout(resolve, delay))
    return translateBatch(values, attempt + 1)
  }
}

export async function translateStrings(values, options = {}) {
  const configuredMaxCharacters = Number(process.env.AWSPL_TRANSLATION_MAX_CHARS)
  const maxCharacters = options.maxCharacters ?? (configuredMaxCharacters || 4200)
  const configuredConcurrency = Number(process.env.AWSPL_TRANSLATION_CONCURRENCY)
  const concurrency = options.concurrency ?? (configuredConcurrency || (provider === 'lingva' ? 6 : 1))
  const delayMs = options.delayMs ?? (provider === 'lingva' ? 0 : 1100)
  const batches = chunksBySize(values, maxCharacters)
  const translated = new Array(batches.length)
  let cursor = 0

  async function worker() {
    while (cursor < batches.length) {
      const index = cursor
      cursor += 1
      translated[index] = await translateBatch(batches[index])
      if (cursor < batches.length) await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, batches.length) }, worker))
  return translated.flat()
}
