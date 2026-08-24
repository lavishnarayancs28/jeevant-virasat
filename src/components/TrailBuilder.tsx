import { ArrowLeft, ArrowRight, Check, Compass, LoaderCircle, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { generateTrail } from '../../shared/recommendation'
import { heritage, regions } from '../../shared/data'
import type { CrowdPreference, ExperienceType, Trail, TrailRequest, TrailTime } from '../../shared/types'
import { apiRequest } from '../lib/api'
import { StatusNotice } from './Shared'

const interestOptions = ['Crafts', 'Local Food', 'Local Stories', 'Living Traditions', 'Spiritual/Cultural', 'Architecture']
const timeOptions: TrailTime[] = ['2 hours', 'Half day', 'Full day']
const experienceOptions: ExperienceType[] = ['Cultural & Social', 'Quiet & Slow', 'Food & Craft', 'History & Stories', 'Family Friendly']
const crowdOptions: CrowdPreference[] = ['Popular', 'Balanced', 'Hidden Gems']
const stepLabels = ['Interests', 'Time', 'Experience', 'Crowd', 'Generate']
const totalSteps = stepLabels.length

export function TrailBuilder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const heritageSlug = searchParams.get('heritage') ?? ''
  const heritageContext = heritage.find((item) => item.slug === heritageSlug)
  const [step, setStep] = useState(1)
  const [interests, setInterests] = useState<string[]>(['Crafts', 'Local Food'])
  const [timeChoice, setTimeChoice] = useState<TrailTime>('Half day')
  const [experienceType, setExperienceType] = useState<ExperienceType>('Cultural & Social')
  const [crowdPreference, setCrowdPreference] = useState<CrowdPreference>('Balanced')
  const [regionSlug, setRegionSlug] = useState(heritageContext?.regionId ?? regions[0].id)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const toggleInterest = (interest: string) => setInterests((current) => current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest])
  const generate = async () => {
    if (!interests.length) { setError('Choose at least one interest to shape your trail.'); setStep(1); return }
    setBusy(true); setError('')
    const request: TrailRequest = { interests, timeChoice, experienceType, crowdPreference, regionSlug }
    try {
      const result = await apiRequest<Trail>('/api/trails/generate', { method: 'POST', body: JSON.stringify(request) })
      navigate(`/trails/${result.id}`)
    } catch {
      const region = regions.find((item) => item.id === regionSlug) ?? regions[0]
      const result = generateTrail(request, heritage, region.name)
      navigate(`/trails/${result.id}`, { state: { trail: result } })
    } finally { setBusy(false) }
  }

  const copy = step === 1
    ? ['What should stay with you?', 'Choose the threads you want to follow. The recommendation service looks for places where those interests meet real local practice.']
    : step === 2
      ? ['How much time do you have?', 'Your trail will stay within this window, including time at each stop.']
      : step === 3
        ? ['What kind of day feels right?', 'This helps the prototype balance pace, people and depth.']
        : step === 4
          ? ['How should the route feel?', 'Choose whether to follow well-known anchors, a mix of places or less-known entries in this prototype dataset.']
          : ['Ready to make a route?', `We’ll rank the demonstration heritage data for ${regions.find((item) => item.id === regionSlug)?.name} and explain why each stop fits.`]

  return <div className="trail-builder">
    <div className="builder-progress five" aria-label={`Step ${step} of ${totalSteps}`}><div className="progress-line"><span style={{ width: `${(step / totalSteps) * 100}%` }} /></div>{stepLabels.map((label, index) => <div key={label} className={`progress-step ${index + 1 <= step ? 'active' : ''}`}><span>{index + 1 < step ? <Check size={14} /> : index + 1}</span><small>{label}</small></div>)}</div>
    <div className="builder-panel">
      <div className="builder-copy"><span className="builder-step">Step {step} of {totalSteps}</span><h2>{copy[0]}</h2><p>{copy[1]}</p>{heritageContext && <StatusNotice tone="success">Starting from <strong>{heritageContext.name}</strong>. The generated route will keep this place in view.</StatusNotice>}</div>
      {step === 1 && <div className="choice-grid interest-grid">{interestOptions.map((item) => <button type="button" key={item} className={`choice-card ${interests.includes(item) ? 'selected' : ''}`} onClick={() => toggleInterest(item)} aria-pressed={interests.includes(item)}><span className="choice-check">{interests.includes(item) && <Check size={15} />}</span><strong>{item}</strong></button>)}</div>}
      {step === 2 && <div className="choice-grid">{timeOptions.map((item) => <button type="button" key={item} className={`choice-card large ${timeChoice === item ? 'selected' : ''}`} onClick={() => setTimeChoice(item)} aria-pressed={timeChoice === item}><span className="choice-symbol">{item === '2 hours' ? '02' : item === 'Half day' ? '½' : '01'}</span><strong>{item}</strong><small>{item === '2 hours' ? 'A focused pause' : item === 'Half day' ? 'A generous morning or afternoon' : 'Space to go deeper'}</small></button>)}</div>}
      {step === 3 && <div className="choice-grid experience-grid">{experienceOptions.map((item) => <button type="button" key={item} className={`choice-card large ${experienceType === item ? 'selected' : ''}`} onClick={() => setExperienceType(item)} aria-pressed={experienceType === item}><Compass size={20} /><strong>{item}</strong></button>)}</div>}
      {step === 4 && <div className="choice-grid crowd-grid">{crowdOptions.map((item) => <button type="button" key={item} className={`choice-card large ${crowdPreference === item ? 'selected' : ''}`} onClick={() => setCrowdPreference(item)} aria-pressed={crowdPreference === item}><Sparkles size={20} /><strong>{item}</strong><small>{item === 'Popular' ? 'Start with familiar anchors' : item === 'Balanced' ? 'Blend anchors and quieter stops' : 'Prioritize less-known prototype entries'}</small></button>)}</div>}
      {step === 5 && <div className="review-card"><div><span>Interests</span><strong>{interests.join(' · ')}</strong></div><div><span>Time</span><strong>{timeChoice}</strong></div><div><span>Experience</span><strong>{experienceType}</strong></div><div><span>Crowd preference</span><strong>{crowdPreference}</strong></div><label>Region<select value={regionSlug} onChange={(event) => setRegionSlug(event.target.value)}>{regions.map((region) => <option key={region.id} value={region.id}>{region.name}, {region.state}</option>)}</select></label></div>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="builder-actions">{step > 1 ? <button type="button" className="text-button" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Back</button> : <Link className="text-button" to="/trails"><ArrowLeft size={16} /> Leave builder</Link>}{step < totalSteps ? <button type="button" className="button primary" onClick={() => setStep(step + 1)}>Continue <ArrowRight size={16} /></button> : <button type="button" className="button primary" onClick={generate} disabled={busy}>{busy ? <><LoaderCircle className="spin" size={16} /> Building</> : <>Generate my trail <ArrowRight size={16} /></>}</button>}</div>
    </div>
  </div>
}
