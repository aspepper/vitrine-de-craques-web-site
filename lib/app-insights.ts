import type { TelemetryClient } from 'applicationinsights'

let client: TelemetryClient | null = null

const connectionStringEnvKeys = [
  'APPINSIGHTS_CONNECTION_STRING',
  'APPLICATIONINSIGHTS_CONNECTION_STRING',
  'APPINSIGHTS_INSTRUMENTATIONKEY',
  'APPLICATIONINSIGHTS_INSTRUMENTATIONKEY',
  'APPLICATIONINSIGHTS_INSTRUMENTATION_KEY',
]

const connectionString = connectionStringEnvKeys
  .map((key) => process.env[key])
  .find((value): value is string => Boolean(value))

// Determine if internal logging should be enabled
// Enable in non-production or when explicitly requested via APPINSIGHTS_DEBUG_ENABLED
const isDebugEnabled =
  process.env.NODE_ENV !== 'production' ||
  process.env.APPINSIGHTS_DEBUG_ENABLED === 'true' ||
  process.env.NEXT_PUBLIC_SHOW_ERRORS === 'true'

if (!connectionString) {
  console.warn(
    '[Telemetry] Application Insights desabilitado: nenhuma connection string encontrada nas variáveis de ambiente',
  )
}

if (connectionString) {
  try {
    const appInsights = (
      eval('require') as (moduleName: string) => unknown
    )('applicationinsights') as typeof import('applicationinsights')

    const connectionStringProvider =
      connectionString?.split('=')[0] ?? 'unknown'

    // Enable internal logging for debugging when not in production or when debug is explicitly enabled
    // This helps diagnose issues with telemetry not being sent
    if (isDebugEnabled) {
      appInsights.Configuration.setInternalLogging(true, true)
      console.info('[Telemetry] Internal logging enabled for diagnostics')
    }

    appInsights
      .setup(connectionString)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectConsole(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectRequests(true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true)
      .start()

    client = appInsights.defaultClient

    const cloudRoleName =
      process.env.WEBSITE_SITE_NAME || process.env.HOSTNAME || 'vitrine-de-craques'
    client.context.tags[appInsights.defaultClient.context.keys.cloudRole] =
      cloudRoleName

    console.info('[Telemetry] Application Insights inicializado', {
      connectionStringProvider,
      runtime: process.env.NEXT_RUNTIME ?? 'node',
      role: cloudRoleName,
      requestAutoCollection: true,
      dependencyCorrelation: true,
      internalLogging: isDebugEnabled,
    })
  } catch (error) {
    console.warn('Application Insights could not be initialized.', error)
  }
}

export const telemetryClient = client
export const telemetryEnabled = Boolean(client)
