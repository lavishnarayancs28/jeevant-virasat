import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useLanguage } from '../lib/i18n'

export function PrototypeModal({ eyebrow, title, onClose, children }: { eyebrow?: string; title: string; onClose: () => void; children: React.ReactNode }) {
  const { language } = useLanguage()
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="prototype-modal" role="dialog" aria-modal="true" aria-labelledby="prototype-modal-title">
      <button className="modal-close" onClick={onClose} aria-label={language === 'hi' ? 'संवाद बंद करें' : 'Close dialog'}><X size={18} /></button>
      <span className="eyebrow">{eyebrow ?? (language === 'hi' ? 'प्रोटोटाइप इंटरैक्शन' : 'Prototype interaction')}</span>
      <h2 id="prototype-modal-title">{title}</h2>
      {children}
    </section>
  </div>
}
