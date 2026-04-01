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
  // Nav is always visible via CSS — only hero content is animated in
  function introAnimation() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.to('.hero-label', { y: 0, opacity: 1, duration: 0.6 })
      .from('.word', { yPercent: 110, duration: 1.0, stagger: 0.1 }, '-=0.3')
      .to('.hero-sub', { y: 0, opacity: 1, duration: 0.7 }, '-=0.5')
      .to('.hero-ctas', { y: 0, opacity: 1, duration: 0.7 }, '-=0.55')
      .to('.scroll-indicator', { opacity: 1, duration: 0.5 }, '-=0.3');
  }

  // Set initial state for hero content only
  gsap.set('.hero-label', { y: 20, opacity: 0 });
  gsap.set('.hero-sub', { y: 24, opacity: 0 });
  gsap.set('.hero-ctas', { y: 20, opacity: 0 });
  gsap.set('.scroll-indicator', { opacity: 0 });

  // ─── Nav Hide / Show on Scroll ───────────────────────────────
  const nav = document.getElementById('site-nav');
  let lastScroll = 0;

  lenis.on('scroll', ({ scroll }) => {
    // Hide on scroll down, show on scroll up
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

  // ─── Stats Counters ───────────────────────────────────────────
  document.querySelectorAll('.stat-num').forEach(el => {
    const target   = parseFloat(el.dataset.target);
    const suffix   = el.dataset.suffix || '';
    const prefix   = el.previousElementSibling?.classList.contains('stat-prefix')
      ? el.previousElementSibling.textContent : '';
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

  // ─── Section Headers ─────────────────────────────────────────
  gsap.utils.toArray('.services-header, .clients-header').forEach(el => {
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

  // Client logos use CSS infinite scroll animation — no JS needed

  // ─── CTA Section ─────────────────────────────────────────────
  const ctaTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.cta-section',
      start: 'top 72%',
      toggleActions: 'play none none none'
    }
  });

  ctaTl
    .to('.cta-heading', { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' })
    .to('.cta-sub',     { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=0.5')
    .from('.cta-section .btn', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4');

  gsap.set('.cta-heading', { y: 50, opacity: 0 });
  gsap.set('.cta-sub',     { y: 30, opacity: 0 });

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
