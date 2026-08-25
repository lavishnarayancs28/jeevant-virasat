import { ApiError } from './utils/errors'

export function stringValue(value: unknown, field: string, options: { required?: boolean; max?: number; min?: number } = {}) {
  if (value === undefined || value === null || value === '') {
    if (options.required) throw ApiError.badRequest(`${field} is required.`)
    return undefined
  }
  if (typeof value !== 'string') throw ApiError.badRequest(`${field} must be a string.`)
  const result = value.trim()
  if (options.required && !result) throw ApiError.badRequest(`${field} is required.`)
  if (options.max && result.length > options.max) throw ApiError.badRequest(`${field} is too long.`)
  if (options.min && result.length < options.min) throw ApiError.badRequest(`${field} is too short.`)
  return result
}

export function positiveNumber(value: unknown, field: string, options: { required?: boolean; integer?: boolean } = {}) {
  if (value === undefined || value === null || value === '') {
    if (options.required) throw ApiError.badRequest(`${field} is required.`)
    return undefined
  }
  const result = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(result) || result < 0 || (options.integer && !Number.isInteger(result))) throw ApiError.badRequest(`${field} must be a non-negative ${options.integer ? 'integer' : 'number'}.`)
  return result
}

export function pageParams(query: Record<string, unknown>) {
  const page = Math.min(100000, Math.max(1, Number(query.page ?? 1)))
  const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)))
  if (!Number.isInteger(page) || !Number.isInteger(limit)) throw ApiError.badRequest('page and limit must be integers.')
  return { page, limit, offset: (page - 1) * limit }
}

export function emailValue(value: unknown) {
  const email = stringValue(value, 'email', { required: true, max: 254 })!.toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw ApiError.badRequest('email must be valid.')
  return email
}

export function passwordValue(value: unknown) {
  return stringValue(value, 'password', { required: true, min: 10, max: 200 })!
}

export function jsonObject(value: unknown, field: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw ApiError.badRequest(`${field} must be an object.`)
  return value as Record<string, unknown>
}
