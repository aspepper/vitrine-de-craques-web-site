import { NextResponse } from 'next/server'
import { errorResponse, logMetric, logTrace } from '@/lib/error'
import { telemetryEnabled } from '@/lib/app-insights'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  const startTime = Date.now()

  try {
    const healthStatus = {
      ok: true,
      hasDB: Boolean(process.env.DATABASE_URL),
      host: process.env.NEXTAUTH_URL ?? null,
      telemetryEnabled,
      // só para confirmar que o processo enxerga as chaves (sem mostrar valores)
      seen: Object.keys(process.env).filter((k) =>
        [
          'DATABASE_URL',
          'NEXTAUTH_URL',
          'AUTH_TRUST_HOST',
          'NEXTAUTH_SECRET',
          'APPLICATIONINSIGHTS_CONNECTION_STRING',
          'APPINSIGHTS_CONNECTION_STRING',
        ].includes(k),
      ),
    }

    const responseTime = Date.now() - startTime

    // Log custom metric for health check
    await logMetric('health_check', 1, {
      status: 'success',
      hasDatabase: String(healthStatus.hasDB),
      responseTimeMs: String(responseTime),
    })

    // Log trace for health check status
    await logTrace(
      `Health check completed successfully in ${responseTime}ms`,
      1, // Information
      {
        hasDatabase: String(healthStatus.hasDB),
        telemetryEnabled: String(telemetryEnabled),
      },
    )

    return NextResponse.json({
      ...healthStatus,
      responseTimeMs: responseTime,
    })
  } catch (error) {
    const responseTime = Date.now() - startTime

    // Log metric for failed health check
    await logMetric('health_check', 0, {
      status: 'failure',
      responseTimeMs: String(responseTime),
    })

    return errorResponse(req, error, 'AO VERIFICAR SAÚDE')
  }
}
