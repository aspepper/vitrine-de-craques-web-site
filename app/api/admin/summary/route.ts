import { NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/admin-auth'
import { getAdminDashboardSummary } from '@/lib/admin-dashboard'
import { errorResponse } from '@/lib/error'

export async function GET(req: Request) {
  try {
    await requireAdminSession()
    const summary = await getAdminDashboardSummary()
    return NextResponse.json(summary)
  } catch (error) {
    const statusCode = (error as { statusCode?: number } | undefined)?.statusCode
    if (statusCode) {
      return NextResponse.json({ error: (error as Error).message }, { status: statusCode })
    }
    return errorResponse(req, error, 'AO BUSCAR RESUMO ADMINISTRATIVO')
  }
}
