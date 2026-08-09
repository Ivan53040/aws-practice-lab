/**
 * Curated sample-question ids per (cert, domain) for the Domain_Landing pages.
 *
 * Each domain landing showcases five sample questions. Picking them purely by
 * keyword score let same-topic questions cluster on one page (e.g. two AWS
 * Artifact questions, two shared-responsibility questions, two consolidated-
 * billing questions). This list pins a hand-picked, topically diverse five per
 * domain so the samples span five distinct subtopics.
 *
 * This is ordinary EDITORIAL selection over the public, open-source question
 * bank: every id below lives in src/data/<certCode>/domain<n>.json. It is NOT
 * SEO keyword targeting and NOT Semrush data, and nothing here is private. The
 * build stays fully self-contained and reproducible from this repository alone
 * (it does not read anything outside src/).
 *
 * Resilience: if an id is later removed or mistyped, the Domain_Landing falls
 * back to keyword-ranked single-select questions to fill the set (see
 * [domain].astro), so a stale id never breaks a page. A unit test
 * (featured-samples.test.ts) asserts every id here resolves to a renderable
 * sample using one of the response formats supported by SampleQuestionCard in
 * the right domain bank.
 */
export const FEATURED_SAMPLE_IDS: Record<string, Record<number, string[]>> = {
  'clf-c02': {
    1: ['q013', 'q023', 'q065', 'q084', 'q099'],
    2: ['q175', 'q351', 'q550', 'q811', 'q037'],
    3: ['q040', 'q230', 'q248', 'q282', 'q313'],
    4: ['q061', 'q847', 'q009', 'q016', 'q180'],
  },
  'aif-c01': {
    // aif-q457 (ordering: ML lifecycle) and aif-q460 (matching: genAI services)
    // are featured so the Domain_Landings visibly showcase the two new AIF-C01
    // response formats alongside the single-select samples (2026-06-13).
    1: ['aif-q004', 'aif-q006', 'aif-q007', 'aif-q014', 'aif-q457'],
    2: ['aif-q022', 'aif-q035', 'aif-q055', 'aif-q460', 'aif-q083'],
    3: ['aif-q271', 'aif-q283', 'aif-q008', 'aif-q019', 'aif-q024'],
    4: ['aif-q047', 'aif-q052', 'aif-q100', 'aif-q187', 'aif-q389'],
    5: ['aif-q126', 'aif-q133', 'aif-q026', 'aif-q028', 'aif-q030'],
  },
  'saa-c03': {
    1: ['saa-d1-001', 'saa-d1-003', 'saa-d1-006', 'saa-d1-011', 'saa-d1-019'],
    2: ['saa-d2-001', 'saa-d2-003', 'saa-d2-006', 'saa-d2-011', 'saa-d2-015'],
    3: ['saa-d3-001', 'saa-d3-002', 'saa-d3-006', 'saa-d3-012', 'saa-d3-015'],
    4: ['saa-d4-001', 'saa-d4-004', 'saa-d4-006', 'saa-d4-008', 'saa-d4-013'],
  },
  'soa-c03': {
    1: ['soa-c03-d1-001', 'soa-c03-d1-002', 'soa-c03-d1-003', 'soa-c03-d1-004', 'soa-c03-d1-005'],
    2: ['soa-c03-d2-001', 'soa-c03-d2-002', 'soa-c03-d2-003', 'soa-c03-d2-004', 'soa-c03-d2-005'],
    3: ['soa-c03-d3-001', 'soa-c03-d3-002', 'soa-c03-d3-003', 'soa-c03-d3-004', 'soa-c03-d3-005'],
    4: ['soa-c03-d4-001', 'soa-c03-d4-002', 'soa-c03-d4-003', 'soa-c03-d4-004', 'soa-c03-d4-005'],
    5: ['soa-c03-d5-001', 'soa-c03-d5-002', 'soa-c03-d5-003', 'soa-c03-d5-004', 'soa-c03-d5-005'],
  },
  'dea-c01': {
    1: ['dea-c01-d1-001', 'dea-c01-d1-002', 'dea-c01-d1-003', 'dea-c01-d1-004', 'dea-c01-d1-005'],
    2: ['dea-c01-d2-001', 'dea-c01-d2-002', 'dea-c01-d2-003', 'dea-c01-d2-004', 'dea-c01-d2-005'],
    3: ['dea-c01-d3-001', 'dea-c01-d3-002', 'dea-c01-d3-003', 'dea-c01-d3-004', 'dea-c01-d3-005'],
    4: ['dea-c01-d4-001', 'dea-c01-d4-002', 'dea-c01-d4-003', 'dea-c01-d4-004', 'dea-c01-d4-005'],
  },
  'dva-c02': {
    1: ['dva-c02-d1-001', 'dva-c02-d1-002', 'dva-c02-d1-003', 'dva-c02-d1-004', 'dva-c02-d1-005'],
    2: ['dva-c02-d2-001', 'dva-c02-d2-002', 'dva-c02-d2-003', 'dva-c02-d2-004', 'dva-c02-d2-005'],
    3: ['dva-c02-d3-001', 'dva-c02-d3-002', 'dva-c02-d3-003', 'dva-c02-d3-004', 'dva-c02-d3-005'],
    4: ['dva-c02-d4-001', 'dva-c02-d4-002', 'dva-c02-d4-003', 'dva-c02-d4-004', 'dva-c02-d4-005'],
  },
  'mla-c01': {
    1: ['mla-c01-d1-001', 'mla-c01-d1-002', 'mla-c01-d1-003', 'mla-c01-d1-004', 'mla-c01-d1-005'],
    2: ['mla-c01-d2-001', 'mla-c01-d2-002', 'mla-c01-d2-003', 'mla-c01-d2-004', 'mla-c01-d2-005'],
    3: ['mla-c01-d3-001', 'mla-c01-d3-002', 'mla-c01-d3-003', 'mla-c01-d3-004', 'mla-c01-d3-005'],
    4: ['mla-c01-d4-001', 'mla-c01-d4-002', 'mla-c01-d4-003', 'mla-c01-d4-004', 'mla-c01-d4-005'],
  },
  'dop-c02': {
    1: ['dop-c02-d1-001', 'dop-c02-d1-002', 'dop-c02-d1-003', 'dop-c02-d1-004', 'dop-c02-d1-005'],
    2: ['dop-c02-d2-001', 'dop-c02-d2-002', 'dop-c02-d2-003', 'dop-c02-d2-004', 'dop-c02-d2-005'],
    3: ['dop-c02-d3-001', 'dop-c02-d3-002', 'dop-c02-d3-003', 'dop-c02-d3-004', 'dop-c02-d3-005'],
    4: ['dop-c02-d4-001', 'dop-c02-d4-002', 'dop-c02-d4-003', 'dop-c02-d4-004', 'dop-c02-d4-005'],
    5: ['dop-c02-d5-001', 'dop-c02-d5-002', 'dop-c02-d5-003', 'dop-c02-d5-004', 'dop-c02-d5-005'],
    6: ['dop-c02-d6-001', 'dop-c02-d6-002', 'dop-c02-d6-003', 'dop-c02-d6-004', 'dop-c02-d6-005'],
  },
  'aip-c01': {
    1: ['aip-c01-d1-001', 'aip-c01-d1-002', 'aip-c01-d1-003', 'aip-c01-d1-004', 'aip-c01-d1-005'],
    2: ['aip-c01-d2-001', 'aip-c01-d2-002', 'aip-c01-d2-003', 'aip-c01-d2-004', 'aip-c01-d2-005'],
    3: ['aip-c01-d3-001', 'aip-c01-d3-002', 'aip-c01-d3-003', 'aip-c01-d3-004', 'aip-c01-d3-005'],
    4: ['aip-c01-d4-001', 'aip-c01-d4-002', 'aip-c01-d4-003', 'aip-c01-d4-004', 'aip-c01-d4-005'],
    5: ['aip-c01-d5-001', 'aip-c01-d5-002', 'aip-c01-d5-003', 'aip-c01-d5-004', 'aip-c01-d5-005'],
  },
  'sap-c02': {
    1: ['sap-c02-d1-001', 'sap-c02-d1-002', 'sap-c02-d1-003', 'sap-c02-d1-004', 'sap-c02-d1-005'],
    2: ['sap-c02-d2-001', 'sap-c02-d2-002', 'sap-c02-d2-003', 'sap-c02-d2-004', 'sap-c02-d2-005'],
    3: ['sap-c02-d3-001', 'sap-c02-d3-002', 'sap-c02-d3-003', 'sap-c02-d3-004', 'sap-c02-d3-005'],
    4: ['sap-c02-d4-001', 'sap-c02-d4-002', 'sap-c02-d4-003', 'sap-c02-d4-004', 'sap-c02-d4-005'],
  },
  'ans-c01': {
    1: ['ans-c01-d1-001', 'ans-c01-d1-002', 'ans-c01-d1-003', 'ans-c01-d1-004', 'ans-c01-d1-005'],
    2: ['ans-c01-d2-001', 'ans-c01-d2-002', 'ans-c01-d2-003', 'ans-c01-d2-004', 'ans-c01-d2-005'],
    3: ['ans-c01-d3-001', 'ans-c01-d3-002', 'ans-c01-d3-003', 'ans-c01-d3-004', 'ans-c01-d3-005'],
    4: ['ans-c01-d4-001', 'ans-c01-d4-002', 'ans-c01-d4-003', 'ans-c01-d4-004', 'ans-c01-d4-005'],
  },
  'scs-c03': {
    1: ['scs-c03-d1-001', 'scs-c03-d1-002', 'scs-c03-d1-003', 'scs-c03-d1-004', 'scs-c03-d1-005'],
    2: ['scs-c03-d2-001', 'scs-c03-d2-002', 'scs-c03-d2-003', 'scs-c03-d2-004', 'scs-c03-d2-005'],
    3: ['scs-c03-d3-001', 'scs-c03-d3-002', 'scs-c03-d3-003', 'scs-c03-d3-004', 'scs-c03-d3-005'],
    4: ['scs-c03-d4-001', 'scs-c03-d4-002', 'scs-c03-d4-003', 'scs-c03-d4-004', 'scs-c03-d4-005'],
    5: ['scs-c03-d5-001', 'scs-c03-d5-002', 'scs-c03-d5-003', 'scs-c03-d5-004', 'scs-c03-d5-005'],
    6: ['scs-c03-d6-001', 'scs-c03-d6-002', 'scs-c03-d6-003', 'scs-c03-d6-004', 'scs-c03-d6-005'],
  },
}

/**
 * Curated, topically diverse sample-question ids for a `(certCode, domainId)`
 * pair. Empty array when none are defined (the Domain_Landing then falls back
 * to keyword-ranked questions).
 */
export function getFeaturedSampleIds(certCode: string, domainId: number): string[] {
  return FEATURED_SAMPLE_IDS[certCode]?.[domainId] ?? []
}
