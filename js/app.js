// app.js — SureClick
// GSAP + Lenis scroll logic

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

  // ─── Lenis Smooth Scroll ──────────────────────────────────────
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // ─── Loader ───────────────────────────────────────────────────
  const loader    = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderPct = document.getElementById('loader-percent');

  let pct = 0;
  const tick = setInterval(() => {
    pct += Math.random() * 18 + 4;
    if (pct >= 100) {
      pct = 100;
      clearInterval(tick);
      loaderBar.style.width = '100%';
      loaderPct.textContent = '100%';
      setTimeout(hideLoader, 350);
    } else {
      loaderBar.style.width = pct + '%';
      loaderPct.textContent = Math.floor(pct) + '%';
    }
  }, 70);

  function hideLoader() {
    gsap.to(loader, {
      opacity: 0,
      duration: 0.7,
      ease: 'power2.inOut',
      onComplete: () => {
        loader.style.display = 'none';
        introAnimation();
      }
    });
  }

  // ─── Intro Animation (runs after loader hides) ────────────────
  function introAnimation() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.to('.hero-label',     { opacity: 1, y: 0, duration: 0.4 })
      .to('#hero-typewriter', { opacity: 1, duration: 0.5 }, '+=0.1')
      .to('.hero-usp',        { opacity: 1, y: 0, duration: 0.5 }, '+=0.2')
      .to('.hero-ctas',       { y: 0, opacity: 1, duration: 0.7 }, '+=0.1')
      .call(() => {
        startTypewriter();
        // Fade CTAs out as hero scrolls away
        gsap.to('.hero-ctas', {
          opacity: 0,
          y: -20,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'center top',
            end: 'bottom top',
            scrub: true
          }
        });
      });
  }

  // Set initial states for hero content
  gsap.set('.hero-label',  { y: 10, opacity: 0 });
  gsap.set('.hero-usp',    { y: 10, opacity: 0 });
  gsap.set('.hero-ctas',   { y: 20, opacity: 0 });

  // ─── Typewriter Animation ─────────────────────────────────────
  const PHRASES = [
    {
      prefix: 'Your website should be generating ',
      services: [
        'leads on autopilot.',
        'consistent revenue.',
        'real business growth.'
      ]
    },
    {
      prefix: 'The brands winning online are ',
      services: [
        'investing in conversion-focused design.',
        'dominating with data-driven SEO.',
        'scaling revenue through precision PPC.'
      ]
    },
    {
      prefix: 'Stop losing customers to ',
      services: [
        'a website that doesn\'t convert.',
        'competitors with better SEO.',
        'poorly managed ad spend.'
      ]
    }
  ];

  const TWP = { TYPE: 38, DELETE: 20, PAUSE_AFTER: 1500, PAUSE_BETWEEN: 150, PAUSE_PREFIX: 340 };

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function typeInto(el, text) {
    for (const ch of text) { el.textContent += ch; await wait(TWP.TYPE); }
  }

  async function deleteFrom(el) {
    while (el.textContent.length) { el.textContent = el.textContent.slice(0, -1); await wait(TWP.DELETE); }
  }

  async function startTypewriter() {
    const prefixEl  = document.getElementById('tw-prefix');
    const serviceEl = document.getElementById('tw-service');
    while (true) {
      for (const phrase of PHRASES) {
        await typeInto(prefixEl, phrase.prefix);
        for (const svc of phrase.services) {
          await typeInto(serviceEl, svc);
          await wait(TWP.PAUSE_AFTER);
          await deleteFrom(serviceEl);
          await wait(TWP.PAUSE_BETWEEN);
        }
        await wait(TWP.PAUSE_PREFIX);
        await deleteFrom(prefixEl);
        await wait(TWP.PAUSE_PREFIX);
      }
    }
  }

  // ─── Contact Popup ────────────────────────────────────────────
  const popup    = document.getElementById('contact-popup');
  const backdrop = popup.querySelector('.contact-popup-backdrop');
  const closeBtn = popup.querySelector('.contact-popup-close');

  function openPopup()  { popup.classList.add('is-open'); }
  function closePopup() { popup.classList.remove('is-open'); }

  // All elements with js-open-popup trigger the modal
  document.querySelectorAll('.js-open-popup').forEach(el => {
    el.addEventListener('click', openPopup);
  });

  backdrop.addEventListener('click', closePopup);
  closeBtn.addEventListener('click', closePopup);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });

  // ─── Nav Hide / Show on Scroll ───────────────────────────────
  const nav = document.getElementById('site-nav');
  let lastScroll = 0;

  lenis.on('scroll', ({ scroll }) => {
    if (scroll > lastScroll && scroll > 120) {
      nav.classList.add('nav-hidden');
    } else {
      nav.classList.remove('nav-hidden');
    }
    lastScroll = scroll;
  });

  // ─── Ticker Marquee ───────────────────────────────────────────
  gsap.to('#ticker', {
    xPercent: -50,
    duration: 28,
    ease: 'none',
    repeat: -1
  });

  // ─── About Section Entrance ───────────────────────────────────
  gsap.fromTo('.about-inner',
    { y: 40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.about-section',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    }
  );

  gsap.fromTo('.about-pillar',
    { y: 20, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: '.about-pillars',
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    }
  );

  // ─── Stats Header ─────────────────────────────────────────────
  gsap.fromTo('.stats-header-wrap',
    { y: 30, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.stats-header-wrap',
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    }
  );

  // ─── Stats Counters ───────────────────────────────────────────
  document.querySelectorAll('.stat-num').forEach(el => {
    const target    = parseFloat(el.dataset.target);
    const suffix    = el.dataset.suffix || '';
    const isDecimal = target % 1 !== 0;

    const obj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 2.2,
          ease: 'power2.out',
          onUpdate: () => {
            const v = obj.val;
            el.textContent = (isDecimal ? v.toFixed(1) : Math.floor(v)) + suffix;
          }
        });
      }
    });
  });

  // ─── Stats Section Entrance ───────────────────────────────────
  gsap.fromTo('.stats-inner',
    { y: 30, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.stats-section',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    }
  );

  // ─── Service Row Entrance ─────────────────────────────────────
  document.querySelectorAll('.service-row').forEach(row => {
    const dir = row.dataset.dir === 'right' ? 60 : -60;

    gsap.fromTo(row,
      { x: dir, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: row,
          start: 'top 82%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // ─── Pricing Section Entrance ────────────────────────────────
  gsap.fromTo('.pricing-header',
    { y: 40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.pricing-section',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    }
  );

  gsap.fromTo('.pricing-card',
    { y: 40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: '.pricing-grid',
        start: 'top 82%',
        toggleActions: 'play none none none'
      }
    }
  );

  // ─── Additional Services Entrance ─────────────────────────────
  gsap.fromTo('.additional-item',
    { y: 30, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.15,
      scrollTrigger: {
        trigger: '.additional-services',
        start: 'top 82%',
        toggleActions: 'play none none none'
      }
    }
  );

  // ─── Section Headers ─────────────────────────────────────────
  gsap.utils.toArray('.services-header, .clients-header, .about-intro').forEach(el => {
    gsap.fromTo(el,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // Client logos use CSS infinite scroll animation — no JS needed

  // ─── CTA Section ─────────────────────────────────────────────
  const ctaTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.cta-section',
      start: 'top 72%',
      toggleActions: 'play none none none'
    }
  });

  gsap.set('.cta-heading',      { y: 50, opacity: 0 });
  gsap.set('.cta-sub',          { y: 30, opacity: 0 });
  gsap.set('.cta-section .btn', { y: 20, opacity: 0 });

  ctaTl
    .to('.cta-heading',      { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' })
    .to('.cta-sub',          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=0.5')
    .to('.cta-section .btn', { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.4');

  // ─── Footer Entrance ─────────────────────────────────────────
  gsap.fromTo('.site-footer',
    { yPercent: 8, opacity: 0 },
    {
      yPercent: 0,
      opacity: 1,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.site-footer',
        start: 'top 98%',
        toggleActions: 'play none none none'
      }
    }
  );

});
