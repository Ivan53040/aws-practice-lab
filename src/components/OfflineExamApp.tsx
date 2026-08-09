import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Moon, Sun } from 'lucide-react'
import type { Certification } from '../data/certifications'
import { CERTIFICATION_LIST, CERTIFICATIONS } from '../data/certifications'
import { loadAllQuestions } from '../data/questions'
import { getRevisionGuide } from '../data/revision'
import type { RevisionDomain, RevisionTopic } from '../data/revision'
import { GLOSSARY_CATEGORIES, GLOSSARY_TERMS } from '../data/glossary'
import type { GlossaryCategoryId, GlossaryTerm } from '../data/glossary'
import { EXAM_KEYWORD_HINTS, STUDY_COMPARISONS } from '../data/study-tools'
import type { Question, QuestionType } from '../types'
import { formatTime, isAnswerCorrect, selectExamQuestions, selectPracticeQuestions } from '../lib/scoring'
import { screenAfterModeChange, splitInlineGlossaryText } from '../lib/offlineAppHelpers'
import { fisherYatesShuffle, getQuestionType, shuffleAndMapQuestions } from '../lib/utils'
import { useTheme } from '../hooks/useTheme'

type Language = 'en' | 'zh'
type AnswerValue = string | string[]
type ExamScreen = 'home' | 'loading' | 'exam' | 'results'
type ExamGroup = 'foundational' | 'associate' | 'advanced'
type AppMode = 'mock' | 'revision' | 'glossary'
type RevisionTool = 'notes' | 'flashcards' | 'comparisons' | 'keywords'
type ExamPreset = 'full' | 'quick' | 'domain'
type PracticeCount = 10 | 20 | 30

interface ExamSettings {
  preset: ExamPreset
  domainId: number
  domainQuestionCount: PracticeCount
  timed: boolean
  shuffleQuestions: boolean
  shuffleOptions: boolean
}

interface QuestionResult {
  question: Question
  userAnswer: AnswerValue
  correctAnswer: AnswerValue
  isCorrect: boolean
}

const PRACTICE_PASS_PERCENT = 75
const DEFAULT_EXAM_SETTINGS: ExamSettings = {
  preset: 'full',
  domainId: 1,
  domainQuestionCount: 20,
  timed: true,
  shuffleQuestions: true,
  shuffleOptions: true,
}

const UI = {
  en: {
    mockExam: 'Mock Exam',
    revision: 'Revision',
    revisionNotes: 'Section notes',
    flashcards: 'Flashcards',
    comparisons: 'Service comparisons',
    keywordHints: 'Exam keywords',
    flashcardsHint: 'Test yourself with all AWS glossary terms. Reveal the function only when you are ready.',
    comparisonsHint: 'Compare services that commonly appear together in AWS exam questions.',
    keywordHintsHint: 'Use wording clues to identify the AWS concept or service a scenario is testing.',
    allCategories: 'All categories',
    chooseCategory: 'Choose category',
    showAnswer: 'Show function',
    tapToReveal: 'Think of the service purpose, then reveal the answer.',
    randomCard: 'Random card',
    previousCard: 'Previous card',
    nextCard: 'Next card',
    comparisonPurpose: 'Best for',
    comparisonRemember: 'Remember',
    officialDecisionGuide: 'AWS decision guide',
    keywordCue: 'Question wording',
    keywordThink: 'Think of',
    keywordWhy: 'Why',
    relatedTerm: 'AWS glossary term',
    serviceFunction: 'Purpose',
    close: 'Close',
    glossary: 'AWS Glossary',
    glossaryTitle: 'AWS service glossary',
    glossaryHint: 'Find the purpose of common AWS services and cloud terms. Browse by category or search in English or Chinese.',
    glossaryAll: 'All services',
    glossarySearch: 'Search services or functions',
    glossarySearchLabel: 'Search the AWS glossary',
    glossaryEmpty: 'No matching terms. Try another keyword or category.',
    glossaryTerms: 'terms',
    glossarySource: 'AWS service overview',
    revisionTitle: 'Revision notes',
    revisionHint: 'Review the latest exam guide one section at a time. Switch language at any time for complete English or Chinese content.',
    chooseCertification: 'Choose certification',
    revisionMap: 'Revision map',
    studyPoints: 'Key study points',
    keyTerms: 'Key terms and services',
    examTip: 'Exam tip',
    commonMistakes: 'Common mistakes',
    domainWeight: 'of scored content',
    officialGuide: 'Official exam guide',
    verified: 'Verified',
    revisionUnavailable: 'Revision notes are being prepared',
    revisionUnavailableBody: 'This certification is already connected to the revision architecture. Its section notes will be added in a later content pass.',
    section: 'Section',
    foundational: 'Foundational',
    foundationalHint: 'Core AWS concepts and services',
    associate: 'Associate',
    associateHint: 'Hands-on role-based AWS skills',
    advanced: 'Professional & Specialty',
    advancedHint: 'Advanced architecture, operations, and security',
    appName: 'AWS Practice Lab',
    subtitle: 'Offline practice for AWS certification exams',
    certification: 'AWS CERTIFICATION',
    chooseExam: 'Choose an exam',
    chooseExamHint: 'Every attempt is fresh. Switch the whole exam between English and Chinese at any time.',
    start: 'Start 65-question exam',
    startPractice: 'Start practice',
    examSettings: 'Exam settings',
    examSettingsHint: 'Choose how this attempt should work. Nothing is saved after the tab is closed.',
    examMode: 'Practice mode',
    fullExam: 'Full mock exam',
    fullExamHint: 'Official question count and domain mix',
    quickExam: 'Quick 10 questions',
    quickExamHint: 'Ten random questions across the exam',
    domainPractice: 'Practice one domain',
    domainPracticeHint: 'Focus on a selected exam domain',
    chooseDomain: 'Choose domain',
    questionCount: 'Question count',
    timedExam: 'Enable timer',
    shuffleQuestions: 'Randomize question order',
    shuffleOptions: 'Randomize answer options',
    enabled: 'Enabled',
    disabled: 'Disabled',
    untimed: 'Untimed',
    questions: 'questions',
    exams: 'exams',
    minutes: 'minutes',
    passRule: 'Practice pass: 75% raw score',
    loading: 'Loading the local question bank...',
    question: 'Question',
    answered: 'answered',
    single: 'Select one answer',
    multi: 'Select all that apply',
    ordering: 'Arrange from first to last',
    matching: 'Match each item',
    previous: 'Previous',
    next: 'Next',
    finish: 'Finish exam',
    submit: 'Submit exam',
    backToHome: 'Choose another exam',
    newExam: 'Start a new exam',
    results: 'Your results',
    correct: 'correct',
    score: 'Raw score',
    passed: 'Practice passed',
    notPassed: 'Keep practicing',
    review: 'Review incorrect questions',
    incorrectCount: 'Incorrect questions',
    domainPerformance: 'Domain performance',
    needsReview: 'Needs the most review',
    incorrectServices: 'Services in incorrect answers',
    noTaggedServices: 'No specific AWS service tags appeared in the incorrect questions.',
    retryIncorrect: 'Retry incorrect questions',
    correctOf: 'correct',
    questionMap: 'Question map',
    reviewAll: 'Review question',
    selectQuestion: 'Select a question to see its answer and explanation.',
    correctStatus: 'Correct',
    incorrectStatus: 'Incorrect',
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    allCorrect: 'Excellent. You answered every question correctly.',
    noIncorrect: 'There are no incorrect questions to review.',
    explanation: 'Explanation',
    yourAnswer: 'Your answer',
    correctAnswer: 'Correct answer',
    notAnswered: 'Not answered',
    up: 'Move up',
    down: 'Move down',
    selectTarget: 'Select a match',
    yourOrder: 'Your order',
    orderingHint: 'Select each option below in the desired order.',
    optionsLabel: 'Options',
    remove: 'Remove',
    language: 'Language',
    timeLeft: 'Time left',
    loadingError: 'The local question bank could not be loaded.',
    tryAgain: 'Try again',
    selected: 'Selected',
    select: 'Select',
    randomizedTitle: 'Randomized',
    randomizedBody: 'A new set of questions is selected from the local bank for every attempt.',
    englishContentTitle: 'Bilingual content',
    englishContentBody: 'Questions, options, explanations, revision notes, and glossary terms can switch between English and Traditional Chinese.',
    noHistoryTitle: 'No history',
    noHistoryBody: 'Your answers stay in the current tab and disappear when you start over.',
    ready: 'is ready. Choose the card above, then start whenever you are ready.',
    footer: 'MIT licensed open-source practice content. No account or score history required.',
    passMark: '75% or above',
    belowPassMark: 'Below 75%',
    studyMode: 'Study mode',
    certificationLevels: 'AWS certification levels',
  },
  zh: {
    mockExam: '\u6a21\u64ec\u8003\u8a66',
    revision: '\u91cd\u9ede\u6eab\u7fd2',
    revisionNotes: '章節筆記',
    flashcards: '溫習卡',
    comparisons: '服務比較表',
    keywordHints: '考試關鍵字',
    flashcardsHint: '使用全部 AWS 名詞卡測試自己，準備好後才揭示服務功用。',
    comparisonsHint: '比較 AWS 考試中經常一同出現及容易混淆的服務。',
    keywordHintsHint: '利用題目字眼判斷情境正在考核的 AWS 概念或服務。',
    allCategories: '全部分類',
    chooseCategory: '選擇分類',
    showAnswer: '顯示功用',
    tapToReveal: '先想一想服務功用，然後揭示答案。',
    randomCard: '隨機抽卡',
    previousCard: '上一張',
    nextCard: '下一張',
    comparisonPurpose: '最適合',
    comparisonRemember: '記憶重點',
    officialDecisionGuide: 'AWS 決策指南',
    keywordCue: '題目字眼',
    keywordThink: '應想到',
    keywordWhy: '原因',
    relatedTerm: 'AWS 名詞解釋',
    serviceFunction: '功用',
    close: '關閉',
    glossary: 'AWS 名詞',
    glossaryTitle: 'AWS 服務名詞專區',
    glossaryHint: '快速查找常見 AWS 服務與雲端名詞的功用。可按分類瀏覽，或使用中文及英文搜尋。',
    glossaryAll: '全部服務',
    glossarySearch: '搜尋服務名稱或功用',
    glossarySearchLabel: '搜尋 AWS 名詞',
    glossaryEmpty: '找不到相符名詞，請嘗試其他關鍵字或分類。',
    glossaryTerms: '個名詞',
    glossarySource: 'AWS 服務概覽',
    revisionTitle: '\u91cd\u9ede\u6eab\u7fd2',
    revisionHint: '\u6309\u6700\u65b0 Exam Guide \u7684\u7ae0\u7bc0\u9010\u9805\u6eab\u7fd2\uff0c\u53ef\u96a8\u6642\u5c07\u5168\u90e8\u5167\u5bb9\u5207\u63db\u70ba\u82f1\u6587\u6216\u4e2d\u6587\u3002',
    chooseCertification: '\u9078\u64c7\u8a8d\u8b49\u8003\u8a66',
    revisionMap: '\u6eab\u7fd2\u7ae0\u7bc0',
    studyPoints: '\u91cd\u9ede\u5167\u5bb9',
    keyTerms: '\u95dc\u9375\u8a5e\u8207\u670d\u52d9',
    examTip: '\u61c9\u8a66\u63d0\u793a',
    commonMistakes: '\u5e38\u898b\u932f\u8aa4',
    domainWeight: '\u8a08\u5206\u5167\u5bb9',
    officialGuide: '\u5b98\u65b9 Exam Guide',
    verified: '\u5df2\u6838\u5c0d',
    revisionUnavailable: '\u91cd\u9ede\u5167\u5bb9\u6b63\u5728\u6574\u7406',
    revisionUnavailableBody: '\u9019\u5957\u8003\u8a66\u5df2\u63a5\u4e0a\u6eab\u7fd2\u9801\u67b6\u69cb\uff0c\u5c0d\u61c9\u7ae0\u7bc0\u5167\u5bb9\u6703\u5728\u5f8c\u7e8c\u5167\u5bb9\u66f4\u65b0\u52a0\u5165\u3002',
    section: '\u7ae0\u7bc0',
    exams: '\u5834\u8003\u8a66',
    foundational: '\u57fa\u790e\u7d1a',
    foundationalHint: '\u81ea\u6700\u57fa\u790e\u7684 AWS \u6982\u5ff5\u8207\u670d\u52d9',
    associate: '\u52a9\u7406\u7d1a',
    associateHint: '\u4ee5\u89d2\u8272\u70ba\u57fa\u790e\u7684\u5be6\u52d9\u6280\u80fd',
    advanced: '\u5c08\u696d\u7d1a\u8207\u5c08\u9805\u8a8d\u8b49',
    advancedHint: '\u9032\u968e\u67b6\u69cb\u3001\u904b\u7dad\u8207\u5b89\u5168',
    appName: 'AWS 練習實驗室',
    subtitle: 'AWS 認證考試離線練習',
    certification: 'AWS 認證考試',
    chooseExam: '選擇考試',
    chooseExamHint: '每次都是全新的考試，並可隨時將整份考試切換為英文或中文。',
    start: '開始 65 題考試',
    startPractice: '開始練習',
    examSettings: '考試設定',
    examSettingsHint: '選擇今次練習方式，關閉分頁後不會保存任何紀錄。',
    examMode: '練習模式',
    fullExam: '完整模擬考試',
    fullExamHint: '使用正式題數與 Domain 比例',
    quickExam: '快速 10 題',
    quickExamHint: '從整份考試隨機抽取十題',
    domainPractice: '指定 Domain 練習',
    domainPracticeHint: '集中練習一個考試 Domain',
    chooseDomain: '選擇 Domain',
    questionCount: '題目數量',
    timedExam: '啟用計時器',
    shuffleQuestions: '隨機排列題目',
    shuffleOptions: '隨機排列選項',
    enabled: '已啟用',
    disabled: '已停用',
    untimed: '不計時',
    questions: '題',
    minutes: '分鐘',
    passRule: '練習及格線：原始分數 75%',
    loading: '正在載入本機題庫...',
    question: '題目',
    answered: '已作答',
    single: '選擇一個答案',
    multi: '選擇所有符合的答案',
    ordering: '由第一步排到最後一步',
    matching: '配對每個項目',
    previous: '上一題',
    next: '下一題',
    finish: '完成考試',
    submit: '提交考試',
    backToHome: '選擇其他考試',
    newExam: '重新開始考試',
    results: '考試結果',
    correct: '答對',
    score: '原始分數',
    passed: '練習通過',
    notPassed: '繼續練習',
    review: '檢視答錯題目',
    incorrectCount: '答錯題目',
    domainPerformance: 'Domain 表現',
    needsReview: '最需要重溫',
    incorrectServices: '錯題涉及的服務',
    noTaggedServices: '錯題沒有標記特定 AWS 服務。',
    retryIncorrect: '只重做錯題',
    correctOf: '答對',
    questionMap: '題目導覽',
    reviewAll: '檢視題目',
    selectQuestion: '選擇題目查看答案與解析。',
    correctStatus: '答對',
    incorrectStatus: '答錯',
    lightMode: '淺色模式',
    darkMode: '深色模式',
    allCorrect: '太好了，所有題目都答對了。',
    noIncorrect: '沒有答錯題目可以檢視。',
    explanation: '解析',
    yourAnswer: '你的答案',
    correctAnswer: '正確答案',
    notAnswered: '未作答',
    up: '上移',
    down: '下移',
    selectTarget: '選擇配對',
    yourOrder: '你的排序',
    orderingHint: '依照所需次序選擇下方選項。',
    optionsLabel: '選項',
    remove: '移除',
    language: '語言',
    timeLeft: '剩餘時間',
    loadingError: '無法載入本機題庫。',
    tryAgain: '再試一次',
    selected: '已選擇',
    select: '選擇',
    randomizedTitle: '隨機選題',
    randomizedBody: '每次考試都會從本機題庫重新選出題目。',
    englishContentTitle: '中英雙語內容',
    englishContentBody: '題目、選項、解析、溫習筆記與名詞專區都可切換為英文或繁體中文。',
    noHistoryTitle: '不保存紀錄',
    noHistoryBody: '答案只存在目前分頁，重新開始後就會清除。',
    ready: '已準備好。選擇上方考試後即可開始。',
    footer: 'MIT 授權的開源練習內容。不需要帳號，也不保存成績紀錄。',
    passMark: '75% 或以上',
    belowPassMark: '低於 75%',
    studyMode: '學習模式',
    certificationLevels: 'AWS 認證等級',
  },
} as const

