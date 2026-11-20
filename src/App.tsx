import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react'

type Role = 'student' | 'mentor' | 'lead' | 'said' | 'cohort'
type Persona = 'student' | 'mentor' | 'program'
type FollowUp = { prompt: string; options: string[]; max?: number }
type PulseQuestion = { theme: string; prompt: string; type: 'rating' | 'note'; low: string; high: string; followUps?: FollowUp[] }
type IconName =
  | 'activity'
  | 'bell'
  | 'bolt'
  | 'check'
  | 'chevron'
  | 'clock'
  | 'close'
  | 'filter'
  | 'home'
  | 'lock'
  | 'message'
  | 'mic'
  | 'more'
  | 'people'
  | 'send'
  | 'sparkles'
  | 'trend'
  | 'user'

const iconPaths: Record<IconName, ReactNode> = {
  activity: <><path d="M3 12h4l2.2-6 4.1 12 2.1-6H21" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  bolt: <path d="m13 2-9 12h8l-1 8 9-12h-8z" />,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  close: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
  filter: <path d="M4 5h16M7 12h10m-7 7h4" />,
  home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />,
  mic: <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" /></>,
  more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
  people: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  send: <><path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" /></>,
  sparkles: <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7zM5 2l.6 1.8L7.5 4l-1.9.6L5 6.5l-.6-1.9L2.5 4l1.9-.2z" /></>,
  trend: <><path d="M3 17 9 11l4 4 8-9" /><path d="M15 6h6v6" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
}

function Icon({ name, size = 20, className = '' }: { name: IconName; size?: number; className?: string }) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{iconPaths[name]}</svg>
}

const questions: PulseQuestion[] = [
  { theme: 'Support', prompt: 'How supported have you felt throughout the program over the past two weeks?', type: 'rating', low: 'Not supported', high: 'Very supported' },
  { theme: 'Motivation', prompt: 'How motivated do you feel to continue participating in the program?', type: 'rating', low: 'Not motivated', high: 'Very motivated' },
  { theme: 'Mentor trust', prompt: 'How comfortable do you feel discussing challenges or concerns with your mentor?', type: 'rating', low: 'Not comfortable', high: 'Very comfortable' },
  { theme: 'Personalized mentorship', prompt: 'Do you feel you receive enough personalized mentorship and career guidance?', type: 'rating', low: 'Not enough', high: 'Definitely', followUps: [
    { prompt: "What's preventing you from getting enough individual attention?", options: ['Group meetings are too short.', "I don't want to take time away from others.", 'My mentor has limited availability.', "I don't know how to request individual meetings."] },
    { prompt: 'What would make your mentorship experience more valuable?', max: 2, options: ['More frequent meetings', 'More one-on-one time with my mentor', 'More personalized career advice', 'More help with networking and opportunities', 'More guidance on skills and professional growth', 'Deeper, less surface-level conversations', 'Better alignment with my career interests', "I'm satisfied with my current mentorship experience"] },
  ] },
  { theme: 'Professional growth', prompt: 'How much has the program helped you grow professionally?', type: 'rating', low: 'Not at all', high: 'A great deal', followUps: [
    { prompt: 'What would make future events more valuable?', max: 2, options: ['More hands-on activities', 'More networking opportunities', 'More technical or industry-specific topics', 'More personalized career guidance', 'More interactive discussions'] },
  ] },
  { theme: 'Community', prompt: 'How connected do you feel to the RBC community?', type: 'rating', low: 'Not connected', high: 'Very connected' },
  { theme: 'Your idea', prompt: 'What is one thing RBC could change to improve your experience?', type: 'note', low: '', high: '' },
  { theme: 'Future at RBC', prompt: 'How interested are you in pursuing future opportunities at RBC?', type: 'rating', low: 'Not interested', high: 'Very interested', followUps: [
    { prompt: 'What would most increase your interest in working at RBC?', max: 2, options: ['Clearer career pathways', 'More networking with employees', 'More relevant work experience', 'Greater flexibility', 'More mentorship and support', 'More information about RBC roles'] },
  ] },
]

const themes = [
  { name: 'Personalized mentorship', mentions: 14, impact: 8.8, change: '+5', color: '#ff7a4d', status: 'Needs action' },
  { name: 'Clearer RBC career pathways', mentions: 11, impact: 6.4, change: '+3', color: '#8267d6', status: 'In review' },
  { name: 'Community connection', mentions: 8, impact: 4.9, change: '-2', color: '#30a483', status: 'Improving' },
]

