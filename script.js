(function () {
  'use strict';

  var GME_FALLBACK_IMAGE = window.GME_FALLBACK_IMAGE || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80';

  document.addEventListener('error', function (e) {
    if (!e.target || e.target.tagName !== 'IMG' || e.target.dataset.fallbackApplied) return;
    e.target.dataset.fallbackApplied = '1';
    e.target.src = GME_FALLBACK_IMAGE;
  }, true);

  const header = document.getElementById('header');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav__link');
  const backToTop = document.getElementById('back-to-top');
  const contactForm = document.getElementById('contact-form');
  const yearEl = document.getElementById('year');

  let overlay = document.querySelector('.nav__overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav__overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
  }

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  function openMenu() {
    navToggle.classList.add('active');
    navMenu.classList.add('active');
    overlay.classList.add('active');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation menu');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navToggle.classList.remove('active');
    navMenu.classList.remove('active');
    overlay.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', function () {
    if (navMenu.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay.addEventListener('click', closeMenu);

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMenu();
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      closeMenu();
    }
  });

  window.addEventListener('scroll', function () {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    if (scrollY > 400) {
      backToTop.classList.add('visible');
      backToTop.removeAttribute('hidden');
    } else {
      backToTop.classList.remove('visible');
      backToTop.setAttribute('hidden', '');
    }
  }, { passive: true });

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const sections = document.querySelectorAll('section[id]');

  function highlightNav() {
    const scrollPos = window.scrollY + header.offsetHeight + 100;

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });

  function initReveal() {
    const revealElements = document.querySelectorAll('.reveal:not(.visible)');

    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );

      revealElements.forEach(function (el) {
        revealObserver.observe(el);
      });
    } else {
      revealElements.forEach(function (el) {
        el.classList.add('visible');
      });
    }
  }

  window.GME_initReveal = initReveal;
  initReveal();

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const message = document.getElementById('message');
      const nameError = document.getElementById('name-error');
      const emailError = document.getElementById('email-error');
      const messageError = document.getElementById('message-error');
      const formSuccess = document.getElementById('form-success');

      let valid = true;

      nameError.textContent = '';
      emailError.textContent = '';
      messageError.textContent = '';
      name.classList.remove('error');
      email.classList.remove('error');
      message.classList.remove('error');
      formSuccess.hidden = true;

      if (!name.value.trim()) {
        nameError.textContent = 'Please enter your full name.';
        name.classList.add('error');
        valid = false;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim()) {
        emailError.textContent = 'Please enter your email address.';
        email.classList.add('error');
        valid = false;
      } else if (!emailPattern.test(email.value.trim())) {
        emailError.textContent = 'Please enter a valid email address.';
        email.classList.add('error');
        valid = false;
      }

      if (!message.value.trim()) {
        messageError.textContent = 'Please enter your message.';
        message.classList.add('error');
        valid = false;
      }

      if (!valid) {
        const firstError = contactForm.querySelector('.error');
        if (firstError) firstError.focus();
        return;
      }

      const programme = document.getElementById('programme');
      const phone = document.getElementById('phone');
      const subject = encodeURIComponent('Enrollment Inquiry - Good Morning Electrical Academy');
      const body = encodeURIComponent(
        'Name: ' + name.value.trim() + '\n' +
        'Email: ' + email.value.trim() + '\n' +
        'Phone: ' + (phone.value.trim() || 'Not provided') + '\n' +
        'Programme: ' + (programme.options[programme.selectedIndex].text || 'Not specified') + '\n\n' +
        'Message:\n' + message.value.trim()
      );

      window.location.href = 'mailto:goodmorningelectricals934@gmail.com?subject=' + subject + '&body=' + body;

      formSuccess.hidden = false;
      contactForm.reset();
    });
  }

  function initFaq() {
    /* Event delegation — safe when CMS re-renders FAQ items */
  }

  document.addEventListener('toggle', function (e) {
    if (!e.target.classList || !e.target.classList.contains('faq-item')) return;
    if (e.target.open) {
      document.querySelectorAll('.faq-item').forEach(function (other) {
        if (other !== e.target && other.open) other.open = false;
      });
    }
  }, true);

  window.GME_initFaq = initFaq;

  function initStatsCounter() {
    var numbers = document.querySelectorAll('.stats-band__number[data-count]');
    if (!numbers.length || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        if (isNaN(target)) return;

        var suffix = el.textContent.replace(/[0-9]/g, '');
        var start = 0;
        var duration = 1400;
        var startTime = null;

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = Math.floor(start + (target - start) * eased);
          el.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    }, { threshold: 0.4 });

    numbers.forEach(function (n) { observer.observe(n); });
  }

  window.GME_initStats = initStatsCounter;
  initStatsCounter();

  highlightNav();
})();
