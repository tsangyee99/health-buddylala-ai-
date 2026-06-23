/* ============================================
   Alessandro's Health — Main JavaScript
   Clean, minimal interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- LANGUAGE SWITCHER DROPDOWN ----------
  const langSwitcher = document.getElementById('langSwitcher');
  const langToggle = document.getElementById('langToggle');

  if (langToggle && langSwitcher) {
    // Use both click and touchend for mobile compatibility
    const toggleDropdown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      langSwitcher.classList.toggle('open');
    };
    
    langToggle.addEventListener('click', toggleDropdown);
    langToggle.addEventListener('touchend', toggleDropdown);

    // Close dropdown when clicking outside
    const closeDropdown = (e) => {
      if (!langSwitcher.contains(e.target)) {
        langSwitcher.classList.remove('open');
      }
    };
    document.addEventListener('click', closeDropdown);
    document.addEventListener('touchstart', closeDropdown);

    // Close dropdown after selecting a language
    langSwitcher.querySelectorAll('.lang-option').forEach(btn => {
      const selectLang = () => {
        langSwitcher.classList.remove('open');
        // Update the current language label
        const langLabels = { en: 'EN', ja: 'JA', fr: 'FR', 'zh-Hant': '繁', 'zh-Hans': '简' };
        const langCurrent = document.getElementById('langCurrent');
        if (langCurrent && btn.dataset.lang) {
          langCurrent.textContent = langLabels[btn.dataset.lang] || btn.dataset.lang.toUpperCase();
        }
      };
      btn.addEventListener('click', selectLang);
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        selectLang();
      });
    });
  }

  // ---------- HEADER SCROLL ----------
  const header = document.getElementById('siteHeader');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 30);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ---------- MOBILE MENU ----------
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ---------- SMOOTH SCROLL ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerHeight = header.offsetHeight + 16;
        const y = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  // ---------- REVEAL ON SCROLL ----------
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  // Mark elements for reveal
  const revealSelectors = [
    '.section-intro',
    '.pillar-card',
    '.focus-card',
    '.signal-item',
    '.product-detail-card',
    '.product-table-wrap',
    '.aging-card',
    '.culture-block-inner',
    '.philosophy-close-inner',
    '.contact-actions'
  ];

  revealSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${Math.min(i * 60, 300)}ms`;
      revealObserver.observe(el);
    });
  });

  // ---------- COUNTER ANIMATION FOR AGING NUMBERS ----------
  const agingCards = document.querySelectorAll('.aging-card');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  agingCards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition = `opacity 0.5s ease ${i * 40}ms, transform 0.5s ease ${i * 40}ms`;
    counterObserver.observe(card);
  });

});
