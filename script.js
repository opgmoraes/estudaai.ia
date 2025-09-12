// Estuda AÍ - interactions (parallax, reveal, A/B CTA, sticky CTA, FAQ, testimonials)
(function(){
  'use strict';

  // Helper - safe querySelectorAll
  const qAll = (s) => Array.from(document.querySelectorAll(s));

  // Reveal on scroll
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});
  qAll('.reveal').forEach(el => io.observe(el));

  // Parallax (mousemove + scroll)
  const hero = document.querySelector('.hero');
  const mockup = document.getElementById('heroMockup');
  if(hero && mockup){
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      mockup.style.transform = `translate3d(${x * 10}px, ${y * 8}px, 0) rotate(${x * 1.8}deg)`;
    });
    window.addEventListener('scroll', () => {
      const offset = window.scrollY * 0.06;
      qAll('.parallax-bg').forEach(layer => layer.style.transform = `translateY(${offset}px)`);
    });
  }

  // Testimonials autoplay
  const testimonials = qAll('#testimonials .testimonial');
  if(testimonials.length){
    let tIdx = 0;
    function showTest(i){
      testimonials.forEach((t, idx) => t.style.display = idx === i ? 'block' : 'none');
    }
    showTest(0);
    setInterval(()=>{ tIdx = (tIdx + 1) % testimonials.length; showTest(tIdx); }, 4500);
  }

  // FAQ toggles (aria-expanded + aria-hidden)
  qAll('.faq-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.nextElementSibling;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      const ic = btn.querySelector('.icon');
      if(ic) ic.textContent = expanded ? '+' : '−';
      if(expanded) { body.style.display = 'none'; body.setAttribute('aria-hidden','true'); }
      else { body.style.display = 'block'; body.setAttribute('aria-hidden','false'); body.scrollIntoView({behavior:'smooth', block:'nearest'}); }
    });
  });

  // Mobile menu toggle
  const hamb = document.querySelector('.hamb');
  const mobileNav = document.getElementById('mobileNav');
  hamb && hamb.addEventListener('click', () => {
    const open = !mobileNav.hidden;
    mobileNav.hidden = open;
    hamb.setAttribute('aria-expanded', String(!open));
  });

  // Sticky CTA close
  const sticky = document.getElementById('stickyCta');
  const stickyClose = document.querySelector('.sticky-close');
  stickyClose && stickyClose.addEventListener('click', () => sticky.style.display = 'none');

  // A/B CTA variant assignment (localStorage)
  const VAR_KEY = 'estuda_ai_cta_variant_v2';
  function getVariant(){
    let v = localStorage.getItem(VAR_KEY);
    if(!v){
      v = Math.random() < 0.5 ? 'A' : 'B';
      localStorage.setItem(VAR_KEY, v);
    }
    return v;
  }
  const variant = getVariant();
  // Apply variant text (A = original, B = alternate)
  qAll('.cta-variant').forEach(el => {
    const orig = el.getAttribute('data-original-text') || el.textContent.trim();
    el.setAttribute('data-original-text', orig);
    el.setAttribute('data-cta-variant', variant);
    if(variant === 'B'){
      // alternate wording for primary checkout CTAs
      if(el.classList.contains('btn-primary') || el.classList.contains('btn-checkout') || el.classList.contains('sticky-btn')){
        el.textContent = 'Começar hoje mesmo';
      } else {
        // for other CTAs keep text but append subtle CTA hint
        el.textContent = orig;
      }
    } else {
      el.textContent = orig;
    }
  });
  window.ESTUDA_VARIANT = variant;
  // TODO: push to dataLayer if GTM is present: window.dataLayer = window.dataLayer || []; window.dataLayer.push({event:'cta_variant', variant});

  // Smooth scroll for anchor links
  qAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if(href.length > 1){
        e.preventDefault();
        const el = document.querySelector(href);
        if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  // Ensure hero image exists, if not show fallback color block
  const heroImg = document.getElementById('heroImg');
  if(heroImg){
    heroImg.addEventListener('error', () => {
      heroImg.style.display = 'none';
      const fallback = document.createElement('div');
      fallback.style.width = '100%';
      fallback.style.height = '320px';
      fallback.style.background = 'linear-gradient(180deg,#eef6ff,#fff7e6)';
      fallback.style.borderRadius = '14px';
      heroImg.parentNode.appendChild(fallback);
    });
  }
})();