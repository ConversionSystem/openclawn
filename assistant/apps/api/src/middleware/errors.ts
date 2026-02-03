import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import type { ApiError, ErrorCode } from '@assistant/shared'
import { ERROR_MESSAGES } from '@assistant/shared'

/**
 * Global error handler for the API
 */
export function errorHandler(err: Error, c: Context) {
  console.error('Error:', err)

  // Handle HTTP exceptions
  if (err instanceof HTTPException) {
    const code = mapStatusToErrorCode(err.status)
    return c.json<{ success: false; error: ApiError }>(
      {
        success: false,
        error: {
          code,
          message: err.message || ERROR_MESSAGES[code],
        },
      },
      err.status
    )
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return c.json<{ success: false; error: ApiError }>(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please check your input and try again.',
          details: { issues: err.issues },
        },
      },
      400
    )
  }

  // Handle unknown errors
  return c.json<{ success: false; error: ApiError }>(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      },
    },
    500
  )
}

function mapStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 401:
      return 'UNAUTHORIZED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 400:
      return 'VALIDATION_ERROR'
    case 429:
      return 'RATE_LIMITED'
    case 402:
      return 'PAYMENT_REQUIRED'
    default:
      return 'INTERNAL_ERROR'
  }
}

/**
 * Not found handler
 */
export function notFoundHandler(c: Context) {
  return c.json<{ success: false; error: ApiError }>(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: ERROR_MESSAGES.NOT_FOUND,
      },
    },
    404
  )
}
