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

  function parseJsonResponse(res) {
    if (!res.ok) {
      return res.text().then(function (body) {
        throw new Error('Content request failed: ' + res.status + (body ? ' ' + body.slice(0, 120) : ''));
      });
    }
    return res.json();
  }

  function fetchFromSupabaseRpc() {
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
    }).then(parseJsonResponse);
  }

  function fetchFromApi() {
    var version = encodeURIComponent(getContentVersion());
    return fetch('/api/site-content?_=' + Date.now() + '&v=' + version, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store',
        Pragma: 'no-cache'
      }
    }).then(parseJsonResponse);
  }

  function fetchPublishedContent() {
    return fetchFromSupabaseRpc().catch(function () {
      return fetchFromApi();
    });
  }

  function loadSiteContent(options) {
    return fetchPublishedContent();
  }

  function applyContentIfChanged(data) {
    if (!window.GME_normalize || !window.GME_render) return;
    var normalized = window.GME_normalize(data);
    if (!normalized) return;
    var snap = JSON.stringify(normalized);
    if (snap === window.GME_lastSnapshot) return;
    window.GME_lastSnapshot = snap;
    window.GME_render(normalized);
    if (window.GME_saveContentCache) window.GME_saveContentCache(data);
  }

  function refreshSiteContent() {
    return loadSiteContent({ force: true }).then(function (data) {
      applyContentIfChanged(data);
      return data;
    });
  }

  window.GME_Supabase = {
    getConfig: getConfig,
    loadSiteContent: loadSiteContent,
    refreshSiteContent: refreshSiteContent,
    clearCache: function () {
      try {
        localStorage.removeItem('gme_content_cache');
      } catch (e) { /* ignore */ }
    }
  };
})();
