// Crew faces v2: semi-realistic SVG portraits with shading, real eyes and lips.
// window.crewFaces.draw(look, mood, label) -> <svg class="hub-face mood-...">
// look: {skin, hair, shirt, accent, eyes, hairStyle: short|curly|ponytail|buzz|swoop, extras: [headset, glasses, beard, hardhat, bandana, goggles]}
// mood: happy | focused | worried | sleepy. Classes kept for animation: .head .eyes .pupil .brows .mouth .mouth-open .think .dot
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  let uid = 0;
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, String(v));
    if (parent) parent.append(e);
    return e;
  };
  const hex = h => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ''); const n = m ? parseInt(m[1], 16) : 0x888888; return [n >> 16, (n >> 8) & 255, n & 255]; };
  const shade = (h, amt) => { const c = hex(h).map(v => Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)); return '#' + c.map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join(''); };
  const mix = (a, b, t) => { const x = hex(a), y = hex(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); };

  const MOUTH = {
    happy: 'M41 67.5 Q50 74.5 59 67.5',
    focused: 'M43.5 69 Q50 70.6 56.5 69',
    worried: 'M43 70.5 Q46.5 67.6 50 69.4 Q53.5 71 57 68.4',
    sleepy: 'M46 69.5 Q50 70.8 54 69.5'
  };
  const BROWS = {
    happy: ['M32.5 43.6 Q38 40 44.6 42.4', 'M55.4 42.4 Q62 40 67.5 43.6'],
    focused: ['M32.5 43 Q38.5 41.6 44.6 44', 'M55.4 44 Q61.5 41.6 67.5 43'],
    worried: ['M32.5 45 Q38.5 42 44.6 40.6', 'M55.4 40.6 Q61.5 42 67.5 45'],
    sleepy: ['M32.5 45 Q38.5 44.2 44.6 45', 'M55.4 45 Q61.5 44.2 67.5 45']
  };
  const HAIR = {
    ponytail: 'M23.5 49 Q22 19 50 18.5 Q78 19 76.5 49 Q74 33 57 30.5 Q41 29.5 31 38 Q26 42.5 23.5 49 Z',
    buzz: 'M24.5 46 Q23.5 21 50 20.5 Q76.5 21 75.5 46 Q72 31 50 29.5 Q28 31 24.5 46 Z',
    swoop: 'M23 50 Q19.5 18 53 17.5 Q81 19 77 47 Q66 25.5 45 33.5 Q35 37.5 29.5 44 Q25.5 47 23 50 Z',
    short: 'M23 49.5 Q21 19.5 50 18.5 Q79 19.5 77 49.5 Q72 32 52 31 Q36 30.5 29 39.5 Q25 44 23 49.5 Z'
  };
  const HEAD = 'M23.5 50 Q23.5 22.5 50 21.5 Q76.5 22.5 76.5 50 Q76.5 69 65 78.5 Q58 84.5 50 84.5 Q42 84.5 35 78.5 Q23.5 69 23.5 50 Z';

  const draw = (look = {}, mood = 'focused', label = '') => {
    const L = {skin: '#C99167', hair: '#2A1B12', shirt: '#1F8A8A', accent: '#EB3831', eyes: '#5A3B22', hairStyle: 'short', extras: [], ...look};
    const ex = new Set(L.extras || []);
    if (L.style === 'headset') ex.add('headset');
    const m = MOUTH[mood] ? mood : 'focused';
    const id = 'cf' + (++uid);
    const skinD = shade(L.skin, -0.22), skinL = shade(L.skin, 0.12), lip = mix(shade(L.skin, -0.35), '#B5524A', 0.45);
    const hairD = shade(L.hair, -0.35), hairL = shade(L.hair, 0.28);
    const svg = el('svg', {viewBox: '0 0 100 100', class: 'hub-face mood-' + m, role: 'img', 'aria-label': label});
    const defs = el('defs', {}, svg);
    const rg = (gid, stops, attrs) => { const g = el('radialGradient', {id: gid, ...attrs}, defs); stops.forEach(([o, c, op]) => el('stop', {offset: o, 'stop-color': c, 'stop-opacity': op ?? 1}, g)); };
    const lg = (gid, stops, attrs) => { const g = el('linearGradient', {id: gid, ...attrs}, defs); stops.forEach(([o, c, op]) => el('stop', {offset: o, 'stop-color': c, 'stop-opacity': op ?? 1}, g)); };
    rg(id + 'sk', [[0, skinL], [0.62, L.skin], [1, skinD]], {cx: '46%', cy: '40%', r: '62%'});
    lg(id + 'hr', [[0, hairL], [0.55, L.hair], [1, hairD]], {x1: 0, y1: 0, x2: 0.3, y2: 1});
    lg(id + 'sh', [[0, shade(L.shirt, 0.12)], [1, shade(L.shirt, -0.3)]], {x1: 0, y1: 0, x2: 0, y2: 1});
    lg(id + 'nk', [[0, shade(L.skin, -0.32)], [0.45, L.skin], [1, L.skin]], {x1: 0, y1: 0, x2: 0, y2: 1});
    rg(id + 'bg', [[0, '#2A3442'], [1, '#161C25']], {cx: '50%', cy: '35%', r: '70%'});
    rg(id + 'ir', [[0, shade(L.eyes, 0.35)], [0.7, L.eyes], [1, shade(L.eyes, -0.45)]], {cx: '45%', cy: '40%', r: '60%'});

    const back = el('circle', {cx: 50, cy: 50, r: 49, class: 'face-bg', fill: 'url(#' + id + 'bg)'}, svg);
    back.style.stroke = 'var(--face-line, #2E3A4B)';
    // shoulders + shirt
    el('path', {d: 'M14 96 Q16 80 38 77.5 L62 77.5 Q84 80 86 96 Q70 100 50 100 Q30 100 14 96 Z', fill: 'url(#' + id + 'sh)'}, svg);
    el('path', {d: 'M40 78 Q50 88 60 78', fill: 'none', stroke: shade(L.shirt, -0.45), 'stroke-width': 1.6, opacity: 0.7}, svg);
    const head = el('g', {class: 'head'}, svg);
    // hair behind
    if (L.hairStyle === 'curly') {
      el('circle', {cx: 50, cy: 42, r: 31.5, fill: 'url(#' + id + 'hr)'}, head);
      for (const [x, y] of [[21.5, 49], [78.5, 49], [23.5, 63], [76.5, 63]]) el('circle', {cx: x, cy: y, r: 8, fill: 'url(#' + id + 'hr)'}, head);
    }
    if (L.hairStyle === 'ponytail') el('ellipse', {cx: 80, cy: 47, rx: 8.5, ry: 16, fill: 'url(#' + id + 'hr)', transform: 'rotate(16 80 47)'}, head);
    // neck
    el('path', {d: 'M42 72 L42 80 Q50 84 58 80 L58 72 Z', fill: 'url(#' + id + 'nk)'}, head);
    // ears
    for (const [cx, flip] of [[23.6, 1], [76.4, -1]]) {
      el('ellipse', {cx, cy: 54, rx: 4.6, ry: 6.6, fill: L.skin}, head);
      el('path', {d: `M${cx + flip * 1.6} 50.5 Q${cx - flip * 1.8} 54 ${cx + flip * 1.4} 58.5`, fill: 'none', stroke: skinD, 'stroke-width': 1.2, 'stroke-linecap': 'round', opacity: 0.8}, head);
    }
    // face
    el('path', {d: HEAD, fill: 'url(#' + id + 'sk)'}, head);
    // jaw + cheek shading
    el('path', {d: 'M27 62 Q33 78 50 82 Q67 78 73 62 Q69 79 50 84 Q31 79 27 62 Z', fill: skinD, opacity: 0.35}, head);
    el('ellipse', {cx: 34.5, cy: 62.5, rx: 4.8, ry: 3, fill: '#E06E5C', opacity: 0.16}, head);
    el('ellipse', {cx: 65.5, cy: 62.5, rx: 4.8, ry: 3, fill: '#E06E5C', opacity: 0.16}, head);
    // hair front with forehead shadow
    if (L.hairStyle === 'curly') {
      el('path', {d: 'M27 41 Q50 31 73 41 Q50 36 27 41 Z', fill: hairD, opacity: 0.25}, head);
      for (const [x, y] of [[30, 30], [40, 24], [50, 22], [60, 24], [70, 30], [35, 27], [65, 27]]) {
        el('circle', {cx: x, cy: y, r: 7.6, fill: 'url(#' + id + 'hr)'}, head);
        el('path', {d: `M${x - 3.5} ${y - 1} Q${x} ${y - 4.5} ${x + 3.5} ${y - 1}`, fill: 'none', stroke: hairL, 'stroke-width': 0.9, opacity: 0.45}, head);
      }
    } else {
      const d = HAIR[L.hairStyle] || HAIR.short;
      el('path', {d, fill: hairD, opacity: 0.3, transform: 'translate(0 1.6)'}, head);
      el('path', {d, fill: 'url(#' + id + 'hr)', opacity: L.hairStyle === 'buzz' ? 0.92 : 1}, head);
      for (const s of ['M33 27 Q44 21 58 23', 'M38 30 Q50 24 64 27', 'M30 34 Q40 28 50 29']) el('path', {d: s, fill: 'none', stroke: hairL, 'stroke-width': 0.8, opacity: L.hairStyle === 'buzz' ? 0.15 : 0.35, 'stroke-linecap': 'round'}, head);
    }
    // eyes
    const eyes = el('g', {class: 'eyes'}, head);
    for (const cx of [39, 61]) {
      if (m === 'sleepy') {
        el('path', {d: `M${cx - 5} 52.6 Q${cx} 55.6 ${cx + 5} 52.6`, fill: 'none', stroke: shade(L.skin, -0.55), 'stroke-width': 1.5, 'stroke-linecap': 'round'}, eyes);
        el('path', {d: `M${cx - 5} 52.6 Q${cx} 50 ${cx + 5} 52.6`, fill: skinD, opacity: 0.35}, eyes);
        continue;
      }
      el('path', {d: `M${cx - 5.4} 52.4 Q${cx} 47.2 ${cx + 5.4} 52.4 Q${cx} 56.4 ${cx - 5.4} 52.4 Z`, fill: '#F7F3EE'}, eyes);
      const g = el('g', {class: 'pupil'}, eyes);
      el('circle', {cx, cy: 52.2, r: 2.9, fill: 'url(#' + id + 'ir)'}, g);
      el('circle', {cx, cy: 52.2, r: 1.35, fill: '#120D0A'}, g);
      el('circle', {cx: cx + 1, cy: 51.1, r: 0.75, fill: '#FFFFFF'}, g);
      el('path', {d: `M${cx - 5.6} 52.3 Q${cx} 46.6 ${cx + 5.6} 52.3`, fill: 'none', stroke: '#1A1210', 'stroke-width': 1.25, 'stroke-linecap': 'round'}, eyes);
      el('path', {d: `M${cx - 4.6} 48.6 Q${cx} 45.6 ${cx + 4.6} 48.6`, fill: 'none', stroke: skinD, 'stroke-width': 0.7, opacity: 0.6}, eyes);
      el('path', {d: `M${cx - 3.6} 56.2 Q${cx} 57.4 ${cx + 3.6} 56.2`, fill: 'none', stroke: skinD, 'stroke-width': 0.6, opacity: 0.45}, eyes);
    }
    if (ex.has('glasses')) {
      const gl = el('g', {fill: '#BFE3FF', 'fill-opacity': 0.12, stroke: '#1B1B1F', 'stroke-width': 1.6}, head);
      el('rect', {x: 31.2, y: 46.2, width: 15.6, height: 12.4, rx: 4.6}, gl);
      el('rect', {x: 53.2, y: 46.2, width: 15.6, height: 12.4, rx: 4.6}, gl);
      el('path', {d: 'M46.8 51 Q50 49.4 53.2 51', fill: 'none'}, gl);
      el('path', {d: 'M33 48 L37 47.4', stroke: '#FFFFFF', 'stroke-width': 0.8, opacity: 0.6, fill: 'none'}, head);
    }
    const brows = el('g', {class: 'brows'}, head);
    for (const d of BROWS[m]) el('path', {d, fill: 'none', stroke: hairD, 'stroke-width': 2.3, 'stroke-linecap': 'round'}, brows);
    // nose
    el('path', {d: 'M50.6 50 Q49.2 57 47.4 61.2 Q49.6 62.8 52.4 61.6', fill: 'none', stroke: skinD, 'stroke-width': 1.1, 'stroke-linecap': 'round', opacity: 0.85}, head);
    el('ellipse', {cx: 47.8, cy: 62, rx: 1.1, ry: 0.7, fill: shade(L.skin, -0.5), opacity: 0.6}, head);
    el('ellipse', {cx: 52.4, cy: 62, rx: 1.1, ry: 0.7, fill: shade(L.skin, -0.5), opacity: 0.6}, head);
    el('ellipse', {cx: 51.4, cy: 57.6, rx: 1.2, ry: 2.2, fill: '#FFFFFF', opacity: 0.12}, head);
    if (ex.has('beard')) {
      el('path', {d: 'M25 55 Q26 83 50 87 Q74 83 75 55 Q72 76 50 78.5 Q28 76 25 55 Z', fill: 'url(#' + id + 'hr)'}, head);
      el('path', {d: 'M41 65.6 Q50 61.6 59 65.6 Q50 67.6 41 65.6 Z', fill: L.hair}, head);
    }
    // lips
    const lipLine = ex.has('beard') ? '#E8B9A6' : shade(lip, -0.25);
    if (!ex.has('beard') && (m === 'happy' || m === 'focused')) el('path', {d: m === 'happy' ? 'M43 69.6 Q50 73.8 57 69.6 Q50 75.8 43 69.6 Z' : 'M45 70 Q50 72.6 55 70 Q50 73.4 45 70 Z', fill: lip, opacity: 0.55}, head);
    el('path', {class: 'mouth', d: MOUTH[m], fill: 'none', stroke: lipLine, 'stroke-width': 1.9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'}, head);
    const mo = el('g', {class: 'mouth-open'}, head);
    el('ellipse', {cx: 50, cy: 69.4, rx: 5.6, ry: 4, fill: '#3A1512'}, mo);
    el('path', {d: 'M45.6 67.4 Q50 66.2 54.4 67.4 L54 68.4 Q50 67.6 46 68.4 Z', fill: '#F4EEE8'}, mo);
    el('ellipse', {cx: 50, cy: 71.6, rx: 3, ry: 1.3, fill: '#B24A4A', opacity: 0.8}, mo);
    el('path', {d: 'M44.6 69.4 Q50 64.8 55.4 69.4', fill: 'none', stroke: lip, 'stroke-width': 1.4}, mo);
    if (ex.has('bandana')) {
      el('path', {d: 'M23 37 Q50 25 77 37 L77 43 Q50 31 23 43 Z', fill: L.accent}, head);
      el('path', {d: 'M23 40 Q50 28 77 40', fill: 'none', stroke: shade(L.accent, -0.3), 'stroke-width': 0.8, 'stroke-dasharray': '1.5 2'}, head);
      el('path', {d: 'M77 38 L86 33 L84 44 Z', fill: shade(L.accent, -0.15)}, head);
    }
    if (ex.has('goggles')) {
      el('path', {d: 'M23 34 Q50 26 77 34', fill: 'none', stroke: '#2B2F36', 'stroke-width': 3.5}, head);
      for (const gx of [40, 60]) { el('circle', {cx: gx, cy: 31, r: 6.5, fill: '#8FE3F0', stroke: '#2B2F36', 'stroke-width': 2.4}, head); el('path', {d: `M${gx - 3.6} 29.4 Q${gx - 1.6} 27 ${gx + 1} 27.6`, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 1.1, opacity: 0.8}, head); }
    }
    if (ex.has('hardhat')) {
      lg(id + 'hh', [[0, '#FFD06A'], [1, '#D98E14']], {x1: 0, y1: 0, x2: 0, y2: 1});
      el('path', {d: 'M22 40 Q23 10.5 50 10.5 Q77 10.5 78 40 Z', fill: 'url(#' + id + 'hh)'}, head);
      el('rect', {x: 15, y: 37, width: 70, height: 6.5, rx: 3.2, fill: '#D98E14'}, head);
      el('path', {d: 'M50 11.5 L50 37', stroke: '#E8A12A', 'stroke-width': 3}, head);
      el('path', {d: 'M30 22 Q36 15 44 13.6', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 1.4, opacity: 0.45, 'stroke-linecap': 'round'}, head);
    }
    if (ex.has('headset')) {
      el('path', {d: 'M20 52 Q18 13.5 50 13.5 Q82 13.5 80 52', fill: 'none', stroke: '#2B2F36', 'stroke-width': 3.4, 'stroke-linecap': 'round'}, head);
      el('rect', {x: 15, y: 46, width: 9, height: 16, rx: 4, fill: '#2B2F36'}, head);
      el('rect', {x: 76, y: 46, width: 9, height: 16, rx: 4, fill: '#2B2F36'}, head);
      el('path', {d: 'M19 61 Q22 73 37 72', fill: 'none', stroke: '#2B2F36', 'stroke-width': 2.2, 'stroke-linecap': 'round'}, head);
      el('circle', {cx: 38.5, cy: 72, r: 2.6, fill: L.accent}, head);
    }
    const dots = el('g', {class: 'think'}, svg);
    [72, 80, 88].forEach((x, i) => el('circle', {cx: x, cy: 16, r: 2.6, class: 'dot dot' + i}, dots));
    if (m === 'sleepy') { const z = el('text', {x: 74, y: 24, class: 'hub-z'}, svg); z.textContent = 'z'; }
    return svg;
  };

  const seat = (label = '') => {
    const svg = el('svg', {viewBox: '0 0 100 100', class: 'hub-face is-seat', role: 'img', 'aria-label': label});
    const back = el('circle', {cx: 50, cy: 50, r: 49}, svg);
    back.style.fill = 'var(--face-bg, #1E2734)';
    back.style.stroke = 'var(--face-line, #2E3A4B)';
    back.style.strokeDasharray = '4 4';
    const g = el('g', {}, svg);
    g.style.fill = 'var(--face-line, #2E3A4B)';
    el('circle', {cx: 50, cy: 45, r: 17}, g);
    el('path', {d: 'M22 90 Q24 68 50 67 Q76 68 78 90 Z'}, g);
    return svg;
  };
  window.crewFaces = {draw, seat};
})();
