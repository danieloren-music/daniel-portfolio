// Mobile menu
const burger = document.getElementById('burger'), menu = document.getElementById('menu');
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
menu.addEventListener('click', e => { if (e.target.tagName === 'A') menu.classList.remove('open'); });

// Particle background
const c = document.getElementById('particles'), ctx = c.getContext('2d');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let pts = [];
function resize() {
  c.width = innerWidth; c.height = innerHeight;
  const n = Math.min(90, Math.floor(innerWidth * innerHeight / 18000));
  pts = Array.from({length: n}, () => ({
    x: Math.random() * c.width, y: Math.random() * c.height,
    vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5
  }));
}
resize(); addEventListener('resize', resize);
function frame() {
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = 'rgba(56,189,248,.8)';
  for (const p of pts) {
    if (!reduce) { p.x += p.vx; p.y += p.vy; }
    if (p.x < 0 || p.x > c.width) p.vx *= -1;
    if (p.y < 0 || p.y > c.height) p.vy *= -1;
    ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, 6.283); ctx.fill();
  }
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
    if (d < 130) {
      ctx.strokeStyle = `rgba(139,92,246,${.35 * (1 - d / 130)})`;
      ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
    }
  }
  if (!reduce) requestAnimationFrame(frame);
}
frame();

// Contact form
const form = document.getElementById('contact-form'), status = document.getElementById('status');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = form.querySelector('button'); btn.disabled = true;
  status.className = ''; status.textContent = 'Sending…';
  try {
    const r = await fetch('/contact', {method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(Object.fromEntries(new FormData(form)))});
    const j = await r.json();
    status.className = j.ok ? 'ok' : 'err';
    status.textContent = j.ok ? 'Thanks! Your message was sent.' : j.error;
    if (j.ok) form.reset();
  } catch { status.className = 'err'; status.textContent = 'Network error. Please try again.'; }
  btn.disabled = false;
});