type Labels = (typeof UI)[Language]

function emptyAnswer(type: QuestionType): AnswerValue {
  return type === 'single' ? '' : []
}

function hasAnswer(value: AnswerValue | undefined): boolean {
  return Array.isArray(value) ? value.length > 0 : Boolean(value)
}

function answerForQuestion(question: Question): AnswerValue {
  const type = getQuestionType(question)
  if (type === 'ordering') return question.correctOrder ?? []
  if (type === 'matching') {
    return Object.entries(question.correctMatches ?? {}).map(([key, target]) => `${key}:${target}`)
  }
  return question.answer
}

function localizeQuestion(question: Question, language: Language): Question {
  const translated = language === 'zh' ? question.translations?.zh : null
  if (!translated) return question
  return {
    ...question,
    question: translated.question,
    options: { ...question.options, ...translated.options },
    explanation: translated.explanation,
    targets: question.targets ? { ...question.targets, ...translated.targets } : undefined,
  }
}

function localizeTopic(topic: RevisionTopic, language: Language): RevisionTopic {
  if (language !== 'zh') return topic
  return { ...topic, ...topic.translations.zh }
}

function localizeDomainTitle(domain: RevisionDomain, language: Language): string {
  return language === 'zh' ? domain.translations.zh.title : domain.title
}

function localizedCertName(cert: Certification, language: Language): string {
  const guide = getRevisionGuide(cert.code)
  return language === 'zh' && guide ? guide.translations.zh.name : cert.name
}

function localizedRegistryDomainName(certCode: string, domainId: number, fallback: string, language: Language): string {
  const guideDomain = getRevisionGuide(certCode)?.domains.find(domain => domain.id === domainId)
  return guideDomain ? localizeDomainTitle(guideDomain, language) : fallback
}

function optionEntries(question: Question): [string, string][] {
  return Object.entries(question.options).filter(([, text]) => Boolean(text)) as [string, string][]
}

function answerText(question: Question, answer: AnswerValue, missingLabel: string): string {
  if (!hasAnswer(answer)) return missingLabel
  const type = getQuestionType(question)
  if (type === 'matching' && Array.isArray(answer)) {
    return answer.map(token => {
      const [key, target] = token.split(':')
      return `${key}: ${question.options[key as keyof Question['options']]} -> ${question.targets?.[target] ?? target}`
    }).join('; ')
  }
  if (Array.isArray(answer)) {
    return answer.map((key, index) => {
      const label = question.options[key as keyof Question['options']] ?? key
      return type === 'ordering' ? `${index + 1}. ${label}` : `${key}: ${label}`
    }).join('; ')
  }
  return `${answer}: ${question.options[answer as keyof Question['options']] ?? answer}`
}

