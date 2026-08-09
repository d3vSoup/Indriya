/**
 * Indriya — Animated Ribbon-Field Gradient Background
 * Stays permanently fixed (like a wallpaper) while all page
 * content scrolls on top of it.
 *
 * Adapted from the "gg" gradient spec on 21st.dev/community/gradients
 * Palette: Inclusion Craft amber/warm-white system
 * Spec: angle=38, wave=14, softness=24, grain=42
 *       speed=1.00, amt=0.00, dir=1
 *       wave clock: 20.75 → 20.75 + ph*1.2 (no snap at t=0)
 */

(function () {
  'use strict';

  /* ── Colour stops (Indriya amber palette) ────────────────────────
     White → Cream → Bright amber → Deep amber → Dark brown
  ─────────────────────────────────────────────────────────────────────── */
  const STOPS = [
    { p:  0, r: 255, g: 253, b: 245 },   // #fffdf5  bright warm white
    { p: 18, r: 255, g: 249, b: 225 },   // #fff9e1  cream
    { p: 57, r: 255, g: 184, b:   0 },   // #ffb800  primary-container amber ★
    { p: 60, r: 222, g: 135, b:   0 },   // #de8700  mid amber
    { p: 80, r: 148, g:  84, b:   0 },   // #945400  deep amber
    { p:100, r:  55, g:  18, b:   0 },   // #371200  very dark brown
  ];

  /* ── Spec constants ───────────────────────────────────────────────────── */
  const ANGLE        = 38;
  const WAVE         = 14;
  const GRAIN        = 42;
  const SPEED        = 1.00;
  const AMT          = 0.00;    // no angle sway
  const DIR          = 1;
  const WAVE_CLK0    = 20.75;
  const WAVE_CLK_SPD = 1.2;
  const TWO_PI       = 2 * Math.PI;
  const RW           = 560;     // render resolution (stretched to fill viewport)
  const RH           = 360;

  /* ── Sample gradient ──────────────────────────────────────────────────── */
  function sample(t) {
    const p   = Math.max(0, Math.min(100, t * 100));
    const len = STOPS.length;
    for (let i = 0; i < len - 1; i++) {
      const a = STOPS[i], b = STOPS[i + 1];
      if (p <= b.p) {
        const span = b.p - a.p;
        let f = span === 0 ? 1 : (p - a.p) / span;
        f = Math.max(0, Math.min(1, f));
        f = f * f * (3 - 2 * f); // smoothstep → emulates softness=24
        return [
          (a.r + (b.r - a.r) * f) | 0,
          (a.g + (b.g - a.g) * f) | 0,
          (a.b + (b.b - a.b) * f) | 0,
        ];
      }
    }
    const last = STOPS[len - 1];
    return [last.r, last.g, last.b];
  }

  /* ── Inject global CSS ────────────────────────────────────────────────
     Forces html/body to be transparent and makes every Tailwind
     bg-surface-* class semi-transparent so the canvas shows through,
     even on inner scroll containers and section backgrounds.
  ──────────────────────────────────────────────────────────────────────── */
  const globalStyle = document.createElement('style');
  globalStyle.id = 'bs-gradient-style';
  globalStyle.textContent = `
    /* ── Root transparency ─────────────────────────── */
    html, body {
      background-color: transparent !important;
      background-image: none !important;
    }

    /* ── All content sits above the canvas ─────────── */
    body > * {
      position: relative;
      z-index: 1;
    }

    /* ── Make Tailwind surface classes translucent ──── */
    .bg-surface                 { background-color: rgba(252, 249, 242, 0.78) !important; }
    .bg-surface-bright          { background-color: rgba(252, 249, 242, 0.78) !important; }
    .bg-surface-container       { background-color: rgba(241, 238, 231, 0.80) !important; }
    .bg-surface-container-low   { background-color: rgba(246, 243, 236, 0.75) !important; }
    .bg-surface-container-high  { background-color: rgba(235, 232, 225, 0.85) !important; }
    .bg-surface-container-highest { background-color: rgba(229, 226, 219, 0.90) !important; }
    .bg-\\[\\#FFFBF2\\]           { background-color: rgba(255, 251, 242, 0.78) !important; }
    .bg-\\[\\#FFFBF2\\]           { background-color: rgba(255, 251, 242, 0.78) !important; }

    /* ── Header / footer glass effect ──────────────── */
    header {
      background-color: rgba(252, 249, 242, 0.82) !important;
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
      border-bottom: 2px solid rgba(28, 28, 24, 0.15) !important;
    }
    footer {
      background-color: rgba(229, 226, 219, 0.80) !important;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    /* ── Card / panel backdrop blur ─────────────────── */
    .paper-shadow,
    .paper-shadow-sm {
      backdrop-filter: blur(6px) saturate(150%);
      -webkit-backdrop-filter: blur(6px) saturate(150%);
    }

    /* ── Section backgrounds ────────────────────────── */
    section {
      background-color: transparent !important;
    }
  `;
  document.head.appendChild(globalStyle);

  /* ── Create permanent fixed canvas ───────────────────────────────────── */
  const canvas = document.createElement('canvas');
  canvas.id    = 'bs-gradient-canvas';
  Object.assign(canvas.style, {
    position      : 'fixed',
    top           : '0',
    left          : '0',
    width         : '100vw',
    height        : '100vh',
    zIndex        : '0',        // above transparent html/body, below z-index:1 content
    display       : 'block',
    pointerEvents : 'none',
  });
  // Insert as the very first child of <body>
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');

  /* ── Off-screen pixel buffer ─────────────────────────────────────────── */
  const offCanvas    = document.createElement('canvas');
  offCanvas.width    = RW;
  offCanvas.height   = RH;
  const offCtx       = offCanvas.getContext('2d');
  const imgBuf       = offCtx.createImageData(RW, RH);
  const pxBuf        = imgBuf.data;

  /* ── Static grain tile ───────────────────────────────────────────────── */
  const GW = 256, GH = 256;
  const grainCanvas    = document.createElement('canvas');
  grainCanvas.width    = GW;
  grainCanvas.height   = GH;
  const grainCtx       = grainCanvas.getContext('2d');
  (function buildGrain() {
    const gd = grainCtx.createImageData(GW, GH);
    const d  = gd.data;
    let s    = 174074637; // fixed seed → same texture every load
    function xorshift() {
      s ^= s << 13; s ^= s >> 17; s ^= s << 5;
      return (s >>> 0) / 4294967296;
    }
    for (let i = 0; i < d.length; i += 4) {
      const v = (xorshift() * 255) | 0;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    grainCtx.putImageData(gd, 0, 0);
  })();

  /* ── rAF animation loop ──────────────────────────────────────────────── */
  let t0 = null;

  function tick(ts) {
    if (!t0) t0 = ts;
    const elapsed  = (ts - t0) / 1000;         // seconds — NOT rounded

    /* Animate params — no Math.round, modulations are 0 at ph=0 */
    const ph       = elapsed * SPEED;
    const spin     = ph * DIR;
    // amt=0 → angle stays exactly ANGLE (sway term contributes 0)
    const angleDeg = ANGLE + Math.sin(spin * 0.6) * 28 * AMT;
    const angleRad = angleDeg * (Math.PI / 180);
    const cosA     = Math.cos(angleRad);
    const sinA     = Math.sin(angleRad);
    // Wave clock advances: 20.75 + ph*1.2
    const clock    = WAVE_CLK0 + ph * WAVE_CLK_SPD;
    const waveAmt  = (WAVE / 100) * 0.35;

    /* Render pixel buffer */
    const diag  = Math.sqrt(RW * RW + RH * RH);
    const halfW = RW * 0.5;
    const halfH = RH * 0.5;
    let idx = 0;

    for (let y = 0; y < RH; y++) {
      const ny = (y - halfH) / diag;
      for (let x = 0; x < RW; x++) {
        const nx     =  (x - halfW) / diag;
        const along  =  nx * cosA + ny * sinA;
        const cross  = -nx * sinA + ny * cosA;
        // (wave/100)*0.35 * sin(cross * 2.4 * 2π + clock)
        const offset = waveAmt * Math.sin(cross * 2.4 * TWO_PI + clock);
        const col    = sample(along + offset + 0.5);
        pxBuf[idx]     = col[0];
        pxBuf[idx + 1] = col[1];
        pxBuf[idx + 2] = col[2];
        pxBuf[idx + 3] = 255;
        idx += 4;
      }
    }
    offCtx.putImageData(imgBuf, 0, 0);

    /* Resize canvas to viewport */
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (canvas.width !== vw || canvas.height !== vh) {
      canvas.width  = vw;
      canvas.height = vh;
    }

    /* Stretch low-res buffer to fill */
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';
    ctx.drawImage(offCanvas, 0, 0, vw, vh);

    /* Grain overlay */
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = (GRAIN / 100) * 0.38;
    for (let gx = 0; gx < vw; gx += GW) {
      for (let gy = 0; gy < vh; gy += GH) {
        ctx.drawImage(grainCanvas, gx, gy);
      }
    }
    ctx.restore();

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
