export type VerificationRecordKind = 'heritage' | 'artisan' | 'product'

export function verificationPath(kind: VerificationRecordKind, id: string) {
  return `/verify/${kind}/${id}`
}