const radar = [
  { name: 'Jordan Lee', initials: 'JL', role: 'Data Analyst Intern', risk: 'Priority', points: 5, reasons: ['Support score fell from 4.3 to 2', 'Mentor comfort rated 2 of 5'], color: '#d85342' },
  { name: 'Avery Chen', initials: 'AC', role: 'Software Developer Intern', risk: 'Check in', points: 3, reasons: ['Motivation rated 2 of 5 twice'], color: '#dc8a2d' },
]

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d56b3] focus-visible:ring-offset-2 ${checked ? 'bg-[#6d56b3]' : 'bg-[#c8c4ce]'}`}>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  )
}

function Avatar({ initials, className = '' }: { initials: string; className?: string }) {
  return <div className={`grid size-10 shrink-0 place-items-center rounded-xl bg-[#e9ddf5] text-[13px] font-bold text-[#503768] ${className}`}>{initials}</div>
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement
    const dialog = dialogRef.current
    const first = dialog?.querySelector<HTMLElement>('button, input, textarea, select')
    first?.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !dialog) return
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button, input, textarea, select, [tabindex]:not([tabindex="-1"])'))
      if (!focusable.length) return
      const firstItem = focusable[0]
      const lastItem = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === firstItem) { event.preventDefault(); lastItem.focus() }
      if (!event.shiftKey && document.activeElement === lastItem) { event.preventDefault(); firstItem.focus() }
    }
    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('keydown', handleKey); previousFocus.current?.focus() }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#211729]/55 p-4 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-title" className="max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e9e6ec] px-6 py-5">
          <h2 id="modal-title" className="text-xl font-bold text-[#211c25]">{title}</h2>
          <button onClick={onClose} aria-label="Close dialog" className="grid size-11 place-items-center rounded-lg text-[#69616d] hover:bg-[#f3f1f4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d56b3]"><Icon name="close" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Sidebar({ role, setRole, persona, setPersona }: { role: Role; setRole: (role: Role) => void; persona: Persona; setPersona: (persona: Persona) => void }) {
  const switchPersona = (next: Persona) => {
    setPersona(next)
    setRole(next === 'student' ? 'student' : next === 'mentor' ? 'mentor' : 'lead')
  }
  return (
    <aside className="flex w-full shrink-0 flex-col bg-[#3f0e40] text-white lg:w-[270px]">
      <div className="flex h-[60px] items-center border-b border-white/15 px-4">
        <div><div className="text-[17px] font-bold tracking-tight">RBC Early Talent</div><div className="flex items-center gap-1 text-xs text-[#cdbdce]"><span className="size-2 rounded-full bg-[#40c78f]" /> {persona === 'student' ? 'Maya Patel' : persona === 'mentor' ? 'Nina Kim' : 'Sophia Chen'}</div></div>
      </div>
      <div className="border-b border-white/10 p-3">
        <label htmlFor="persona" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#bcaabd]">Viewing workspace as</label>
        <div className="relative"><select id="persona" value={persona} onChange={event => switchPersona(event.target.value as Persona)} className="min-h-10 w-full cursor-pointer appearance-none rounded-md border border-white/15 bg-white/10 px-3 pr-9 text-sm font-semibold text-white outline-none focus:border-white/50 focus:ring-2 focus:ring-white/20">
          <option className="text-[#2d2630]" value="student">Student · Maya Patel</option><option className="text-[#2d2630]" value="mentor">Mentor · Nina Kim</option><option className="text-[#2d2630]" value="program">Program lead · Sophia Chen</option>
        </select><Icon name="chevron" size={16} className="pointer-events-none absolute right-3 top-3 rotate-90 text-[#d8c9da]" /></div>
      </div>
      <div className="border-b border-white/10 p-2">
        <button className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-[#ded2df] hover:bg-white/10"><Icon name="message" size={17} /> Threads</button>
        <button className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-[#ded2df] hover:bg-white/10"><Icon name="clock" size={17} /> Later</button>
        <button className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-[#ded2df] hover:bg-white/10"><Icon name="more" size={17} /> More</button>
      </div>
      <div className="px-2 py-3">
        <p className="flex min-h-8 items-center px-3 text-sm font-semibold text-[#ded2df]"><Icon name="chevron" size={14} className="mr-1 rotate-90" /> Channels</p>
        <nav aria-label="Slack channels">
          <button onClick={() => setRole('cohort')} aria-current={role === 'cohort' ? 'page' : undefined} className={`flex min-h-9 w-full items-center rounded-md px-3 text-sm ${role === 'cohort' ? 'bg-[#1164a3] text-white' : 'text-[#ded2df] hover:bg-white/10'}`}><span className="mr-2 text-lg text-[#baa8bd]">#</span> cohort-2026</button>
          <button onClick={() => setRole('said')} aria-current={role === 'said' ? 'page' : undefined} className={`flex min-h-9 w-full items-center rounded-md px-3 text-sm ${role === 'said' ? 'bg-[#1164a3] text-white' : 'text-[#ded2df] hover:bg-white/10'}`}><span className="mr-2 text-lg text-[#baa8bd]">#</span> you-said-we-did</button>
        </nav>
      </div>
      <div className="px-2 pb-3">
        <p className="flex min-h-8 items-center px-3 text-sm font-semibold text-[#ded2df]"><Icon name="chevron" size={14} className="mr-1 rotate-90" /> Apps</p>
        <button onClick={() => setRole('student')} aria-current={role === 'student' ? 'page' : undefined} className={`flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-sm ${role === 'student' ? 'bg-[#1164a3] text-white' : 'text-[#ded2df] hover:bg-white/10'}`}>
          <span className="grid size-6 place-items-center rounded-md bg-[#f06a53] text-white"><Icon name="activity" size={14} /></span><span className="font-semibold">Early Connect</span><span className="rounded bg-white/15 px-1 text-[10px] font-bold">APP</span><span className="ml-auto size-2 rounded-full bg-[#e45c4d]" />
        </button>
        {persona !== 'student' && <button onClick={() => setRole('mentor')} aria-current={role === 'mentor' ? 'page' : undefined} className={`flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-sm ${role === 'mentor' ? 'bg-[#1164a3] text-white' : 'text-[#ded2df] hover:bg-white/10'}`}>
          <Avatar initials="NK" className="!size-6 !rounded-md !text-[10px]" /><span>Early Connect Radar</span><span className="rounded bg-white/15 px-1 text-[10px] font-bold">APP</span><span className="ml-auto rounded-full bg-[#e45c4d] px-1.5 text-[10px] font-bold">2</span>
        </button>}
        {persona === 'program' && <button onClick={() => setRole('lead')} aria-current={role === 'lead' ? 'page' : undefined} className={`flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-sm ${role === 'lead' ? 'bg-[#1164a3] text-white' : 'text-[#ded2df] hover:bg-white/10'}`}>
          <span className="grid size-6 place-items-center rounded-md bg-[#735886] text-white"><Icon name="trend" size={14} /></span><span>Early Connect Dashboard</span><span className="rounded bg-white/15 px-1 text-[10px] font-bold">APP</span>
        </button>}
      </div>
      <div className="mt-auto hidden border-t border-white/10 p-3 lg:block">
        <div className="flex items-center gap-3 rounded-lg bg-white/[.07] p-3"><span className="grid size-8 place-items-center rounded-lg bg-[#f06a53]"><Icon name="bolt" size={16} /></span><div><p className="text-xs font-bold">3 workflows active</p><p className="text-[11px] text-[#c7b6c9]">Next run Thursday, 3 PM</p></div></div>
      </div>
    </aside>
  )
}

function Topbar({ role, onFeedback }: { role: Role; onFeedback: () => void }) {
  const titles = { student: ['Early Connect', 'App home'], mentor: ['Early Connect Radar', 'App home'], lead: ['Early Connect Dashboard', 'App home · Program access'], said: ['you-said-we-did', 'Channel'], cohort: ['cohort-2026', 'Channel'] }
  return (
    <header className="flex min-h-[62px] items-center border-b border-[#ddd9df] bg-white px-4 md:px-5">
      <div><h1 className="flex items-center gap-2 text-[17px] font-bold text-[#251f28]">{(role === 'said' || role === 'cohort') && <span className="text-xl font-normal">#</span>}{titles[role][0]} {role !== 'said' && role !== 'cohort' && <span className="rounded bg-[#eee9ef] px-1.5 py-0.5 text-[10px] text-[#64586a]">APP</span>}</h1><p className="text-xs text-[#756d79]">{titles[role][1]}</p></div>
      <div className="ml-auto flex items-center gap-2">
        {role === 'student' && <button onClick={onFeedback} className="hidden min-h-11 items-center gap-2 rounded-lg border border-[#dcd6df] px-4 text-sm font-bold text-[#413947] hover:bg-[#f7f5f7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d56b3] sm:flex"><Icon name="message" size={17} /> Give feedback</button>}
        <button className="hidden min-h-10 items-center gap-2 rounded-lg border border-[#ddd9df] px-3 text-xs font-semibold text-[#554c59] md:flex"><Icon name="people" size={16} /> {role === 'said' || role === 'cohort' ? '40' : role === 'lead' ? '8' : '2'}</button>
        <button aria-label="Notifications" className="relative grid size-11 place-items-center rounded-lg text-[#625a67] hover:bg-[#f4f2f5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d56b3]"><Icon name="bell" size={20} /><span className="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-white bg-[#e65c4d]" /></button>
      </div>
    </header>
  )
}

function SlackGlobalBar() {
  return <div className="flex h-10 shrink-0 items-center bg-[#350d36] px-3 text-white">
    <div className="hidden w-[250px] items-center gap-3 text-[#d8c9da] lg:flex"><Icon name="home" size={17} /><Icon name="clock" size={17} /></div>
    <div className="mx-auto flex h-7 w-full max-w-[620px] items-center rounded-md border border-white/15 bg-white/15 px-3 text-xs text-[#e9e0ea]"><span className="flex-1 text-center">Search RBC Early Talent</span><Icon name="filter" size={14} /></div>
    <div className="ml-auto flex w-auto justify-end pl-3 lg:w-[250px]"><Icon name="bell" size={17} /></div>
  </div>
}

function PulseCard({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0)
  const [anonymous, setAnonymous] = useState(false)
  const [note, setNote] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [recorded, setRecorded] = useState(false)
  const [selections, setSelections] = useState<Record<string, string[]>>({})
  const [done, setDone] = useState(false)
  const answer = () => {
    if (step < questions.length - 1) {
      setStep(step + 1)
      setRating(null)
      setRecorded(false)
      setNote('')
    } else {
      setDone(true)
      onFinish()
    }
  }
  const toggleOption = (key: string, option: string, max?: number) => {
    const current = selections[key] ?? []
    const next = current.includes(option) ? current.filter(item => item !== option) : max && current.length >= max ? current : [...current, option]
    setSelections({ ...selections, [key]: next })
  }
  const q = questions[step]
  const canContinue = q.type === 'rating' ? rating !== null || recorded : note.trim().length > 0 || recorded
  if (done) return (
    <div className="overflow-hidden rounded-2xl border border-[#ded8e2] bg-white shadow-[0_18px_50px_rgba(44,28,49,.08)]">
      <div className="bg-[#5f4674] px-6 py-8 text-center text-white">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-white/15"><Icon name="check" size={28} /></div>
        <h2 className="text-2xl font-bold">Thanks, Maya!</h2><p className="mt-2 text-sm text-[#e7ddeb]">Your eight-question pulse has been submitted.</p>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#8b7f90]">Your streak</p><p className="mt-1 text-2xl font-bold text-[#2b2530]">4 pulses</p><p className="mt-1 text-sm text-[#756c79]">Your response is included in cohort trends.</p></div><Icon name="bolt" size={30} className="text-[#e86f51]" /></div>
      </div>
    </div>
  )
  return (
    <div className="overflow-hidden rounded-2xl border border-[#ded8e2] bg-white shadow-[0_18px_50px_rgba(44,28,49,.08)]">
      <div className="border-b border-[#ebe7ed] px-5 py-4 md:px-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#5f4674] text-white"><Icon name="activity" size={20} /></div><div><p className="text-sm font-bold text-[#29232d]">Early Connect <span className="font-normal text-[#8a828e]">APP</span></p><p className="text-xs text-[#8a828e]">Today at 10:00 AM</p></div></div>
          <span className="rounded-full bg-[#f0ebf3] px-3 py-1 text-xs font-bold text-[#664b76]">{step + 1} of {questions.length}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#eeeaf0]"><div className="h-full rounded-full bg-[#ff7657] transition-all duration-500" style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
      </div>
      <div className="min-h-[342px] p-5 md:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div><p className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-[#8a7396]">{q.theme}</p><h2 className="max-w-lg text-[22px] font-bold leading-tight text-[#28212b] md:text-2xl">{q.prompt}</h2></div>
          {step === 0 && <div className="flex items-center gap-2"><span className="hidden text-xs font-semibold text-[#756b79] sm:block">Anonymous</span><Toggle checked={anonymous} onChange={setAnonymous} label="Submit anonymously" /></div>}
        </div>
        {step === 0 && anonymous && <div className="mb-5 flex gap-2 rounded-lg bg-[#f6f1f8] p-3 text-xs leading-5 text-[#62566a]"><Icon name="lock" size={16} className="mt-0.5 shrink-0" />Anonymous answers count toward trends but can’t trigger personal support.</div>}
        {q.type === 'rating' && <div><div className="grid grid-cols-5 gap-2">{[1,2,3,4,5].map(number => <button key={number} onClick={() => setRating(number)} aria-pressed={rating === number} aria-label={`${number} out of 5`} className={`grid min-h-[66px] place-items-center rounded-xl border text-2xl font-bold transition hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d56b3] ${rating === number ? 'border-[#6d56b3] bg-[#6d56b3] text-white' : 'border-[#ddd7e0] bg-white text-[#4e3a59] hover:border-[#8267a0] hover:bg-[#faf7fc]'}`}>{number}</button>)}</div><div className="mt-2 flex justify-between text-xs font-semibold text-[#817787]"><span>{q.low}</span><span>{q.high}</span></div></div>}
        {q.type === 'note' && <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Write your answer…" className="w-full resize-none rounded-xl border border-[#d8d2dc] p-4 text-sm outline-none placeholder:text-[#9b929f] focus:border-[#735886] focus:ring-2 focus:ring-[#735886]/15" />}
        {rating !== null && q.followUps?.map((followUp, index) => {
          const key = `${step}-${index}`
          return <div key={followUp.prompt} className="mt-5 rounded-xl bg-[#f8f6f8] p-4"><div className="mb-3 flex items-start justify-between gap-3"><p className="text-sm font-bold leading-5 text-[#443a48]">{followUp.prompt}</p><span className="shrink-0 text-xs text-[#817784]">{followUp.max ? `Up to ${followUp.max}` : 'Select one'}</span></div><div className="grid gap-2 sm:grid-cols-2">{followUp.options.map(option => {
            const active = (selections[key] ?? []).includes(option)
            return <button key={option} type="button" onClick={() => toggleOption(key, option, followUp.max ?? 1)} aria-pressed={active} className={`min-h-11 rounded-lg border px-3 py-2 text-left text-xs font-semibold leading-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d56b3] ${active ? 'border-[#6d56b3] bg-[#eee8f3] text-[#4f3760]' : 'border-[#dcd6df] bg-white text-[#5f5563] hover:border-[#8a7396]'}`}><span className={`mr-2 inline-grid size-4 place-items-center rounded border ${active ? 'border-[#6d56b3] bg-[#6d56b3] text-white' : 'border-[#aaa0ae]'}`}>{active && <Icon name="check" size={11} />}</span>{option}</button>
          })}</div></div>
        })}
        <div className="mt-5 border-t border-[#e5e0e7] pt-4">
          <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => setRecorded(!recorded)} aria-pressed={recorded} className={`flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d56b3] ${recorded ? 'border-[#e96853] bg-[#fff2ef] text-[#b94635]' : 'border-[#d8d2dc] text-[#5e5362]'}`}><Icon name="mic" size={17} />{recorded ? 'Voice recorded' : 'Answer with voice'}</button><span className="text-xs text-[#847a88]">Early Connect will transcribe and summarize</span><button disabled={!canContinue} onClick={answer} className="ml-auto min-h-11 rounded-lg bg-[#5f4674] px-5 text-sm font-bold text-white hover:bg-[#4e3960] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d56b3] focus-visible:ring-offset-2">{step === questions.length - 1 ? 'Submit pulse' : 'Continue'}</button></div>
          {recorded && <div className="mt-3 rounded-xl bg-[#f6f2f8] p-3 text-sm leading-6 text-[#5e5362]"><span className="font-bold text-[#4e3b58]">AI summary:</span> I’d value more personalized support and clearer guidance related to {q.theme.toLowerCase()}. <button className="ml-2 font-bold text-[#6d56b3] underline">Edit</button><button onClick={() => setRecorded(false)} className="ml-3 font-bold text-[#7d727f] underline">Discard</button></div>}
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-[#ebe7ed] bg-[#fbfafb] px-5 py-3 text-xs text-[#7a707e]"><Icon name="lock" size={14} />Your feedback never affects performance or return-offer decisions.</div>
    </div>
  )
}

function StudentView({ onFeedback, onFinish }: { onFeedback: () => void; onFinish: () => void }) {
  return (
    <div className="mx-auto grid max-w-[1180px] gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section>
        <div className="mb-5 flex gap-3 border-b border-[#e5e1e7] pb-5"><div className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#f06a53] text-white"><Icon name="activity" size={19} /></div><div><p className="text-sm font-bold text-[#2d2630]">Early Connect <span className="ml-1 rounded bg-[#ebe7ed] px-1.5 py-0.5 text-[10px] text-[#6f6474]">APP</span> <span className="font-normal text-[#8c838f]">10:00 AM</span></p><p className="mt-1 text-sm leading-6 text-[#443b48]">Good morning, Maya. Your biweekly pulse is ready—8 focused questions about your program experience.</p><div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#6c6170]"><Icon name="bolt" size={14} className="text-[#d65d46]" /> Workflow: Biweekly pulse · Sent automatically</div></div></div>
        <PulseCard onFinish={onFinish} />
      </section>
      <aside className="space-y-4">
        <div className="rounded-2xl border border-[#e2dde5] bg-white p-5"><div className="mb-4 flex items-center gap-2"><Icon name="bolt" size={17} className="text-[#d65d46]" /><h3 className="font-bold text-[#302934]">Early Connect workflows</h3></div><div className="space-y-4">{[['Today · 10:00 AM','Pulse sent','Done'],['Thu · 3:00 PM','Friendly reminder','Scheduled'],['After 2 missed','One-tap check-in','Trigger']].map(([time,title,state], i) => <div key={title} className="relative flex gap-3"><div className={`mt-1 size-2.5 shrink-0 rounded-full ${i === 0 ? 'bg-[#2f9e74]' : 'border-2 border-[#9e92a2] bg-white'}`} />{i < 2 && <span className="absolute left-[4px] top-4 h-8 w-px bg-[#ddd6e0]" />}<div><p className="text-xs text-[#8b818f]">{time}</p><p className="text-sm font-bold text-[#453c49]">{title}</p><p className="text-xs text-[#7d727f]">{state}</p></div></div>)}</div></div>
        <div className="rounded-2xl border border-[#e2dde5] bg-white p-5">
          <div className="mb-4 flex items-center justify-between"><h3 className="font-bold text-[#302934]">Cohort progress</h3><span className="text-sm font-bold text-[#5e4671]">82%</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-[#eeeaf0]"><div className="h-full w-[82%] rounded-full bg-[#30a483]" /></div>
          <p className="mt-3 text-xs leading-5 text-[#776e7b]">33 of 40 people have checked in this round.</p>
        </div>
        <button onClick={onFeedback} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#d8d1dc] bg-white text-sm font-bold text-[#54455d] hover:border-[#765e83] hover:bg-[#faf8fb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d56b3]"><Icon name="message" size={18} /> Share feedback anytime</button>
      </aside>
    </div>
  )
}

function MentorView({ onTalkingPoints }: { onTalkingPoints: (name: string) => void }) {
  const [resolved, setResolved] = useState<string[]>([])
  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-6 flex gap-3 border-b border-[#e5e1e7] pb-5"><div className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#f06a53] text-white"><Icon name="activity" size={19} /></div><div><p className="text-sm font-bold text-[#2d2630]">Early Connect Radar <span className="ml-1 rounded bg-[#ebe7ed] px-1.5 py-0.5 text-[10px] text-[#6f6474]">APP</span> <span className="font-normal text-[#8c838f]">9:00 AM</span></p><h2 className="mt-1 text-xl font-bold text-[#28222b]">2 of your 4 students could use a check-in this week.</h2><p className="mt-1 text-sm text-[#756d79]">This weekly radar was sent automatically. Signals are visible and never include private feedback quotes.</p><p className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#6c6170]"><Icon name="bolt" size={14} className="text-[#d65d46]" /> Workflow: Monday mentor radar</p></div></div>
      <div className="space-y-4">
        {radar.map(person => {
          const isResolved = resolved.includes(person.name)
          return <article key={person.name} className={`rounded-2xl border bg-white p-5 shadow-[0_10px_35px_rgba(45,32,49,.05)] md:p-6 ${isResolved ? 'border-[#b8ddcf]' : 'border-[#e0dbe3]'}`}>
            <div className="flex flex-col gap-5 md:flex-row md:items-start">
              <Avatar initials={person.initials} className="!size-12 !rounded-full" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold text-[#2c2530]">{person.name}</h3>{isResolved ? <span className="rounded-full bg-[#e7f6f0] px-2.5 py-1 text-xs font-bold text-[#29785f]">Checked in</span> : <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: `${person.color}16`, color: person.color }}>{person.risk} · {person.points} pts</span>}</div>
                <p className="mt-0.5 text-sm text-[#7b727f]">{person.role}</p>
                <div className="mt-4 rounded-xl bg-[#f8f6f8] p-4"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8a808e]">Why they’re here</p>{person.reasons.map(reason => <div key={reason} className="flex items-start gap-2 py-1 text-sm font-semibold text-[#4b424f]"><span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: person.color }} />{reason}</div>)}</div>
              </div>
              <div className="flex shrink-0 flex-col gap-2 md:w-[190px]">
                <button onClick={() => onTalkingPoints(person.name)} className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#5f4674] px-4 text-sm font-bold text-white hover:bg-[#4c365e] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d56b3] focus-visible:ring-offset-2"><Icon name="sparkles" size={17} /> Talking points</button>
                <button disabled={isResolved} onClick={() => setResolved([...resolved, person.name])} className="min-h-11 rounded-lg border border-[#d9d3dc] px-4 text-sm font-bold text-[#5b505f] hover:bg-[#f8f6f8] disabled:cursor-default disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d56b3]">{isResolved ? 'Check-in logged' : 'Mark checked in'}</button>
              </div>
            </div>
          </article>
        })}
      </div>
    </div>
  )
}

function TrendChart() {
  const points = '0,72 56,62 112,67 168,44 224,50 280,24 336,30 392,10'
  return (
    <div className="relative h-[180px] w-full" role="img" aria-label="Sentiment score rose from 3.6 to 4.2 over eight pulse rounds">
      <div className="absolute inset-0 flex flex-col justify-between text-xs text-[#948a98]">{['4.5','4.0','3.5','3.0'].map(n => <div key={n} className="flex items-center gap-2"><span className="w-6">{n}</span><span className="h-px flex-1 bg-[#eee9f0]" /></div>)}</div>
      <svg className="absolute inset-[4px_0_0_34px] h-[145px] w-[calc(100%-34px)]" viewBox="0 0 392 82" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6d56b3" stopOpacity=".25" /><stop offset="1" stopColor="#6d56b3" stopOpacity="0" /></linearGradient></defs>
        <path d={`M${points} L392,82 L0,82 Z`} fill="url(#area)" />
        <polyline points={points} fill="none" stroke="#6d56b3" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        <circle cx="392" cy="10" r="5" fill="#fff" stroke="#6d56b3" strokeWidth="3" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="absolute bottom-0 left-9 right-0 flex justify-between text-xs text-[#948a98]"><span>Aug 12</span><span>Sep 09</span><span>Oct 07</span><span>Nov 04</span></div>
    </div>
  )
}

function CohortView() {
  const messages = [
    { initials: 'SC', name: 'Sophia Chen', time: '9:02 AM', body: 'Good morning, cohort! Your new eight-question Early Connect pulse is open. It focuses on support, mentorship, professional growth, community, and future opportunities at RBC.' },
    { initials: 'AS', name: 'Alex Singh', time: '9:18 AM', body: 'For future events, I’d love more hands-on activities and time to connect with employees from different teams.' },
    { initials: 'MP', name: 'Maya Patel', time: '9:24 AM', body: 'Same here. A session explaining different RBC career pathways and what skills each role uses would be really helpful.' },
    { initials: 'NK', name: 'Nina Kim', time: '9:31 AM', body: 'Thanks for sharing. Mentors are also setting aside optional one-on-one office hours next week for anyone who wants more personalized career guidance.' },
  ]
  return <div className="mx-auto max-w-[900px]">
    <div className="border-b border-[#e3dfe5] pb-5"><div className="grid size-14 place-items-center rounded-xl bg-[#e9e4ed] text-2xl font-bold text-[#4b3652]">#</div><h2 className="mt-4 text-2xl font-bold text-[#29222c]">Welcome to #cohort-2026</h2><p className="mt-2 text-sm leading-6 text-[#6e6572]">A space for the early talent cohort to connect, share opportunities, and help shape the program.</p></div>
    <div className="divide-y divide-[#e7e2e8]">{messages.map((message, index) => <article key={`${message.name}-${message.time}`} className="flex gap-3 py-5"><Avatar initials={message.initials} className={`!rounded-lg ${index === 0 ? '!bg-[#d9e9f5] !text-[#285b7a]' : ''}`} /><div><p className="text-sm font-bold text-[#2d2630]">{message.name} <span className="ml-1 font-normal text-[#8c838f]">{message.time}</span></p><p className="mt-1 text-sm leading-6 text-[#4f4653]">{message.body}</p>{index === 0 && <div className="mt-3 flex gap-2"><button className="min-h-9 rounded-md border border-[#d8d2da] bg-white px-3 text-xs font-bold text-[#554a59]">Open Early Connect</button><button className="min-h-9 rounded-md border border-[#d8d2da] bg-white px-3 text-xs font-bold text-[#554a59]">Remind me later</button></div>}<button className="mt-2 min-h-8 rounded-md border border-[#ddd7df] bg-white px-2.5 text-xs text-[#655a69]">+ Add reaction</button></div></article>)}</div>
    <div className="flex min-h-12 items-center rounded-lg border border-[#d8d3da] bg-white px-4 text-sm text-[#918894]"><span className="flex-1">Message #cohort-2026</span><span className="font-mono text-xs">Aa</span><Icon name="send" size={17} className="ml-4" /></div>
  </div>
}

function SaidView() {
  const posts = [
    { type: 'IMPROVE', title: 'More personalized mentor time', body: 'You asked for more individual attention, deeper conversations, and career advice aligned with your interests. We’re adding biweekly one-on-one office hours and a meeting-request template for every participant.', detail: 'Based on mentorship and mentor-comfort responses · Owner: Mentor Experience', time: 'Monday at 9:15 AM' },
    { type: 'KEEP', title: 'Networking and community sessions', body: 'You said employee networking helps you feel connected to the RBC community and more interested in future roles. We’re keeping monthly cross-team networking sessions and adding role-specific hosts.', detail: 'Based on community and future-opportunity responses · Owner: Early Talent Programs', time: 'Oct 28 at 2:40 PM' },
    { type: 'REMOVE', title: 'Large, surface-level mentor panels', body: 'You told us large panels leave too little time for meaningful guidance. We’re removing the generic quarterly panel and replacing it with smaller, interactive career conversations.', detail: 'Based on 12 comments about mentorship value · Owner: Program Experience', time: 'Oct 21 at 11:10 AM' },
  ]
  return <div className="mx-auto max-w-[900px]">
    <div className="border-b border-[#e3dfe5] pb-5"><div className="grid size-14 place-items-center rounded-xl bg-[#e9e4ed] text-2xl font-bold text-[#4b3652]">#</div><h2 className="mt-4 text-2xl font-bold text-[#29222c]">Welcome to #you-said-we-did</h2><p className="mt-2 text-sm leading-6 text-[#6e6572]">Program updates tied directly to cohort feedback. React to let the team know whether a change helped.</p></div>
    <div className="divide-y divide-[#e7e2e8]">
      {posts.map(post => <article key={post.title} className="flex gap-3 py-6"><div className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#f06a53] text-white"><Icon name="activity" size={19} /></div><div className="min-w-0 flex-1"><p className="text-sm font-bold text-[#2d2630]">Early Connect <span className="ml-1 rounded bg-[#ebe7ed] px-1.5 py-0.5 text-[10px] text-[#6f6474]">APP</span> <span className="font-normal text-[#8c838f]">{post.time}</span></p><div className="mt-2 overflow-hidden rounded-lg border border-[#ddd8df] bg-white"><div className={`border-l-4 p-4 ${post.type === 'KEEP' ? 'border-[#2f9e74]' : post.type === 'REMOVE' ? 'border-[#8a657c]' : 'border-[#e86f51]'}`}><p className={`text-xs font-bold tracking-wider ${post.type === 'KEEP' ? 'text-[#298362]' : post.type === 'REMOVE' ? 'text-[#78566c]' : 'text-[#bd513d]'}`}>{post.type}</p><h3 className="mt-1 text-base font-bold text-[#302934]">{post.title}</h3><p className="mt-2 text-sm leading-6 text-[#5f5663]">{post.body}</p><p className="mt-3 text-xs text-[#817784]">{post.detail}</p></div></div><div className="mt-2 flex gap-2"><button className="min-h-9 rounded-md border border-[#d8d2da] bg-white px-3 text-sm hover:bg-[#f7f5f7]">Helpful · 12</button><button className="min-h-9 rounded-md border border-[#d8d2da] bg-white px-3 text-sm hover:bg-[#f7f5f7]">Not yet · 2</button></div></div></article>)}
    </div>
    <div className="flex min-h-12 items-center rounded-lg border border-[#d8d3da] bg-white px-4 text-sm text-[#918894]"><span className="flex-1">Message #you-said-we-did</span><span className="font-mono text-xs">Aa</span><Icon name="send" size={17} className="ml-4" /></div>
  </div>
}

function LeadView({ published, setPublished }: { published: boolean; setPublished: (value: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <div className="mx-auto max-w-[1240px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#e5e1e7] pb-5"><div><p className="flex items-center gap-2 text-sm font-bold text-[#443b48]"><span className="grid size-8 place-items-center rounded-md bg-[#735886] text-white"><Icon name="trend" size={16} /></span> Early Connect Dashboard <span className="rounded bg-[#ebe7ed] px-1.5 py-0.5 text-[10px] text-[#6f6474]">APP</span></p><h2 className="mt-3 text-2xl font-bold text-[#28222b]">Program health at a glance</h2><p className="mt-1 flex items-center gap-2 text-sm text-[#756d79]"><Icon name="lock" size={14} /> Program leads only · Fall 2026 cohort</p></div><button className="flex min-h-11 items-center gap-2 rounded-lg border border-[#d9d3dc] bg-white px-4 text-sm font-bold text-[#554c59] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d56b3]"><Icon name="filter" size={17} /> All locations <Icon name="chevron" size={15} className="rotate-90" /></button></div>
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[['Response rate','82%','+8% vs last round','people'],['Sentiment','4.2 / 5','+0.3 this month','trend'],['Open flags','5','2 priority','activity'],['Loop closure','91%','Within 2 weeks','check']].map(([label,value,detail,icon], i) => <div key={label} className="rounded-2xl border border-[#e2dde5] bg-white p-5"><div className="flex items-start justify-between"><p className="text-sm font-semibold text-[#746b78]">{label}</p><div className={`grid size-9 place-items-center rounded-lg ${i === 2 ? 'bg-[#fff0ed] text-[#cb5947]' : 'bg-[#f0ebf4] text-[#6d56b3]'}`}><Icon name={icon as IconName} size={18} /></div></div><p className="mt-3 text-3xl font-bold tracking-tight text-[#2c2530]">{value}</p><p className={`mt-1 text-xs font-semibold ${i === 2 ? 'text-[#b35848]' : 'text-[#3a8b70]'}`}>{detail}</p></div>)}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-2xl border border-[#e2dde5] bg-white p-5 md:p-6">
          <div className="mb-5 flex items-start justify-between"><div><h3 className="font-bold text-[#302934]">Sentiment over time</h3><p className="mt-1 text-xs text-[#837987]">Average response across all pulse themes</p></div><span className="rounded-full bg-[#e8f6f1] px-3 py-1 text-xs font-bold text-[#2d8065]">Trending up</span></div>
          <TrendChart />
        </section>
        <section className="rounded-2xl border border-[#e2dde5] bg-white p-5 md:p-6">
          <div className="mb-5"><h3 className="font-bold text-[#302934]">Response by theme</h3><p className="mt-1 text-xs text-[#837987]">Positive share this round</p></div>
          <div className="space-y-5">{[['Program support',86],['Mentor comfort',74],['Professional growth',68],['RBC connection',54]].map(([label,value]) => <div key={label as string}><div className="mb-2 flex justify-between text-sm"><span className="font-semibold text-[#564d5a]">{label}</span><span className="font-bold text-[#302934]">{value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#eeeaf0]"><div className="h-full rounded-full bg-[#6d56b3]" style={{ width: `${value}%` }} /></div></div>)}</div>
        </section>
      </div>
      <section className="mt-5 overflow-hidden rounded-2xl border border-[#e2dde5] bg-white">
        <div className="flex items-center justify-between border-b border-[#ece8ee] px-5 py-4 md:px-6"><div><h3 className="font-bold text-[#302934]">Top themes by impact</h3><p className="mt-1 text-xs text-[#837987]">Reach × severity × risk link</p></div><button className="grid size-11 place-items-center rounded-lg text-[#6f6573] hover:bg-[#f5f2f6]" aria-label="Theme options"><Icon name="more" /></button></div>
        <div className="divide-y divide-[#eeeaf0]">
          {themes.map((theme, i) => <div key={theme.name} className="grid items-center gap-3 px-5 py-4 md:grid-cols-[32px_minmax(0,1fr)_100px_100px_120px] md:px-6">
            <span className="text-sm font-bold text-[#a098a3]">0{i + 1}</span><div><p className="font-bold text-[#39313d]">{theme.name}</p><p className="mt-1 text-xs text-[#837987]">{theme.mentions} mentions · <span style={{ color: theme.color }}>{theme.change} this round</span></p></div>
            <div><p className="text-[11px] font-bold uppercase tracking-wider text-[#9a919d]">Impact</p><p className="font-bold text-[#39313d]">{theme.impact}</p></div>
            <span className="w-fit rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: `${theme.color}16`, color: theme.color }}>{published && i === 0 ? 'Published' : theme.status}</span>
            <button onClick={() => setSelected(theme.name)} className="min-h-11 rounded-lg border border-[#d9d3dc] px-3 text-sm font-bold text-[#584d5d] hover:bg-[#f8f6f8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d56b3]">{i === 0 ? 'Take action' : 'View theme'}</button>
          </div>)}
        </div>
      </section>
      {selected && <Modal title="Close the loop" onClose={() => setSelected(null)}>
        <div className="p-6">
          <div className="rounded-xl bg-[#f6f2f8] p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#786384]">Theme</p><p className="mt-1 font-bold text-[#312a35]">{selected}</p><p className="mt-1 text-sm text-[#716775]">14 mentions · Impact score 8.8</p></div>
          <label className="mt-5 block text-sm font-bold text-[#473e4b]">Response type</label><div className="mt-2 grid grid-cols-3 gap-2">{['Keep','Remove','Improve'].map(type => <button key={type} className={`min-h-11 rounded-lg border text-sm font-bold ${type === 'Improve' ? 'border-[#6d56b3] bg-[#f2eef6] text-[#5e4671]' : 'border-[#dad4dd] text-[#6b626f]'}`}>{type}</button>)}</div>
          <label htmlFor="action" className="mt-5 block text-sm font-bold text-[#473e4b]">What we’re doing</label><textarea id="action" rows={3} defaultValue="We’re adding biweekly one-on-one mentor office hours and clearer ways for students to request personalized career guidance." className="mt-2 w-full resize-none rounded-xl border border-[#d8d2dc] p-3 text-sm outline-none focus:border-[#735886] focus:ring-2 focus:ring-[#735886]/15" />
          <div className="mt-5 flex justify-end gap-2"><button onClick={() => setSelected(null)} className="min-h-11 rounded-lg px-4 text-sm font-bold text-[#655b69]">Cancel</button><button onClick={() => { setPublished(true); setSelected(null) }} className="flex min-h-11 items-center gap-2 rounded-lg bg-[#5f4674] px-5 text-sm font-bold text-white hover:bg-[#4e3960] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d56b3] focus-visible:ring-offset-2"><Icon name="send" size={16} /> Publish update</button></div>
        </div>
      </Modal>}
    </div>
  )
}

function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [anonymous, setAnonymous] = useState(false)
  const [sent, setSent] = useState(false)
  const [recorded, setRecorded] = useState(false)
  const [summary, setSummary] = useState('I would value more one-on-one mentorship and clearer information about career paths at RBC.')
  const [editingSummary, setEditingSummary] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try { localStorage.setItem('pulse-feedback-saved', new Date().toISOString()) } catch { /* local preview only */ }
    setSent(true)
  }
  return <Modal title={sent ? 'Feedback received' : 'Share feedback anytime'} onClose={onClose}>
    {sent ? <div className="p-8 text-center"><div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-[#e8f6f1] text-[#2e8167]"><Icon name="check" size={28} /></div><h3 className="text-xl font-bold text-[#302934]">Thanks for speaking up</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#756b79]">This prototype saved your submission locally on this device. No data was sent to a server.</p><button onClick={onClose} className="mt-6 min-h-11 rounded-lg bg-[#5f4674] px-6 text-sm font-bold text-white">Done</button></div> :
    <form onSubmit={submit} className="p-6">
      <div className="mb-5 flex items-center justify-between rounded-xl bg-[#f6f2f8] p-4"><div className="pr-4"><p className="text-sm font-bold text-[#433949]">Submit anonymously</p><p className="mt-1 text-xs leading-5 text-[#756a7a]">No identity is stored; your feedback informs cohort trends only.</p></div><Toggle checked={anonymous} onChange={setAnonymous} label="Submit feedback anonymously" /></div>
      <label htmlFor="category" className="block text-sm font-bold text-[#473e4b]">Category</label><select id="category" className="mt-2 min-h-12 w-full rounded-xl border border-[#d8d2dc] bg-white px-3 text-sm outline-none focus:border-[#735886]"><option>Program</option><option>Mentor</option><option>Team</option><option>Event</option><option>Other</option></select>
      <label htmlFor="message" className="mt-5 block text-sm font-bold text-[#473e4b]">What would you like us to know?</label><textarea id="message" required={!recorded} rows={4} placeholder="Write your feedback, or record a voice note below…" className="mt-2 w-full resize-none rounded-xl border border-[#d8d2dc] p-3 text-sm outline-none placeholder:text-[#9b929f] focus:border-[#735886] focus:ring-2 focus:ring-[#735886]/15" />
      <div className="mt-3 rounded-xl border border-[#d8d2dc] bg-[#f8f6f8] p-4">
        <div className="flex flex-wrap items-center gap-3"><button type="button" onClick={() => { setRecorded(!recorded); setEditingSummary(false) }} aria-pressed={recorded} className={`flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d56b3] ${recorded ? 'border-[#0072ce] bg-[#e8f2fb] text-[#0051a5]' : 'border-[#d8d2dc] bg-white text-[#5e5362]'}`}><Icon name="mic" size={17} />{recorded ? 'Voice recorded · 0:18' : 'Record voice feedback'}</button><span className="text-xs text-[#817784]">{recorded ? 'Transcribed and summarized' : 'Raw audio is deleted after transcription'}</span></div>
        {recorded && <div className="mt-4 border-t border-[#d8d2dc] pt-4"><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0051a5]"><Icon name="sparkles" size={15} /> AI summary</div>{editingSummary ? <textarea aria-label="Edit AI summary" value={summary} onChange={event => setSummary(event.target.value)} rows={3} className="w-full resize-none rounded-lg border border-[#b9cfe4] bg-white p-3 text-sm leading-6 outline-none focus:border-[#0072ce] focus:ring-2 focus:ring-[#0072ce]/15" /> : <p className="text-sm leading-6 text-[#443b48]">{summary}</p>}<div className="mt-3 flex gap-3"><button type="button" onClick={() => setEditingSummary(!editingSummary)} className="min-h-9 text-xs font-bold text-[#0051a5] underline">{editingSummary ? 'Save edit' : 'Edit summary'}</button><button type="button" onClick={() => setRecorded(false)} className="min-h-9 text-xs font-bold text-[#6f6474] underline">Discard recording</button></div></div>}
      </div>
      {!anonymous && <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold text-[#554b59]"><input type="checkbox" className="size-5 accent-[#6d56b3]" />I’d like someone to reach out</label>}
      <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="min-h-11 rounded-lg px-4 text-sm font-bold text-[#655b69]">Cancel</button><button type="submit" className="min-h-11 rounded-lg bg-[#5f4674] px-5 text-sm font-bold text-white hover:bg-[#4e3960] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d56b3] focus-visible:ring-offset-2">Review & submit</button></div>
    </form>}
  </Modal>
}

function TalkingPoints({ name, onClose }: { name: string; onClose: () => void }) {
  return <Modal title={`Talking points for ${name}`} onClose={onClose}>
    <div className="p-6">
      <div className="mb-5 flex gap-3 rounded-xl bg-[#f1eef5] p-4 text-sm leading-6 text-[#5d5065]"><Icon name="sparkles" className="mt-0.5 shrink-0 text-[#6d56b3]" /><p>Coaching suggestions are based on visible signals only—never private comments or evaluation data.</p></div>
      <p className="text-xs font-bold uppercase tracking-wider text-[#8a808e]">Suggested opener</p><p className="mt-2 rounded-xl border border-[#e2dde5] p-4 text-sm leading-6 text-[#443b48]">“Hey {name.split(' ')[0]}, I wanted to check in and see how things have been feeling lately. No agenda—how are you doing?”</p>
      <p className="mt-5 text-xs font-bold uppercase tracking-wider text-[#8a808e]">Open questions</p><ol className="mt-2 space-y-3">{['What’s been taking most of your energy this week?','Is there anything making it harder to ask for help?','What’s one thing I could help unblock?'].map((q,i) => <li key={q} className="flex gap-3 text-sm leading-6 text-[#4e4552]"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#eee9f2] text-xs font-bold text-[#6d56b3]">{i + 1}</span>{q}</li>)}</ol>
      <div className="mt-6 flex justify-end"><button onClick={onClose} className="min-h-11 rounded-lg bg-[#5f4674] px-5 text-sm font-bold text-white">Use these points</button></div>
    </div>
  </Modal>
}

export default function App() {
  const [role, setRole] = useState<Role>('student')
  const [persona, setPersona] = useState<Persona>('student')
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [talkingFor, setTalkingFor] = useState<string | null>(null)
  const [published, setPublished] = useState(false)
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f3f6] text-[#2b2530]">
      <SlackGlobalBar />
      <div className="min-h-0 flex-1 lg:flex">
        <Sidebar role={role} setRole={setRole} persona={persona} setPersona={setPersona} />
        <div className="min-w-0 flex-1">
          <Topbar role={role} onFeedback={() => setFeedbackOpen(true)} />
          <main className="p-4 md:p-6">
            {role === 'student' && <StudentView onFeedback={() => setFeedbackOpen(true)} onFinish={() => undefined} />}
            {role === 'mentor' && persona !== 'student' && <MentorView onTalkingPoints={setTalkingFor} />}
            {role === 'lead' && persona === 'program' && <LeadView published={published} setPublished={setPublished} />}
            {role === 'said' && <SaidView />}
            {role === 'cohort' && <CohortView />}
          </main>
        </div>
      </div>
      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
      {talkingFor && <TalkingPoints name={talkingFor} onClose={() => setTalkingFor(null)} />}
    </div>
  )
}
