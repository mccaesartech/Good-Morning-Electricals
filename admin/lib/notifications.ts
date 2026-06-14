import { sendEmail, type EmailResult } from '@/lib/email';

type EnrolmentRecord = {
  full_name: string;
  email: string;
  phone: string;
  programme: string;
  message?: string | null;
  date_of_birth?: string | null;
  education_level?: string | null;
};

type EnquiryRecord = {
  full_name: string;
  email: string;
  phone?: string | null;
  programme?: string | null;
  message?: string | null;
};

export type EnrolmentNotifyStatus =
  | 'pending'
  | 'contacted'
  | 'admitted'
  | 'rejected'
  | 'archived';

function getConfig() {
  return {
    adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ?? 'goodmorningelectricals934@gmail.com',
    atUsername: process.env.AT_USERNAME?.trim() ?? '',
    atApiKey: process.env.AT_API_KEY?.trim() ?? '',
    smsSender: process.env.SMS_SENDER_ID?.trim() ?? 'GME Academy'
  };
}

// Re-export for any legacy imports
export type { EmailResult };

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

function enrolmentDetailsHtml(record: EnrolmentRecord): string {
  return `<ul>
      <li><strong>Name:</strong> ${record.full_name}</li>
      <li><strong>Email:</strong> ${record.email}</li>
      <li><strong>Phone:</strong> ${record.phone}</li>
      <li><strong>Programme:</strong> ${record.programme}</li>
      ${record.date_of_birth ? `<li><strong>Date of birth:</strong> ${record.date_of_birth}</li>` : ''}
      ${record.education_level ? `<li><strong>Education:</strong> ${record.education_level}</li>` : ''}
      ${record.message ? `<li><strong>Message:</strong> ${record.message}</li>` : ''}
    </ul>`;
}

export async function notifyEnrolmentSubmitted(record: EnrolmentRecord) {
  const { full_name: name, email, phone, programme } = record;
  const cfg = getConfig();

  const applicantEmail = await sendEmail(
    email,
    'Enrolment Received — Good Morning Electrical Engineering Academy',
    `<p>Dear ${name},</p>
    <p>Thank you for applying to <strong>Good Morning Electrical Engineering Academy</strong>.</p>
    <p>Your application for <strong>${programme}</strong> has been <strong>received successfully</strong>.</p>
    <p><strong>Current status: Received (pending review)</strong></p>
    <p>Our admissions team will review your application and email you when your status changes to contacted, admitted, or not admitted.</p>
    <p>Best regards,<br>Admissions Team<br>Good Morning Electrical Engineering Academy</p>`
  );

  const smsSent = await sendSms(
    phone,
    `GME Academy: Hi ${name}, your enrolment for ${programme} was RECEIVED. Status: PENDING review. We will contact you soon.`
  );

  const adminEmail = await sendEmail(
    cfg.adminEmail,
    `New Enrolment Application — ${name}`,
    `<p><strong>New enrolment application received</strong></p>
    ${enrolmentDetailsHtml(record)}
    <p>Review in <strong>Admin → Enrolments</strong>. Status: <strong>pending (received)</strong>.</p>`
  );

  return {
    emailSent: applicantEmail.sent,
    emailError: applicantEmail.error,
    smsSent,
    adminEmailSent: adminEmail.sent,
    adminEmailError: adminEmail.error
  };
}

export async function notifyEnrolmentStatusChange(
  record: EnrolmentRecord,
  status: EnrolmentNotifyStatus
) {
  const { full_name: name, email, phone, programme } = record;

  if (status === 'contacted') {
    await sendEmail(
      email,
      'Enrolment Update — Contacted — GME Academy',
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
      'Congratulations — Admitted — GME Academy',
      `<p>Dear ${name},</p>
      <p>Congratulations! You have been <strong>admitted</strong> to <strong>${programme}</strong> at Good Morning Electrical Engineering Academy.</p>
      <p><strong>Status: Admitted.</strong> Our admissions team will contact you with registration and orientation details.</p>
      <p>Welcome to GME Academy!</p>`
    );
    await sendSms(
      phone,
      `GME Academy: Congratulations ${name}! You have been ADMITTED to ${programme}. We will contact you with next steps.`
    );
    return;
  }

  if (status === 'rejected') {
    await sendEmail(
      email,
      'Enrolment Update — Not Admitted — GME Academy',
      `<p>Dear ${name},</p>
      <p>Thank you for your interest in <strong>${programme}</strong> at Good Morning Electrical Engineering Academy.</p>
      <p><strong>Status: Not admitted.</strong> After review, we are unable to offer you a place at this time.</p>
      <p>You may contact our admissions team if you have questions.</p>
      <p>Good Morning Electrical Engineering Academy</p>`
    );
    await sendSms(
      phone,
      `GME Academy: Hi ${name}, your ${programme} application was reviewed. Status: NOT ADMITTED at this time.`
    );
    return;
  }

  if (status === 'archived') {
    await sendEmail(
      email,
      'Enrolment Application Archived — GME Academy',
      `<p>Dear ${name},</p>
      <p>Your application for <strong>${programme}</strong> has been <strong>archived</strong> in our records.</p>
      <p>Contact admissions if you would like to re-apply or need more information.</p>`
    );
    return;
  }

  if (status === 'pending') {
    await sendEmail(
      email,
      'Enrolment Status — Received (Pending Review) — GME Academy',
      `<p>Dear ${name},</p>
      <p>Your application for <strong>${programme}</strong> is <strong>received and pending review</strong>.</p>
      <p>We will contact you when your status is updated.</p>`
    );
    await sendSms(
      phone,
      `GME Academy: Hi ${name}, your ${programme} application status is RECEIVED — pending review.`
    );
  }
}

export async function notifyEnquirySubmitted(record: EnquiryRecord) {
  const { full_name: name, email, phone, programme, message } = record;
  const cfg = getConfig();

  const applicantEmail = await sendEmail(
    email,
    'Message Received — GME Academy',
    `<p>Dear ${name},</p>
    <p>Thank you for contacting <strong>Good Morning Electrical Engineering Academy</strong>.</p>
    <p>We received your message and will respond by phone or email shortly.</p>`
  );

  const adminEmail = await sendEmail(
    cfg.adminEmail,
    `New Contact Enquiry — ${name}`,
    `<p><strong>New contact message</strong></p>
    <ul>
      <li><strong>Name:</strong> ${name}</li>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Phone:</strong> ${phone ?? '—'}</li>
      <li><strong>Programme:</strong> ${programme ?? '—'}</li>
    </ul>
    <p><strong>Message:</strong><br>${message ?? '—'}</p>
    <p>Review in <strong>Admin → Enquiries</strong>.</p>`
  );

  let smsSent = false;
  if (phone) {
    smsSent = await sendSms(phone, `GME Academy: Hi ${name}, we received your enquiry. Our team will contact you shortly.`);
  }

  return {
    emailSent: applicantEmail.sent,
    emailError: applicantEmail.error,
    adminEmailSent: adminEmail.sent,
    adminEmailError: adminEmail.error,
    smsSent
  };
}
