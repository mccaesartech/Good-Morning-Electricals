import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'GME Academy <onboarding@resend.dev>';
const ADMIN_EMAIL = Deno.env.get('ADMIN_NOTIFICATION_EMAIL') ?? 'goodmorningelectricals934@gmail.com';
const AT_USERNAME = Deno.env.get('AT_USERNAME');
const AT_API_KEY = Deno.env.get('AT_API_KEY');
const SMS_SENDER = Deno.env.get('SMS_SENDER_ID') ?? 'GME Academy';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  });
}

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const payload = await req.json();
    const record = payload.record ?? payload;
    const table = payload.table ?? payload.type ?? '';

    const isEnrolment = table === 'enrolments' || table === 'enrolment' || (record.programme && record.phone && !record.message);
    const isEnquiry = table === 'contact_enquiries' || table === 'enquiry' || (record.message && !record.education_level);

    if (isEnrolment) {
      const name = record.full_name as string;
      const email = record.email as string;
      const programme = record.programme as string;
      const phone = record.phone as string;
      const status = record.status as string | undefined;

      if (status === 'admitted') {
        await sendEmail(
          email,
          'Congratulations — You Have Been Admitted! — GME Academy',
          `<p>Dear ${name},</p><p>Congratulations! You have been <strong>admitted</strong> to <strong>${programme}</strong>.</p>`
        );
        await sendSms(phone, `GME Academy: Congratulations ${name}! You have been ADMITTED to ${programme}.`);
      } else if (status === 'contacted') {
        await sendEmail(
          email,
          'Enrolment Update — GME Academy',
          `<p>Dear ${name},</p><p>Your application for <strong>${programme}</strong> status is <strong>Contacted</strong>.</p>`
        );
        await sendSms(phone, `GME Academy: Hi ${name}, your ${programme} application status is CONTACTED.`);
      } else {
        await sendEmail(
          email,
          'Enrolment Application Received — GME Academy',
          `<p>Dear ${name},</p>
          <p>Thank you for applying to <strong>Good Morning Electrical Engineering Academy</strong>.</p>
          <p>Your application for <strong>${programme}</strong> was received successfully.</p>
          <p><strong>Status: Pending review.</strong></p>`
        );
        await sendSms(
          phone,
          `GME Academy: Hi ${name}, your enrolment for ${programme} was received. Status: PENDING.`
        );
        await sendEmail(
          ADMIN_EMAIL,
          `New Enrolment Application — ${name}`,
          `<p><strong>New enrolment</strong></p><ul><li>Name: ${name}</li><li>Email: ${email}</li><li>Phone: ${phone}</li><li>Programme: ${programme}</li></ul>`
        );
      }
    } else if (isEnquiry) {
      const name = record.full_name as string;
      const email = record.email as string;

      await sendEmail(
        email,
        'Message Received — GME Academy',
        `<p>Dear ${name},</p><p>We received your message and will respond shortly.</p>`
      );
      await sendEmail(
        ADMIN_EMAIL,
        `New Contact Enquiry — ${name}`,
        `<p><strong>New enquiry</strong></p><p>${record.message ?? ''}</p>`
      );
      if (record.phone) {
        await sendSms(record.phone as string, `GME Academy: Hi ${name}, we received your enquiry.`);
      }
    }

    return jsonResponse({ ok: true });
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: String(e) }, 500);
  }
});
