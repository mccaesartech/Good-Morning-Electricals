import { createServiceClient } from '@/lib/supabase/service';
import { notifyEnquirySubmitted, notifyEnrolmentSubmitted } from '@/lib/notifications';

export type EnrolmentPayload = {
  full_name: string;
  email: string;
  phone: string;
  programme: string;
  date_of_birth?: string | null;
  education_level?: string | null;
  message?: string | null;
};

export type EnquiryPayload = {
  full_name: string;
  email: string;
  phone?: string | null;
  programme?: string | null;
  message: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function submitPublicEnrolment(payload: EnrolmentPayload) {
  const record = {
    full_name: payload.full_name.trim(),
    email: normalizeEmail(payload.email),
    phone: payload.phone.trim(),
    programme: payload.programme.trim(),
    date_of_birth: payload.date_of_birth?.trim() || null,
    education_level: payload.education_level?.trim() || null,
    message: payload.message?.trim() || null
  };

  if (record.full_name.length < 2) throw new Error('Full name is required');
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(record.email)) throw new Error('Valid email is required');
  if (record.phone.length < 6) throw new Error('Phone number is required');
  if (record.programme.length < 2) throw new Error('Programme is required');

  const supabase = createServiceClient();
  const { data: id, error } = await supabase.rpc('submit_enrolment', {
    p_full_name: record.full_name,
    p_email: record.email,
    p_phone: record.phone,
    p_programme: record.programme,
    p_date_of_birth: record.date_of_birth,
    p_education_level: record.education_level,
    p_message: record.message
  });

  if (error) throw new Error(error.message);

  const notify = await notifyEnrolmentSubmitted(record);

  return {
    id: id as string,
    saved: true,
    ...notify
  };
}

export async function submitPublicEnquiry(payload: EnquiryPayload) {
  const record = {
    full_name: payload.full_name.trim(),
    email: normalizeEmail(payload.email),
    phone: payload.phone?.trim() || null,
    programme: payload.programme?.trim() || null,
    message: payload.message.trim()
  };

  if (record.full_name.length < 2) throw new Error('Full name is required');
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(record.email)) throw new Error('Valid email is required');
  if (record.message.length < 5) throw new Error('Message is required');

  const supabase = createServiceClient();
  const { data: id, error } = await supabase.rpc('submit_contact_enquiry', {
    p_full_name: record.full_name,
    p_email: record.email,
    p_phone: record.phone,
    p_programme: record.programme,
    p_message: record.message
  });

  if (error) throw new Error(error.message);

  const notify = await notifyEnquirySubmitted(record);

  return {
    id: id as string,
    saved: true,
    ...notify
  };
}
