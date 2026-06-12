import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'GME Academy <onboarding@resend.dev>';
const ADMIN_EMAIL = Deno.env.get('ADMIN_NOTIFICATION_EMAIL') ?? 'goodmorningelectricals934@gmail.com';
const AT_USERNAME = Deno.env.get('AT_USERNAME');
const AT_API_KEY = Deno.env.get('AT_API_KEY');
const SMS_SENDER = Deno.env.get('SMS_SENDER_ID') ?? 'GME Academy';

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email to', to);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
}

function formatGhanaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('233')) return '+' + digits;
  if (digits.startsWith('0')) return '+233' + digits.slice(1);
  return '+233' + digits;
}

async function sendSms(phone: string, message: string) {
  if (!AT_USERNAME || !AT_API_KEY) {
    console.warn('Africa\'s Talking not configured — skipping SMS');
    return;
  }
  const to = formatGhanaPhone(phone);
  const res = await fetch('https://api.africastalking.com/version1/messaging', {
    method: 'POST',
    headers: {
      apiKey: AT_API_KEY,
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      username: AT_USERNAME,
      to,
      message,
      from: SMS_SENDER
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SMS error: ${err}`);
  }
}

serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record ?? payload;
    const table = payload.table ?? payload.type ?? '';

    const isEnrolment = table === 'enrolments' || (record.programme && record.phone && !record.message);
    const isEnquiry = table === 'contact_enquiries' || (record.message && !record.education_level);

    if (isEnrolment) {
      const name = record.full_name as string;
      const email = record.email as string;
      const programme = record.programme as string;
      const phone = record.phone as string;

      await sendEmail(
        email,
        'Enrolment Application Received — GME Academy',
        `<p>Dear ${name},</p>
        <p>Thank you for applying to <strong>Good Morning Electrical Engineering Academy</strong>.</p>
        <p>Your application for <strong>${programme}</strong> was received successfully.</p>
        <p><strong>Status:</strong> Pending review. Our admissions team will contact you by phone or email shortly.</p>
        <p>Best regards,<br>Admissions Team<br>Good Morning Electrical Engineering Academy</p>`
      );

      await sendSms(
        phone,
        `GME Academy: Hi ${name}, your enrolment application for ${programme} was received. Status: Pending. We will contact you soon.`
      );

      await sendEmail(
        ADMIN_EMAIL,
        `New Enrolment Application — ${name}`,
        `<p><strong>New enrolment application</strong></p>
        <ul>
          <li>Name: ${name}</li>
          <li>Email: ${email}</li>
          <li>Phone: ${phone}</li>
          <li>Programme: ${programme}</li>
        </ul>
        <p>Review in Admin → Enrolments. Status starts as <strong>pending</strong> until you mark Contacted or Admitted.</p>`
      );
    } else if (isEnquiry) {
      const name = record.full_name as string;
      const email = record.email as string;

      await sendEmail(
        email,
        'Message Received — GME Academy',
        `<p>Dear ${name},</p>
        <p>Thank you for contacting <strong>Good Morning Electrical Engineering Academy</strong>.</p>
        <p>We received your message and will respond by phone or email shortly.</p>
        <p>Best regards,<br>Admissions Team</p>`
      );

      await sendEmail(
        ADMIN_EMAIL,
        `New Contact Enquiry — ${name}`,
        `<p><strong>New contact message</strong></p>
        <ul>
          <li>Name: ${name}</li>
          <li>Email: ${email}</li>
          <li>Phone: ${record.phone ?? '—'}</li>
          <li>Programme: ${record.programme ?? '—'}</li>
        </ul>
        <p><strong>Message:</strong><br>${record.message}</p>
        <p>Review in Admin → Enquiries.</p>`
      );

      if (record.phone) {
        await sendSms(
          record.phone as string,
          `GME Academy: Hi ${name}, we received your enquiry. Our team will contact you shortly.`
        );
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
