import { useState } from 'react'
import { ArrowRight, Check, ImagePlus, LoaderCircle, ScanSearch, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import { recognitionExamples } from '../../shared/data'
import { identifyHeritage } from '../../shared/recognition'
import type { HeritageRecognitionResult } from '../../shared/types'
import { apiRequest } from '../lib/api'
import { heritageCopy } from '../lib/content'
import { useLanguage } from '../lib/i18n'
import { CTAButton, EmptyState, HeritageCard, ImageFrame, JoinNotice, StatusNotice, Tag } from './Shared'

export function HeritageIdentifier({ compact = false }: { compact?: boolean }) {
  const { language, t } = useLanguage()
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
      setError(language === 'hi' ? 'एपीआई उपलब्ध नहीं है, इसलिए स्थानीय प्रदर्शन पहचान का उपयोग किया जा रहा है।' : 'The API is unavailable, so the local demonstration recognizer is being used.')
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
    <div className="identifier-head"><div><span className="eyebrow">{t('identify.eyebrow')}</span><h2>{t('identify.sectionTitle')}</h2><p>{t('identify.upload')}</p></div><ScanSearch size={32} /></div>
    <div className="identifier-layout">
      <div className="identifier-upload">
        {preview ? <div className="identifier-preview"><ImageFrame src={preview} alt={fileName || t('identify.fileHint')} /><button className="text-button" onClick={reset}>{t('identify.chooseAnother')}</button></div> : <label className="upload-drop"><Upload size={25} /><strong>{t('identify.uploadImage')}</strong><span>{t('identify.fileHint')}</span><input type="file" accept="image/*" onChange={handleUpload} /></label>}
        <div className="demo-image-list"><span className="demo-label">{t('identify.tryDemo')}</span>{recognitionExamples.map((example) => <button className="demo-image" key={example.id} onClick={() => { setFileName(example.label); recognize({ demoKey: example.id }, example.image) }}><ImageFrame src={example.image} alt={example.label} /><span>{example.label}</span></button>)}</div>
      </div>
      <div className="identifier-result" aria-live="polite">
        {busy && <div className="identifier-state"><LoaderCircle className="spin" size={22} /><p>{t('identify.comparing')}</p></div>}
        {!busy && !result && <div className="identifier-state"><ImagePlus size={24} /><p>{t('identify.waiting')}</p></div>}
        {!busy && result && identified && <div className="recognition-match"><div className="recognition-result-head"><div><Tag tone="success"><Check size={12} /> {t('identify.match')}</Tag><h3>{heritageCopy(identified, 'name', language)}</h3><p>{result.message}</p></div><span className="confidence-note">{t('identify.limited')}</span></div><p className="recognition-context"><strong>{t('identify.culturalContext')}</strong>{heritageCopy(identified, 'culturalSignificance', language)}</p><div className="result-actions"><CTAButton to={`/trails/create?heritage=${identified.slug}`}>{t('identify.buildTrail')}</CTAButton><Link className="arrow-link" to={`/heritage/${identified.slug}`}>{t('identify.readStory')} <ArrowRight size={15} /></Link></div></div>}
        {!busy && result && !identified && <div className="recognition-fallback"><Tag>{t('identify.fallbackTag')}</Tag><h3>{result.message}</h3><p>{t('identify.fallbackBody')}</p>{nearby.length ? <div className="mini-heritage-grid">{nearby.map((item) => <HeritageCard key={item.id} item={item} compact />)}</div> : <EmptyState title={language === 'hi' ? 'अभी आसपास के सुझाव नहीं हैं' : 'No nearby suggestions yet'} />}</div>}
        {error && <StatusNotice>{error}</StatusNotice>}
      </div>
    </div>
    {!compact && <JoinNotice text={language === 'hi' ? 'एआई विज़न प्रोटोटाइप · पहचान प्रदर्शन डेटा तक सीमित है और सार्वभौमिक छवि पहचान नहीं है।' : 'AI vision prototype · Recognition is limited to the demonstration dataset and is not universal image recognition.'} />}
  </section>
}
