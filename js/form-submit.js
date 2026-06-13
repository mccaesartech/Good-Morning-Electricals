/**
 * Public form submissions → Supabase RPC (no SDK required)
 */
(function () {
  'use strict';

  function getConfig() {
    var cfg = window.GME_SUPABASE || {};
    var url = (cfg.url || '').trim();
    var anonKey = (cfg.anonKey || '').trim();
    var urlMeta = document.querySelector('meta[name="gme-supabase-url"]');
    var keyMeta = document.querySelector('meta[name="gme-supabase-anon-key"]');
    if (urlMeta && urlMeta.content) url = urlMeta.content.trim();
    if (keyMeta && keyMeta.content) anonKey = keyMeta.content.trim();
    return { url: url, anonKey: anonKey };
  }

  function callRpc(fn, params) {
    var cfg = getConfig();
    if (!cfg.url || !cfg.anonKey) {
      return Promise.reject(new Error('Supabase not configured'));
    }
    var endpoint = cfg.url.replace(/\/$/, '') + '/rest/v1/rpc/' + fn;
    return fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: cfg.anonKey,
        Authorization: 'Bearer ' + cfg.anonKey,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(params)
    }).then(function (res) {
      if (!res.ok) {
        return res.json().then(function (j) {
          throw new Error(j.message || j.error || 'Submission failed');
        });
      }
      return res.json();
    });
  }

  function sendNotification(table, record) {
    var type = table === 'enrolments' ? 'enrolment' : 'enquiry';
    return fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: type, record: record })
    }).then(function (res) {
      return res.json().then(function (data) {
        return { ok: res.ok, data: data };
      });
    }).catch(function (err) {
      console.warn('[GME] Notification request failed:', err);
      return { ok: false, data: null };
    });
  }

  function setLoading(form, loading) {
    var btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = loading;
      if (!btn.dataset.originalText) btn.dataset.originalText = btn.innerHTML;
      btn.innerHTML = loading ? 'Sending…' : btn.dataset.originalText;
    }
  }

  function showSuccess(form, message) {
    var el = form.querySelector('.form-success');
    if (el) {
      el.hidden = false;
      el.textContent = message;
    }
    var err = form.querySelector('.form-error-global');
    if (err) err.remove();
    form.reset();
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function showError(form, msg) {
    var el = form.querySelector('.form-error-global');
    if (!el) {
      el = document.createElement('p');
      el.className = 'form-error form-error-global';
      el.setAttribute('role', 'alert');
      form.prepend(el);
    }
    el.textContent = msg;
    var ok = form.querySelector('.form-success');
    if (ok) ok.hidden = true;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }
        setLoading(contactForm, true);
        var record = {
          full_name: contactForm.querySelector('[name="name"]').value.trim(),
          email: contactForm.querySelector('[name="email"]').value.trim(),
          phone: contactForm.querySelector('[name="phone"]').value.trim() || null,
          programme: contactForm.querySelector('[name="programme"]').value.trim() || null,
          message: contactForm.querySelector('[name="message"]').value.trim()
        };
        callRpc('submit_contact_enquiry', {
          p_full_name: record.full_name,
          p_email: record.email,
          p_phone: record.phone,
          p_programme: record.programme,
          p_message: record.message
        }).then(function () {
          return sendNotification('contact_enquiries', record);
        }).then(function (notifyResult) {
          var msg = 'Thank you! Your message was received successfully. We will contact you by phone or email shortly.';
          if (notifyResult && notifyResult.ok && notifyResult.data && notifyResult.data.emailSent) {
            msg = 'Thank you! A confirmation email has been sent to ' + record.email + '. We will contact you shortly.';
          }
          showSuccess(contactForm, msg);
        }).catch(function (err) {
          showError(contactForm, err.message || 'Please try again.');
        }).finally(function () {
          setLoading(contactForm, false);
        });
      });
    }

    var enrolForm = document.getElementById('enrol-form');
    if (enrolForm) {
      enrolForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!enrolForm.checkValidity()) { enrolForm.reportValidity(); return; }
        setLoading(enrolForm, true);
        var dob = enrolForm.querySelector('[name="date_of_birth"]').value;
        var record = {
          full_name: enrolForm.querySelector('[name="full_name"]').value.trim(),
          email: enrolForm.querySelector('[name="email"]').value.trim(),
          phone: enrolForm.querySelector('[name="phone"]').value.trim(),
          programme: enrolForm.querySelector('[name="programme"]').value.trim(),
          date_of_birth: dob || null,
          education_level: enrolForm.querySelector('[name="education_level"]').value.trim() || null,
          message: enrolForm.querySelector('[name="message"]').value.trim() || null
        };
        callRpc('submit_enrolment', {
          p_full_name: record.full_name,
          p_email: record.email,
          p_phone: record.phone,
          p_programme: record.programme,
          p_date_of_birth: record.date_of_birth,
          p_education_level: record.education_level,
          p_message: record.message
        }).then(function () {
          return sendNotification('enrolments', record);
        }).then(function (notifyResult) {
          var msg = 'Application received successfully! Our admissions team will review it and contact you soon.';
          if (notifyResult && notifyResult.ok && notifyResult.data && notifyResult.data.emailSent) {
            msg = 'Application received successfully! A confirmation email has been sent to ' + record.email + '.';
          }
          showSuccess(enrolForm, msg);
        }).catch(function (err) {
          showError(enrolForm, err.message || 'Please try again.');
        }).finally(function () {
          setLoading(enrolForm, false);
        });
      });
    }

    document.querySelectorAll('[data-open-enrol]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var target = document.getElementById('enrol');
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  });
})();
