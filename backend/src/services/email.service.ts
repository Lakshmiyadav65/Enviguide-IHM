// -- Email Service ----------------------------------------
// Two delivery transports, picked at runtime:
//
//   1. Resend (HTTPS, port 443) — used when RESEND_API_KEY is set.
//      Works on hosts that block outbound SMTP (e.g. Render Free).
//      This is the recommended path for production.
//
//   2. Nodemailer SMTP — fallback when SMTP_HOST/USER/PASS are set
//      and Resend is not. Useful for local development against a
//      Mailtrap instance, etc.
//
// Both paths share the same SendMailInput contract and the same
// "self-send Bcc reroute" rule (any To/Cc address that matches the
// authenticated sender is moved to Bcc, so Gmail / Workspace don't
// silently file the mail under Sent only).
//
// Switching transports just means flipping env vars. No callsite
// changes needed anywhere else in the app.

import nodemailer, { type Transporter } from 'nodemailer';
import { Resend } from 'resend';
import { env } from '../config/env.js';

// ─── Transport selection ────────────────────────────────────────────────

let resendClient: Resend | null = null;
function getResendClient(): Resend {
  if (!env.RESEND_API_KEY) {
    throw new Error('Email not configured. Set RESEND_API_KEY in environment.');
  }
  if (!resendClient) resendClient = new Resend(env.RESEND_API_KEY);
  return resendClient;
}

let smtpTransporter: Transporter | null = null;
function getSmtpTransporter(): Transporter {
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error(
      'Email not configured. Set RESEND_API_KEY (preferred) or SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS in environment.',
    );
  }
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return smtpTransporter;
}

// ─── Public API ─────────────────────────────────────────────────────────

