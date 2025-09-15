import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
import { errorResponse } from '@/lib/error'

const handler = NextAuth(authOptions)

export async function GET(req: Request, ctx: any) {
  try {
    return await handler(req, ctx)
  } catch (error) {
    return errorResponse(req, error, 'AO PROCESSAR AUTH GET')
  }
}

export async function POST(req: Request, ctx: any) {
  try {
    return await handler(req, ctx)
  } catch (error) {
    return errorResponse(req, error, 'AO PROCESSAR AUTH POST')
  }
}
