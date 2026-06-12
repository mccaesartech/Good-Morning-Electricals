type EnrolmentRecord = {
  full_name: string;
  email: string;
  phone: string;
  programme: string;
  message?: string | null;
};

type EnquiryRecord = {
  full_name: string;
  email: string;
  phone?: string | null;
  programme?: string | null;
  message?: string | null;
};

function getConfig() {
  return {
    resendKey: process.env.RESEND_API_KEY?.trim() ?? '',
    fromEmail: process.env.FROM_EMAIL?.trim() ?? 'GME Academy <onboarding@resend.dev>',
    adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ?? 'goodmorningelectricals934@gmail.com',
    atUsername: process.env.AT_USERNAME?.trim() ?? '',
    atApiKey: process.env.AT_API_KEY?.trim() ?? '',
    smsSender: process.env.SMS_SENDER_ID?.trim() ?? 'GME Academy'
  };
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const cfg = getConfig();
  if (!cfg.resendKey) {
    console.warn('[notifications] RESEND_API_KEY not set — skipping email to', to);
    return false;
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
    console.error('[notifications] Resend error:', err);
    return false;
  }
  return true;
}

function formatGhanaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('233')) return '+' + digits;
  if (digits.startsWith('0')) return '+233' + digits.slice(1);
  return '+233' + digits;
}

async function sendSms(phone: string, message: string): Promise<boolean> {
  const cfg = getConfig();
  if (!cfg.atUsername || !cfg.atApiKey) {
    console.warn('[notifications] Africa\'s Talking not configured — skipping SMS');
    return false;
  }
  const res = await fetch('https://api.africastalking.com/version1/messaging', {
    method: 'POST',
    headers: {
      apiKey: cfg.atApiKey,
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      username: cfg.atUsername,
      to: formatGhanaPhone(phone),
      message,
      from: cfg.smsSender
    })
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('[notifications] SMS error:', err);
    return false;
  }
  return true;
}

export async function notifyEnrolmentSubmitted(record: EnrolmentRecord) {
  const { full_name: name, email, phone, programme } = record;
  const cfg = getConfig();

  const emailSent = await sendEmail(
    email,
    'Enrolment Application Received — GME Academy',
    `<p>Dear ${name},</p>
    <p>Thank you for applying to <strong>Good Morning Electrical Engineering Academy</strong>.</p>
    <p>Your application for <strong>${programme}</strong> was received successfully.</p>
    <p><strong>Status: Pending review.</strong> Our admissions team will contact you by phone or email shortly.</p>
    <p>Best regards,<br>Admissions Team<br>Good Morning Electrical Engineering Academy</p>`
  );

  const smsSent = await sendSms(
    phone,
    `GME Academy: Hi ${name}, your enrolment for ${programme} was received. Status: PENDING. We will contact you soon.`
  );

  await sendEmail(
    cfg.adminEmail,
    `New Enrolment Application — ${name}`,
    `<p><strong>New enrolment application</strong></p>
    <ul>
      <li>Name: ${name}</li>
      <li>Email: ${email}</li>
      <li>Phone: ${phone}</li>
      <li>Programme: ${programme}</li>
    </ul>
    <p>Review in Admin → Enrolments. Status: <strong>pending</strong>.</p>`
  );

  return { emailSent, smsSent };
}

export async function notifyEnrolmentStatusChange(
  record: EnrolmentRecord,
  status: 'contacted' | 'admitted' | 'pending'
) {
  const { full_name: name, email, phone, programme } = record;

  if (status === 'contacted') {
    await sendEmail(
      email,
      'Enrolment Update — GME Academy',
      `<p>Dear ${name},</p>
      <p>Your enrolment application for <strong>${programme}</strong> has been reviewed.</p>
      <p><strong>Status: Contacted.</strong> Our admissions team has reached out or will contact you shortly with next steps.</p>
      <p>Good Morning Electrical Engineering Academy</p>`
    );
    await sendSms(
      phone,
      `GME Academy: Hi ${name}, your ${programme} application status is CONTACTED. Our team will be in touch soon.`
    );
    return;
  }

  if (status === 'admitted') {
    await sendEmail(
      email,
      'Congratulations — You Have Been Admitted! — GME Academy',
      `<p>Dear ${name},</p>
      <p>Congratulations! You have been <strong>admitted</strong> to <strong>${programme}</strong> at Good Morning Electrical Engineering Academy.</p>
      <p>Our admissions team will contact you with registration and orientation details.</p>
      <p>Welcome to GME Academy!</p>`
    );
    await sendSms(
      phone,
      `GME Academy: Congratulations ${name}! You have been ADMITTED to ${programme}. We will contact you with next steps.`
    );
    return;
  }

  if (status === 'pending') {
    await sendEmail(
      email,
      'Enrolment Status — Pending — GME Academy',
      `<p>Dear ${name},</p>
      <p>Your application for <strong>${programme}</strong> is <strong>pending review</strong>.</p>
      <p>We will contact you soon.</p>`
    );
    await sendSms(
      phone,
      `GME Academy: Hi ${name}, your ${programme} application status is PENDING review.`
    );
  }
}

export async function notifyEnquirySubmitted(record: EnquiryRecord) {
  const { full_name: name, email, phone, programme, message } = record;
  const cfg = getConfig();

  await sendEmail(
    email,
    'Message Received — GME Academy',
    `<p>Dear ${name},</p>
    <p>Thank you for contacting <strong>Good Morning Electrical Engineering Academy</strong>.</p>
    <p>We received your message and will respond by phone or email shortly.</p>`
  );

  await sendEmail(
    cfg.adminEmail,
    `New Contact Enquiry — ${name}`,
    `<p><strong>New contact message</strong></p>
    <ul>
      <li>Name: ${name}</li>
      <li>Email: ${email}</li>
      <li>Phone: ${phone ?? '—'}</li>
      <li>Programme: ${programme ?? '—'}</li>
    </ul>
    <p><strong>Message:</strong><br>${message ?? '—'}</p>`
  );

  if (phone) {
    await sendSms(phone, `GME Academy: Hi ${name}, we received your enquiry. Our team will contact you shortly.`);
  }
}