export interface SendMailInput {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

export interface SendMailResult {
  messageId: string;
  /** 'resend' | 'smtp' — useful for logs / debugging which path ran. */
  transport: 'resend' | 'smtp';
}

/** Normalise a to/cc/bcc field into a trimmed, de-duped array. */
function toList(v: string | string[] | undefined): string[] {
  if (!v) return [];
  const raw = Array.isArray(v) ? v : v.split(/[,;]/);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const entry of raw) {
    const trimmed = String(entry).trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

/**
 * Reroute any recipient that matches the authenticated sender (EMAIL_FROM
 * or SMTP_USER) into Bcc — Gmail / Workspace deliver self-addressed mail
 * to the Sent folder only, so without this the sender wouldn't see their
 * own copy in their Inbox.
 */
function applySelfSendBcc(input: SendMailInput) {
  const senderAliases = new Set(
    [env.EMAIL_FROM, env.SMTP_USER]
      .filter((v): v is string => Boolean(v))
      .map((v) => v.toLowerCase()),
  );
  const isSelf = (addr: string) => senderAliases.has(addr.toLowerCase());

  const toRaw = toList(input.to);
  const ccRaw = toList(input.cc);
  const bccRaw = toList(input.bcc);

  const toKept = toRaw.filter((a) => !isSelf(a));
  const ccKept = ccRaw.filter((a) => !isSelf(a));
  const bccExtras = [
    ...toRaw.filter(isSelf),
    ...ccRaw.filter(isSelf),
  ];

  const to = toKept.length === 0 && ccKept.length === 0 && bccExtras.length === 0
    ? toRaw
    : toKept;
  const bcc = toList([...bccRaw, ...bccExtras]);

  return { to, cc: ccKept, bcc };
}

/**
 * If EMAIL_TEST_REDIRECT_TO is set, reroute the outgoing mail to that
 * single address — useful while the email provider's sandbox blocks
 * sends to anyone other than the signup address. The original to/cc
 * are preserved in the subject and a banner at the top of the body so
 * the tester can still tell which vendor each mail was meant for.
 */
function applyTestRedirect(
  to: string[],
  cc: string[],
  bcc: string[],
  subject: string,
  text: string | undefined,
  html: string | undefined,
): { to: string[]; cc: string[]; bcc: string[]; subject: string; text: string | undefined; html: string | undefined } {
  const redirect = env.EMAIL_TEST_REDIRECT_TO?.trim();
  if (!redirect) return { to, cc, bcc, subject, text, html };

  const originalTo = to.join(', ');
  const originalCc = cc.length > 0 ? cc.join(', ') : '';
  const newSubject = `[TEST → ${originalTo}]${originalCc ? ` (cc: ${originalCc})` : ''} ${subject}`;
  const banner =
    '⚠️ TEST REDIRECT — this email was meant for:\n'
    + `  To:  ${originalTo}\n`
    + (originalCc ? `  Cc:  ${originalCc}\n` : '')
    + 'Set EMAIL_TEST_REDIRECT_TO to "" in the host env vars to deliver real recipients.\n'
    + '──────────────────────────────────────────────────\n\n';
  const htmlBanner =
    '<div style="background:#FEF3C7;border:1px solid #F59E0B;color:#92400E;padding:12px 16px;border-radius:8px;margin-bottom:16px;font-family:system-ui,sans-serif;font-size:13px;">'
    + '<strong>⚠️ TEST REDIRECT</strong><br/>'
    + `<div style="margin-top:6px"><strong>To:</strong> ${originalTo}</div>`
    + (originalCc ? `<div><strong>Cc:</strong> ${originalCc}</div>` : '')
    + '<div style="margin-top:6px;font-size:11px;opacity:0.8">Clear <code>EMAIL_TEST_REDIRECT_TO</code> in the host env vars to deliver real recipients.</div>'
    + '</div>';

  return {
    to: [redirect],
    cc: [],
    bcc: [],
    subject: newSubject,
    text: text ? banner + text : undefined,
    html: html ? htmlBanner + html : undefined,
  };
}

export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  const { to, cc, bcc } = applySelfSendBcc(input);
  const fromAddr = env.EMAIL_FROM || env.SMTP_USER || 'onboarding@resend.dev';
  const replyTo = input.replyTo || env.EMAIL_FROM || env.SMTP_USER;
  const redirected = applyTestRedirect(to, cc, bcc, input.subject, input.text, input.html);

  // Prefer Resend when configured. Render Free blocks outbound SMTP, so
  // SMTP is only useful for local dev against Mailtrap-style services.
  if (env.RESEND_API_KEY) {
    const r = getResendClient();
    const { data, error } = await r.emails.send({
      from: fromAddr,
      to: redirected.to.length > 0 ? redirected.to : [fromAddr],
      cc: redirected.cc.length > 0 ? redirected.cc : undefined,
      bcc: redirected.bcc.length > 0 ? redirected.bcc : undefined,
      replyTo,
      subject: redirected.subject,
      text: redirected.text ?? '',
      html: redirected.html ?? redirected.text ?? '',
    });
    if (error) {
      // Resend SDK returns errors via the destructured `error` rather than
      // throwing — surface them as a thrown Error so callers handle a
      // single shape regardless of transport.
      const msg = (error as { message?: string })?.message
        ?? (error as { name?: string })?.name
        ?? 'Resend send failed';
      throw new Error(msg);
    }
    return { messageId: data?.id ?? '', transport: 'resend' };
  }

  // SMTP fallback (local dev / non-Render environments).
  const t = getSmtpTransporter();
  const result = await t.sendMail({
    from: fromAddr,
    replyTo,
    to: redirected.to.length > 0 ? redirected.to : undefined,
    cc: redirected.cc.length > 0 ? redirected.cc : undefined,
    bcc: redirected.bcc.length > 0 ? redirected.bcc : undefined,
    subject: redirected.subject,
    text: redirected.text,
    html: redirected.html,
  });
  return { messageId: (result as { messageId?: string }).messageId ?? '', transport: 'smtp' };
}