function typeLabel(type: QuestionType, labels: Labels): string {
  if (type === 'single') return labels.single
  if (type === 'multi') return labels.multi
  if (type === 'ordering') return labels.ordering
  return labels.matching
}

function examCardClass(active = false): string {
  return `flex flex-col justify-between gap-6 rounded-2xl border p-6 transition ${
    active
      ? 'border-brand bg-brand/10 shadow-card'
      : 'border-border-hairline bg-bg-card hover:border-brand/60 hover:shadow-card'
  }`
}

function examGroup(level: Certification['level']): ExamGroup {
  if (level === 'foundational') return 'foundational'
  if (level === 'associate') return 'associate'
  return 'advanced'
}

function InlineGlossaryText({ text, onTermClick }: { text: string; onTermClick: (term: GlossaryTerm) => void }) {
  return <>{splitInlineGlossaryText(text).map((part, index) => part.term ? (
    <button
      key={`${part.term.id}-${index}`}
      type="button"
      onClick={() => onTermClick(part.term!)}
      className="inline font-semibold text-brand underline decoration-brand/40 underline-offset-2 transition hover:decoration-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {part.text}
    </button>
  ) : part.text)}</>
}

function servicesForQuestion(question: Question): string[] {
  if (question.services && question.services.length > 0) return question.services
  const text = [question.question, ...Object.values(question.options)].join(' ').toLocaleLowerCase()
  return GLOSSARY_TERMS.filter(item => {
    const aliases = [
      item.name,
      item.name.replace(/\s*\([^)]*\)/g, ''),
      item.id.length >= 3 ? item.id.replaceAll('-', ' ') : '',
    ].map(alias => alias.trim().toLocaleLowerCase()).filter(alias => alias.length >= 3)
    return aliases.some(alias => text.includes(alias))
  }).map(item => item.name)
}

