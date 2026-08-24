import { X } from 'lucide-react'
import { useEffect } from 'react'

export function PrototypeModal({ eyebrow = 'Prototype interaction', title, onClose, children }: { eyebrow?: string; title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="prototype-modal" role="dialog" aria-modal="true" aria-labelledby="prototype-modal-title">
      <button className="modal-close" onClick={onClose} aria-label="Close dialog"><X size={18} /></button>
      <span className="eyebrow">{eyebrow}</span>
      <h2 id="prototype-modal-title">{title}</h2>
      {children}
    </section>
  </div>
}
