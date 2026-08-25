export type VendorStockStatus = 'In stock' | 'Low stock' | 'Out of stock'

export interface VendorProduct {
  name: string
  price: number
  stock: number
  status: VendorStockStatus
}

export interface VendorRevenuePoint {
  day: string
  revenue: number
}

export interface VendorDashboardData {
  name: string
  category: string
  location: string
  verificationStatus: string
  today: {
    sales: number
    orders: number
    customers: number
    estimatedProfit: number
  }
  products: VendorProduct[]
  insights: {
    revenue: number
    costs: number
    profit: number
    revenueHistory: VendorRevenuePoint[]
  }
  culturalConnection: {
    heritageSite: string
    practice: string
    description: string
  }
}

export const prototypeVendorDashboard: VendorDashboardData = {
  name: 'Pipli Appliqué Collective (prototype)',
  category: 'Textile craft vendor',
  location: 'Pipli, Kurukshetra district, Haryana',
  verificationStatus: 'PROTOTYPE — pending community review',
  today: { sales: 8400, orders: 6, customers: 14, estimatedProfit: 3150 },
  products: [
    { name: 'Appliqué textile panel', price: 650, stock: 18, status: 'In stock' },
    { name: 'Layered colour wall hanging', price: 1200, stock: 7, status: 'Low stock' },
    { name: 'Small stitched keepsake pouch', price: 380, stock: 0, status: 'Out of stock' },
  ],
  insights: {
    revenue: 43800,
    costs: 24100,
    profit: 19700,
    revenueHistory: [
      { day: 'Mon', revenue: 4200 },
      { day: 'Tue', revenue: 5600 },
      { day: 'Wed', revenue: 3900 },
      { day: 'Thu', revenue: 7200 },
      { day: 'Fri', revenue: 6400 },
      { day: 'Sat', revenue: 8100 },
      { day: 'Sun', revenue: 8400 },
    ],
  },
  culturalConnection: {
    heritageSite: 'Pipli’s Appliqué Courtyards',
    practice: 'Appliqué textile practice',
    description: 'A prototype connection between a local vendor record and the cut-cloth, layered-colour practice documented around Pipli. Maker attribution and consent remain open for community review.',
  },
}