export default function OfflineExamApp() {
  const [language, setLanguage] = useState<Language>('en')
  const [mode, setMode] = useState<AppMode>('mock')
  const [certId, setCertId] = useState('clf-c02')
  const [revisionCertId, setRevisionCertId] = useState('clf-c02')
  const [screen, setScreen] = useState<ExamScreen>('home')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [results, setResults] = useState<QuestionResult[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [error, setError] = useState(false)
  const [examSettings, setExamSettings] = useState<ExamSettings>(DEFAULT_EXAM_SETTINGS)

  const labels = UI[language]
  const cert = CERTIFICATIONS[certId]
  const currentQuestion = questions[questionIndex]
  const displayQuestion = currentQuestion ? localizeQuestion(currentQuestion, language) : null
  const answeredCount = questions.filter(question => hasAnswer(answers[question.id])).length
  const changeMode = (nextMode: AppMode) => {
    setMode(nextMode)
    setScreen(currentScreen => screenAfterModeChange(nextMode, currentScreen))
  }

  const startExam = useCallback(async (nextCertId = certId) => {
    const nextCert = CERTIFICATIONS[nextCertId]
    if (!nextCert) return
    setCertId(nextCertId)
    setScreen('loading')
    setError(false)
    try {
      const bank = await loadAllQuestions(nextCertId)
      const selected = examSettings.preset === 'full'
        ? selectExamQuestions(bank, nextCert, examSettings.shuffleQuestions)
        : selectPracticeQuestions(
            bank,
            examSettings.preset === 'quick' ? 10 : examSettings.domainQuestionCount,
            examSettings.preset === 'domain' ? examSettings.domainId : undefined,
            examSettings.shuffleQuestions,
          )
      const prepared = examSettings.shuffleOptions ? shuffleAndMapQuestions(selected).questions : selected
      setQuestions(prepared)
      setAnswers({})
      setResults([])
      setQuestionIndex(0)
      const secondsPerQuestion = nextCert.examTimeSeconds / nextCert.examQuestionCount
      setTimeLeft(Math.max(60, Math.round(secondsPerQuestion * prepared.length)))
      setScreen('exam')
    } catch {
      setError(true)
      setScreen('home')
    }
  }, [certId, examSettings])

  const retryIncorrectQuestions = useCallback(() => {
    const incorrect = results.filter(result => !result.isCorrect).map(result => result.question)
    if (incorrect.length === 0) return
    const ordered = examSettings.shuffleQuestions ? fisherYatesShuffle(incorrect) : incorrect
    const prepared = examSettings.shuffleOptions ? shuffleAndMapQuestions(ordered).questions : ordered
    setQuestions(prepared)
    setAnswers({})
    setResults([])
    setQuestionIndex(0)
    const secondsPerQuestion = cert.examTimeSeconds / cert.examQuestionCount
    setTimeLeft(Math.max(60, Math.round(secondsPerQuestion * prepared.length)))
    setScreen('exam')
  }, [cert.examQuestionCount, cert.examTimeSeconds, examSettings.shuffleOptions, examSettings.shuffleQuestions, results])

  const finishExam = useCallback(() => {
    const evaluated = questions.map(question => {
      const type = getQuestionType(question)
      const userAnswer = answers[question.id] ?? emptyAnswer(type)
      const correctAnswer = answerForQuestion(question)
      return {
        question,
        userAnswer,
        correctAnswer,
        isCorrect: isAnswerCorrect(userAnswer, correctAnswer, type),
      }
    })
    setResults(evaluated)
    setScreen('results')
    setQuestionIndex(0)
  }, [answers, questions])

  useEffect(() => {
    if (mode !== 'mock' || screen !== 'exam' || !examSettings.timed) return
    const interval = window.setInterval(() => {
      setTimeLeft(value => Math.max(0, value - 1))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [examSettings.timed, mode, screen])

  useEffect(() => {
    if (mode !== 'mock' || screen !== 'exam' || !examSettings.timed || timeLeft !== 0 || questions.length === 0) return
    const timeout = window.setTimeout(finishExam, 0)
    return () => window.clearTimeout(timeout)
  }, [examSettings.timed, finishExam, mode, questions.length, screen, timeLeft])

  const updateAnswer = (value: AnswerValue) => {
    if (!currentQuestion) return
    setAnswers(previous => ({ ...previous, [currentQuestion.id]: value }))
  }

  const selectSingle = (key: string) => updateAnswer(key)

  const toggleMulti = (key: string) => {
    if (!currentQuestion) return
    const current = answers[currentQuestion.id]
    const selected = Array.isArray(current) ? current : []
    updateAnswer(selected.includes(key) ? selected.filter(item => item !== key) : [...selected, key])
  }

  const toggleOrder = (key: string) => {
    if (!currentQuestion) return
    const current = answers[currentQuestion.id]
    const selected = Array.isArray(current) ? current : []
    updateAnswer(selected.includes(key) ? selected.filter(item => item !== key) : [...selected, key])
  }

  const moveOrder = (from: number, direction: -1 | 1) => {
    if (!currentQuestion) return
    const current = answers[currentQuestion.id]
    const selected = Array.isArray(current) ? [...current] : []
    const target = from + direction
    if (target < 0 || target >= selected.length) return
    ;[selected[from], selected[target]] = [selected[target], selected[from]]
    updateAnswer(selected)
  }

  const setMatch = (key: string, target: string) => {
    if (!currentQuestion) return
    const current = answers[currentQuestion.id]
    const selected = Array.isArray(current) ? current.filter(token => !token.startsWith(`${key}:`)) : []
    if (target) selected.push(`${key}:${target}`)
    updateAnswer(selected)
  }

  const resultSummary = useMemo(() => {
    const correct = results.filter(result => result.isCorrect).length
    const percent = results.length === 0 ? 0 : Math.round((correct / results.length) * 100)
    return { correct, percent, passed: percent >= PRACTICE_PASS_PERCENT }
  }, [results])

  if (mode === 'revision') {
    return (
      <Shell language={language} setLanguage={setLanguage} labels={labels} mode={mode} setMode={changeMode}>
        <RevisionView language={language} labels={labels} certId={revisionCertId} onSelect={setRevisionCertId} />
      </Shell>
    )
  }

  if (mode === 'glossary') {
    return (
      <Shell language={language} setLanguage={setLanguage} labels={labels} mode={mode} setMode={changeMode}>
        <GlossaryView language={language} labels={labels} />
      </Shell>
    )
  }

  if (screen === 'loading') {
    return <Shell language={language} setLanguage={setLanguage} labels={labels} mode={mode} setMode={changeMode}><LoadingView labels={labels} /></Shell>
  }

  if (screen === 'results') {
    return (
      <Shell language={language} setLanguage={setLanguage} labels={labels} mode={mode} setMode={changeMode}>
        <ResultsView
          labels={labels}
          cert={cert}
          results={results}
          language={language}
          summary={resultSummary}
          onNewExam={() => void startExam(certId)}
          onRetryIncorrect={retryIncorrectQuestions}
          onHome={() => setScreen('home')}
        />
      </Shell>
    )
  }

  if (screen === 'exam' && currentQuestion && displayQuestion) {
    const type = getQuestionType(currentQuestion)
    const currentAnswer = answers[currentQuestion.id] ?? emptyAnswer(type)
    return (
      <Shell language={language} setLanguage={setLanguage} labels={labels} mode={mode} setMode={changeMode} compact>
        <div className="mx-auto w-full max-w-5xl px-4 py-5 md:px-8 md:py-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-hairline bg-bg-card px-4 py-3 md:px-6">
            <div>
              <p className="text-sm font-semibold text-text-primary">{cert.shortName} {labels.question} {questionIndex + 1} / {questions.length}</p>
              <p className="text-xs text-text-muted">{answeredCount} {labels.answered}</p>
            </div>
            {examSettings.timed ? (
              <div className={`font-mono text-lg font-bold ${timeLeft < 300 ? 'text-danger' : 'text-text-primary'}`} aria-label={`${labels.timeLeft}: ${formatTime(timeLeft)}`}>
                {labels.timeLeft}: {formatTime(timeLeft)}
              </div>
            ) : <span className="rounded-full bg-brand/15 px-3 py-1.5 text-xs font-bold text-brand">{labels.untimed}</span>}
          </div>

          <div className="mb-5 flex flex-wrap gap-1.5" aria-label={labels.questionMap}>
            {questions.map((question, index) => (
              <button
                key={question.id}
                type="button"
                onClick={() => setQuestionIndex(index)}
                aria-label={`${labels.question} ${index + 1}`}
                aria-current={index === questionIndex ? 'step' : undefined}
                className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${index === questionIndex ? 'bg-brand text-on-brand' : hasAnswer(answers[question.id]) ? 'bg-success/15 text-success' : 'bg-bg-card text-text-muted hover:bg-bg-card-hover'}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <article className="rounded-2xl border border-border-hairline bg-bg-card p-5 shadow-card md:p-8">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-bold tracking-wide text-text-primary">{typeLabel(type, labels)}</span>
            </div>
            <h1 className="cc-question-stem text-xl font-semibold leading-relaxed text-text-primary md:text-2xl">{displayQuestion.question}</h1>
            <div className="mt-7">
              {type === 'single' && <SingleAnswer question={displayQuestion} value={currentAnswer} onSelect={selectSingle} />}
              {type === 'multi' && <MultiAnswer question={displayQuestion} value={currentAnswer} onToggle={toggleMulti} />}
              {type === 'ordering' && <OrderingAnswer question={displayQuestion} value={currentAnswer} onToggle={toggleOrder} onMove={moveOrder} labels={labels} />}
              {type === 'matching' && <MatchingAnswer question={displayQuestion} value={currentAnswer} onSelect={setMatch} labels={labels} />}
            </div>
          </article>

          <div className="mt-5 flex flex-wrap justify-between gap-3">
            <button type="button" onClick={() => setQuestionIndex(index => Math.max(0, index - 1))} disabled={questionIndex === 0} className="rounded-xl border border-border-hairline px-5 py-3 text-sm font-semibold text-text-primary disabled:cursor-not-allowed disabled:opacity-40">{labels.previous}</button>
            {questionIndex < questions.length - 1 ? (
              <button type="button" onClick={() => setQuestionIndex(index => Math.min(questions.length - 1, index + 1))} className="rounded-xl bg-brand px-5 py-3 text-sm font-bold text-on-brand">{labels.next}</button>
            ) : (
              <button type="button" onClick={finishExam} className="rounded-xl bg-brand px-5 py-3 text-sm font-bold text-on-brand">{labels.submit}</button>
            )}
          </div>
        </div>
      </Shell>
    )
  }

  return (
    <Shell language={language} setLanguage={setLanguage} labels={labels} mode={mode} setMode={changeMode}>
      <HomeView
        language={language}
        labels={labels}
        certId={certId}
        onSelect={nextCertId => {
          setCertId(nextCertId)
          setExamSettings(previous => ({ ...previous, domainId: CERTIFICATIONS[nextCertId]?.domains[0]?.id ?? 1 }))
        }}
        onStart={() => void startExam(certId)}
        settings={examSettings}
        onSettingsChange={setExamSettings}
        error={error}
      />
    </Shell>
  )
}

function Shell({
  language,
  setLanguage,
  labels,
  mode,
  setMode,
  compact = false,
  children,
}: {
  language: Language
  setLanguage: (language: Language) => void
  labels: Labels
  mode: AppMode
  setMode: (mode: AppMode) => void
  compact?: boolean
  children: ReactNode
}) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary">
      <header className="sticky top-0 z-20 border-b border-border-hairline bg-bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
          <button type="button" onClick={() => setMode('mock')} className="min-w-0 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand">
            <p className="text-base font-bold tracking-tight text-text-primary">{labels.appName}</p>
            {!compact && <p className="hidden text-xs text-text-muted sm:block">{labels.subtitle}</p>}
          </button>
          <nav className="order-3 flex w-full rounded-xl border border-border-hairline bg-bg-dark p-1 sm:order-none sm:w-auto" aria-label={labels.studyMode}>
            <button
              type="button"
              onClick={() => setMode('mock')}
              aria-current={mode === 'mock' ? 'page' : undefined}
              className={`flex-1 rounded-lg px-4 py-2 text-xs font-bold transition sm:flex-none ${mode === 'mock' ? 'bg-brand text-on-brand shadow-card' : 'text-text-muted hover:bg-bg-card-hover hover:text-text-primary'}`}
            >
              {labels.mockExam}
            </button>
            <button
              type="button"
              onClick={() => setMode('revision')}
              aria-current={mode === 'revision' ? 'page' : undefined}
              className={`flex-1 rounded-lg px-4 py-2 text-xs font-bold transition sm:flex-none ${mode === 'revision' ? 'bg-brand text-on-brand shadow-card' : 'text-text-muted hover:bg-bg-card-hover hover:text-text-primary'}`}
            >
              {labels.revision}
            </button>
            <button
              type="button"
              onClick={() => setMode('glossary')}
              aria-current={mode === 'glossary' ? 'page' : undefined}
              className={`flex-1 rounded-lg px-4 py-2 text-xs font-bold transition sm:flex-none ${mode === 'glossary' ? 'bg-brand text-on-brand shadow-card' : 'text-text-muted hover:bg-bg-card-hover hover:text-text-primary'}`}
            >
              {labels.glossary}
            </button>
          </nav>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? labels.lightMode : labels.darkMode}
              title={theme === 'dark' ? labels.lightMode : labels.darkMode}
              aria-pressed={theme === 'dark'}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition hover:bg-bg-card-hover hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            </button>
            <span className="sr-only">{labels.language}</span>
            <button type="button" onClick={() => setLanguage('en')} aria-pressed={language === 'en'} className={`rounded-lg px-2.5 py-1.5 font-semibold ${language === 'en' ? 'bg-brand text-on-brand' : 'text-text-muted hover:bg-bg-card-hover'}`}>EN</button>
            <button type="button" onClick={() => setLanguage('zh')} aria-pressed={language === 'zh'} className={`rounded-lg px-2.5 py-1.5 font-semibold ${language === 'zh' ? 'bg-brand text-on-brand' : 'text-text-muted hover:bg-bg-card-hover'}`}>中文</button>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-text-muted md:px-8">{labels.footer}</footer>
    </div>
  )
}

function GlossaryView({ language, labels }: { language: Language; labels: Labels }) {
  const [categoryId, setCategoryId] = useState<'all' | GlossaryCategoryId>('all')
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const visibleTerms = useMemo(() => GLOSSARY_TERMS.filter(item => {
    if (categoryId !== 'all' && item.categoryId !== categoryId) return false
    if (!normalizedQuery) return true
    const searchText = [
      item.name,
      item.description,
      item.translations.zh.name,
      item.translations.zh.description,
    ].join(' ').toLocaleLowerCase()
    return searchText.includes(normalizedQuery)
  }), [categoryId, normalizedQuery])
  const activeCategory = categoryId === 'all'
    ? null
    : GLOSSARY_CATEGORIES.find(category => category.id === categoryId) ?? null
  const activeCategoryContent = activeCategory
    ? language === 'zh' ? activeCategory.translations.zh : activeCategory
    : null

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <div className="max-w-3xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-text-muted">{labels.glossary}</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-5xl">{labels.glossaryTitle}</h1>
        <p className="mt-4 text-base leading-relaxed text-text-muted md:text-lg">{labels.glossaryHint}</p>
      </div>

      <label className="mt-8 block max-w-2xl">
        <span className="sr-only">{labels.glossarySearchLabel}</span>
        <input
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder={labels.glossarySearch}
          className="w-full rounded-xl border border-border-hairline bg-bg-card px-4 py-3.5 text-sm text-text-primary shadow-card outline-none placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
      </label>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label={labels.glossaryTitle}>
        <button
          type="button"
          role="tab"
          aria-selected={categoryId === 'all'}
          onClick={() => setCategoryId('all')}
          className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${categoryId === 'all' ? 'border-brand bg-brand text-on-brand shadow-card' : 'border-border-hairline bg-bg-card text-text-muted hover:border-brand/60 hover:text-text-primary'}`}
        >
          {labels.glossaryAll} <span className="ml-1 opacity-75">{GLOSSARY_TERMS.length}</span>
        </button>
        {GLOSSARY_CATEGORIES.map(category => {
          const content = language === 'zh' ? category.translations.zh : category
          const count = GLOSSARY_TERMS.filter(item => item.categoryId === category.id).length
          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={categoryId === category.id}
              onClick={() => setCategoryId(category.id)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${categoryId === category.id ? 'border-brand bg-brand text-on-brand shadow-card' : 'border-border-hairline bg-bg-card text-text-muted hover:border-brand/60 hover:text-text-primary'}`}
            >
              {content.name} <span className="ml-1 opacity-75">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-9 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">{activeCategoryContent?.name ?? labels.glossaryAll}</h2>
          {activeCategoryContent && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-muted">{activeCategoryContent.description}</p>}
        </div>
        <span className="rounded-full bg-brand/15 px-3 py-1.5 text-xs font-bold text-brand">{visibleTerms.length} {labels.glossaryTerms}</span>
      </div>

      {visibleTerms.length === 0 ? (
        <p role="status" className="mt-6 rounded-2xl border border-dashed border-border-hairline bg-bg-card p-8 text-center text-sm text-text-muted">{labels.glossaryEmpty}</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTerms.map(item => {
            const content = language === 'zh' ? item.translations.zh : item
            const category = GLOSSARY_CATEGORIES.find(entry => entry.id === item.categoryId)
            const categoryContent = category && (language === 'zh' ? category.translations.zh : category)
            return (
              <article key={item.id} className="rounded-2xl border border-border-hairline bg-bg-card p-5 shadow-card">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand">{categoryContent?.name}</p>
                <h3 className="mt-3 text-lg font-bold leading-snug text-text-primary">{content.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">{content.description}</p>
              </article>
            )
          })}
        </div>
      )}

      <p className="mt-8 text-xs text-text-muted">
        <a
          href="https://docs.aws.amazon.com/whitepapers/latest/aws-overview/amazon-web-services-cloud-platform.html"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand hover:underline"
        >
          {labels.glossarySource}
        </a>
      </p>
    </div>
  )
}

function RevisionView({
  language,
  labels,
  certId,
  onSelect,
}: {
  language: Language
  labels: Labels
  certId: string
  onSelect: (certId: string) => void
}) {
  const certs = CERTIFICATION_LIST.filter(cert => cert.status === 'active' && cert.provider === 'aws')
  const cert = CERTIFICATIONS[certId] ?? CERTIFICATIONS['clf-c02']
  const guide = getRevisionGuide(cert.code)
  const [topicId, setTopicId] = useState('')
  const [tool, setTool] = useState<RevisionTool>('notes')
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<GlossaryTerm | null>(null)

  const topicEntries = guide?.domains.flatMap(domain =>
    domain.topics.map(topic => ({ domain, topic })),
  ) ?? []
  const foundIndex = topicEntries.findIndex(entry => entry.topic.id === topicId)
  const commonMistakesSelected = topicId === guide?.commonMistakes.id
  const selectedIndex = commonMistakesSelected ? topicEntries.length : foundIndex >= 0 ? foundIndex : 0
  const selectedEntry = commonMistakesSelected ? null : topicEntries[selectedIndex]
  const baseSelectedTopic = guide
    ? commonMistakesSelected ? guide.commonMistakes : selectedEntry?.topic ?? guide.domains[0].topics[0]
    : null
  const selectedTopic = baseSelectedTopic ? localizeTopic(baseSelectedTopic, language) : null
  const selectedDomain = selectedEntry?.domain ?? null
  const entryIds = [...topicEntries.map(entry => entry.topic.id), ...(guide ? [guide.commonMistakes.id] : [])]
  const groupedCerts: { id: ExamGroup; label: string; certs: Certification[] }[] = [
    { id: 'foundational', label: labels.foundational, certs: certs.filter(item => examGroup(item.level) === 'foundational') },
    { id: 'associate', label: labels.associate, certs: certs.filter(item => examGroup(item.level) === 'associate') },
    { id: 'advanced', label: labels.advanced, certs: certs.filter(item => examGroup(item.level) === 'advanced') },
  ]

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-text-muted">{labels.revision}</p>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-5xl">{labels.revisionTitle}</h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted md:text-lg">{labels.revisionHint}</p>
        </div>
        {tool === 'notes' && <label className="block w-full md:w-80">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-text-muted">{labels.chooseCertification}</span>
          <select
            value={cert.code}
            onChange={event => onSelect(event.target.value)}
            className="w-full rounded-xl border border-border-hairline bg-bg-card px-4 py-3 text-sm font-semibold text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            {groupedCerts.map(group => (
              <optgroup key={group.id} label={group.label}>
                {group.certs.map(item => <option key={item.code} value={item.code}>{item.shortName} - {localizedCertName(item, language)}</option>)}
              </optgroup>
            ))}
          </select>
        </label>}
      </div>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label={labels.revisionTitle}>
        {([
          ['notes', labels.revisionNotes],
          ['flashcards', labels.flashcards],
          ['comparisons', labels.comparisons],
          ['keywords', labels.keywordHints],
        ] as const).map(([nextTool, label]) => (
          <button
            key={nextTool}
            type="button"
            aria-current={tool === nextTool ? 'page' : undefined}
            onClick={() => setTool(nextTool)}
            className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${tool === nextTool ? 'border-brand bg-brand text-on-brand shadow-card' : 'border-border-hairline bg-bg-card text-text-muted hover:border-brand/60 hover:text-text-primary'}`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tool === 'notes' && (!guide ? (
        <section className="mt-10 rounded-2xl border border-border-hairline bg-bg-card p-6 shadow-card md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">{cert.shortName}</p>
          <h2 className="mt-3 text-2xl font-bold text-text-primary">{labels.revisionUnavailable}</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-text-muted">{labels.revisionUnavailableBody}</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {cert.domains.map(domain => (
              <div key={domain.id} className="rounded-xl border border-border-hairline bg-bg-dark p-4">
                <p className="text-xs font-bold text-brand">{domain.taskRange ?? `${domain.id}.1`}</p>
                <p className="mt-1 font-semibold text-text-primary">{localizedRegistryDomainName(cert.code, domain.id, domain.name, language)}</p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="mt-10 grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
          <aside className="self-start rounded-2xl border border-border-hairline bg-bg-card p-4 shadow-card lg:sticky lg:top-28">
            <div className="flex items-center justify-between gap-3 px-2 pb-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">{labels.revisionMap}</p>
                <p className="mt-1 font-bold text-text-primary">{cert.shortName}</p>
              </div>
              <span className="rounded-full bg-brand/15 px-2.5 py-1 text-xs font-bold text-brand">{entryIds.length}</span>
            </div>
            <div className="max-h-[62vh] space-y-4 overflow-y-auto pr-1">
              {guide.domains.map(domain => (
                <div key={domain.id}>
                  <div className="mb-2 flex items-start justify-between gap-2 px-2">
                    <p className="text-sm font-semibold leading-snug text-text-primary">{domain.id}. {localizeDomainTitle(domain, language)}</p>
                    <span className="shrink-0 text-xs text-text-muted">{domain.weight}%</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {domain.topics.map(topic => (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => setTopicId(topic.id)}
                        aria-current={!commonMistakesSelected && topic.id === selectedEntry?.topic.id ? 'step' : undefined}
                        title={localizeTopic(topic, language).title}
                        className={`rounded-lg px-2 py-2 text-xs font-bold transition ${!commonMistakesSelected && topic.id === selectedEntry?.topic.id ? 'bg-brand text-on-brand' : 'bg-bg-dark text-text-muted hover:bg-bg-card-hover hover:text-text-primary'}`}
                      >
                        {topic.id}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setTopicId(guide.commonMistakes.id)}
                aria-current={commonMistakesSelected ? 'step' : undefined}
                className={`w-full rounded-xl border px-3 py-3 text-left text-sm font-bold transition ${commonMistakesSelected ? 'border-danger bg-danger/15 text-danger' : 'border-danger/30 bg-danger/5 text-text-primary hover:bg-danger/10'}`}
              >
                {labels.commonMistakes}
              </button>
            </div>
          </aside>

          {selectedTopic && (
            <div>
              <article className="rounded-2xl border border-border-hairline bg-bg-card p-5 shadow-card md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${commonMistakesSelected ? 'bg-danger text-white' : 'bg-brand text-on-brand'}`}>
                      {commonMistakesSelected ? labels.commonMistakes : `${labels.section} ${selectedTopic.id}`}
                    </span>
                    {selectedDomain && <span className="text-sm text-text-muted">{selectedDomain.weight}% {labels.domainWeight}</span>}
                  </div>
                  <span className="text-xs font-semibold text-text-muted">{selectedIndex + 1} / {entryIds.length}</span>
                </div>
                {selectedDomain && <p className="mt-5 text-sm font-semibold text-brand">{localizeDomainTitle(selectedDomain, language)}</p>}
                <h2 className={`${selectedDomain ? 'mt-2' : 'mt-5'} text-2xl font-bold leading-tight text-text-primary md:text-3xl`}>{selectedTopic.title}</h2>
                <p className="mt-4 text-base leading-relaxed text-text-muted"><InlineGlossaryText text={selectedTopic.summary} onTermClick={setSelectedGlossaryTerm} /></p>

                <section className="mt-8">
                  <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-text-muted">{labels.studyPoints}</h3>
                  <ul className="mt-4 space-y-3">
                    {selectedTopic.points.map(point => (
                      <li key={point} className="flex gap-3 rounded-xl border border-border-hairline bg-bg-dark p-4 text-sm leading-relaxed text-text-primary">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                        <span><InlineGlossaryText text={point} onTermClick={setSelectedGlossaryTerm} /></span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="mt-8">
                  <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-text-muted">{labels.keyTerms}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedTopic.keyTerms.map(term => <span key={term} className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-text-primary">{term}</span>)}
                  </div>
                </section>

                <section className="mt-8 rounded-xl border border-brand/30 bg-brand/10 p-4">
                  <h3 className="text-sm font-bold text-text-primary">{labels.examTip}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-primary"><InlineGlossaryText text={selectedTopic.examTip} onTermClick={setSelectedGlossaryTerm} /></p>
                </section>
              </article>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setTopicId(entryIds[Math.max(0, selectedIndex - 1)])}
                  disabled={selectedIndex === 0}
                  className="rounded-xl border border-border-hairline px-5 py-3 text-sm font-semibold text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {labels.previous}
                </button>
                <button
                  type="button"
                  onClick={() => setTopicId(entryIds[Math.min(entryIds.length - 1, selectedIndex + 1)])}
                  disabled={selectedIndex === entryIds.length - 1}
                  className="rounded-xl bg-brand px-5 py-3 text-sm font-bold text-on-brand disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {labels.next}
                </button>
              </div>

              <p className="mt-6 text-xs text-text-muted">
                {labels.verified}: {guide.verified} · <a href={guide.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand hover:underline">{labels.officialGuide}</a>
              </p>
            </div>
          )}
        </div>
      ))}

      {tool === 'flashcards' && <FlashcardsView language={language} labels={labels} />}
      {tool === 'comparisons' && <ComparisonsView language={language} labels={labels} />}
      {tool === 'keywords' && <KeywordHintsView language={language} labels={labels} />}
      {selectedGlossaryTerm && <GlossaryTermDialog term={selectedGlossaryTerm} language={language} labels={labels} onClose={() => setSelectedGlossaryTerm(null)} />}
    </div>
  )
}

