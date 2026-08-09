import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Moon, Sun } from 'lucide-react'
import type { Certification } from '../data/certifications'
import { CERTIFICATION_LIST, CERTIFICATIONS } from '../data/certifications'
import { loadAllQuestions } from '../data/questions'
import type { Question, QuestionType } from '../types'
import { formatTime, isAnswerCorrect, selectExamQuestions } from '../lib/scoring'
import { getQuestionType, shuffleAndMapQuestions } from '../lib/utils'
import { useTheme } from '../hooks/useTheme'

type Language = 'en' | 'zh'
type AnswerValue = string | string[]
type ExamScreen = 'home' | 'loading' | 'exam' | 'results'

interface QuestionResult {
  question: Question
  userAnswer: AnswerValue
  correctAnswer: AnswerValue
  isCorrect: boolean
}

const PRACTICE_PASS_PERCENT = 75

const UI = {
  en: {
    appName: 'AWS Practice Lab',
    subtitle: 'Offline practice for AWS certification exams',
    certification: 'AWS CERTIFICATION',
    chooseExam: 'Choose an exam',
    chooseExamHint: 'Every attempt is fresh. Questions and explanations stay in English.',
    start: 'Start 65-question exam',
    questions: 'questions',
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
    language: 'Language',
    timeLeft: 'Time left',
    loadingError: 'The local question bank could not be loaded.',
    tryAgain: 'Try again',
    selected: 'Selected',
    select: 'Select',
    randomizedTitle: 'Randomized',
    randomizedBody: 'A new set of questions is selected from the local bank for every attempt.',
    englishContentTitle: 'English content',
    englishContentBody: 'Question wording and explanations are kept in English for exam familiarity.',
    noHistoryTitle: 'No history',
    noHistoryBody: 'Your answers stay in the current tab and disappear when you start over.',
    ready: 'is ready. Choose the card above, then start whenever you are ready.',
    footer: 'MIT licensed open-source practice content. No account or score history required.',
  },
  zh: {
    appName: 'AWS 練習實驗室',
    subtitle: 'AWS 認證考試離線練習',
    certification: 'AWS 認證考試',
    chooseExam: '選擇考試',
    chooseExamHint: '每次都是全新的考試。題目與解析維持英文。',
    start: '開始 65 題考試',
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
    language: '語言',
    timeLeft: '剩餘時間',
    loadingError: '無法載入本機題庫。',
    tryAgain: '再試一次',
    selected: '已選擇',
    select: '選擇',
    randomizedTitle: '隨機選題',
    randomizedBody: '每次考試都會從本機題庫重新選出題目。',
    englishContentTitle: '英文內容',
    englishContentBody: '題目文字與解析維持英文，熟悉正式考試語境。',
    noHistoryTitle: '不保存紀錄',
    noHistoryBody: '答案只存在目前分頁，重新開始後就會清除。',
    ready: '已準備好。選擇上方考試後即可開始。',
    footer: 'MIT 授權的開源練習內容。不需要帳號，也不保存成績紀錄。',
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

export default function OfflineExamApp() {
  const [language, setLanguage] = useState<Language>('en')
  const [certId, setCertId] = useState('clf-c02')
  const [screen, setScreen] = useState<ExamScreen>('home')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [results, setResults] = useState<QuestionResult[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [error, setError] = useState(false)

  const labels = UI[language]
  const cert = CERTIFICATIONS[certId]
  const currentQuestion = questions[questionIndex]
  const answeredCount = questions.filter(question => hasAnswer(answers[question.id])).length

  const startExam = useCallback(async (nextCertId = certId) => {
    const nextCert = CERTIFICATIONS[nextCertId]
    if (!nextCert) return
    setCertId(nextCertId)
    setScreen('loading')
    setError(false)
    try {
      const bank = await loadAllQuestions(nextCertId)
      const selected = selectExamQuestions(bank, nextCert)
      const shuffled = shuffleAndMapQuestions(selected).questions
      setQuestions(shuffled)
      setAnswers({})
      setResults([])
      setQuestionIndex(0)
      setTimeLeft(nextCert.examTimeSeconds)
      setScreen('exam')
    } catch {
      setError(true)
      setScreen('home')
    }
  }, [certId])

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
    if (screen !== 'exam') return
    const interval = window.setInterval(() => {
      setTimeLeft(value => Math.max(0, value - 1))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [screen])

  useEffect(() => {
    if (screen !== 'exam' || timeLeft !== 0 || questions.length === 0) return
    const timeout = window.setTimeout(finishExam, 0)
    return () => window.clearTimeout(timeout)
  }, [finishExam, questions.length, screen, timeLeft])

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

  if (screen === 'loading') {
    return <Shell language={language} setLanguage={setLanguage} labels={labels}><LoadingView labels={labels} /></Shell>
  }

  if (screen === 'results') {
    return (
      <Shell language={language} setLanguage={setLanguage} labels={labels}>
        <ResultsView
          labels={labels}
          cert={cert}
          results={results}
          summary={resultSummary}
          onNewExam={() => void startExam(certId)}
          onHome={() => setScreen('home')}
        />
      </Shell>
    )
  }

  if (screen === 'exam' && currentQuestion) {
    const type = getQuestionType(currentQuestion)
    const currentAnswer = answers[currentQuestion.id] ?? emptyAnswer(type)
    return (
      <Shell language={language} setLanguage={setLanguage} labels={labels} compact>
        <div className="mx-auto w-full max-w-5xl px-4 py-5 md:px-8 md:py-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-hairline bg-bg-card px-4 py-3 md:px-6">
            <div>
              <p className="text-sm font-semibold text-text-primary">{cert.shortName} {labels.question} {questionIndex + 1} / {questions.length}</p>
              <p className="text-xs text-text-muted">{answeredCount} {labels.answered}</p>
            </div>
            <div className={`font-mono text-lg font-bold ${timeLeft < 300 ? 'text-danger' : 'text-text-primary'}`} aria-label={`${labels.timeLeft}: ${formatTime(timeLeft)}`}>
              {labels.timeLeft}: {formatTime(timeLeft)}
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-1.5" aria-label="Question navigation">
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
              <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-text-primary">{type}</span>
              <span className="text-sm text-text-muted">{typeLabel(type, labels)}</span>
            </div>
            <h1 className="cc-question-stem text-xl font-semibold leading-relaxed text-text-primary md:text-2xl">{currentQuestion.question}</h1>
            <div className="mt-7">
              {type === 'single' && <SingleAnswer question={currentQuestion} value={currentAnswer} onSelect={selectSingle} />}
              {type === 'multi' && <MultiAnswer question={currentQuestion} value={currentAnswer} onToggle={toggleMulti} />}
              {type === 'ordering' && <OrderingAnswer question={currentQuestion} value={currentAnswer} onToggle={toggleOrder} onMove={moveOrder} labels={labels} />}
              {type === 'matching' && <MatchingAnswer question={currentQuestion} value={currentAnswer} onSelect={setMatch} labels={labels} />}
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
    <Shell language={language} setLanguage={setLanguage} labels={labels}>
      <HomeView
        labels={labels}
        certId={certId}
        onSelect={setCertId}
        onStart={() => void startExam(certId)}
        error={error}
      />
    </Shell>
  )
}

function Shell({
  language,
  setLanguage,
  labels,
  compact = false,
  children,
}: {
  language: Language
  setLanguage: (language: Language) => void
  labels: Labels
  compact?: boolean
  children: ReactNode
}) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary">
      <header className="sticky top-0 z-20 border-b border-border-hairline bg-bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div>
            <p className="text-base font-bold tracking-tight text-text-primary">{labels.appName}</p>
            {!compact && <p className="hidden text-xs text-text-muted sm:block">{labels.subtitle}</p>}
          </div>
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

function HomeView({
  labels,
  certId,
  onSelect,
  onStart,
  error,
}: {
  labels: Labels
  certId: string
  onSelect: (certId: string) => void
  onStart: () => void
  error: boolean
}) {
  const certs = CERTIFICATION_LIST.filter(cert => cert.status === 'active' && cert.provider === 'aws')
  const selected = CERTIFICATIONS[certId]
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8 md:py-16">
      <div className="max-w-3xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-text-muted">{labels.certification}</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-5xl">{labels.chooseExam}</h1>
        <p className="mt-4 text-base leading-relaxed text-text-muted md:text-lg">{labels.chooseExamHint}</p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {certs.map(cert => (
          <button key={cert.code} type="button" aria-label={`${cert.shortName} ${cert.name}`} onClick={() => onSelect(cert.code)} className={examCardClass(cert.code === certId)}>
            <span className="text-left">
              <span className="block text-xs font-bold uppercase tracking-widest text-text-muted">{cert.shortName}</span>
              <span className="mt-2 block text-xl font-bold text-text-primary">{cert.name}</span>
              <span className="mt-3 block text-sm leading-relaxed text-text-muted">{cert.domains.map(domain => domain.name).join(' / ')}</span>
            </span>
            <span className="flex items-center justify-between gap-4 text-left text-xs text-text-muted">
              <span>{cert.examQuestionCount} {labels.questions} / {Math.round(cert.examTimeSeconds / 60)} {labels.minutes}</span>
              <span className={`rounded-full px-2 py-1 font-bold ${cert.code === certId ? 'bg-brand text-on-brand' : 'bg-bg-dark'}`}>{cert.code === certId ? labels.selected : labels.select}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="button" onClick={onStart} className="rounded-xl bg-brand px-6 py-3.5 text-sm font-bold text-on-brand shadow-card hover:bg-brand-hover">{labels.start.replace('65', String(selected?.examQuestionCount ?? 65))}</button>
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
  return <div className="space-y-5"><div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Your order</p><div className="grid gap-2">{selected.length === 0 && <p className="rounded-xl border border-dashed border-border-hairline p-4 text-sm text-text-muted">Click each option below in the desired order.</p>}{selected.map((key, index) => <div key={key} className="flex items-center gap-2 rounded-xl border border-brand/50 bg-brand/10 p-3"><span className="w-7 text-center font-mono text-sm font-bold text-text-muted">{index + 1}</span><span className="flex-1 text-sm text-text-primary">{question.options[key as keyof Question['options']]}</span><button type="button" onClick={() => onMove(index, -1)} disabled={index === 0} aria-label={labels.up} className="rounded px-2 py-1 text-xs text-text-muted hover:bg-bg-card disabled:opacity-30">↑</button><button type="button" onClick={() => onMove(index, 1)} disabled={index === selected.length - 1} aria-label={labels.down} className="rounded px-2 py-1 text-xs text-text-muted hover:bg-bg-card disabled:opacity-30">↓</button><button type="button" onClick={() => onToggle(key)} aria-label={`Remove ${key}`} className="rounded px-2 py-1 text-xs text-danger hover:bg-danger/10">×</button></div>)}</div></div><div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Options</p><div className="grid gap-2">{remaining.map(([key, text]) => <button key={key} type="button" onClick={() => onToggle(key)} className="rounded-xl border border-border-hairline p-4 text-left text-sm hover:border-brand/50"><span className="mr-2 font-bold text-text-primary">{key}</span><span className="text-text-primary">{text}</span></button>)}</div></div></div>
}

function MatchingAnswer({ question, value, onSelect, labels }: { question: Question; value: AnswerValue; onSelect: (key: string, target: string) => void; labels: Labels }) {
  const selected = Array.isArray(value) ? value : []
  const map = Object.fromEntries(selected.map(token => token.split(':'))) as Record<string, string>
  return <div className="grid gap-3">{optionEntries(question).map(([key, text]) => <div key={key} className="rounded-xl border border-border-hairline p-4"><p className="text-sm text-text-primary"><span className="mr-2 font-bold">{key}</span>{text}</p><select value={map[key] ?? ''} onChange={event => onSelect(key, event.target.value)} className="mt-3 w-full rounded-lg border border-border-hairline bg-bg-dark px-3 py-2 text-sm text-text-primary"><option value="">{labels.selectTarget}</option>{Object.entries(question.targets ?? {}).map(([target, targetText]) => <option key={target} value={target}>{target}. {targetText}</option>)}</select></div>)}</div>
}

function ResultsView({ labels, cert, results, summary, onNewExam, onHome }: { labels: Labels; cert: Certification; results: QuestionResult[]; summary: { correct: number; percent: number; passed: boolean }; onNewExam: () => void; onHome: () => void }) {
  const incorrect = results
    .map((result, index) => ({ result, index }))
    .filter(({ result }) => !result.isCorrect)
  const [selectedIndex, setSelectedIndex] = useState(incorrect[0]?.index ?? 0)
  const selectedResult = results[selectedIndex]

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
            <p className="mt-1 text-xl font-bold text-text-primary">{summary.passed ? '75%+' : 'Below 75%'}</p>
          </div>
          <div className="rounded-xl bg-bg-dark p-4">
            <p className="text-xs text-text-muted">{labels.incorrectCount}</p>
            <p className="mt-1 text-3xl font-bold text-text-primary">{incorrect.length}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={onNewExam} className="rounded-xl bg-brand px-5 py-3 text-sm font-bold text-on-brand">{labels.newExam}</button>
          <button type="button" onClick={onHome} className="rounded-xl border border-border-hairline px-5 py-3 text-sm font-semibold text-text-primary">{labels.backToHome}</button>
        </div>
      </div>

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
          {selectedResult && <ReviewCard result={selectedResult} questionNumber={selectedIndex + 1} labels={labels} />}
        </div>
      </section>
    </div>
  )
}

function ReviewCard({ result, questionNumber, labels }: { result: QuestionResult; questionNumber: number; labels: Labels }) {
  const statusClass = result.isCorrect ? 'text-success' : 'text-danger'
  const answerClass = result.isCorrect ? 'bg-success/10' : 'bg-danger/10'
  return (
    <article className="rounded-2xl border border-border-hairline bg-bg-card p-5 md:p-7">
      <p className={`text-xs font-bold uppercase tracking-wide ${statusClass}`}>{labels.question} {questionNumber} - {result.isCorrect ? labels.correctStatus : labels.incorrectStatus}</p>
      <h3 className="mt-3 text-lg font-semibold leading-relaxed text-text-primary">{result.question.question}</h3>
      <div className="mt-5 grid gap-3 text-sm">
        <div className={`rounded-xl p-4 ${answerClass}`}>
          <p className="font-semibold text-text-primary">{labels.yourAnswer}</p>
          <p className="mt-1 text-text-muted">{answerText(result.question, result.userAnswer, labels.notAnswered)}</p>
        </div>
        <div className="rounded-xl bg-success/10 p-4">
          <p className="font-semibold text-text-primary">{labels.correctAnswer}</p>
          <p className="mt-1 text-text-muted">{answerText(result.question, result.correctAnswer, labels.notAnswered)}</p>
        </div>
      </div>
      <div className="mt-5 border-t border-border-hairline pt-5">
        <p className="font-semibold text-text-primary">{labels.explanation}</p>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-muted">{result.question.explanation}</p>
      </div>
    </article>
  )
}
