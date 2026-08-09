import type { Question } from '../types'

type DomainLoader = () => Promise<unknown>

/**
 * In-memory cache to avoid re-mapping domainId on repeat calls.
 * Key format: "cert-code:domain-id" (e.g., "clf-c02:1")
 */
const questionCache = new Map<string, Question[]>()

/**
 * Static import map for each certification's domain files.
 * Vite requires static strings for dynamic imports to chunk correctly.
 * To add a cert: add an entry here and in certifications.ts.
 */
const CERT_LOADERS: Record<string, Record<number, DomainLoader>> = {
  'clf-c02': {
    1: () => import('./clf-c02/domain1.json'),
    2: () => import('./clf-c02/domain2.json'),
    3: () => import('./clf-c02/domain3.json'),
    4: () => import('./clf-c02/domain4.json'),
  },
  'saa-c03': {
    1: () => import('./saa-c03/domain1.json'),
    2: () => import('./saa-c03/domain2.json'),
    3: () => import('./saa-c03/domain3.json'),
    4: () => import('./saa-c03/domain4.json'),
  },
  'aif-c01': {
    1: () => import('./aif-c01/domain1.json'),
    2: () => import('./aif-c01/domain2.json'),
    3: () => import('./aif-c01/domain3.json'),
    4: () => import('./aif-c01/domain4.json'),
    5: () => import('./aif-c01/domain5.json'),
  },
  'soa-c03': {
    1: () => import('./soa-c03/domain1.json'),
    2: () => import('./soa-c03/domain2.json'),
    3: () => import('./soa-c03/domain3.json'),
    4: () => import('./soa-c03/domain4.json'),
    5: () => import('./soa-c03/domain5.json'),
  },
  'dea-c01': {
    1: () => import('./dea-c01/domain1.json'),
    2: () => import('./dea-c01/domain2.json'),
    3: () => import('./dea-c01/domain3.json'),
    4: () => import('./dea-c01/domain4.json'),
  },
  'dva-c02': {
    1: () => import('./dva-c02/domain1.json'),
    2: () => import('./dva-c02/domain2.json'),
    3: () => import('./dva-c02/domain3.json'),
    4: () => import('./dva-c02/domain4.json'),
  },
  'mla-c01': {
    1: () => import('./mla-c01/domain1.json'),
    2: () => import('./mla-c01/domain2.json'),
    3: () => import('./mla-c01/domain3.json'),
    4: () => import('./mla-c01/domain4.json'),
  },
  'dop-c02': {
    1: () => import('./dop-c02/domain1.json'),
    2: () => import('./dop-c02/domain2.json'),
    3: () => import('./dop-c02/domain3.json'),
    4: () => import('./dop-c02/domain4.json'),
    5: () => import('./dop-c02/domain5.json'),
    6: () => import('./dop-c02/domain6.json'),
  },
  'aip-c01': {
    1: () => import('./aip-c01/domain1.json'),
    2: () => import('./aip-c01/domain2.json'),
    3: () => import('./aip-c01/domain3.json'),
    4: () => import('./aip-c01/domain4.json'),
    5: () => import('./aip-c01/domain5.json'),
  },
  'sap-c02': {
    1: () => import('./sap-c02/domain1.json'),
    2: () => import('./sap-c02/domain2.json'),
    3: () => import('./sap-c02/domain3.json'),
    4: () => import('./sap-c02/domain4.json'),
  },
  'ans-c01': {
    1: () => import('./ans-c01/domain1.json'),
    2: () => import('./ans-c01/domain2.json'),
    3: () => import('./ans-c01/domain3.json'),
    4: () => import('./ans-c01/domain4.json'),
  },
  'scs-c03': {
    1: () => import('./scs-c03/domain1.json'),
    2: () => import('./scs-c03/domain2.json'),
    3: () => import('./scs-c03/domain3.json'),
    4: () => import('./scs-c03/domain4.json'),
    5: () => import('./scs-c03/domain5.json'),
    6: () => import('./scs-c03/domain6.json'),
  },
}

/**
 * Load questions for a single domain of a specific certification.
 * Each domain is a separate chunk, only the requested domain is downloaded.
 * Results are cached in memory to avoid re-mapping domainId on repeat calls.
 */
export async function loadDomainQuestions(certCode: string, domainId: number): Promise<Question[]> {
  const cacheKey = `${certCode}:${domainId}`
  
  // Return cached questions if available
  if (questionCache.has(cacheKey)) {
    return questionCache.get(cacheKey)!
  }
  
  const certLoaders = CERT_LOADERS[certCode]
  if (!certLoaders) {
    throw new Error(`Unknown certification: ${certCode}`)
  }
  const loader = certLoaders[domainId]
  if (!loader) {
    throw new Error(`Invalid domain ID ${domainId} for certification ${certCode}`)
  }
  
  const mod = await loader() as { default: Omit<Question, 'domainId'>[] }
  const questions = mod.default.map(q => ({ ...q, domainId: domainId as Question['domainId'] }))
  
  // Cache for future calls
  questionCache.set(cacheKey, questions)
  
  return questions
}

/**
 * Load ALL questions from every domain of a certification in parallel.
 * Used by MockExam which needs the full question bank.
 */
export async function loadAllQuestions(certCode: string): Promise<Question[]> {
  const certLoaders = CERT_LOADERS[certCode]
  if (!certLoaders) {
    throw new Error(`Unknown certification: ${certCode}`)
  }
  const domainIds = Object.keys(certLoaders).map(Number)
  const results = await Promise.all(domainIds.map(id => loadDomainQuestions(certCode, id)))
  return results.flat()
}
