const root = document.documentElement;

// Mobile menu
const burger = document.getElementById('burger'), menu = document.getElementById('menu');
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
menu.addEventListener('click', e => { if (e.target.tagName === 'A') menu.classList.remove('open'); });

// Dark / light theme (default: dark, choice is remembered)
let rgb = [];
function readColors() {
  const s = getComputedStyle(root);
  rgb = [s.getPropertyValue('--p1').trim(), s.getPropertyValue('--p2').trim()];
}
document.getElementById('theme').addEventListener('click', () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
  readColors();
});
readColors();

// Interactive particle network
const c = document.getElementById('particles'), ctx = c.getContext('2d');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mouse = {x: -9999, y: -9999}, LINK = 130, MOUSE_R = 170;
let pts = [];
function resize() {
  c.width = innerWidth; c.height = innerHeight;
  const n = Math.min(110, Math.floor(innerWidth * innerHeight / 15000));
  pts = Array.from({length: n}, () => ({
    x: Math.random() * c.width, y: Math.random() * c.height,
    vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5,
    r: Math.random() < .12 ? 3.2 : 1.8
  }));
}
resize(); addEventListener('resize', resize);
addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
addEventListener('touchmove', e => { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }, {passive: true});
document.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });

function frame() {
  ctx.clearRect(0, 0, c.width, c.height);
  for (const p of pts) {
    if (!reduce) {
      p.x += p.vx; p.y += p.vy;
      const dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.hypot(dx, dy);
      if (d < MOUSE_R && d > 40) { p.x += dx * .006; p.y += dy * .006; } // gently drawn to the cursor
    }
    if (p.x < 0 || p.x > c.width) p.vx *= -1;
    if (p.y < 0 || p.y > c.height) p.vy *= -1;
    ctx.fillStyle = `rgba(${rgb[0]},.85)`;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    const dm = Math.hypot(mouse.x - p.x, mouse.y - p.y);
    if (dm < MOUSE_R) {                                   // link to the cursor
      ctx.strokeStyle = `rgba(${rgb[0]},${.7 * (1 - dm / MOUSE_R)})`;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
    }
  }
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
    if (d < LINK) {
      ctx.strokeStyle = `rgba(${rgb[1]},${.4 * (1 - d / LINK)})`;
      ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
    }
  }
  requestAnimationFrame(frame);
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
