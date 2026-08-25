import type { NextFunction, Request, Response } from 'express'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static badRequest(message: string, code = 'VALIDATION_ERROR') { return new ApiError(400, code, message) }
  static unauthorized(message = 'Authentication is required.') { return new ApiError(401, 'AUTH_REQUIRED', message) }
  static forbidden(message = 'You are not authorized to perform this action.') { return new ApiError(403, 'FORBIDDEN', message) }
  static notFound(message = 'Resource not found.') { return new ApiError(404, 'NOT_FOUND', message) }
  static conflict(message: string, code = 'CONFLICT') { return new ApiError(409, code, message) }
  static unavailable(message: string, code = 'SERVICE_UNAVAILABLE') { return new ApiError(503, code, message) }
}

export function asyncHandler(handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown) {
  return (req: Request, res: Response, next: NextFunction) => Promise.resolve(handler(req, res, next)).catch(next)
}

export function sendApiError(error: unknown, req: Request, res: Response) {
  const apiError = error instanceof ApiError ? error : new ApiError(500, 'INTERNAL_ERROR', 'Something went wrong.')
  const requestId = req.requestId ?? 'unknown'
  if (!(error instanceof ApiError)) console.error(`[${requestId}] unexpected API error`, error)
  return res.status(apiError.status).json({
    error: { code: apiError.code, message: apiError.message, requestId, ...(apiError.details ? { details: apiError.details } : {}) },
  })
}

export function ok<T>(data: T, meta?: Record<string, unknown>) {
  return meta ? { data, meta } : { data }
}
