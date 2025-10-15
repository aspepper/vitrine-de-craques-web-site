import nodemailer, { type Transporter } from "nodemailer";

/**
 * Utilitários para configurar o transporte SMTP utilizado no envio de e-mails.
 *
 * Em ambiente de desenvolvimento, valores padrão apontam para o sandbox do
 * Mailtrap, conforme solicitado para facilitar testes locais.
 */

export interface SmtpCredentials {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

const DEV_DEFAULTS: SmtpCredentials = {
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  secure: false,
  auth: {
    user: "f30856131a517d",
    pass: "8a2198c37b4ff3",
  },
};

function readEnv(key: string): string | undefined {
  const value = process.env[key as keyof NodeJS.ProcessEnv];
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function resolveSmtpCredentials(): SmtpCredentials | null {
  const isDevelopment = process.env.NODE_ENV !== "production";

  const host = readEnv("SMTP_HOST") ?? (isDevelopment ? DEV_DEFAULTS.host : undefined);
  const portValue = readEnv("SMTP_PORT") ?? (isDevelopment ? String(DEV_DEFAULTS.port) : undefined);
  const user = readEnv("SMTP_USER") ?? (isDevelopment ? DEV_DEFAULTS.auth.user : undefined);
  const pass = readEnv("SMTP_PASSWORD") ?? (isDevelopment ? DEV_DEFAULTS.auth.pass : undefined);

  if (!host || !portValue || !user || !pass) {
    return null;
  }

  const port = Number.parseInt(portValue, 10);
  const secureEnv = readEnv("SMTP_SECURE");
  const secure = secureEnv
    ? ["1", "true", "yes"].includes(secureEnv.toLowerCase())
    : port === 465;

  return {
    host,
    port: Number.isNaN(port) ? DEV_DEFAULTS.port : port,
    secure,
    auth: { user, pass },
  };
}

export function getSmtpCredentials(): SmtpCredentials | null {
  return resolveSmtpCredentials();
}

export function getDefaultFromAddress(): string {
  return readEnv("SMTP_FROM") ?? "Vitrine de Craques <no-reply@vitrinecraques.com>";
}

export function createSmtpTransport(): Transporter | null {
  const credentials = resolveSmtpCredentials();
  if (!credentials) {
    return null;
  }

  return nodemailer.createTransport(credentials);
}
