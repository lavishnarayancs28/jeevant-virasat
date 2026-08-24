import { ArrowLeft, ArrowRight, Check, Compass, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { apiRequest } from '../lib/api'
import { generateTrail } from '../../shared/recommendation'
import { heritage, regions } from '../../shared/data'
import type { ExperienceType, Trail, TrailRequest, TrailTime } from '../../shared/types'
import { Link, useNavigate } from 'react-router-dom'

const interestOptions = ['History', 'Food', 'Crafts', 'Architecture', 'Spirituality', 'Folk Culture', 'Photography', 'Local Stories']
const timeOptions: TrailTime[] = ['2 hours', 'Half day', 'Full day', 'Weekend']
const experienceOptions: ExperienceType[] = ['Quiet & Authentic', 'Cultural & Social', 'Food-focused', 'Photography', 'Deep Historical', 'Local Stories']

export function TrailBuilder() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [interests, setInterests] = useState<string[]>(['Crafts', 'Food'])
  const [timeChoice, setTimeChoice] = useState<TrailTime>('Half day')
  const [experienceType, setExperienceType] = useState<ExperienceType>('Cultural & Social')
  const [regionSlug, setRegionSlug] = useState(regions[0].id)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const toggleInterest = (interest: string) => setInterests((current) => current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest])
  const generate = async () => {
    if (!interests.length) { setError('Choose at least one interest to shape your trail.'); return }
    setBusy(true); setError('')
    const request: TrailRequest = { interests, timeChoice, experienceType, regionSlug }
    try {
      const result = await apiRequest<Trail>('/api/trails/generate', { method: 'POST', body: JSON.stringify(request) })
      navigate(`/trails/${result.id}`)
    } catch {
      const region = regions.find((item) => item.id === regionSlug) ?? regions[0]
      const result = generateTrail(request, heritage, region.name)
      navigate(`/trails/${result.id}`, { state: { trail: result } })
    } finally { setBusy(false) }
  }

  return <div className="trail-builder"><div className="builder-progress" aria-label={`Step ${step} of 4`}><div className="progress-line"><span style={{ width: `${step * 25}%` }} /></div>{['Interests', 'Time', 'Feel', 'Generate'].map((label, index) => <div key={label} className={`progress-step ${index + 1 <= step ? 'active' : ''}`}><span>{index + 1 < step ? <Check size={14} /> : index + 1}</span><small>{label}</small></div>)}</div>
    <div className="builder-panel"><div className="builder-copy"><span className="builder-step">Step {step} of 4</span>{step === 1 && <><h2>What should stay with you?</h2><p>Choose the threads you want to follow. We’ll look for places where those interests meet real local practice.</p></>}{step === 2 && <><h2>How much time do you have?</h2><p>Your trail will stay within this window, including time at each stop.</p></>}{step === 3 && <><h2>What kind of day feels right?</h2><p>This helps the recommendation service balance pace, people and depth.</p></>}{step === 4 && <><h2>Ready to make a route?</h2><p>We’ll rank the demonstration heritage data for {regions.find((item) => item.id === regionSlug)?.name} and explain why each stop fits.</p></>}</div>
      {step === 1 && <div className="choice-grid interest-grid">{interestOptions.map((item) => <button key={item} className={`choice-card ${interests.includes(item) ? 'selected' : ''}`} onClick={() => toggleInterest(item)} aria-pressed={interests.includes(item)}><span className="choice-check">{interests.includes(item) && <Check size={15} />}</span><strong>{item}</strong></button>)}</div>}
      {step === 2 && <div className="choice-grid">{timeOptions.map((item) => <button key={item} className={`choice-card large ${timeChoice === item ? 'selected' : ''}`} onClick={() => setTimeChoice(item)} aria-pressed={timeChoice === item}><span className="choice-symbol">{item === '2 hours' ? '02' : item === 'Half day' ? '½' : item === 'Full day' ? '01' : '02'}</span><strong>{item}</strong><small>{item === '2 hours' ? 'A focused pause' : item === 'Half day' ? 'A generous morning or afternoon' : item === 'Full day' ? 'Space to go deeper' : 'A slower regional rhythm'}</small></button>)}</div>}
      {step === 3 && <div className="choice-grid experience-grid">{experienceOptions.map((item) => <button key={item} className={`choice-card large ${experienceType === item ? 'selected' : ''}`} onClick={() => setExperienceType(item)} aria-pressed={experienceType === item}><Compass size={20} /><strong>{item}</strong></button>)}</div>}
      {step === 4 && <div className="review-card"><div><span>Interests</span><strong>{interests.join(' · ')}</strong></div><div><span>Time</span><strong>{timeChoice}</strong></div><div><span>Feel</span><strong>{experienceType}</strong></div><label>Region<select value={regionSlug} onChange={(event) => setRegionSlug(event.target.value)}>{regions.map((region) => <option key={region.id} value={region.id}>{region.name}, {region.state}</option>)}</select></label></div>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="builder-actions">{step > 1 ? <button className="text-button" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Back</button> : <Link className="text-button" to="/trails"><ArrowLeft size={16} /> Leave builder</Link>}{step < 4 ? <button className="button primary" onClick={() => setStep(step + 1)}>Continue <ArrowRight size={16} /></button> : <button className="button primary" onClick={generate} disabled={busy}>{busy ? <><LoaderCircle className="spin" size={16} /> Building</> : <>Generate my trail <ArrowRight size={16} /></>}</button>}</div>
    </div></div>
}
