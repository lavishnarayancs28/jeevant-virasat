import type { BusinessHealth, LivelihoodRecord, LivelihoodRecordInput } from './types'

export function calculateLivelihood(input: LivelihoodRecordInput): LivelihoodRecord {
  const revenue = input.unitsSold * input.averageSellingPrice
  const totalCost = input.materialCost + input.labourCost + input.transportCost + input.otherCosts
  const grossProfit = revenue - totalCost
  return { ...input, revenue, totalCost, grossProfit, profitMargin: revenue > 0 ? (grossProfit / revenue) * 100 : null }
}

export function aggregateLivelihood(records: LivelihoodRecord[]) {
  return records.reduce((total, record) => ({
    productionUnits: total.productionUnits + record.productionUnits,
    unitsSold: total.unitsSold + record.unitsSold,
    revenue: total.revenue + record.revenue,
    totalCost: total.totalCost + record.totalCost,
    materialCost: total.materialCost + record.materialCost,
    labourCost: total.labourCost + record.labourCost,
    transportCost: total.transportCost + record.transportCost,
    otherCosts: total.otherCosts + record.otherCosts,
    grossProfit: total.grossProfit + record.grossProfit,
  }), { productionUnits: 0, unitsSold: 0, revenue: 0, totalCost: 0, materialCost: 0, labourCost: 0, transportCost: 0, otherCosts: 0, grossProfit: 0 })
}

export function classifyBusinessHealth(revenue: number, grossProfit: number): BusinessHealth {
  if (revenue <= 0) return 'INSUFFICIENT_DATA'
  const margin = (grossProfit / revenue) * 100
  if (grossProfit < 0) return 'NEGATIVE_MARGIN'
  if (margin < 15) return 'LOW_MARGIN'
  return 'POSITIVE_MARGIN'
}

export function explainBusinessHealth(revenue: number, totalCost: number, grossProfit: number) {
  if (revenue <= 0) return 'There is not enough recorded prototype revenue to assess a margin.'
  if (grossProfit < 0) return 'Recorded prototype costs exceed revenue. The dashboard should be read as an illustrative loss scenario.'
  return `Revenue exceeds recorded prototype operating costs, resulting in a positive estimated gross margin. Total costs are ₹${totalCost.toLocaleString('en-IN')}.`
}
