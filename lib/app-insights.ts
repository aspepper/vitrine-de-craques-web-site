import type { TelemetryClient } from 'applicationinsights'

let client: TelemetryClient | null = null

if (process.env.APPINSIGHTS_CONNECTION_STRING) {
  try {
    const appInsights = (
      eval('require') as (moduleName: string) => unknown
    )('applicationinsights') as typeof import('applicationinsights')

    appInsights
      .setup(process.env.APPINSIGHTS_CONNECTION_STRING)
      .setAutoCollectConsole(true, true)
      .start()

    client = appInsights.defaultClient
  } catch (error) {
    console.warn('Application Insights could not be initialized.', error)
  }
}

export const telemetryClient = client
