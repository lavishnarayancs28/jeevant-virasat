import { ExternalLink, QrCode, X } from 'lucide-react'
import { useState } from 'react'
import type { DataProvenance, VerificationStatus } from '../../shared/types'
import { useLanguage } from '../lib/i18n'
import { verificationPath } from '../lib/verification'

const statusClass: Record<VerificationStatus, string> = { VERIFIED: 'verified', COMMUNITY_VERIFIED: 'community-verified', PROTOTYPE: 'prototype', PENDING_VERIFICATION: 'pending' }

export function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  const { t } = useLanguage()
  const labels: Record<VerificationStatus, string> = { VERIFIED: t('verification.statusVerified'), COMMUNITY_VERIFIED: t('verification.statusCommunity'), PROTOTYPE: t('verification.statusPrototype'), PENDING_VERIFICATION: t('verification.statusPending') }
  return <span className={`verification-status ${statusClass[status]}`} aria-label={`${t('verification.status')}: ${labels[status]}`}>{labels[status]}</span>
}

export function DataProvenance({ provenance }: { provenance: DataProvenance }) {
  const { t } = useLanguage()
  return <section className="provenance-card" aria-labelledby="data-provenance-title"><div className="provenance-heading"><h3 id="data-provenance-title">{t('provenance.title')}</h3>{provenance.isPrototype && <span className="prototype-label">{t('provenance.prototype')}</span>}</div><dl><div><dt>{t('provenance.source')}</dt><dd><a href={provenance.sourceUrl} target="_blank" rel="noreferrer">{provenance.source} <ExternalLink size={12} /></a></dd></div><div><dt>{t('provenance.status')}</dt><dd><VerificationStatusBadge status={provenance.verificationStatus} /></dd></div><div><dt>{t('provenance.lastUpdated')}</dt><dd>{provenance.lastUpdated}</dd></div>{provenance.imageSource && <div><dt>{t('provenance.image')}</dt><dd>{provenance.imageSource}{provenance.imageLicense ? ` · ${provenance.imageLicense}` : ''}</dd></div>}</dl>{provenance.isPrototype && <p className="provenance-note">{t('verification.disclaimer')}</p>}</section>
}

export function VerificationQr({ kind, id }: { kind: 'heritage' | 'artisan' | 'product'; id: string }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const recordPath = verificationPath(kind, id)
  const qrImageUrl = `https://quickchart.io/qr?size=320&text=${encodeURIComponent(recordPath)}`
  return <>
    <button type="button" className="button secondary verification-qr-trigger" onClick={() => setOpen(true)}><QrCode size={16} /> {t('verification.generate')}</button>
    {open && <div className="modal-backdrop verification-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}><section className="verification-qr-modal" role="dialog" aria-modal="true" aria-labelledby="verification-qr-title"><button className="modal-close" type="button" onClick={() => setOpen(false)} aria-label={t('common.close')}><X size={18} /></button><span className="eyebrow"><QrCode size={13} /> {t('verification.record')}</span><h2 id="verification-qr-title">{t('verification.scan')}</h2><img src={qrImageUrl} alt={`${t('verification.scan')}: ${recordPath}`} className="verification-qr-image" /><code>{recordPath}</code><p>{t('verification.disclaimer')}</p><div className="verification-qr-actions"><a className="button primary" href={qrImageUrl} download={`jeevant-virasat-${kind}-${id}.png`} target="_blank" rel="noreferrer">{t('verification.download')}</a><a className="arrow-link" href={recordPath}>{t('verification.open')} <ExternalLink size={14} /></a></div></section></div>}
  </>
}
