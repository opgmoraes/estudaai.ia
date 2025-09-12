// Interactive JS: menu, reveal on scroll, simple carousels, FAQ toggles

// Mobile menu toggle
const hamb = document.querySelector('.hamb');
const mobileMenu = document.getElementById('mobileMenu');
hamb && hamb.addEventListener('click', ()=>{
  const open = mobileMenu.hidden;
  mobileMenu.hidden = !open;
  hamb.setAttribute('aria-expanded', String(open));
});

// IntersectionObserver for reveal animations
const io = new IntersectionObserver((entries, obs)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    }
  });
},{threshold:0.12});

document.querySelectorAll('.reveal').forEach(el=>{
  const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 80;
  el.style.transition = `opacity 520ms ease ${delay}ms, transform 520ms cubic-bezier(.2,.9,.2,1) ${delay}ms`;
  io.observe(el);
});

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const href = a.getAttribute('href');
    if(href.length>1){
      e.preventDefault();
      const el = document.querySelector(href);
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
    }
  });
});

// Simple plans carousel: left/right buttons and dots
(function(){
  const container = document.getElementById('planCarousel');
  const prev = document.getElementById('prevPlan');
  const next = document.getElementById('nextPlan');
  const dots = document.getElementById('planDots');
  if(!container) return;
  const cards = Array.from(container.querySelectorAll('.plan-card'));
  let idx = 0;
  function render(){
    container.style.transform = `translateX(${ -idx * (100)}%)`;
    // create dots
    dots.innerHTML = '';
    cards.forEach((c,i)=>{
      const d = document.createElement('button');
      d.className = 'dot';
      d.setAttribute('aria-label','Ir para plano '+(i+1));
      d.onclick = ()=>{ idx = i; update(); };
      if(i===idx) d.classList.add('active');
      dots.appendChild(d);
    });
  }
  function update(){ cards.forEach((c,i)=> c.style.display = i===idx || window.innerWidth>980 ? 'block' : 'none'); render(); }
  prev && prev.addEventListener('click', ()=>{ idx = Math.max(0, idx-1); update(); });
  next && next.addEventListener('click', ()=>{ idx = Math.min(cards.length-1, idx+1); update(); });
  window.addEventListener('resize', ()=> update());
  update();
})();

// Testimonials carousel (simple)
(function(){
  const wrap = document.getElementById('testCarousel');
  const prev = document.getElementById('prevTest');
  const next = document.getElementById('nextTest');
  if(!wrap) return;
  const items = Array.from(wrap.querySelectorAll('.testimonial'));
  let i = 0;
  function show(){ items.forEach((it,idx)=> it.style.display = (idx===i || window.innerWidth>980) ? 'block' : 'none'); }
  prev && prev.addEventListener('click', ()=>{ i = (i-1+items.length)%items.length; show(); });
  next && next.addEventListener('click', ()=>{ i = (i+1)%items.length; show(); });
  window.addEventListener('resize', show);
  show();
})();

// FAQ toggle with icon change
document.querySelectorAll('.faq-toggle').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const body = btn.nextElementSibling;
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    const icon = btn.querySelector('.icon');
    if(icon) icon.textContent = expanded ? '+' : '−';
    if(body.style.display==='block') body.style.display='none'; else body.style.display='block';
  });
});