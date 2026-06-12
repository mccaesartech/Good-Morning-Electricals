(function () {
  'use strict';

  var VERSION_KEY = 'gme_content_version';

  function getContentVersion() {
    try {
      return localStorage.getItem(VERSION_KEY) || '0';
    } catch (e) {
      return '0';
    }
  }

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

  function fetchPublishedContent() {
    var cfg = getConfig();
    if (!cfg.url || !cfg.anonKey) {
      return Promise.reject(new Error('Supabase not configured'));
    }
    var endpoint = cfg.url.replace(/\/$/, '') + '/rest/v1/rpc/get_published_site_content';
    return fetch(endpoint + '?_=' + Date.now() + '&v=' + encodeURIComponent(getContentVersion()), {
      method: 'POST',
      cache: 'no-store',
      headers: {
        apikey: cfg.anonKey,
        Authorization: 'Bearer ' + cfg.anonKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store',
        Pragma: 'no-cache'
      },
      body: '{}'
    }).then(function (res) {
      if (!res.ok) throw new Error('Supabase RPC failed: ' + res.status);
      return res.json();
    });
  }

  function loadSiteContent(options) {
    var force = !options || options.force !== false;
    if (!force) {
      return fetchPublishedContent();
    }
    return fetchPublishedContent();
  }

  function refreshSiteContent() {
    return loadSiteContent({ force: true }).then(function (data) {
      if (window.GME_render && window.GME_normalize) {
        var normalized = window.GME_normalize(data);
        if (normalized) window.GME_render(normalized);
      }
      return data;
    });
  }

  window.GME_Supabase = {
    getConfig: getConfig,
    loadSiteContent: loadSiteContent,
    refreshSiteContent: refreshSiteContent,
    clearCache: function () { /* no-op — cache removed for live sync */ }
  };
})();
