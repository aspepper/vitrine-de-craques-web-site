import type { TelemetryClient } from 'applicationinsights'

let client: TelemetryClient | null = null

const connectionString = [
  'APPINSIGHTS_CONNECTION_STRING',
  'APPLICATIONINSIGHTS_CONNECTION_STRING',
  'APPINSIGHTS_INSTRUMENTATIONKEY',
  'APPLICATIONINSIGHTS_INSTRUMENTATIONKEY',
  'APPLICATIONINSIGHTS_INSTRUMENTATION_KEY',
]
  .map((key) => process.env[key])
  .find((value): value is string => Boolean(value))

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
    })
  } catch (error) {
    console.warn('Application Insights could not be initialized.', error)
  }
}

export const telemetryClient = client
export const telemetryEnabled = Boolean(client)
