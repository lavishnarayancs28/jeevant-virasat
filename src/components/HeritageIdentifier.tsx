import { useState } from 'react'
import { ArrowRight, Check, ImagePlus, LoaderCircle, ScanSearch, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import { recognitionExamples } from '../../shared/data'
import { identifyHeritage } from '../../shared/recognition'
import type { HeritageRecognitionResult } from '../../shared/types'
import { apiRequest } from '../lib/api'
import { CTAButton, EmptyState, HeritageCard, ImageFrame, JoinNotice, StatusNotice, Tag } from './Shared'

export function HeritageIdentifier({ compact = false }: { compact?: boolean }) {
  const [preview, setPreview] = useState('')
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState<HeritageRecognitionResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const recognize = async (input: { demoKey?: string; fileName?: string }, image = '') => {
    setBusy(true)
    setError('')
    if (image) setPreview(image)
    try {
      const next = await apiRequest<HeritageRecognitionResult>('/api/heritage/identify', { method: 'POST', body: JSON.stringify(input) })
      setResult(next)
    } catch {
      setResult(identifyHeritage(input))
      setError('The API is unavailable, so the local demonstration recognizer is being used.')
    } finally {
      setBusy(false)
    }
  }

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => recognize({ fileName: file.name }, typeof reader.result === 'string' ? reader.result : '')
    reader.readAsDataURL(file)
  }

  const reset = () => { setPreview(''); setFileName(''); setResult(null); setError('') }
  const identified = result?.identified
  const nearby = result?.nearby ?? []

  return <section className={`identifier ${compact ? 'compact' : ''}`}>
    <div className="identifier-head"><div><span className="eyebrow">AI vision prototype</span><h2>Identify Heritage</h2><p>Upload a place or choose a curated demonstration image. Recognition is limited to the demonstration dataset.</p></div><ScanSearch size={32} /></div>
    <div className="identifier-layout">
      <div className="identifier-upload">
        {preview ? <div className="identifier-preview"><ImageFrame src={preview} alt={fileName || 'Selected demonstration image'} /><button className="text-button" onClick={reset}>Choose another image</button></div> : <label className="upload-drop"><Upload size={25} /><strong>Upload an image</strong><span>JPG, PNG or a demonstration image</span><input type="file" accept="image/*" onChange={handleUpload} /></label>}
        <div className="demo-image-list"><span className="demo-label">Try the demo dataset</span>{recognitionExamples.map((example) => <button className="demo-image" key={example.id} onClick={() => { setFileName(example.label); recognize({ demoKey: example.id }, example.image) }}><ImageFrame src={example.image} alt="" /><span>{example.label}</span></button>)}</div>
      </div>
      <div className="identifier-result" aria-live="polite">
        {busy && <div className="identifier-state"><LoaderCircle className="spin" size={22} /><p>Comparing with the curated prototype examples…</p></div>}
        {!busy && !result && <div className="identifier-state"><ImagePlus size={24} /><p>Your recognition result will appear here with cultural context and nearby living heritage.</p></div>}
        {!busy && result && identified && <div className="recognition-match"><div className="recognition-result-head"><div><Tag tone="success"><Check size={12} /> Prototype match</Tag><h3>{identified.name}</h3><p>{result.message}</p></div><span className="confidence-note">Limited demo dataset</span></div><p className="recognition-context"><strong>Cultural context</strong>{identified.culturalSignificance}</p><div className="result-actions"><CTAButton to={`/trails/create?heritage=${identified.slug}`}>Build a Trail From This</CTAButton><Link className="arrow-link" to={`/heritage/${identified.slug}`}>Read the place story <ArrowRight size={15} /></Link></div></div>}
        {!busy && result && !identified && <div className="recognition-fallback"><Tag>Needs a closer match</Tag><h3>{result.message}</h3><p>Explore nearby heritage instead, or try one of the demonstration images above.</p>{nearby.length ? <div className="mini-heritage-grid">{nearby.map((item) => <HeritageCard key={item.id} item={item} compact />)}</div> : <EmptyState title="No nearby suggestions yet" />}</div>}
        {error && <StatusNotice>{error}</StatusNotice>}
      </div>
    </div>
    {!compact && <JoinNotice text="AI vision prototype · Recognition is limited to the demonstration dataset and is not universal image recognition." />}
  </section>
}
