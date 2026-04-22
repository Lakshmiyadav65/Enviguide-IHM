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
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

export async function sendMail(input: SendMailInput) {
  const t = getTransporter();
  return t.sendMail({
    from: env.EMAIL_FROM || env.SMTP_USER,
    replyTo: input.replyTo || env.SMTP_USER,
    to: input.to,
    cc: input.cc,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}