function FlashcardsView({ language, labels }: { language: Language; labels: Labels }) {
  const [categoryId, setCategoryId] = useState<'all' | GlossaryCategoryId>('all')
  const [cardIndex, setCardIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const cards = useMemo(
    () => categoryId === 'all' ? GLOSSARY_TERMS : GLOSSARY_TERMS.filter(item => item.categoryId === categoryId),
    [categoryId],
  )
  const card = cards[Math.min(cardIndex, cards.length - 1)] ?? GLOSSARY_TERMS[0]
  const content = language === 'zh' ? card.translations.zh : card
  const category = GLOSSARY_CATEGORIES.find(item => item.id === card.categoryId)
  const categoryContent = category && (language === 'zh' ? category.translations.zh : category)

  const changeCard = (nextIndex: number) => {
    setCardIndex((nextIndex + cards.length) % cards.length)
    setRevealed(false)
  }

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-text-primary md:text-3xl">{labels.flashcards}</h2>
          <p className="mt-3 leading-relaxed text-text-muted">{labels.flashcardsHint}</p>
        </div>
        <label className="block w-full md:w-72">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-text-muted">{labels.chooseCategory}</span>
          <select
            value={categoryId}
            onChange={event => {
              setCategoryId(event.target.value as 'all' | GlossaryCategoryId)
              setCardIndex(0)
              setRevealed(false)
            }}
            className="w-full rounded-xl border border-border-hairline bg-bg-card px-4 py-3 text-sm font-semibold text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="all">{labels.allCategories}</option>
            {GLOSSARY_CATEGORIES.map(item => <option key={item.id} value={item.id}>{language === 'zh' ? item.translations.zh.name : item.name}</option>)}
          </select>
        </label>
      </div>

      <article className="mx-auto mt-8 max-w-3xl rounded-3xl border border-brand/40 bg-bg-card p-6 text-center shadow-card md:p-10">
        <div className="flex items-center justify-between gap-3 text-xs font-bold text-text-muted">
          <span>{categoryContent?.name}</span>
          <span>{cardIndex + 1} / {cards.length}</span>
        </div>
        <h3 className="mt-10 text-2xl font-bold text-text-primary md:text-4xl">{content.name}</h3>
        {!revealed ? (
          <div className="mt-10">
            <p className="text-sm text-text-muted">{labels.tapToReveal}</p>
            <button type="button" onClick={() => setRevealed(true)} className="mt-5 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-on-brand">{labels.showAnswer}</button>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-brand/30 bg-brand/10 p-5 text-left">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">{labels.serviceFunction}</p>
            <p className="mt-3 text-base leading-relaxed text-text-primary">{content.description}</p>
          </div>
        )}
      </article>

      <div className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => changeCard(cardIndex - 1)} className="rounded-xl border border-border-hairline px-4 py-2.5 text-sm font-semibold text-text-primary">{labels.previousCard}</button>
        <button type="button" onClick={() => changeCard(Math.floor(Math.random() * cards.length))} className="rounded-xl border border-brand/40 bg-brand/10 px-4 py-2.5 text-sm font-bold text-text-primary">{labels.randomCard}</button>
        <button type="button" onClick={() => changeCard(cardIndex + 1)} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-on-brand">{labels.nextCard}</button>
      </div>
    </section>
  )
}

