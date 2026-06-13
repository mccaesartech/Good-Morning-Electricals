/**
 * Public form submissions → server API (save + email in one step)
 */
(function () {
  'use strict';

  function postJson(url, record) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          throw new Error(data.error || 'Submission failed');
        }
        return data;
      });
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

  function buildSuccessMessage(result, record, formType) {
    var applicantEmail = record.email;
    var parts = [];

    if (formType === 'enrolment') {
      parts.push('Your application has been received and saved.');
    } else {
      parts.push('Your message has been received and saved.');
    }

    if (result.emailSent) {
      parts.push('A confirmation email was sent to ' + applicantEmail + '.');
    }

    if (result.adminEmailSent) {
      parts.push('Our admissions team has been notified.');
    } else if (result.saved) {
      parts.push('Our team will follow up with you shortly.');
    }

    if (result.saved && !result.emailSent) {
      parts.push('(Email confirmation could not be delivered — please check your email address or contact us directly.)');
    }

    return parts.join(' ');
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
        postJson('/api/submit/enquiry', record)
          .then(function (result) {
            showSuccess(contactForm, buildSuccessMessage(result, record, 'enquiry'));
          })
          .catch(function (err) {
            showError(contactForm, err.message || 'Please try again.');
          })
          .finally(function () {
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
        postJson('/api/submit/enrolment', record)
          .then(function (result) {
            showSuccess(enrolForm, buildSuccessMessage(result, record, 'enrolment'));
          })
          .catch(function (err) {
            showError(enrolForm, err.message || 'Please try again.');
          })
          .finally(function () {
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
