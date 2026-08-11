import { NextResponse } from 'next/server'

type ActionResponse<T = null> = {
  success: boolean
  data?: T
  error?: {
    message: string
    details?: Record<string, string[]>
  }
  status?: number
}

type ErrorResponse = ActionResponse<undefined> & { success: false }

type APIErrorResponse = NextResponse<ErrorResponse>