function ComparisonsView({ language, labels }: { language: Language; labels: Labels }) {
  return (
    <section className="mt-8">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold text-text-primary md:text-3xl">{labels.comparisons}</h2>
        <p className="mt-3 leading-relaxed text-text-muted">{labels.comparisonsHint}</p>
      </div>
      <div className="mt-8 space-y-6">
        {STUDY_COMPARISONS.map(comparison => {
          const heading = language === 'zh' ? comparison.translations.zh : comparison
          return (
            <article key={comparison.id} className="overflow-hidden rounded-2xl border border-border-hairline bg-bg-card shadow-card">
              <div className="p-5 md:p-7">
                <h3 className="text-xl font-bold text-text-primary">{heading.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{heading.summary}</p>
              </div>
              <div className="overflow-x-auto border-t border-border-hairline">
                <table className="w-full min-w-[42rem] text-left text-sm">
                  <thead className="bg-bg-dark text-xs uppercase tracking-wide text-text-muted">
                    <tr><th className="px-5 py-3">AWS</th><th className="px-5 py-3">{labels.comparisonPurpose}</th><th className="px-5 py-3">{labels.comparisonRemember}</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border-hairline">
                    {comparison.items.map(item => {
                      const content = language === 'zh' ? item.translations.zh : item
                      return <tr key={item.name}><th className="px-5 py-4 font-bold text-text-primary">{content.name}</th><td className="px-5 py-4 leading-relaxed text-text-muted">{content.purpose}</td><td className="px-5 py-4 leading-relaxed text-text-primary">{content.remember}</td></tr>
                    })}
                  </tbody>
                </table>
              </div>
              {comparison.sourceUrl && <p className="border-t border-border-hairline px-5 py-3 text-xs text-text-muted"><a href={comparison.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand hover:underline">{labels.officialDecisionGuide}</a></p>}
            </article>
          )
        })}
      </div>
    </section>
  )
}

function KeywordHintsView({ language, labels }: { language: Language; labels: Labels }) {
  return (
    <section className="mt-8">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold text-text-primary md:text-3xl">{labels.keywordHints}</h2>
        <p className="mt-3 leading-relaxed text-text-muted">{labels.keywordHintsHint}</p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {EXAM_KEYWORD_HINTS.map(hint => {
          const content = language === 'zh' ? hint.translations.zh : hint
          return (
            <article key={hint.id} className="rounded-2xl border border-border-hairline bg-bg-card p-5 shadow-card">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted">{labels.keywordCue}</p>
              <h3 className="mt-2 text-lg font-bold text-text-primary">“{content.phrase}”</h3>
              <div className="mt-4 rounded-xl bg-brand/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-brand">{labels.keywordThink}</p>
                <p className="mt-1 font-bold text-text-primary">{content.thinkOf}</p>
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-text-muted">{labels.keywordWhy}</p>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{content.reason}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function GlossaryTermDialog({ term, language, labels, onClose }: { term: GlossaryTerm; language: Language; labels: Labels; onClose: () => void }) {
  const content = language === 'zh' ? term.translations.zh : term
  const category = GLOSSARY_CATEGORIES.find(item => item.id === term.categoryId)
  const categoryName = category ? language === 'zh' ? category.translations.zh.name : category.name : ''
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="glossary-dialog-title">
      <article className="w-full max-w-lg rounded-2xl border border-border-hairline bg-bg-card p-6 shadow-card md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">{labels.relatedTerm} · {categoryName}</p>
            <h2 id="glossary-dialog-title" className="mt-3 text-2xl font-bold text-text-primary">{content.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label={labels.close} className="rounded-lg border border-border-hairline px-3 py-2 text-sm font-bold text-text-muted hover:text-text-primary">×</button>
        </div>
        <div className="mt-6 rounded-xl bg-brand/10 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-brand">{labels.serviceFunction}</p>
          <p className="mt-2 leading-relaxed text-text-primary">{content.description}</p>
        </div>
      </article>
    </div>
  )
}

function HomeView({
  language,
  labels,
  certId,
  onSelect,
  onStart,
  settings,
  onSettingsChange,
  error,
}: {
  language: Language
  labels: Labels
  certId: string
  onSelect: (certId: string) => void
  onStart: () => void
  settings: ExamSettings
  onSettingsChange: (settings: ExamSettings) => void
  error: boolean
}) {
  const certs = CERTIFICATION_LIST.filter(cert => cert.status === 'active' && cert.provider === 'aws')
  const selected = CERTIFICATIONS[certId]
  const [selectedGroup, setSelectedGroup] = useState<ExamGroup>(() => examGroup(selected?.level ?? 'foundational'))
  const groups: { id: ExamGroup; label: string; hint: string }[] = [
    { id: 'foundational', label: labels.foundational, hint: labels.foundationalHint },
    { id: 'associate', label: labels.associate, hint: labels.associateHint },
    { id: 'advanced', label: labels.advanced, hint: labels.advancedHint },
  ]
  const activeGroup = groups.find(group => group.id === selectedGroup) ?? groups[0]
  const visibleCerts = certs.filter(cert => examGroup(cert.level) === selectedGroup)
  const selectedQuestionCount = settings.preset === 'full'
    ? selected?.examQuestionCount ?? 65
    : settings.preset === 'quick' ? 10 : settings.domainQuestionCount
  const updateSetting = <K extends keyof ExamSettings>(key: K, value: ExamSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value })
  }
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8 md:py-16">
      <div className="max-w-3xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-text-muted">{labels.certification}</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-5xl">{labels.chooseExam}</h1>
        <p className="mt-4 text-base leading-relaxed text-text-muted md:text-lg">{labels.chooseExamHint}</p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3" role="tablist" aria-label={labels.certificationLevels}>
        {groups.map(group => (
          <button
            key={group.id}
            type="button"
            role="tab"
            aria-selected={group.id === selectedGroup}
            onClick={() => setSelectedGroup(group.id)}
            className={`rounded-2xl border p-5 text-left transition ${group.id === selectedGroup ? 'border-brand bg-brand/10 shadow-card' : 'border-border-hairline bg-bg-card hover:border-brand/60 hover:shadow-card'}`}
          >
            <span className="block text-lg font-bold text-text-primary">{group.label}</span>
            <span className="mt-1 block text-sm text-text-muted">{group.hint}</span>
          </button>
        ))}
      </div>
      <div className="mt-8" role="tabpanel" aria-label={activeGroup.label}>
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-bold text-text-primary">{activeGroup.label}</h2>
          <span className="text-sm text-text-muted">{visibleCerts.length} {labels.exams}</span>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {visibleCerts.map(cert => (
            <button key={cert.code} type="button" aria-label={`${cert.shortName} ${localizedCertName(cert, language)}`} onClick={() => { setSelectedGroup(examGroup(cert.level)); onSelect(cert.code) }} className={examCardClass(cert.code === certId)}>
              <span className="text-left">
                <span className="block text-xs font-bold uppercase tracking-widest text-text-muted">{cert.shortName}</span>
                <span className="mt-2 block text-xl font-bold text-text-primary">{localizedCertName(cert, language)}</span>
                <span className="mt-3 block text-sm leading-relaxed text-text-muted">{cert.domains.map(domain => localizedRegistryDomainName(cert.code, domain.id, domain.name, language)).join(' / ')}</span>
              </span>
              <span className="flex items-center justify-between gap-4 text-left text-xs text-text-muted">
                <span>{cert.examQuestionCount} {labels.questions} / {Math.round(cert.examTimeSeconds / 60)} {labels.minutes}</span>
                <span className={`rounded-full px-2 py-1 font-bold ${cert.code === certId ? 'bg-brand text-on-brand' : 'bg-bg-dark'}`}>{cert.code === certId ? labels.selected : labels.select}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <section className="mt-10 rounded-2xl border border-border-hairline bg-bg-card p-5 shadow-card md:p-7">
        <h2 className="text-xl font-bold text-text-primary">{labels.examSettings}</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">{labels.examSettingsHint}</p>

        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted">{labels.examMode}</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {([
              ['full', labels.fullExam, labels.fullExamHint],
              ['quick', labels.quickExam, labels.quickExamHint],
              ['domain', labels.domainPractice, labels.domainPracticeHint],
            ] as const).map(([preset, title, hint]) => (
              <button
                key={preset}
                type="button"
                aria-pressed={settings.preset === preset}
                onClick={() => updateSetting('preset', preset)}
                className={`rounded-xl border p-4 text-left transition ${settings.preset === preset ? 'border-brand bg-brand/10' : 'border-border-hairline bg-bg-dark hover:border-brand/60'}`}
              >
                <span className="block font-bold text-text-primary">{title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-text-muted">{hint}</span>
              </button>
            ))}
          </div>
        </div>

        {settings.preset === 'domain' && selected && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-text-muted">{labels.chooseDomain}</span>
              <select
                value={settings.domainId}
                onChange={event => updateSetting('domainId', Number(event.target.value))}
                className="w-full rounded-xl border border-border-hairline bg-bg-dark px-4 py-3 text-sm font-semibold text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                {selected.domains.map(domain => (
                  <option key={domain.id} value={domain.id}>{domain.id}. {localizedRegistryDomainName(selected.code, domain.id, domain.name, language)}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-text-muted">{labels.questionCount}</span>
              <select
                value={settings.domainQuestionCount}
                onChange={event => updateSetting('domainQuestionCount', Number(event.target.value) as PracticeCount)}
                className="w-full rounded-xl border border-border-hairline bg-bg-dark px-4 py-3 text-sm font-semibold text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                {[10, 20, 30].map(count => <option key={count} value={count}>{count} {labels.questions}</option>)}
              </select>
            </label>
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <SettingToggle label={labels.timedExam} enabledLabel={labels.enabled} disabledLabel={labels.disabled} value={settings.timed} onChange={value => updateSetting('timed', value)} />
          <SettingToggle label={labels.shuffleQuestions} enabledLabel={labels.enabled} disabledLabel={labels.disabled} value={settings.shuffleQuestions} onChange={value => updateSetting('shuffleQuestions', value)} />
          <SettingToggle label={labels.shuffleOptions} enabledLabel={labels.enabled} disabledLabel={labels.disabled} value={settings.shuffleOptions} onChange={value => updateSetting('shuffleOptions', value)} />
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="button" onClick={onStart} className="rounded-xl bg-brand px-6 py-3.5 text-sm font-bold text-on-brand shadow-card hover:bg-brand-hover">
          {settings.preset === 'full' ? labels.start.replace('65', String(selectedQuestionCount)) : `${labels.startPractice} ${selectedQuestionCount} ${labels.questions}`}
        </button>
        <span className="text-sm text-text-muted">{labels.passRule}</span>
      </div>
      {error && <p role="alert" className="mt-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{labels.loadingError} <button type="button" onClick={onStart} className="ml-2 font-bold underline">{labels.tryAgain}</button></p>}
      <div className="mt-14 grid gap-4 text-sm text-text-muted md:grid-cols-3">
        <InfoCard title={labels.randomizedTitle} body={labels.randomizedBody} />
        <InfoCard title={labels.englishContentTitle} body={labels.englishContentBody} />
        <InfoCard title={labels.noHistoryTitle} body={labels.noHistoryBody} />
      </div>
      <p className="mt-8 text-xs text-text-muted">{selected?.shortName} {labels.ready}</p>
    </div>
  )
}

function SettingToggle({ label, enabledLabel, disabledLabel, value, onChange }: { label: string; enabledLabel: string; disabledLabel: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      aria-pressed={value}
      onClick={() => onChange(!value)}
      className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition ${value ? 'border-brand bg-brand/10' : 'border-border-hairline bg-bg-dark'}`}
    >
      <span className="text-sm font-semibold text-text-primary">{label}</span>
      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${value ? 'bg-brand text-on-brand' : 'bg-bg-card text-text-muted'}`}>{value ? enabledLabel : disabledLabel}</span>
    </button>
  )
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return <div className="rounded-xl border border-border-hairline bg-bg-card p-4"><p className="font-semibold text-text-primary">{title}</p><p className="mt-1 leading-relaxed">{body}</p></div>
}

function LoadingView({ labels }: { labels: Labels }) {
  return <div className="flex min-h-[70vh] items-center justify-center px-4"><div className="rounded-2xl border border-border-hairline bg-bg-card px-8 py-10 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand/20 border-t-brand" /><p className="mt-5 text-sm text-text-muted">{labels.loading}</p></div></div>
}

function SingleAnswer({ question, value, onSelect }: { question: Question; value: AnswerValue; onSelect: (key: string) => void }) {
  return <div className="grid gap-3">{optionEntries(question).map(([key, text]) => <label key={key} className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${value === key ? 'border-brand bg-brand/10' : 'border-border-hairline hover:border-brand/50'}`}><input type="radio" name={question.id} aria-label={`${key}: ${text}`} checked={value === key} onChange={() => onSelect(key)} className="mt-1 accent-brand" /><span><span className="font-bold text-text-primary">{key}</span><span className="ml-2 text-text-primary">{text}</span></span></label>)}</div>
}

function MultiAnswer({ question, value, onToggle }: { question: Question; value: AnswerValue; onToggle: (key: string) => void }) {
  const selected = Array.isArray(value) ? value : []
  return <div className="grid gap-3">{optionEntries(question).map(([key, text]) => <label key={key} className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${selected.includes(key) ? 'border-brand bg-brand/10' : 'border-border-hairline hover:border-brand/50'}`}><input type="checkbox" aria-label={`${key}: ${text}`} checked={selected.includes(key)} onChange={() => onToggle(key)} className="mt-1 accent-brand" /><span><span className="font-bold text-text-primary">{key}</span><span className="ml-2 text-text-primary">{text}</span></span></label>)}</div>
}

function OrderingAnswer({ question, value, onToggle, onMove, labels }: { question: Question; value: AnswerValue; onToggle: (key: string) => void; onMove: (from: number, direction: -1 | 1) => void; labels: Labels }) {
  const selected = Array.isArray(value) ? value : []
  const remaining = optionEntries(question).filter(([key]) => !selected.includes(key))
  return <div className="space-y-5"><div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">{labels.yourOrder}</p><div className="grid gap-2">{selected.length === 0 && <p className="rounded-xl border border-dashed border-border-hairline p-4 text-sm text-text-muted">{labels.orderingHint}</p>}{selected.map((key, index) => <div key={key} className="flex items-center gap-2 rounded-xl border border-brand/50 bg-brand/10 p-3"><span className="w-7 text-center font-mono text-sm font-bold text-text-muted">{index + 1}</span><span className="flex-1 text-sm text-text-primary">{question.options[key as keyof Question['options']]}</span><button type="button" onClick={() => onMove(index, -1)} disabled={index === 0} aria-label={labels.up} className="rounded px-2 py-1 text-xs text-text-muted hover:bg-bg-card disabled:opacity-30">↑</button><button type="button" onClick={() => onMove(index, 1)} disabled={index === selected.length - 1} aria-label={labels.down} className="rounded px-2 py-1 text-xs text-text-muted hover:bg-bg-card disabled:opacity-30">↓</button><button type="button" onClick={() => onToggle(key)} aria-label={`${labels.remove} ${key}`} className="rounded px-2 py-1 text-xs text-danger hover:bg-danger/10">×</button></div>)}</div></div><div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">{labels.optionsLabel}</p><div className="grid gap-2">{remaining.map(([key, text]) => <button key={key} type="button" onClick={() => onToggle(key)} className="rounded-xl border border-border-hairline p-4 text-left text-sm hover:border-brand/50"><span className="mr-2 font-bold text-text-primary">{key}</span><span className="text-text-primary">{text}</span></button>)}</div></div></div>
}

function MatchingAnswer({ question, value, onSelect, labels }: { question: Question; value: AnswerValue; onSelect: (key: string, target: string) => void; labels: Labels }) {
  const selected = Array.isArray(value) ? value : []
  const map = Object.fromEntries(selected.map(token => token.split(':'))) as Record<string, string>
  return <div className="grid gap-3">{optionEntries(question).map(([key, text]) => <div key={key} className="rounded-xl border border-border-hairline p-4"><p className="text-sm text-text-primary"><span className="mr-2 font-bold">{key}</span>{text}</p><select value={map[key] ?? ''} onChange={event => onSelect(key, event.target.value)} className="mt-3 w-full rounded-lg border border-border-hairline bg-bg-dark px-3 py-2 text-sm text-text-primary"><option value="">{labels.selectTarget}</option>{Object.entries(question.targets ?? {}).map(([target, targetText]) => <option key={target} value={target}>{target}. {targetText}</option>)}</select></div>)}</div>
}

function ResultsView({ language, labels, cert, results, summary, onNewExam, onRetryIncorrect, onHome }: { language: Language; labels: Labels; cert: Certification; results: QuestionResult[]; summary: { correct: number; percent: number; passed: boolean }; onNewExam: () => void; onRetryIncorrect: () => void; onHome: () => void }) {
  const incorrect = results
    .map((result, index) => ({ result, index }))
    .filter(({ result }) => !result.isCorrect)
  const [selectedIndex, setSelectedIndex] = useState(incorrect[0]?.index ?? 0)
  const selectedResult = results[selectedIndex]
  const domainStats = cert.domains.map(domain => {
    const attempted = results.filter(result => result.question.domainId === domain.id)
    const correct = attempted.filter(result => result.isCorrect).length
    return {
      id: domain.id,
      name: localizedRegistryDomainName(cert.code, domain.id, domain.name, language),
      attempted: attempted.length,
      correct,
      percent: attempted.length === 0 ? 0 : Math.round((correct / attempted.length) * 100),
    }
  }).filter(domain => domain.attempted > 0)
  const weakestDomain = [...domainStats].sort((a, b) => a.percent - b.percent || b.attempted - a.attempted)[0]
  const taskStats = [...results.reduce((stats, result) => {
    const taskId = result.question.taskStatement
    if (!taskId) return stats
    const current = stats.get(taskId) ?? { attempted: 0, correct: 0 }
    current.attempted += 1
    if (result.isCorrect) current.correct += 1
    stats.set(taskId, current)
    return stats
  }, new Map<string, { attempted: number; correct: number }>()).entries()]
    .map(([id, stats]) => ({ id, ...stats, percent: Math.round((stats.correct / stats.attempted) * 100) }))
    .sort((a, b) => a.percent - b.percent || b.attempted - a.attempted)
  const weakestTask = taskStats[0]
  const weakestTaskTopic = getRevisionGuide(cert.code)?.domains.flatMap(domain => domain.topics).find(topic => topic.id === weakestTask?.id)
  const needsReviewLabel = weakestTask
    ? `${weakestTask.id} ${weakestTaskTopic ? localizeTopic(weakestTaskTopic, language).title : ''}`.trim()
    : weakestDomain ? `${weakestDomain.id}. ${weakestDomain.name}` : ''
  const serviceCounts = [...incorrect.reduce((counts, { result }) => {
    for (const service of servicesForQuestion(result.question)) counts.set(service, (counts.get(service) ?? 0) + 1)
    return counts
  }, new Map<string, number>()).entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 md:px-8 md:py-14">
      <div className="rounded-2xl border border-border-hairline bg-bg-card p-6 shadow-card md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">{cert.shortName}</p>
        <h1 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">{labels.results}</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-bg-dark p-4">
            <p className="text-xs text-text-muted">{labels.score}</p>
            <p className="mt-1 text-3xl font-bold text-text-primary">{summary.percent}%</p>
            <p className="text-xs text-text-muted">{summary.correct}/{results.length} {labels.correct}</p>
          </div>
          <div className={`rounded-xl p-4 ${summary.passed ? 'bg-success/15' : 'bg-danger/10'}`}>
            <p className="text-xs text-text-muted">{summary.passed ? labels.passed : labels.notPassed}</p>
            <p className="mt-1 text-xl font-bold text-text-primary">{summary.passed ? labels.passMark : labels.belowPassMark}</p>
          </div>
          <div className="rounded-xl bg-bg-dark p-4">
            <p className="text-xs text-text-muted">{labels.incorrectCount}</p>
            <p className="mt-1 text-3xl font-bold text-text-primary">{incorrect.length}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={onNewExam} className="rounded-xl bg-brand px-5 py-3 text-sm font-bold text-on-brand">{labels.newExam}</button>
          {incorrect.length > 0 && <button type="button" onClick={onRetryIncorrect} className="rounded-xl border border-danger/40 bg-danger/10 px-5 py-3 text-sm font-bold text-danger">{labels.retryIncorrect}</button>}
          <button type="button" onClick={onHome} className="rounded-xl border border-border-hairline px-5 py-3 text-sm font-semibold text-text-primary">{labels.backToHome}</button>
        </div>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
        <div className="rounded-2xl border border-border-hairline bg-bg-card p-5 shadow-card md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-text-primary">{labels.domainPerformance}</h2>
            {needsReviewLabel && <span className="rounded-full bg-danger/10 px-3 py-1 text-xs font-bold text-danger">{labels.needsReview}: {needsReviewLabel}</span>}
          </div>
          <div className="mt-5 space-y-4">
            {domainStats.map(domain => (
              <div key={domain.id}>
                <div className="flex items-end justify-between gap-4 text-sm">
                  <div><p className="font-semibold text-text-primary">{domain.id}. {domain.name}</p><p className="mt-1 text-xs text-text-muted">{domain.correct}/{domain.attempted} {labels.correctOf}</p></div>
                  <span className={`font-bold ${domain.percent >= PRACTICE_PASS_PERCENT ? 'text-success' : 'text-danger'}`}>{domain.percent}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-dark"><div className={`h-full rounded-full ${domain.percent >= PRACTICE_PASS_PERCENT ? 'bg-success' : 'bg-danger'}`} style={{ width: `${domain.percent}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border-hairline bg-bg-card p-5 shadow-card md:p-7">
          <h2 className="text-xl font-bold text-text-primary">{labels.incorrectServices}</h2>
          {serviceCounts.length === 0 ? <p className="mt-4 text-sm leading-relaxed text-text-muted">{labels.noTaggedServices}</p> : (
            <div className="mt-5 space-y-2">
              {serviceCounts.map(([service, count]) => (
                <div key={service} className="flex items-center justify-between gap-3 rounded-xl bg-bg-dark px-4 py-3"><span className="text-sm font-semibold text-text-primary">{service}</span><span className="rounded-full bg-danger/15 px-2.5 py-1 text-xs font-bold text-danger">{count}</span></div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{labels.questionMap}</h2>
            <p className="mt-2 text-sm text-text-muted">{labels.selectQuestion}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5" aria-label={labels.questionMap}>
          {results.map((result, index) => (
            <button
              key={result.question.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`${labels.question} ${index + 1}: ${result.isCorrect ? labels.correctStatus : labels.incorrectStatus}`}
              aria-pressed={selectedIndex === index}
              className={`h-9 w-9 rounded-lg border text-xs font-bold transition ${result.isCorrect ? 'border-success/60 bg-success/30 text-success hover:bg-success/45' : 'border-danger/60 bg-danger/30 text-danger hover:bg-danger/45'} ${selectedIndex === index ? 'ring-2 ring-brand ring-offset-2 ring-offset-bg-dark' : ''}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="mt-6">
          <h3 className="mb-3 text-lg font-bold text-text-primary">{labels.reviewAll}</h3>
          {selectedResult && <ReviewCard result={selectedResult} questionNumber={selectedIndex + 1} language={language} labels={labels} />}
        </div>
      </section>
    </div>
  )
}

function ReviewCard({ result, questionNumber, language, labels }: { result: QuestionResult; questionNumber: number; language: Language; labels: Labels }) {
  const statusClass = result.isCorrect ? 'text-success' : 'text-danger'
  const answerClass = result.isCorrect ? 'bg-success/10' : 'bg-danger/10'
  const question = localizeQuestion(result.question, language)
  return (
    <article className="rounded-2xl border border-border-hairline bg-bg-card p-5 md:p-7">
      <p className={`text-xs font-bold uppercase tracking-wide ${statusClass}`}>{labels.question} {questionNumber} - {result.isCorrect ? labels.correctStatus : labels.incorrectStatus}</p>
      <h3 className="mt-3 text-lg font-semibold leading-relaxed text-text-primary">{question.question}</h3>
      <div className="mt-5 grid gap-3 text-sm">
        <div className={`rounded-xl p-4 ${answerClass}`}>
          <p className="font-semibold text-text-primary">{labels.yourAnswer}</p>
          <p className="mt-1 text-text-muted">{answerText(question, result.userAnswer, labels.notAnswered)}</p>
        </div>
        <div className="rounded-xl bg-success/10 p-4">
          <p className="font-semibold text-text-primary">{labels.correctAnswer}</p>
          <p className="mt-1 text-text-muted">{answerText(question, result.correctAnswer, labels.notAnswered)}</p>
        </div>
      </div>
      <div className="mt-5 border-t border-border-hairline pt-5">
        <p className="font-semibold text-text-primary">{labels.explanation}</p>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-muted">{question.explanation}</p>
      </div>
    </article>
  )
}
