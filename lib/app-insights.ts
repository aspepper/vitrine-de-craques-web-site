import appInsights from 'applicationinsights'

let client: appInsights.TelemetryClient | null = null

if (process.env.APPINSIGHTS_CONNECTION_STRING) {
  appInsights
    .setup(process.env.APPINSIGHTS_CONNECTION_STRING)
    .setAutoCollectConsole(true, true)
    .start()
  client = appInsights.defaultClient
}

export const telemetryClient = client
