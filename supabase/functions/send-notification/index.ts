import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'GME Academy <onboarding@resend.dev>';
const ADMIN_EMAIL = Deno.env.get('ADMIN_NOTIFICATION_EMAIL') ?? 'goodmorningelectricals934@gmail.com';

async function sendEmail(to: string, subject: string, html: string) {
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

serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record ?? payload;
    const table = payload.table ?? payload.type;

    if (table === 'enrolments' || record.programme && record.phone) {
      const name = record.full_name as string;
      const email = record.email as string;
      const programme = record.programme as string;

      await sendEmail(
        email,
        'Application Received',
        `<p>Dear ${name},</p>
        <p>Thank you for applying to <strong>Good Morning Electrical Engineering Academy</strong>.</p>
        <p>Your application for <strong>${programme}</strong> has been received successfully. Our admissions team will contact you shortly.</p>
        <p>Best regards,<br>Admissions Team</p>`
      );

      await sendEmail(
        ADMIN_EMAIL,
        `New Enrolment Application — ${name}`,
        `<p><strong>New enrolment application</strong></p>
        <ul>
          <li>Name: ${name}</li>
          <li>Email: ${email}</li>
          <li>Phone: ${record.phone}</li>
          <li>Programme: ${programme}</li>
        </ul>
        <p>Review in the admin dashboard under Enrolments.</p>`
      );
    } else {
      const name = record.full_name as string;
      const email = record.email as string;

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
        <p>Review in the admin dashboard under Enquiries.</p>`
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
