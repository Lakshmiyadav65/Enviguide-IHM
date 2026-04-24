// -- Email Service (nodemailer, SMTP) ---------------------
import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env.js';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error(
      'Email not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in environment.',
    );
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

export interface SendMailInput {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
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

export async function sendMail(input: SendMailInput) {
  const t = getTransporter();

  // Self-send workaround: Gmail / Google Workspace SMTP deliver a message
  // addressed to the authenticated sender into the Sent folder ONLY — no
  // Inbox copy. Any recipient in To/Cc that matches EMAIL_FROM / SMTP_USER
  // is rerouted to Bcc so the mail actually lands in that Inbox.
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

  // Guard: if every recipient was the sender, keep the original To intact so
  // we don't send to nobody. Gmail will still file it under Sent, but at
  // least we're not silently dropping the only address the caller gave us.
  const to = toKept.length === 0 && ccKept.length === 0 && bccExtras.length === 0
    ? toRaw
    : toKept;

  const bcc = toList([...bccRaw, ...bccExtras]);

  return t.sendMail({
    from: env.EMAIL_FROM || env.SMTP_USER,
    replyTo: input.replyTo || env.SMTP_USER,
    to: to.length > 0 ? to : undefined,
    cc: ccKept.length > 0 ? ccKept : undefined,
    bcc: bcc.length > 0 ? bcc : undefined,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}
