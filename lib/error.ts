import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { telemetryClient, telemetryEnabled } from "./app-insights";

type ErrorMetadata = Record<string, unknown>;

const connectionStringKeys = [
  "APPINSIGHTS_CONNECTION_STRING",
  "APPLICATIONINSIGHTS_CONNECTION_STRING",
  "APPINSIGHTS_INSTRUMENTATIONKEY",
  "APPLICATIONINSIGHTS_INSTRUMENTATIONKEY",
  "APPLICATIONINSIGHTS_INSTRUMENTATION_KEY",
];

export interface LoggedError {
  errorId: string;
  context: string;
  timestamp: string;
}

const MAX_LOG_VALUE_LENGTH = 2048;

function ensureError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error(String(error));
  }
}

function truncate(value: string, maxLength = MAX_LOG_VALUE_LENGTH): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}…`;
}

function extractErrorDetails(original: unknown, normalized: Error) {
  const details: Record<string, unknown> = {
    errorName: normalized.name,
    errorMessage: normalized.message,
  };

  if (normalized.stack) {
    details.errorStack = truncate(normalized.stack);
  }

  const cause = (normalized as Error & { cause?: unknown }).cause;
  if (cause) {
    details.errorCause = safeStringify(cause);
  }

  if (
    typeof original === "object" &&
    original !== null &&
    "code" in original &&
    typeof (original as { code?: unknown }).code !== "undefined"
  ) {
    details.errorCode = safeStringify((original as { code?: unknown }).code);
  }

  if (
    typeof original === "object" &&
    original !== null &&
    "status" in original &&
    typeof (original as { status?: unknown }).status !== "undefined"
  ) {
    details.errorStatus = safeStringify(
      (original as { status?: unknown }).status,
    );
  }

  if (
    typeof original === "object" &&
    original !== null &&
    "statusCode" in original &&
    typeof (original as { statusCode?: unknown }).statusCode !== "undefined"
  ) {
    details.errorStatusCode = safeStringify(
      (original as { statusCode?: unknown }).statusCode,
    );
  }

  return details satisfies ErrorMetadata;
}

function safeStringify(value: unknown, maxLength = MAX_LOG_VALUE_LENGTH): string {
  if (typeof value === "string") {
    return truncate(value, maxLength);
  }

  try {
    const serialized = JSON.stringify(value);
    return truncate(serialized, maxLength);
  } catch (error) {
    return `<<não serializável: ${
      error instanceof Error ? error.message : String(error)
    }>>`;
  }
}

async function flushTelemetry(timeoutMs = 1500) {
  const client = telemetryClient;
  if (!client) {
    return;
  }

  // Resilient flush with timeout for serverless environments
  await Promise.race([
    new Promise<void>((resolve) => {
      client.flush({
        isAppCrashing: false,
        callback: () => resolve(),
      });
    }),
    new Promise<void>((resolve) => {
      setTimeout(() => {
        console.warn(
          `[Telemetry] Flush timeout after ${timeoutMs}ms - telemetry may not have been fully sent`,
        );
        resolve();
      }, timeoutMs);
    }),
  ]);
}

function buildTelemetryProperties(
  context: string,
  errorId: string,
  metadata: ErrorMetadata,
) {
  const properties: Record<string, string> = { context, errorId };

  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined) continue;
    properties[`meta_${key}`] = safeStringify(value);
  }

  return properties;
}

function buildTraceMessage(
  context: string,
  errorId: string,
  timestamp: string,
  normalizedError: Error,
): string {
  const baseMessage = `${context} (${errorId}) - ${normalizedError.name}: ${normalizedError.message}`;
  return `${timestamp} | ${truncate(baseMessage, 512)}`;
}

function buildRuntimeMetadata() {
  return {
    runtime: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      nextRuntime: process.env.NEXT_RUNTIME ?? null,
      environment: process.env.NODE_ENV ?? null,
      deploymentId:
        process.env.WEBSITE_INSTANCE_ID ??
        process.env.VERCEL_DEPLOYMENT_ID ??
        process.env.DEPLOYMENT_ID ??
        null,
      siteName: process.env.WEBSITE_SITE_NAME ?? null,
      hostname: process.env.WEBSITE_HOSTNAME ?? process.env.HOSTNAME ?? null,
    },
    configuration: {
      databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
      nextAuthUrlConfigured: Boolean(process.env.NEXTAUTH_URL),
      nextAuthSecretConfigured: Boolean(process.env.NEXTAUTH_SECRET),
      appInsightsConfigured: connectionStringKeys.some(
        (key) => Boolean(process.env[key]),
      ),
      telemetryEnabled,
    },
  } satisfies ErrorMetadata;
}

async function readRequestBody(request: Request): Promise<unknown | undefined> {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD") {
    return undefined;
  }

  if (request.bodyUsed) {
    return "<<corpo já consumido antes do log>>";
  }

  try {
    const clone = request.clone();
    const rawBody = await clone.text();
    if (!rawBody) {
      return undefined;
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      try {
        return JSON.parse(rawBody);
      } catch {
        return `<<JSON inválido>> ${truncate(rawBody)}`;
      }
    }

    return truncate(rawBody);
  } catch (error) {
    return `<<falha ao ler corpo: ${
      error instanceof Error ? error.message : String(error)
    }>>`;
  }
}

async function buildRequestMetadata(request: Request) {
  const headers: Record<string, string> = {};
  const relevantHeaders = [
    "x-request-id",
    "x-ms-request-id",
    "x-forwarded-for",
    "x-real-ip",
    "user-agent",
    "referer",
  ];

  for (const header of relevantHeaders) {
    const value = request.headers.get(header);
    if (value) {
      headers[header] = value;
    }
  }

  const metadata: Record<string, unknown> = {
    method: request.method,
    url: request.url,
  };

  try {
    const parsedUrl = new URL(request.url);
    metadata.pathname = parsedUrl.pathname;
    metadata.search = parsedUrl.search;
    if (parsedUrl.searchParams.size > 0) {
      metadata.searchParams = Object.fromEntries(parsedUrl.searchParams.entries());
    }
  } catch (error) {
    metadata.urlParseError = safeStringify(error);
  }

  if (Object.keys(headers).length > 0) {
    metadata.headers = headers;
  }

  const body = await readRequestBody(request);
  if (body !== undefined) {
    metadata.body = body;
  }

  return metadata;
}

export async function logError(
  error: unknown,
  context: string,
  metadata: ErrorMetadata = {},
): Promise<LoggedError> {
  const errorId = randomUUID();
  const timestamp = new Date().toISOString();
  const normalizedError = ensureError(error);
  const runtimeMetadata = buildRuntimeMetadata();
  const errorDetails = extractErrorDetails(error, normalizedError);
  const mergedMetadata = { ...runtimeMetadata, ...errorDetails, ...metadata };
  const telemetryProperties = buildTelemetryProperties(
    context,
    errorId,
    mergedMetadata,
  );

  try {
    console.error(`===== ERRO ${context} (${errorId}) =====`);
    console.error("Timestamp:", timestamp);
    console.error("Nome:", normalizedError.name);
    console.error("Mensagem:", normalizedError.message);
    if (normalizedError.stack) {
      console.error("Stack:", normalizedError.stack);
    }
    if (Object.keys(mergedMetadata).length > 0) {
      console.error("Metadados:", mergedMetadata);
    }
    if (!(error instanceof Error)) {
      console.error("Erro original:", error);
    }
    console.error("===================================");
  } catch (consoleError) {
    console.warn(
      "Falha ao registrar o erro no console:",
      consoleError instanceof Error ? consoleError.message : consoleError,
    );
  }

  if (telemetryClient) {
    try {
      telemetryClient.trackException({
        exception: normalizedError,
        properties: telemetryProperties,
      });
      telemetryClient.trackTrace({
        message: buildTraceMessage(context, errorId, timestamp, normalizedError),
        severity: 3, // Error
        properties: telemetryProperties,
      });
      await flushTelemetry();
    } catch (telemetryError) {
      console.warn(
        "Falha ao enviar o erro para o Application Insights:",
        telemetryError instanceof Error
          ? telemetryError.message
          : telemetryError,
      );
    }
  }

  return { errorId, context, timestamp };
}

export async function logApiError(
  request: Request,
  error: unknown,
  context: string,
  extraMetadata: ErrorMetadata = {},
) {
  const requestMetadata = await buildRequestMetadata(request);
  return logError(error, context, { ...extraMetadata, request: requestMetadata });
}

export async function errorResponse(
  request: Request,
  error: unknown,
  context: string,
) {
  const { errorId } = await logApiError(request, error, context);
  return NextResponse.json(
    {
      message:
        "Ocorreu um erro no servidor. Por favor, tente novamente mais tarde.",
      errorId,
    },
    { status: 500 },
  );
}

/**
 * Log a custom metric to Application Insights.
 * Safe to call even if telemetry is not enabled - will silently return.
 * @param name - The name of the metric
 * @param value - The numeric value of the metric
 * @param properties - Optional properties to attach to the metric
 * @param flush - Whether to flush telemetry immediately (default: true for serverless compatibility)
 */
export async function logMetric(
  name: string,
  value: number,
  properties: Record<string, string> = {},
  flush = true,
): Promise<void> {
  if (!telemetryClient) {
    return;
  }

  try {
    telemetryClient.trackMetric({
      name,
      value,
      properties,
    });
    if (flush) {
      await flushTelemetry();
    }
  } catch (error) {
    console.warn(
      `[Telemetry] Failed to send metric '${name}':`,
      error instanceof Error ? error.message : error,
    );
  }
}

/**
 * Log a trace message to Application Insights.
 * Safe to call even if telemetry is not enabled - will silently return.
 * @param message - The trace message
 * @param severity - Severity level (0=Verbose, 1=Information, 2=Warning, 3=Error, 4=Critical)
 * @param properties - Optional properties to attach to the trace
 * @param flush - Whether to flush telemetry immediately (default: true for serverless compatibility)
 */
export async function logTrace(
  message: string,
  severity: 0 | 1 | 2 | 3 | 4 = 1,
  properties: Record<string, string> = {},
  flush = true,
): Promise<void> {
  if (!telemetryClient) {
    return;
  }

  try {
    telemetryClient.trackTrace({
      message,
      severity,
      properties,
    });
    if (flush) {
      await flushTelemetry();
    }
  } catch (error) {
    console.warn(
      `[Telemetry] Failed to send trace:`,
      error instanceof Error ? error.message : error,
    );
  }
}
