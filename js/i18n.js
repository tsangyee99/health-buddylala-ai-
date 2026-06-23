/* ============================================
   Alessandro's Health — i18n System
   5 languages: EN (default), JA, FR, zh-Hant, zh-Hans
   ============================================ */

const AH_i18n = (() => {
  const SUPPORTED = ['en', 'ja', 'fr', 'zh-Hant', 'zh-Hans'];
  const DEFAULT = 'en';
  const STORAGE_KEY = 'ah-lang';
  let currentLang = DEFAULT;
  let translations = {};

  /* ---------- LOAD TRANSLATIONS ---------- */
  async function loadLang(lang) {
    if (translations[lang]) return translations[lang];
    try {
      const res = await fetch(`/js/lang/${lang}.json?v=1`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      translations[lang] = await res.json();
      return translations[lang];
    } catch (e) {
      console.warn(`[i18n] Failed to load ${lang}:`, e);
      return null;
    }
  }

  /* ---------- APPLY TRANSLATIONS ---------- */
  function apply(lang, data) {
    // Set HTML lang attribute
    const langMap = {
      'en': 'en',
      'ja': 'ja',
      'fr': 'fr',
      'zh-Hant': 'zh-Hant',
      'zh-Hans': 'zh-Hans'
    };
    document.documentElement.lang = langMap[lang] || 'en';

    // Update page title and meta
    if (data._meta) {
      if (data._meta.title) document.title = data._meta.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && data._meta.description) metaDesc.content = data._meta.description;
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc && data._meta.ogDescription) ogDesc.content = data._meta.ogDescription;
    }

    // Translate elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = getNestedValue(data, key);
      if (val !== undefined && val !== null) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = val;
        } else {
          el.textContent = val;
        }
      }
    });

    // Translate elements with data-i18n-html (for content with <br> etc.)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const val = getNestedValue(data, key);
      if (val !== undefined && val !== null) {
        el.innerHTML = val;
      }
    });

    // Update aria-labels
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      const val = getNestedValue(data, key);
      if (val !== undefined) el.setAttribute('aria-label', val);
    });

    // Font adjustments for CJK vs Latin scripts
    adjustFonts(lang);

    // Update active state on language switcher
    document.querySelectorAll('.lang-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Update current language label
    const langLabels = { en: 'EN', ja: 'JA', fr: 'FR', 'zh-Hant': '繁', 'zh-Hans': '简' };
    const langCurrent = document.getElementById('langCurrent');
    if (langCurrent) {
      langCurrent.textContent = langLabels[lang] || lang.toUpperCase();
    }
  }

  /* ---------- FONT ADJUSTMENTS ---------- */
  function adjustFonts(lang) {
    const root = document.documentElement;
    const isCJK = ['ja', 'zh-Hant', 'zh-Hans'].includes(lang);

    // Adjust letter-spacing for CJK
    root.classList.toggle('lang-cjk', isCJK);
    root.classList.toggle('lang-latin', !isCJK);

    // Load Noto Sans JP for Japanese if needed
    if (lang === 'ja' && !document.getElementById('font-jp')) {
      const link = document.createElement('link');
      link.id = 'font-jp';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600&display=swap';
      document.head.appendChild(link);
    }

    // Update font-family based on language
    if (lang === 'ja') {
      root.style.setProperty('--font-body', "'Inter', 'Noto Sans JP', 'Hiragino Sans', sans-serif");
      root.style.setProperty('--font-display', "'Noto Sans JP', 'Hiragino Sans', sans-serif");
    } else if (lang === 'zh-Hant') {
      root.style.setProperty('--font-body', "'Inter', 'Noto Sans TC', -apple-system, 'PingFang TC', 'Microsoft JhengHei', sans-serif");
      root.style.setProperty('--font-display', "'Noto Sans TC', 'PingFang TC', sans-serif");
    } else if (lang === 'zh-Hans') {
      root.style.setProperty('--font-body', "'Inter', 'Noto Sans SC', -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif");
      root.style.setProperty('--font-display', "'Noto Sans SC', 'PingFang SC', sans-serif");
    } else {
      // Reset to default (EN, FR)
      root.style.setProperty('--font-body', "'Inter', 'Noto Sans TC', -apple-system, sans-serif");
      root.style.setProperty('--font-display', "'Noto Sans TC', sans-serif");
    }
  }

  /* ---------- LOAD Noto Sans SC FOR SIMPLIFIED CHINESE ---------- */
  function ensureSCFont() {
    if (!document.getElementById('font-sc')) {
      const link = document.createElement('link');
      link.id = 'font-sc';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600&display=swap';
      document.head.appendChild(link);
    }
  }

  /* ---------- HELPER: NESTED VALUE ---------- */
  function getNestedValue(obj, path) {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : undefined, obj);
  }

  /* ---------- DETECT LANGUAGE ---------- */
  function detectLang() {
    // 1. URL parameter
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang && SUPPORTED.includes(urlLang)) return urlLang;

    // 2. URL hash (e.g. #lang=ja)
    const hash = window.location.hash;
    if (hash.startsWith('#lang=')) {
      const hashLang = hash.replace('#lang=', '');
      if (SUPPORTED.includes(hashLang)) return hashLang;
    }

    // 3. localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;

    // 4. Browser language
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang) {
      // Check exact match first
      if (SUPPORTED.includes(browserLang)) return browserLang;
      // Check prefix (e.g. "zh-TW" → "zh-Hant")
      if (browserLang.startsWith('zh-TW') || browserLang.startsWith('zh-HK')) return 'zh-Hant';
      if (browserLang.startsWith('zh-CN') || browserLang.startsWith('zh')) return 'zh-Hans';
      if (browserLang.startsWith('ja')) return 'ja';
      if (browserLang.startsWith('fr')) return 'fr';
    }

    return DEFAULT;
  }

  /* ---------- PUBLIC: SWITCH LANGUAGE ---------- */
  async function switchLang(lang) {
    if (!SUPPORTED.includes(lang)) return;
    if (lang === 'zh-Hans') ensureSCFont();

    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);

    const data = await loadLang(lang);
    if (data) {
      apply(lang, data);
    }
  }

  /* ---------- PUBLIC: GET CURRENT LANG ---------- */
  function getLang() {
    return currentLang;
  }

  /* ---------- PUBLIC: INIT ---------- */
  async function init() {
    currentLang = detectLang();
    if (currentLang === 'zh-Hans') ensureSCFont();

    localStorage.setItem(STORAGE_KEY, currentLang);

    const data = await loadLang(currentLang);
    if (data) {
      apply(currentLang, data);
    }

    // Bind language switcher clicks
    document.querySelectorAll('.lang-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = btn.dataset.lang;
        if (lang) switchLang(lang);
      });
    });
  }

  return { init, switchLang, getLang, SUPPORTED };
})();

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  AH_i18n.init();
});
