export type EmailResult = {
  sent: boolean;
  error?: string;
  provider?: 'gmail' | 'resend';
};

function getResendConfig() {
  return {
    resendKey: process.env.RESEND_API_KEY?.trim() ?? '',
    fromEmail: process.env.FROM_EMAIL?.trim() ?? 'GME Academy <onboarding@resend.dev>'
  };
}

function getGmailConfig() {
  return {
    user: process.env.GMAIL_USER?.trim() ?? process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ?? '',
    pass: process.env.GMAIL_APP_PASSWORD?.trim() ?? ''
  };
}

async function sendViaResend(to: string, subject: string, html: string): Promise<EmailResult> {
  const cfg = getResendConfig();
  if (!cfg.resendKey) {
    return { sent: false, error: 'RESEND_API_KEY not set', provider: 'resend' };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.resendKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: cfg.fromEmail, to: [to], subject, html })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[email] Resend error for', to, ':', err);
    return { sent: false, error: err, provider: 'resend' };
  }

  return { sent: true, provider: 'resend' };
}

async function sendViaGmail(to: string, subject: string, html: string): Promise<EmailResult> {
  const cfg = getGmailConfig();
  if (!cfg.user || !cfg.pass) {
    return {
      sent: false,
      error: 'GMAIL_USER and GMAIL_APP_PASSWORD not set in Vercel',
      provider: 'gmail'
    };
  }

  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: cfg.user, pass: cfg.pass.replace(/\s/g, '') }
    });

    await transporter.sendMail({
      from: `Good Morning Electrical Engineering Academy <${cfg.user}>`,
      to,
      subject,
      html
    });

    return { sent: true, provider: 'gmail' };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[email] Gmail error for', to, ':', message);
    return { sent: false, error: message, provider: 'gmail' };
  }
}

/** Gmail first (any recipient, no domain), then Resend fallback. */
export async function sendEmail(to: string, subject: string, html: string): Promise<EmailResult> {
  const gmail = await sendViaGmail(to, subject, html);
  if (gmail.sent) return gmail;

  const resend = await sendViaResend(to, subject, html);
  if (resend.sent) return resend;

  const parts = [gmail.error, resend.error].filter(Boolean);
  return {
    sent: false,
    error: parts.join(' | ') || 'No email provider configured'
  };
}

export function getEmailProviderStatus() {
  const gmail = getGmailConfig();
  const resend = getResendConfig();
  return {
    gmailConfigured: Boolean(gmail.user && gmail.pass),
    resendConfigured: Boolean(resend.resendKey),
    adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ?? 'goodmorningelectricals934@gmail.com'
  };
}
