import { describe, it, expect } from 'vitest'
import { FEATURED_SAMPLE_IDS, getFeaturedSampleIds } from './featured-samples'
import { CERTIFICATIONS } from './certifications'

import clfDomain1 from './clf-c02/domain1.json'
import clfDomain2 from './clf-c02/domain2.json'
import clfDomain3 from './clf-c02/domain3.json'
import clfDomain4 from './clf-c02/domain4.json'
import aifDomain1 from './aif-c01/domain1.json'
import aifDomain2 from './aif-c01/domain2.json'
import aifDomain3 from './aif-c01/domain3.json'
import aifDomain4 from './aif-c01/domain4.json'
import aifDomain5 from './aif-c01/domain5.json'
import saaDomain1 from './saa-c03/domain1.json'
import saaDomain2 from './saa-c03/domain2.json'
import saaDomain3 from './saa-c03/domain3.json'
import saaDomain4 from './saa-c03/domain4.json'
import soaDomain1 from './soa-c03/domain1.json'
import soaDomain2 from './soa-c03/domain2.json'
import soaDomain3 from './soa-c03/domain3.json'
import soaDomain4 from './soa-c03/domain4.json'
import soaDomain5 from './soa-c03/domain5.json'
import deaDomain1 from './dea-c01/domain1.json'
import deaDomain2 from './dea-c01/domain2.json'
import deaDomain3 from './dea-c01/domain3.json'
import deaDomain4 from './dea-c01/domain4.json'
import dvaDomain1 from './dva-c02/domain1.json'
import dvaDomain2 from './dva-c02/domain2.json'
import dvaDomain3 from './dva-c02/domain3.json'
import dvaDomain4 from './dva-c02/domain4.json'
import mlaDomain1 from './mla-c01/domain1.json'
import mlaDomain2 from './mla-c01/domain2.json'
import mlaDomain3 from './mla-c01/domain3.json'
import mlaDomain4 from './mla-c01/domain4.json'
import dopDomain1 from './dop-c02/domain1.json'
import dopDomain2 from './dop-c02/domain2.json'
import dopDomain3 from './dop-c02/domain3.json'
import dopDomain4 from './dop-c02/domain4.json'
import dopDomain5 from './dop-c02/domain5.json'
import dopDomain6 from './dop-c02/domain6.json'
import aipDomain1 from './aip-c01/domain1.json'
import aipDomain2 from './aip-c01/domain2.json'
import aipDomain3 from './aip-c01/domain3.json'
import aipDomain4 from './aip-c01/domain4.json'
import aipDomain5 from './aip-c01/domain5.json'
import sapDomain1 from './sap-c02/domain1.json'
import sapDomain2 from './sap-c02/domain2.json'
import sapDomain3 from './sap-c02/domain3.json'
import sapDomain4 from './sap-c02/domain4.json'
import ansDomain1 from './ans-c01/domain1.json'
import ansDomain2 from './ans-c01/domain2.json'
import ansDomain3 from './ans-c01/domain3.json'
import ansDomain4 from './ans-c01/domain4.json'
import scsDomain1 from './scs-c03/domain1.json'
import scsDomain2 from './scs-c03/domain2.json'
import scsDomain3 from './scs-c03/domain3.json'
import scsDomain4 from './scs-c03/domain4.json'
import scsDomain5 from './scs-c03/domain5.json'
import scsDomain6 from './scs-c03/domain6.json'

interface BankQuestion {
  id: string
  answer: string | string[]
  isMultiAnswer?: boolean
  type?: 'single' | 'multi' | 'ordering' | 'matching'
}

