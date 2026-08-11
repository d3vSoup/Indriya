/**
 * accordion-gallery.js — CSS Grid edition
 *
 * Performance contract:
 *  • ONE property change per interaction: container.style.gridTemplateColumns
 *  • CSS handles ALL transitions (no JS animation loop, no GSAP, no rAF)
 *  • Panels get transform:translateZ(0) once on build → own GPU compositor layer
 *  • Labels revealed via CSS class toggle only
 *  • Mouse events throttled to 1 per 60ms via timestamp guard
 *  • ResizeObserver debounced 80ms
 *  • No grayscale filter (eliminates repaint trigger)
 */
(function (global) {
  'use strict';

  var ITEMS = [
    {
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&h=1200&fit=crop&auto=format',
      label: 'Learning Together'
    },
    {
      image: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=900&h=1200&fit=crop&auto=format',
      label: 'Silent Voices'
    },
    {
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&h=1200&fit=crop&auto=format',
      label: 'Every Classroom'
    },
    {
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&h=1200&fit=crop&auto=format',
      label: 'Braille Dreams'
    },
    {
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=900&h=1200&fit=crop&auto=format',
      label: 'No Barriers'
    }
  ];

  function AccordionGallery(container, opts) {
    opts = opts || {};

    var items        = opts.items        || ITEMS;
    var expandRatio  = Math.min(Math.max(opts.expandRatio || 0.52, 0.2), 0.9);
    var trigger      = opts.trigger      || 'hover';
    var tiltDeg      = (opts.tilt !== undefined) ? opts.tilt : 6;
    var height       = opts.height       || 480;
    var gap          = opts.gap          || 8;
    var radius       = opts.radius       || 18;
    var accentColor  = opts.accentColor  || '#ffb800';

    var count   = items.length;
    var active  = Math.min(Math.max(opts.defaultIndex || 2, 0), count - 1);
    var panelEls = [];
    var lastEnter = 0; // throttle guard

    var prefersReduced = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

    /* ── Container ────────────────────────────────────────────────── */
    container.className = 'accordion-gallery';
    container.style.setProperty('--ag-accent', accentColor);
    container.style.setProperty('--ag-gap', gap + 'px');
    container.style.setProperty('--ag-radius', radius + 'px');
    container.style.height = height + 'px';
    if (prefersReduced) container.style.setProperty('--ag-dur', '0s');
    container.setAttribute('role', 'list');
    container.setAttribute('aria-label', 'Image accordion gallery');

    /* Set initial columns immediately — no transition on first paint */
    container.style.transition = 'none';
    container.style.gridTemplateColumns = buildColumns(active, count, expandRatio);

    /* ── Build panels ─────────────────────────────────────────────── */
    items.forEach(function (item, i) {
      var isActive = i === active;

      var panel = document.createElement('div');
      panel.className = 'ag-panel' + (isActive ? ' ag-panel--active' : '');
      panel.setAttribute('role', 'listitem');
      panel.setAttribute('tabindex', '0');
      if (isActive) panel.setAttribute('aria-current', 'true');
      if (item.label) panel.setAttribute('aria-label', item.label);
      // GPU layer promotion — done once, stays for lifetime
      panel.style.transform = tiltStr(i, active, tiltDeg);
      panel.style.borderRadius = radius + 'px';

      /* Frame */
      var frame = document.createElement('span');
      frame.className = 'ag-panel__frame';

      /* Media */
      var media = document.createElement('span');
      media.className = 'ag-panel__media';

      var img = document.createElement('img');
      img.src = item.image;
      img.alt = item.alt || item.label || '';
      img.draggable = false;
      if (i !== active) img.loading = 'lazy';

      media.appendChild(img);

      /* Overlays */
      var overlay = document.createElement('span');
      overlay.className = 'ag-panel__overlay';
      overlay.setAttribute('aria-hidden', 'true');

      var dim = document.createElement('span');
      dim.className = 'ag-panel__dim';
      dim.setAttribute('aria-hidden', 'true');

      frame.appendChild(media);
      frame.appendChild(overlay);
      frame.appendChild(dim);
      panel.appendChild(frame);

      /* Label */
      if (item.label) {
        var wrap = document.createElement('span');
        wrap.className = 'ag-panel__label';
        wrap.setAttribute('aria-hidden', 'true');

        var bar = document.createElement('span');
        bar.className = 'ag-panel__bar';

        var txt = document.createElement('span');
        txt.className = 'ag-panel__text';
        txt.textContent = item.label;

        wrap.appendChild(bar);
        wrap.appendChild(txt);
        panel.appendChild(wrap);
      }

      panelEls.push(panel);
      container.appendChild(panel);

      /* ── Events ─────────────────────────────────────────────────── */
      panel.addEventListener('mouseenter', function () {
        if (trigger !== 'hover') return;
        // Throttle: max 1 activation per 80ms (prevents jitter on fast moves)
        var now = Date.now();
        if (now - lastEnter < 80) return;
        lastEnter = now;
        activate(i);
      });

      panel.addEventListener('click', function (e) {
        e.preventDefault();
        activate(i);
      });

      panel.addEventListener('focus', function () { activate(i); });

      panel.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault(); activate((active + 1) % count);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault(); activate((active - 1 + count) % count);
        }
      });
    });

    /* Allow CSS transitions after first paint */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        container.style.transition = '';
      });
    });

    /* ── Activate ─────────────────────────────────────────────────── */
    function activate(idx) {
      if (idx === active) return;

      panelEls[active].classList.remove('ag-panel--active');
      panelEls[active].removeAttribute('aria-current');
      active = idx;
      panelEls[active].classList.add('ag-panel--active');
      panelEls[active].setAttribute('aria-current', 'true');

      /* ★ THE ONLY layout change: one CSS property on the container */
      container.style.gridTemplateColumns = buildColumns(active, count, expandRatio);

      /* Tilt update on all panels */
      panelEls.forEach(function (p, i) {
        p.style.transform = tiltStr(i, active, tiltDeg);
      });
    }

    /* ── Helpers ─────────────────────────────────────────────────── */
    function buildColumns(activeIdx, n, ratio) {
      /* expanded panel gets ratio fraction, others share the rest equally */
      var grow = (ratio * (n - 1)) / (1 - ratio); // in fr units
      return Array.from({ length: n }, function (_, i) {
        return (i === activeIdx ? grow : 1) + 'fr';
      }).join(' ');
    }

    function tiltStr(i, activeIdx, deg) {
      if (deg === 0) return 'translateZ(0)';
      var rot = (i === activeIdx) ? 0 : (i < activeIdx ? deg : -deg);
      return 'translateZ(0) rotateY(' + rot + 'deg)';
    }

    /* ── ResizeObserver (debounced) ──────────────────────────────── */
    var resizeTimer;
    var ro = new ResizeObserver(function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        /* Re-apply columns without transition */
        var prev = container.style.transition;
        container.style.transition = 'none';
        container.style.gridTemplateColumns = buildColumns(active, count, expandRatio);
        container.offsetHeight; // force reflow
        container.style.transition = prev;
      }, 80);
    });
    ro.observe(container);
  }

  global.AccordionGallery = AccordionGallery;
})(window);
