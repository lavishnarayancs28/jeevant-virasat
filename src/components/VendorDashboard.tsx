import { ArrowRight, BarChart3, CheckCircle2, MapPin, PackagePlus, ShieldCheck, ShoppingBag, TrendingUp, Users } from 'lucide-react'
import { useState } from 'react'
import { prototypeVendorDashboard as vendor } from '../../shared/vendor-data'
import { useLanguage } from '../lib/i18n'
import { Eyebrow, PageHero, SectionHeading, StatusNotice, Tag } from './Shared'

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`

export function VendorDashboard() {
  const { t } = useLanguage()
  const [notice, setNotice] = useState('')
  const copy = {
    eyebrow: t('vendor.eyebrow'), title: t('vendor.title'), body: t('vendor.body'), overview: t('vendor.overview'), business: t('vendor.business'), products: t('vendor.products'), productsBody: t('vendor.productsBody'), insights: t('vendor.insights'), insightsBody: t('vendor.insightsBody'), cultural: t('vendor.cultural'), actions: t('vendor.actions'), sales: t('vendor.sales'), orders: t('vendor.orders'), customers: t('vendor.customers'), profit: t('vendor.profit'), revenue: t('vendor.revenue'), costs: t('vendor.costs'), product: t('vendor.product'), price: t('vendor.price'), stock: t('vendor.stock'), status: t('vendor.status'), inStock: t('vendor.inStock'), lowStock: t('vendor.lowStock'), outOfStock: t('vendor.outOfStock'), sevenDay: t('vendor.sevenDay'), heritageSite: t('vendor.heritageSite'), practice: t('vendor.practice'), addProduct: t('vendor.addProduct'), updateStock: t('vendor.updateStock'), viewVerification: t('vendor.viewVerification'), viewAnalytics: t('vendor.viewAnalytics'), prototypeNote: t('vendor.prototypeLimitation'),
  }
  const maxRevenue = Math.max(...vendor.insights.revenueHistory.map((point) => point.revenue))
  const actionNotice = (action: string) => setNotice(t('vendor.prototypeAction', undefined, { action }))
  const stockLabel = (status: string) => status === 'In stock' ? copy.inStock : status === 'Low stock' ? copy.lowStock : copy.outOfStock

  return <div className="container page-container vendor-page">
    <PageHero eyebrow={copy.eyebrow} title={copy.title} body={copy.body}>
      <div className="vendor-hero-meta"><Tag tone="success"><CheckCircle2 size={12} /> {t('vendor.prototypeLabel')}</Tag></div>
    </PageHero>
    {notice && <StatusNotice tone="success">{notice}</StatusNotice>}

    <section className="vendor-overview" aria-labelledby="vendor-overview-title">
      <div className="vendor-overview-copy">
        <Eyebrow>{copy.overview}</Eyebrow>
        <h2 id="vendor-overview-title">{vendor.name}</h2>
        <p>{vendor.category}</p>
        <span className="vendor-location"><MapPin size={15} /> {vendor.location}</span>
      </div>
      <div className="vendor-verification-card">
        <ShieldCheck size={21} />
        <span>{t('vendor.verificationStatus')}</span>
        <strong>{vendor.verificationStatus}</strong>
      </div>
    </section>

    <section className="vendor-section" aria-labelledby="vendor-business-title">
      <SectionHeading eyebrow={copy.business} title={t('vendor.overviewTitle')} />
      <div className="vendor-metric-grid">
        <article className="vendor-metric"><ShoppingBag size={19} /><span>{copy.sales}</span><strong>{formatCurrency(vendor.today.sales)}</strong></article>
        <article className="vendor-metric"><BarChart3 size={19} /><span>{copy.orders}</span><strong>{vendor.today.orders}</strong></article>
        <article className="vendor-metric"><Users size={19} /><span>{copy.customers}</span><strong>{vendor.today.customers}</strong></article>
        <article className="vendor-metric"><TrendingUp size={19} /><span>{copy.profit}</span><strong>{formatCurrency(vendor.today.estimatedProfit)}</strong></article>
      </div>
    </section>

    <section className="vendor-section" aria-labelledby="vendor-products-title">
      <SectionHeading eyebrow={copy.products} title={t('vendor.productsTitle')} body={copy.productsBody} />
      <div className="vendor-panel vendor-product-list">
        <div className="vendor-product-header"><span>{copy.product}</span><span>{copy.price}</span><span>{copy.stock}</span><span>{copy.status}</span></div>
        {vendor.products.map((product) => <div className="vendor-product-row" key={product.name}>
          <strong>{product.name}</strong>
          <span>{formatCurrency(product.price)}</span>
          <span>{product.stock}</span>
          <span className={`vendor-stock-status ${product.status.toLowerCase().replaceAll(' ', '-')}`}>{stockLabel(product.status)}</span>
        </div>)}
      </div>
    </section>

    <section className="vendor-section" id="business-insights" aria-labelledby="vendor-insights-title">
      <SectionHeading eyebrow={copy.insights} title={t('vendor.insightsTitle')} body={copy.insightsBody} />
      <div className="vendor-insights-layout">
        <article className="vendor-panel vendor-chart-panel">
          <div className="vendor-panel-heading"><div><Eyebrow>{copy.sevenDay}</Eyebrow><h3>{formatCurrency(vendor.insights.revenue)}</h3></div><BarChart3 size={21} /></div>
          <div className="vendor-chart" role="img" aria-label={`${copy.sevenDay}: ${vendor.insights.revenueHistory.map((point) => `${point.day} ${formatCurrency(point.revenue)}`).join(', ')}`}>
            {vendor.insights.revenueHistory.map((point) => <div className="vendor-chart-column" key={point.day}><div className="vendor-chart-track"><div className="vendor-chart-bar" style={{ height: `${Math.max((point.revenue / maxRevenue) * 100, 7)}%` }} /></div><small>{point.day}</small><span>{formatCurrency(point.revenue)}</span></div>)}
          </div>
        </article>
        <article className="vendor-panel vendor-financial-panel">
          <Eyebrow>{t('vendor.financialSummary')}</Eyebrow>
          <div className="vendor-financial-row"><span>{copy.revenue}</span><strong>{formatCurrency(vendor.insights.revenue)}</strong></div>
          <div className="vendor-financial-row"><span>{copy.costs}</span><strong>{formatCurrency(vendor.insights.costs)}</strong></div>
          <div className="vendor-financial-row highlight"><span>{copy.profit}</span><strong>{formatCurrency(vendor.insights.profit)}</strong></div>
          <p>{t('vendor.financialNote')}</p>
        </article>
      </div>
    </section>

    <section className="vendor-cultural-connection" aria-labelledby="vendor-cultural-title">
      <div className="vendor-cultural-mark">JV</div>
      <div>
        <Eyebrow>{copy.cultural}</Eyebrow>
        <h2 id="vendor-cultural-title">{vendor.culturalConnection.heritageSite}</h2>
        <p>{vendor.culturalConnection.description}</p>
        <div className="vendor-cultural-facts"><div><span>{copy.heritageSite}</span><strong>{vendor.culturalConnection.heritageSite}</strong></div><div><span>{copy.practice}</span><strong>{vendor.culturalConnection.practice}</strong></div></div>
      </div>
    </section>

    <section className="vendor-section vendor-actions-section" aria-labelledby="vendor-actions-title">
      <SectionHeading eyebrow={copy.actions} title={t('vendor.actionsTitle')} />
      <div className="vendor-actions">
        <button type="button" className="button primary" onClick={() => actionNotice(copy.addProduct)}><PackagePlus size={16} /> {copy.addProduct}</button>
        <button type="button" className="button secondary" onClick={() => actionNotice(copy.updateStock)}><PackagePlus size={16} /> {copy.updateStock}</button>
        <a className="button secondary" href="/verify/artisan/artisan-pipli-applique"><ShieldCheck size={16} /> {copy.viewVerification}</a>
        <a className="button secondary" href="#business-insights"><BarChart3 size={16} /> {copy.viewAnalytics} <ArrowRight size={15} /></a>
      </div>
    </section>

    <StatusNotice><strong>{t('vendor.prototypeLimitationLabel')}</strong>{copy.prototypeNote}</StatusNotice>
  </div>
}