const BANKS: Record<string, Record<number, BankQuestion[]>> = {
  'clf-c02': {
    1: clfDomain1 as BankQuestion[],
    2: clfDomain2 as BankQuestion[],
    3: clfDomain3 as BankQuestion[],
    4: clfDomain4 as BankQuestion[],
  },
  'aif-c01': {
    1: aifDomain1 as BankQuestion[],
    2: aifDomain2 as BankQuestion[],
    3: aifDomain3 as BankQuestion[],
    4: aifDomain4 as BankQuestion[],
    5: aifDomain5 as BankQuestion[],
  },
  'saa-c03': {
    1: saaDomain1 as BankQuestion[],
    2: saaDomain2 as BankQuestion[],
    3: saaDomain3 as BankQuestion[],
    4: saaDomain4 as BankQuestion[],
  },
  'soa-c03': {
    1: soaDomain1 as BankQuestion[],
    2: soaDomain2 as BankQuestion[],
    3: soaDomain3 as BankQuestion[],
    4: soaDomain4 as BankQuestion[],
    5: soaDomain5 as BankQuestion[],
  },
  'dea-c01': {
    1: deaDomain1 as BankQuestion[],
    2: deaDomain2 as BankQuestion[],
    3: deaDomain3 as BankQuestion[],
    4: deaDomain4 as BankQuestion[],
  },
  'dva-c02': {
    1: dvaDomain1 as BankQuestion[],
    2: dvaDomain2 as BankQuestion[],
    3: dvaDomain3 as BankQuestion[],
    4: dvaDomain4 as BankQuestion[],
  },
  'mla-c01': {
    1: mlaDomain1 as BankQuestion[],
    2: mlaDomain2 as BankQuestion[],
    3: mlaDomain3 as BankQuestion[],
    4: mlaDomain4 as BankQuestion[],
  },
  'dop-c02': {
    1: dopDomain1 as BankQuestion[],
    2: dopDomain2 as BankQuestion[],
    3: dopDomain3 as BankQuestion[],
    4: dopDomain4 as BankQuestion[],
    5: dopDomain5 as BankQuestion[],
    6: dopDomain6 as BankQuestion[],
  },
  'aip-c01': {
    1: aipDomain1 as BankQuestion[],
    2: aipDomain2 as BankQuestion[],
    3: aipDomain3 as BankQuestion[],
    4: aipDomain4 as BankQuestion[],
    5: aipDomain5 as BankQuestion[],
  },
  'sap-c02': {
    1: sapDomain1 as BankQuestion[],
    2: sapDomain2 as BankQuestion[],
    3: sapDomain3 as BankQuestion[],
    4: sapDomain4 as BankQuestion[],
  },
  'ans-c01': {
    1: ansDomain1 as BankQuestion[],
    2: ansDomain2 as BankQuestion[],
    3: ansDomain3 as BankQuestion[],
    4: ansDomain4 as BankQuestion[],
  },
  'scs-c03': {
    1: scsDomain1 as BankQuestion[],
    2: scsDomain2 as BankQuestion[],
    3: scsDomain3 as BankQuestion[],
    4: scsDomain4 as BankQuestion[],
    5: scsDomain5 as BankQuestion[],
    6: scsDomain6 as BankQuestion[],
  },
}

describe('FEATURED_SAMPLE_IDS', () => {
  for (const [certCode, domains] of Object.entries(FEATURED_SAMPLE_IDS)) {
    for (const [domainIdStr, ids] of Object.entries(domains)) {
      const domainId = Number(domainIdStr)

      describe(`${certCode} domain ${domainId}`, () => {
        const bank = BANKS[certCode]?.[domainId] ?? []
        const byId = new Map(bank.map(q => [q.id, q]))

        it('pins exactly five sample ids', () => {
          expect(ids).toHaveLength(5)
        })

        it('has no duplicate ids', () => {
          expect(new Set(ids).size).toBe(ids.length)
        })

        it('every featured id resolves to a supported sample in this domain bank', () => {
          for (const id of ids) {
            const q = byId.get(id)
            expect(q, `${certCode} d${domainId}: featured id ${id} not found in bank`).toBeDefined()
            const type = q!.type ?? (Array.isArray(q!.answer) || q!.isMultiAnswer ? 'multi' : 'single')
            expect(['single', 'multi', 'ordering', 'matching'], `${certCode} d${domainId}: unsupported type ${type}`).toContain(type)
          }
        })
      })
    }
  }

  it('covers every active AWS cert domain', () => {
    for (const cert of Object.values(CERTIFICATIONS)) {
      if (cert.status !== 'active' || cert.provider !== 'aws') continue
      for (const domain of cert.domains) {
        expect(
          getFeaturedSampleIds(cert.code, domain.id).length,
          `${cert.code} domain ${domain.id} has no featured samples`,
        ).toBe(5)
      }
    }
  })
})
