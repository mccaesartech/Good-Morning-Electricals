(function () {
  'use strict';

  var FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80';
  var CONTENT_CACHE_KEY = 'gme_content_cache';
  var VERSION_KEY = 'gme_content_version';
  var cmsReadyMarked = false;
  var preloadedImageUrls = {};

  function saveContentCache(raw) {
    if (!raw) return;
    try {
      localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(raw));
    } catch (e) { /* quota / private mode */ }
  }

  function loadContentCache() {
    try {
      var raw = localStorage.getItem(CONTENT_CACHE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function markCmsReady() {
    if (cmsReadyMarked) return;
    cmsReadyMarked = true;
    document.documentElement.classList.remove('cms-loading');
    document.documentElement.classList.add('cms-ready');
    var splash = document.querySelector('.cms-boot-splash');
    if (splash) splash.setAttribute('aria-hidden', 'true');
  }

  function preloadImage(src) {
    if (!src || src.indexOf('http') !== 0 || preloadedImageUrls[src]) return;
    preloadedImageUrls[src] = true;
    var img = new Image();
    img.decoding = 'async';
    img.src = cacheBustUrl(src);
  }

  function preloadContentImages(data) {
    if (!data) return;
    if (data.settings) {
      preloadImage(data.settings.logo);
      preloadImage(data.settings.favicon);
      preloadImage(data.settings.ogImage);
    }
    if (data.hero && data.hero.bgImage) preloadImage(data.hero.bgImage);
    if (data.about && data.about.image) preloadImage(data.about.image);
    if (data.admissions && data.admissions.bgImage) preloadImage(data.admissions.bgImage);
    (data.gallery || []).forEach(function (g) { preloadImage(g.image); });
    (data.programmes || []).forEach(function (p) { preloadImage(p.image); });
    (data.facilities || []).forEach(function (f) { preloadImage(f.image); });
    (data.staff || []).forEach(function (st) { preloadImage(st.image); });
  }

  function applyRawContent(raw, options) {
    var data = normalize(raw);
    if (!data) return false;
    var snap = JSON.stringify(data);
    if (snap !== window.GME_lastSnapshot) {
      window.GME_lastSnapshot = snap;
      render(data);
    }
    preloadContentImages(data);
    if (!options || options.persist !== false) saveContentCache(raw);
    return true;
  }

  function esc(s) {
    if (s == null) return '';
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  function parseJsonArray(val) {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch (e) { return []; }
    }
    return [];
  }

  function normalize(raw) {
    if (!raw) return null;
    var s = raw.settings || {};
    var h = raw.hero || {};
    var a = raw.about || {};
    var adm = raw.admissions || {};
    var c = raw.contact || {};
    var fsec = raw.facilities_section || {};
    var ssec = raw.staff_section || {};
    var gsec = raw.gallery_section || {};

    return {
      settings: {
        academyName: s.academy_name || '',
        logoLine1: s.logo_line_1 || 'Good Morning',
        logoLine2: s.logo_line_2 || 'Electrical Engineering Academy',
        tagline: s.tagline || '',
        established: s.established_year || '2015',
        logo: s.logo_url || 'assets/logo.png',
        favicon: s.favicon_url || s.logo_url || 'assets/logo.png',
        metaDescription: s.meta_description || '',
        metaTitle: s.meta_title || '',
        metaKeywords: s.meta_keywords || '',
        ogImage: s.og_image_url || '',
        phones: parseJsonArray(c.phones),
        email: c.email || '',
        whatsapp: c.whatsapp || '',
        social: {
          facebook: s.social_facebook || '#',
          instagram: s.social_instagram || '#',
          twitter: s.social_twitter || '#',
          linkedin: s.social_linkedin || '#',
          youtube: s.social_youtube || '#'
        }
      },
      footer: {
        description: s.footer_description || s.tagline || '',
        copyright: s.footer_copyright || s.academy_name || ''
      },
      hero: {
        badge: h.badge || '',
        title: h.title || '',
        subtitle: h.subtitle || '',
        highlights: parseJsonArray(h.highlights),
        panelCta: h.panel_cta || '100% Practical Focus',
        ctaPrimary: h.cta_primary || 'Enroll Today',
        ctaSecondary: h.cta_secondary || 'View Programmes',
        bgImage: h.bg_image_url || '',
        bgFocus: h.bg_image_focus || 'center center'
      },
      statistics: parseJsonArray(h.statistics),
      about: {
        label: a.section_label || 'About Us',
        title: a.title || '',
        desc: a.description || '',
        lead: a.lead_text || '',
        paragraphs: parseJsonArray(a.paragraphs),
        features: parseJsonArray(a.feature_bullets),
        imageBadge: a.image_badge || '',
        image: a.image_url || ''
      },
      features: (raw.features || []).map(function (f) {
        return { icon: f.icon, title: f.title, text: f.body };
      }),
      programmes: (raw.programmes || []).map(function (p) {
        return {
          icon: p.icon,
          title: p.title,
          desc: p.description,
          duration: p.duration,
          certificate: p.certificate,
          badge: p.badge,
          image: p.image_url,
          careers: parseJsonArray(p.careers)
        };
      }),
      facilitiesSection: {
        label: fsec.section_label || 'Our Campus',
        title: fsec.title || 'Facilities & Practical Training',
        desc: fsec.description || ''
      },
      staffSection: {
        label: ssec.section_label || 'Meet the Team',
        title: ssec.title || 'Our Instructors & Staff',
        desc: ssec.description || ''
      },
      facilities: (raw.facilities || []).map(function (f) {
        return { icon: f.icon, title: f.title, text: f.body, image: f.image_url };
      }),
      gallerySection: {
        label: gsec.section_label || 'In the Field',
        title: gsec.title || 'Photo Gallery',
        desc: gsec.description || ''
      },
      journey: (raw.journey || []).map(function (j) {
        return { icon: j.icon, step: j.step_label, title: j.title, text: j.body };
      }),
      careers: (raw.careers || []).map(function (cr) {
        return { icon: cr.icon, title: cr.title, text: cr.body };
      }),
      testimonials: (raw.testimonials || []).map(function (t) {
        return {
          name: t.author_name,
          initials: t.initials,
          programme: t.programme,
          text: t.quote,
          stars: t.stars || 5
        };
      }),
      staff: (raw.staff || []).map(function (st) {
        return {
          name: st.full_name,
          role: st.role,
          qualifications: st.qualifications,
          bio: st.bio,
          initials: st.initials,
          image: st.photo_url
        };
      }),
      gallery: (raw.gallery || []).map(function (g) {
        return { title: g.caption, image: g.image_url, alt: g.alt_text, captionColor: g.caption_color || '#ffffff' };
      }),
      admissions: {
        title: adm.title || '',
        text: adm.body || '',
        btnApply: adm.btn_apply_text || 'Apply Now',
        btnCall: adm.btn_call_text || 'Call Admissions',
        checklist: parseJsonArray(adm.checklist),
        bgImage: adm.bg_image_url || ''
      },
      faq: (raw.faq || []).map(function (f) {
        return { question: f.question, answer: f.answer };
      }),
      location: {
        address: c.address || '',
        gps: c.gps_code || '',
        hours: c.office_hours || '',
        lat: c.map_latitude != null ? Number(c.map_latitude) : null,
        lng: c.map_longitude != null ? Number(c.map_longitude) : null
      }
    };
  }

  function setText(el, text) {
    if (el) el.textContent = text;
  }

  function formatPhone(phone) {
    var clean = String(phone).replace(/\s/g, '');
    return clean.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  }

  function phoneLink(phone) {
    return 'tel:+233' + String(phone).replace(/^0/, '').replace(/\s/g, '');
  }

  function cacheBustUrl(src) {
    if (!src || src.indexOf('http') !== 0) return src;
    var version = '0';
    try {
      version = localStorage.getItem(VERSION_KEY) || '0';
    } catch (e) {
      version = '0';
    }
    if (version === '0') return src;
    var sep = src.indexOf('?') >= 0 ? '&' : '?';
    return src + sep + 'v=' + encodeURIComponent(version);
  }

  function baseImageSrc(src) {
    return String(src || '').split('?')[0];
  }

  function setImageSrc(el, src) {
    if (!el || !src) return;
    var tracked = el.getAttribute('data-image-src');
    if (tracked === src) return;

    if (src.indexOf('assets/logo') !== -1 || src === 'assets/logo.png') {
      if (baseImageSrc(el.src) !== baseImageSrc('assets/logo.png')) {
        el.src = 'assets/logo.png';
      }
      el.setAttribute('data-image-src', src);
      return;
    }

    var next = cacheBustUrl(src);
    if (baseImageSrc(el.src) !== baseImageSrc(src)) {
      el.src = next;
    }
    el.setAttribute('data-image-src', src);
  }

  var lastHeroSettings = null;

  function applyHeroBackground(h) {
    if (!h) return;
    lastHeroSettings = h;
    var heroBgEl = document.getElementById('hero-bg-img');
    if (!heroBgEl) return;

    setImageSrc(heroBgEl, h.bgImage);

    var focus = h.bgFocus || 'center center';
    if (heroBgEl.getAttribute('data-bg-focus') !== focus) {
      heroBgEl.setAttribute('data-bg-focus', focus);
      heroBgEl.style.setProperty('--hero-bg-position', focus);
      heroBgEl.style.objectPosition = focus;
    }
  }

  function mapQuery(loc) {
    if (loc.lat != null && loc.lng != null && !isNaN(loc.lat) && !isNaN(loc.lng)) {
      return String(loc.lat) + ',' + String(loc.lng);
    }
    if (loc.gps) return loc.gps;
    return '5.6602529,-0.0391007';
  }

  function mapEmbedUrl(loc) {
    return 'https://www.google.com/maps?q=' + encodeURIComponent(mapQuery(loc)) + '&z=17&hl=en&output=embed';
  }

  function mapLinkUrl(loc) {
    return 'https://www.google.com/maps?q=' + encodeURIComponent(mapQuery(loc)) + '&z=17&hl=en';
  }

  function faIcon(name) {
    if (!name) return 'fa-circle';
    var s = String(name).trim();
    if (s.indexOf('fa-') === 0) return s;
    return 'fa-' + s;
  }

  function populateProgrammeSelect(el, programmes) {
    if (!el) return;
    if (!programmes.length) {
      el.innerHTML = '<option value="">Select a programme</option>';
      return;
    }
    el.innerHTML = '<option value="">Select a programme</option>' +
      programmes.map(function (p) {
        return '<option value="' + esc(p.title) + '">' + esc(p.title) + '</option>';
      }).join('');
  }

  var lastRenderSnapshot = '';

  function renderGallerySection(grid, items) {
    if (!grid) return;
    var fp = JSON.stringify(items);
    if (grid.getAttribute('data-content-fp') === fp) return;

    var existing = grid.querySelectorAll('.gallery-item');
    if (existing.length === items.length && items.length > 0) {
      for (var gi = 0; gi < items.length; gi++) {
        var g = items[gi];
        var fig = existing[gi];
        var img = fig.querySelector('img');
        var cap = fig.querySelector('figcaption');
        var imageSrc = g.image || FALLBACK_IMAGE;
        fig.style.setProperty('--caption-color', g.captionColor || '#ffffff');
        if (img) {
          if (img.getAttribute('data-image-src') !== imageSrc) {
            img.setAttribute('data-image-src', imageSrc);
            img.src = cacheBustUrl(imageSrc);
            img.alt = g.alt || g.title || '';
          }
        }
        if (cap && cap.textContent !== (g.title || '')) cap.textContent = g.title || '';
      }
      grid.setAttribute('data-content-fp', fp);
      return;
    }

    grid.setAttribute('data-content-fp', fp);
    grid.innerHTML = items.length
      ? items.map(function (g) {
        var imageSrc = g.image || FALLBACK_IMAGE;
        return '<figure class="gallery-item" style="--caption-color:' + esc(g.captionColor || '#ffffff') + '"><img src="' + esc(cacheBustUrl(imageSrc)) + '" data-image-src="' + esc(imageSrc) + '" alt="' + esc(g.alt || g.title) + '" loading="lazy" decoding="async"><figcaption>' + esc(g.title) + '</figcaption></figure>';
      }).join('')
      : '';
  }

  function render(data) {
    var snap = JSON.stringify(data);
    if (snap === lastRenderSnapshot) return;
    lastRenderSnapshot = snap;
    window.GME_lastSnapshot = snap;

    var s = data.settings;

    if (s.metaTitle) document.title = s.metaTitle;
    else if (s.academyName) document.title = s.academyName + ' | Admissions Open';

    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && s.metaDescription) metaDesc.content = s.metaDescription;

    var metaKw = document.querySelector('meta[name="keywords"]');
    if (metaKw && s.metaKeywords) metaKw.content = s.metaKeywords;

    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && s.metaTitle) ogTitle.content = s.metaTitle;

    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && s.metaDescription) ogDesc.content = s.metaDescription;

    if (s.ogImage) {
      var ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.content = s.ogImage;
    }

    setImageSrc(document.getElementById('site-favicon'), s.favicon || s.logo);

    var logos = document.querySelectorAll('.site-logo');
    for (var li = 0; li < logos.length; li++) {
      setImageSrc(logos[li], s.logo);
      logos[li].alt = s.academyName;
    }

    setText(document.getElementById('nav-logo-name'), s.logoLine1);
    setText(document.getElementById('nav-logo-sub'), s.logoLine2);
    setText(document.getElementById('nav-menu-line1'), s.logoLine1);
    setText(document.getElementById('nav-menu-line2'), s.logoLine2);
    setText(document.getElementById('footer-brand-line1'), s.logoLine1);
    setText(document.getElementById('footer-brand-line2'), s.logoLine2);

    var footerDesc = document.getElementById('footer-tagline');
    if (footerDesc) footerDesc.textContent = data.footer.description || s.tagline;

    var footerCopy = document.getElementById('footer-copyright');
    if (footerCopy) footerCopy.textContent = data.footer.copyright || s.academyName;

    setText(document.getElementById('footer-tagline-2'), s.tagline);

    var h = data.hero;
    setText(document.getElementById('hero-badge'), h.badge);
    var heroTitle = document.getElementById('hero-title');
    if (heroTitle) heroTitle.innerHTML = esc(h.title).replace(/\n/g, '<br>');
    setText(document.getElementById('hero-subtitle'), h.subtitle);
    setText(document.getElementById('hero-established'), s.established || '2015');
    setText(document.getElementById('hero-tagline'), s.tagline);
    setText(document.getElementById('hero-panel-cta'), h.panelCta);

    applyHeroBackground(h);

    var heroCtaPrimary = document.querySelector('#hero-cta-primary span');
    if (heroCtaPrimary) heroCtaPrimary.textContent = h.ctaPrimary;
    var heroCtaSecondary = document.querySelector('#hero-cta-secondary span');
    if (heroCtaSecondary) heroCtaSecondary.textContent = h.ctaSecondary;

    var highlightsEl = document.getElementById('hero-highlights');
    if (highlightsEl && h.highlights.length) {
      highlightsEl.innerHTML = h.highlights.map(function (item) {
        return '<li><i class="fas fa-check" aria-hidden="true"></i> ' + esc(item) + '</li>';
      }).join('');
    }

    var statsGrid = document.getElementById('stats-grid');
    if (statsGrid && data.statistics.length) {
      statsGrid.innerHTML = data.statistics.map(function (st) {
        var countAttr = st.count !== undefined ? ' data-count="' + esc(st.count) + '"' : '';
        return '<div class="stats-band__item reveal"><span class="stats-band__number"' + countAttr + '>' + esc(st.number) + '</span><span class="stats-band__label">' + esc(st.label) + '</span></div>';
      }).join('');
    }

    var ab = data.about;
    setText(document.getElementById('about-label'), ab.label);
    setText(document.getElementById('about-title'), ab.title);
    setText(document.getElementById('about-desc'), ab.desc);
    setText(document.getElementById('about-lead'), ab.lead);
    setText(document.getElementById('about-badge'), ab.imageBadge);
    setImageSrc(document.getElementById('about-img'), ab.image);

    var aboutParas = document.getElementById('about-paragraphs');
    if (aboutParas && ab.paragraphs.length) {
      aboutParas.innerHTML = ab.paragraphs.map(function (p) {
        return '<p>' + esc(p) + '</p>';
      }).join('');
    }

    var aboutFeatures = document.getElementById('about-features');
    if (aboutFeatures && ab.features.length) {
      aboutFeatures.innerHTML = ab.features.map(function (f) {
        return '<li><i class="fas fa-check" aria-hidden="true"></i> ' + esc(f) + '</li>';
      }).join('');
    }

    var featuresGrid = document.getElementById('features-grid');
    if (featuresGrid) {
      featuresGrid.innerHTML = data.features.length
        ? data.features.map(function (f) {
          return '<article class="feature-card reveal"><div class="feature-card__icon"><i class="fas ' + esc(faIcon(f.icon)) + '" aria-hidden="true"></i></div><h3 class="feature-card__title">' + esc(f.title) + '</h3><p class="feature-card__text">' + esc(f.text) + '</p></article>';
        }).join('')
        : '';
    }

    var programmesGrid = document.getElementById('programmes-grid');
    if (programmesGrid) {
      programmesGrid.innerHTML = data.programmes.length
        ? data.programmes.map(function (p) {
        return '<article class="programme-card reveal visible"><div class="programme-card__image"><img src="' + esc(cacheBustUrl(p.image || FALLBACK_IMAGE)) + '" alt="' + esc(p.title) + '" loading="lazy">' +
          (p.badge ? '<span class="programme-card__badge">' + esc(p.badge) + '</span>' : '') +
          '</div><div class="programme-card__body"><div class="programme-card__icon"><i class="fas ' + esc(faIcon(p.icon)) + '" aria-hidden="true"></i></div>' +
          '<h3 class="programme-card__title">' + esc(p.title) + '</h3><p class="programme-card__desc">' + esc(p.desc) + '</p>' +
          '<ul class="programme-card__meta"><li><i class="fas fa-clock" aria-hidden="true"></i> Duration: ' + esc(p.duration) + '</li>' +
          '<li><i class="fas fa-certificate" aria-hidden="true"></i> ' + esc(p.certificate) + '</li></ul>' +
          '<div class="programme-card__careers"><span class="programme-card__careers-label">Career Paths:</span>' +
          p.careers.map(function (cr) { return '<span class="tag">' + esc(cr) + '</span>'; }).join('') +
          '</div><a href="#admissions" class="btn btn--secondary btn--sm">Apply Now</a></div></article>';
      }).join('')
        : '';
    }

    if (data.facilitiesSection) {
      setText(document.getElementById('facilities-label'), data.facilitiesSection.label);
      setText(document.getElementById('facilities-heading'), data.facilitiesSection.title);
      setText(document.getElementById('facilities-desc'), data.facilitiesSection.desc);
    }

    if (data.staffSection) {
      setText(document.getElementById('staff-label'), data.staffSection.label);
      setText(document.getElementById('staff-heading'), data.staffSection.title);
      setText(document.getElementById('staff-desc'), data.staffSection.desc);
    }

    if (data.gallerySection) {
      setText(document.getElementById('gallery-label'), data.gallerySection.label);
      setText(document.getElementById('gallery-heading'), data.gallerySection.title);
      setText(document.getElementById('gallery-desc'), data.gallerySection.desc);
    }

    var facilitiesGrid = document.getElementById('facilities-grid');
    if (facilitiesGrid) {
      facilitiesGrid.innerHTML = data.facilities.length
        ? data.facilities.map(function (f) {
        return '<article class="facility-card reveal visible"><div class="facility-card__image"><img src="' + esc(cacheBustUrl(f.image || FALLBACK_IMAGE)) + '" alt="' + esc(f.title) + '" loading="lazy"></div>' +
          '<div class="facility-card__content"><div class="facility-card__icon"><i class="fas ' + esc(faIcon(f.icon)) + '" aria-hidden="true"></i></div>' +
          '<h3>' + esc(f.title) + '</h3><p>' + esc(f.text) + '</p></div></article>';
      }).join('')
        : '';
    }

    var timeline = document.getElementById('journey-timeline');
    if (timeline) {
      timeline.setAttribute('data-count', String(data.journey.length));
      timeline.classList.toggle('timeline--compact', data.journey.length >= 6);
      timeline.innerHTML = data.journey.length
        ? data.journey.map(function (j) {
        return '<div class="timeline__item reveal visible"><div class="timeline__marker"><i class="fas ' + esc(faIcon(j.icon)) + '" aria-hidden="true"></i></div>' +
          '<div class="timeline__content"><span class="timeline__step">' + esc(j.step) + '</span><h3>' + esc(j.title) + '</h3><p>' + esc(j.text) + '</p></div></div>';
      }).join('')
        : '';
    }

    var careersGrid = document.getElementById('careers-grid');
    if (careersGrid) {
      careersGrid.innerHTML = data.careers.length
        ? data.careers.map(function (cr) {
          return '<article class="career-card reveal"><i class="fas ' + esc(faIcon(cr.icon)) + '" aria-hidden="true"></i><h3>' + esc(cr.title) + '</h3><p>' + esc(cr.text) + '</p></article>';
        }).join('')
        : '';
    }

    var testimonialsGrid = document.getElementById('testimonials-grid');
    if (testimonialsGrid) {
      testimonialsGrid.innerHTML = data.testimonials.length ? data.testimonials.map(function (t) {
        var stars = '';
        for (var si = 0; si < (t.stars || 5); si++) stars += '<i class="fas fa-star" aria-hidden="true"></i>';
        return '<blockquote class="testimonial-card reveal visible"><div class="testimonial-card__stars" aria-label="' + (t.stars || 5) + ' out of 5 stars">' + stars + '</div>' +
          '<p class="testimonial-card__text">&ldquo;' + esc(t.text) + '&rdquo;</p>' +
          '<footer class="testimonial-card__author"><div class="testimonial-card__avatar">' + esc(t.initials) + '</div>' +
          '<div><cite class="testimonial-card__name">' + esc(t.name) + '</cite><span class="testimonial-card__programme">' + esc(t.programme) + '</span></div></footer></blockquote>';
      }).join('') : '';
    }

    var staffGrid = document.getElementById('staff-grid');
    if (staffGrid) {
      staffGrid.innerHTML = data.staff.length
        ? data.staff.map(function (st) {
          return '<article class="staff-card reveal visible">' +
            (st.image ? '<div class="staff-card__image"><img src="' + esc(cacheBustUrl(st.image)) + '" alt="' + esc(st.name) + '" loading="lazy"></div>' :
              '<div class="staff-card__avatar">' + esc(st.initials || st.name.charAt(0)) + '</div>') +
            '<h3 class="staff-card__name">' + esc(st.name) + '</h3><p class="staff-card__role">' + esc(st.role) + '</p>' +
            (st.qualifications ? '<p class="staff-card__qual">' + esc(st.qualifications) + '</p>' : '') +
            (st.bio ? '<p class="staff-card__bio">' + esc(st.bio) + '</p>' : '') +
            '</article>';
        }).join('')
        : '';
    }

    renderGallerySection(document.getElementById('gallery-grid'), data.gallery);

    var adm = data.admissions;
    setText(document.getElementById('admissions-title'), adm.title);
    setText(document.getElementById('admissions-text'), adm.text);
    setImageSrc(document.getElementById('admissions-bg-img'), adm.bgImage);

    var admApply = document.querySelector('#admissions-btn-apply span');
    if (admApply) admApply.textContent = adm.btnApply;
    var admCall = document.querySelector('#admissions-btn-call span');
    if (admCall) admCall.textContent = adm.btnCall;

    if (s.phones && s.phones[0]) {
      var admCallLink = document.getElementById('admissions-btn-call');
      if (admCallLink) admCallLink.href = phoneLink(s.phones[0]);
    }

    var admList = document.getElementById('admissions-checklist');
    if (admList && adm.checklist.length) {
      admList.innerHTML = adm.checklist.map(function (item) {
        return '<li><i class="fas fa-check-circle" aria-hidden="true"></i> ' + esc(item) + '</li>';
      }).join('');
    }

    var faqList = document.getElementById('faq-list');
    if (faqList) {
      faqList.innerHTML = data.faq.length ? data.faq.map(function (f) {
        return '<details class="faq-item reveal visible"><summary class="faq-item__question"><span>' + esc(f.question) + '</span><i class="fas fa-plus faq-item__icon" aria-hidden="true"></i></summary>' +
          '<div class="faq-item__answer"><p>' + esc(f.answer) + '</p></div></details>';
      }).join('') : '';
    }

    var loc = data.location;
    var addrEl = document.getElementById('location-address');
    if (addrEl && loc.address) addrEl.innerHTML = esc(loc.address).replace(/\n/g, '<br>');

    var hoursEl = document.getElementById('location-hours');
    if (hoursEl && loc.hours) hoursEl.innerHTML = esc(loc.hours).replace(/\n/g, '<br>');

    var gpsLink = document.getElementById('location-gps-link');
    if (gpsLink) gpsLink.href = mapLinkUrl(loc);

    var mapFrame = document.getElementById('location-map');
    if (mapFrame) mapFrame.src = mapEmbedUrl(loc);

    if (loc.lat != null && loc.lng != null && !isNaN(loc.lat) && !isNaN(loc.lng)) {
      setText(document.getElementById('location-gps'), loc.lat + ', ' + loc.lng);
    } else if (loc.gps) {
      setText(document.getElementById('location-gps'), loc.gps);
    }

    var contactPhones = document.getElementById('contact-phones');
    if (contactPhones && s.phones.length) {
      contactPhones.innerHTML = s.phones.map(function (ph) {
        return '<a href="' + phoneLink(ph) + '" class="contact__link">' + formatPhone(ph) + '</a>';
      }).join('');
    }

    var contactEmail = document.getElementById('contact-email');
    if (contactEmail && s.email) {
      contactEmail.href = 'mailto:' + s.email;
      contactEmail.textContent = s.email;
    }

    var footerContact = document.getElementById('footer-contact-list');
    if (footerContact && (loc.address || s.phones.length || s.email)) {
      var fc = '';
      if (loc.address) {
        fc += '<li><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ' + esc(loc.address.split('\n')[0]) + '</li>';
      }
      s.phones.forEach(function (ph) {
        fc += '<li><i class="fas fa-phone" aria-hidden="true"></i> <a href="' + phoneLink(ph) + '">' + formatPhone(ph) + '</a></li>';
      });
      if (s.email) {
        fc += '<li><i class="fas fa-envelope" aria-hidden="true"></i> <a href="mailto:' + esc(s.email) + '">' + esc(s.email) + '</a></li>';
      }
      footerContact.innerHTML = fc;
    }

    var footerProgrammes = document.getElementById('footer-programmes-list');
    if (footerProgrammes && data.programmes.length) {
      footerProgrammes.innerHTML = data.programmes.map(function (p) {
        return '<li><a href="#programmes">' + esc(p.title) + '</a></li>';
      }).join('');
    }

    var waFloat = document.querySelector('.whatsapp-float');
    if (waFloat && s.whatsapp) {
      waFloat.href = 'https://wa.me/' + s.whatsapp + '?text=' + encodeURIComponent('Hello, I am interested in enrolling at ' + s.academyName + '.');
    }

    var waBtn = document.getElementById('contact-whatsapp');
    if (waBtn && s.whatsapp) {
      waBtn.href = 'https://wa.me/' + s.whatsapp + '?text=' + encodeURIComponent('Hello, I am interested in enrolling at ' + s.academyName + '.');
    }

    var callBtn = document.getElementById('contact-call');
    if (callBtn && s.phones[0]) callBtn.href = phoneLink(s.phones[0]);

    var socialMap = {
      facebook: 'fab fa-facebook-f',
      instagram: 'fab fa-instagram',
      twitter: 'fab fa-x-twitter',
      linkedin: 'fab fa-linkedin-in',
      youtube: 'fab fa-youtube'
    };
    var socialEl = document.getElementById('footer-social');
    if (socialEl && s.social) {
      socialEl.innerHTML = Object.keys(s.social).map(function (key) {
        return '<a href="' + esc(s.social[key]) + '" aria-label="' + esc(key) + '" class="footer__social-link" target="_blank" rel="noopener noreferrer"><i class="' + socialMap[key] + '" aria-hidden="true"></i></a>';
      }).join('');
    }

    populateProgrammeSelect(document.getElementById('programme'), data.programmes);
    populateProgrammeSelect(document.getElementById('enrol-programme'), data.programmes);

    preloadContentImages(data);

    if (window.GME_initReveal) window.GME_initReveal();
    if (window.GME_initStats) window.GME_initStats();
    markCmsReady();
  }

  function bootSiteContent() {
    if (!window.GME_Supabase) return;

    var cachedRaw = loadContentCache();
    if (cachedRaw) {
      applyRawContent(cachedRaw, { persist: false });
      markCmsReady();
    }

    GME_Supabase.loadSiteContent({ force: true })
      .then(function (raw) {
        if (!raw) {
          markCmsReady();
          return;
        }
        applyRawContent(raw, { persist: true });
        markCmsReady();
      })
      .catch(function (err) {
        console.warn('[GME] Could not load site content from Supabase:', err && err.message ? err.message : err);
        markCmsReady();
      });

    setTimeout(markCmsReady, 12000);

    var heroResizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(heroResizeTimer);
      heroResizeTimer = setTimeout(function () {
        if (lastHeroSettings) applyHeroBackground(lastHeroSettings);
      }, 150);
    });

    var lastKnownVersion = '0';
    try {
      lastKnownVersion = localStorage.getItem('gme_content_version') || '0';
    } catch (verErr) {
      lastKnownVersion = '0';
    }

    function onContentPublished() {
      GME_Supabase.refreshSiteContent().catch(function () { /* keep current view */ });
    }

    window.addEventListener('storage', function (e) {
      if (e.key === 'gme_content_version' && e.newValue) {
        lastKnownVersion = e.newValue;
        onContentPublished();
      }
    });

    if (typeof BroadcastChannel !== 'undefined') {
      var contentChannel = new BroadcastChannel('gme_content_channel');
      contentChannel.onmessage = function (ev) {
        if (ev.data && ev.data.type === 'content-published') {
          if (ev.data.version) lastKnownVersion = String(ev.data.version);
          onContentPublished();
        }
      };
    }

    setInterval(function () {
      if (document.hidden) return;
      try {
        var currentVersion = localStorage.getItem('gme_content_version') || '0';
        if (currentVersion !== lastKnownVersion) {
          lastKnownVersion = currentVersion;
          onContentPublished();
        }
      } catch (pollErr) { /* ignore */ }
    }, 5000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootSiteContent);
  } else {
    bootSiteContent();
  }

  window.GME_render = render;
  window.GME_normalize = normalize;
  window.GME_saveContentCache = saveContentCache;
  window.GME_FALLBACK_IMAGE = FALLBACK_IMAGE;
})();
