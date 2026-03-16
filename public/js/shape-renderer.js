// ============================================================
// ShapeRenderer — 복잡한 도형 SVG 렌더러
// shape 객체 → SVG 문자열 반환
// ============================================================

const ShapeRenderer = {

  // ── 공개 API ────────────────────────────────────────────────
  render(shape, { width = 280, height = 210 } = {}) {
    if (!shape || !shape.type) return '';

    // 특수 도형 (원·종이접기·색칠) — 폴리곤 방식 우회
    const special = this._renderSpecial(shape, width, height);
    if (special) return special;

    const PAD = 42;
    const geo = this._geometry(shape);
    if (!geo.points.length) return '';

    // 바운딩 박스 & 스케일
    const xs = geo.points.map(p => p[0]);
    const ys = geo.points.map(p => p[1]);
    const xMin = Math.min(...xs), yMin = Math.min(...ys);
    const xMax = Math.max(...xs), yMax = Math.max(...ys);
    const bW = xMax - xMin, bH = yMax - yMin;
    const scale = Math.min((width - 2 * PAD) / bW, (height - 2 * PAD) / bH);
    const ox = PAD - xMin * scale;
    const oy = PAD - yMin * scale;

    const px = x => +(ox + x * scale).toFixed(1);
    const py = y => +(oy + y * scale).toFixed(1);

    // 바운딩 박스 SVG 좌표
    const bx0 = px(xMin), by0 = py(yMin);
    const bx1 = px(xMax), by1 = py(yMax);
    const bbW = (bW * scale).toFixed(1), bbH = (bH * scale).toFixed(1);

    // 치수선 위치 해석: refY/refX + offPx → SVG 픽셀 좌표 (scale 무관)
    const resolveAt = d => {
      const off = d.offPx || 0;
      if (d.axis === 'h') {
        const ref = d.refY;
        const base = ref === 'top' ? +by0 : ref === 'bottom' ? +by1 : py(ref);
        return { ...d, atSvg: base + off };
      } else {
        const ref = d.refX;
        const base = ref === 'left' ? +bx0 : ref === 'right' ? +bx1 : px(ref);
        return { ...d, atSvg: base + off };
      }
    };

    const poly = geo.points.map(([x, y]) => `${px(x)},${py(y)}`).join(' ');

    let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">
  <!-- 바운딩 박스 점선 -->
  <rect x="${bx0}" y="${by0}" width="${bbW}" height="${bbH}"
        fill="none" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="6,3" rx="2"/>
  <!-- 도형 본체 -->
  <polygon points="${poly}" fill="#ccfbf1" stroke="#0d9488" stroke-width="2.5" stroke-linejoin="round"/>`;

    for (const dim of geo.dims) {
      svg += this._dimLine(resolveAt(dim), px, py, '#134e4a', '#2dd4bf');
    }

    svg += '\n</svg>';
    return svg;
  },

  // ── 도형별 기하 정보 ─────────────────────────────────────────
  // dim 형식: { axis:'h'|'v', a, b, refY|refX:'top'|'bottom'|'left'|'right'|number, offPx, label, small }
  //   axis:'h' → 수평 치수선, a~b는 x 범위, refY+offPx로 y 위치 결정
  //   axis:'v' → 수직 치수선, a~b는 y 범위, refX+offPx로 x 위치 결정
  //   refY/refX: 'top'=bx0, 'bottom'=bx1, 'left'=by0, 'right'=by1, number=shape좌표
  //   offPx: SVG 픽셀 단위 오프셋 (양수=아래/오른쪽, 음수=위/왼쪽)
  _geometry(shape) {
    const { type } = shape;

    if (type === 'L') {
      // ㄱ자: 전체 W×H, 오른쪽 위 w×h 잘림
      const { W, H, w, h } = shape;
      return {
        points: [[0,0],[W-w,0],[W-w,h],[W,h],[W,H],[0,H]],
        dims: [
          { axis:'h', a:0,   b:W,   refY:'top',    offPx:-15, label:`${W}` },
          { axis:'v', a:0,   b:H,   refX:'left',   offPx:-15, label:`${H}` },
          { axis:'h', a:W-w, b:W,   refY:h,        offPx:12,  label:`${w}`, small:true },
          { axis:'v', a:0,   b:h,   refX:'right',  offPx:12,  label:`${h}`, small:true },
        ],
      };
    }

    if (type === 'stair') {
      // 계단: 위 W2×H2 + 아래 W1×H1
      const { W1, H1, W2, H2 } = shape;
      return {
        points: [[0,0],[W2,0],[W2,H2],[W1,H2],[W1,H1+H2],[0,H1+H2]],
        dims: [
          { axis:'h', a:0,  b:W2, refY:'top',    offPx:-15, label:`${W2}`, small:true },
          { axis:'h', a:0,  b:W1, refY:'bottom', offPx:15,  label:`${W1}` },
          { axis:'v', a:0,  b:H2, refX:W2,       offPx:12,  label:`${H2}`, small:true },
          { axis:'v', a:H2, b:H1+H2, refX:W1,   offPx:12,  label:`${H1}`, small:true },
        ],
      };
    }

    if (type === 'U') {
      // ㄷ자: 전체 W×H, 오른쪽 중앙 w×h 뚫림
      const { W, H, w, h } = shape;
      const gy = (H - h) / 2;
      return {
        points: [[0,0],[W,0],[W,gy],[W-w,gy],[W-w,gy+h],[W,gy+h],[W,H],[0,H]],
        dims: [
          { axis:'h', a:0,   b:W,     refY:'top',   offPx:-15, label:`${W}` },
          { axis:'v', a:0,   b:H,     refX:'left',  offPx:-15, label:`${H}` },
          { axis:'h', a:W-w, b:W,     refY:H/2,     offPx:0,   label:`${w}`, small:true },
          { axis:'v', a:gy,  b:gy+h,  refX:'right', offPx:12,  label:`${h}`, small:true },
        ],
      };
    }

    if (type === 'cross') {
      // 십자: 수평 hw×hh + 수직 vw×vh
      const { hw, hh, vw, vh } = shape;
      const vx = Math.max(0, (hw - vw) / 2);
      const vy = Math.max(0, (vh - hh) / 2);
      return {
        points: [
          [vx, 0],  [vx+vw, 0],
          [vx+vw, vy], [hw, vy],
          [hw, vy+hh], [vx+vw, vy+hh],
          [vx+vw, vh], [vx, vh],
          [vx, vy+hh], [0, vy+hh],
          [0, vy],  [vx, vy],
        ],
        dims: [
          { axis:'h', a:0,  b:hw,    refY:'bottom', offPx:15,  label:`${hw}` },
          { axis:'v', a:0,  b:vh,    refX:'left',   offPx:-15, label:`${vh}` },
          { axis:'h', a:vx, b:vx+vw, refY:'top',    offPx:-12, label:`${vw}`, small:true },
          { axis:'v', a:vy, b:vy+hh, refX:'right',  offPx:12,  label:`${hh}`, small:true },
        ],
      };
    }

    return { points: [], dims: [] };
  },

  // ── 특수 도형 SVG 렌더러 ─────────────────────────────────────
  _renderSpecial(shape, W, H) {
    const { type } = shape;
    const vb = `viewBox="0 0 ${W} ${H}"`;
    const svgOpen = `<svg ${vb} xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">`;

    // ── ㄱ자 + 삼각형 빈 공간 ────────────────────────────────
    if (type === 'L_tri') {
      const { W: w, H: h, cw, ch, bT, hT } = shape;
      const PAD = 40;
      const sc = Math.min((W - PAD*2) / w, (H - PAD*2) / h);
      const ox = (W - w*sc)/2, oy = (H - h*sc)/2;
      const px = x => +(ox + x*sc).toFixed(1);
      const py = y => +(oy + y*sc).toFixed(1);
      const bx0 = px(0), by0 = py(0), bx1 = px(w), by1 = py(h);

      const lPoly = `${bx0},${by0} ${px(w-cw)},${by0} ${px(w-cw)},${py(ch)} ${bx1},${py(ch)} ${bx1},${by1} ${bx0},${by1}`;
      const triPoly = `${bx0},${by1} ${px(bT)},${by1} ${bx0},${py(h-hT)}`;

      const hLbl = (x, y, t, col='#134e4a') =>
        `<text x="${x}" y="${y}" text-anchor="middle" font-size="10" fill="${col}" font-family="sans-serif" font-weight="bold">${t}</text>`;
      const vLbl = (cx, cy, t, col='#134e4a') =>
        `<text x="${cx}" y="${cy}" text-anchor="middle" font-size="10" fill="${col}" font-family="sans-serif" font-weight="bold" transform="rotate(-90,${cx},${cy})">${t}</text>`;

      return `<svg ${vb} xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">
  <rect x="${bx0}" y="${by0}" width="${(w*sc).toFixed(1)}" height="${(h*sc).toFixed(1)}"
        fill="none" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="6,3" rx="2"/>
  <polygon points="${lPoly}" fill="#ccfbf1" stroke="#0d9488" stroke-width="2.5" stroke-linejoin="round"/>
  <polygon points="${triPoly}" fill="white" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,3"/>
  <text x="${+(bx0*0.5 + px(bT*0.4)).toFixed(1)}" y="${+((py(h-hT*0.3)+by1)/2).toFixed(1)}"
        font-size="9" fill="#ef4444" font-family="sans-serif" text-anchor="middle">빈공간</text>
  <!-- 총 가로 -->
  <line x1="${bx0}" y1="${by0-10}" x2="${bx1}" y2="${by0-10}" stroke="#2dd4bf" stroke-width="1" stroke-dasharray="4,2"/>
  <line x1="${bx0}" y1="${+by0-6}" x2="${bx0}" y2="${+by0-14}" stroke="#2dd4bf" stroke-width="1"/>
  <line x1="${bx1}" y1="${+by0-6}" x2="${bx1}" y2="${+by0-14}" stroke="#2dd4bf" stroke-width="1"/>
  ${hLbl((+bx0 + +bx1)/2, +by0-13, `${w}cm`)}
  <!-- 총 세로 -->
  <line x1="${+bx0-10}" y1="${by0}" x2="${+bx0-10}" y2="${by1}" stroke="#2dd4bf" stroke-width="1" stroke-dasharray="4,2"/>
  <line x1="${+bx0-6}" y1="${by0}" x2="${+bx0-14}" y2="${by0}" stroke="#2dd4bf" stroke-width="1"/>
  <line x1="${+bx0-6}" y1="${by1}" x2="${+bx0-14}" y2="${by1}" stroke="#2dd4bf" stroke-width="1"/>
  ${vLbl(+bx0-18, (+by0 + +by1)/2, `${h}cm`)}
  <!-- 잘린 cw, ch -->
  ${hLbl((+px(w-cw) + +bx1)/2, +py(ch)+13, `${cw}cm`, '#94a3b8')}
  ${vLbl(+bx1+14, (+by0 + +py(ch))/2, `${ch}cm`, '#94a3b8')}
  <!-- 삼각형 bT -->
  <line x1="${bx0}" y1="${+by1+10}" x2="${px(bT)}" y2="${+by1+10}" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,2"/>
  ${hLbl((+bx0 + +px(bT))/2, +by1+14, `${bT}cm`, '#ef4444')}
  <!-- 삼각형 hT (안쪽 왼쪽, 빈공간 안) -->
  ${vLbl(+bx0+10, (+py(h-hT) + +by1)/2, `${hT}cm`, '#ef4444')}
</svg>`;
    }

    // ── 원에 내접하는 마름모 ─────────────────────────────────
    if (type === 'circle_rhombus') {
      const { r } = shape;
      const cx = W/2, cy = H/2;
      const sr = Math.min(W, H) * 0.38;
      const lbl = (x,y,t,col='#be185d') => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="10.5" fill="${col}" font-family="sans-serif" font-weight="bold">${t}</text>`;
      return `${svgOpen}
  <circle cx="${cx}" cy="${cy}" r="${sr}" fill="#fce7f3" stroke="#ec4899" stroke-width="2"/>
  <polygon points="${cx},${cy-sr} ${cx+sr},${cy} ${cx},${cy+sr} ${cx-sr},${cy}" fill="#fbcfe8" fill-opacity="0.6" stroke="#be185d" stroke-width="2"/>
  <line x1="${cx-sr}" y1="${cy}" x2="${cx+sr}" y2="${cy}" stroke="#9d174d" stroke-width="1.5" stroke-dasharray="5,3"/>
  <line x1="${cx}" y1="${cy-sr}" x2="${cx}" y2="${cy+sr}" stroke="#9d174d" stroke-width="1.5" stroke-dasharray="5,3"/>
  ${lbl(cx+(sr/2)+2, cy-6, `지름=${2*r}cm`)}
  ${lbl(cx+6, cy-(sr/2)+4, `지름=${2*r}cm`, '#9d174d')}
  ${lbl(cx, cy+sr+14, `반지름 r=${r}cm`, '#be185d')}
</svg>`;
    }

    // ── 직사각형 대각선 접기 ─────────────────────────────────
    if (type === 'paper_fold_diag') {
      const { W: w, H: h } = shape;
      const PAD = 36;
      const sc = Math.min((W-PAD*2)/w, (H-PAD*2)/h);
      const ox = (W - w*sc)/2, oy = (H - h*sc)/2;
      const px = x => (ox+x*sc).toFixed(1), py = y => (oy+y*sc).toFixed(1);
      const lbl = (x,y,t,col='#b45309') => `<text x="${x}" y="${y}" text-anchor="middle" font-size="10" fill="${col}" font-family="sans-serif" font-weight="bold">${t}</text>`;
      return `${svgOpen}
  <polygon points="${px(0)},${py(0)} ${px(w)},${py(0)} ${px(0)},${py(h)}" fill="#fde68a" stroke="#d97706" stroke-width="2"/>
  <polygon points="${px(w)},${py(0)} ${px(w)},${py(h)} ${px(0)},${py(h)}" fill="#fef3c7" fill-opacity="0.5" stroke="#d97706" stroke-width="1.5" stroke-dasharray="5,3"/>
  <line x1="${px(0)}" y1="${py(0)}" x2="${px(w)}" y2="${py(h)}" stroke="#b45309" stroke-width="2.5"/>
  ${lbl((parseFloat(px(0))+parseFloat(px(w)))/2, parseFloat(py(h))+15, `가로 ${w}cm`)}
  ${lbl(parseFloat(px(0))-18, (parseFloat(py(0))+parseFloat(py(h)))/2, `${h}cm`)}
  <text x="${(parseFloat(px(0))+parseFloat(px(w))/2)/2+10}" y="${(parseFloat(py(0))+parseFloat(py(h)))/2-5}" font-size="10" fill="#b45309" font-family="sans-serif">색칠 삼각형</text>
</svg>`;
    }

    // ── 가로 반 접기 → 접힌 종이(W×foldH)에 대각선 절단 표시 ─
    if (type === 'paper_fold') {
      const { W: w, H: fh, origH: oh } = shape;
      const PAD = 36;
      // 접힌 종이(w×fh)만 표시 — 원본 전체 대신 접힌 후 크기 기준 스케일
      const sc = Math.min((W-PAD*2)/w, (H-PAD*2)/fh);
      const rw = w*sc, rh = fh*sc;
      const ox = (W-rw)/2, oy = (H-rh)/2;
      const px = x => (ox+x*sc).toFixed(1), py = y => (oy+y*sc).toFixed(1);
      const lx = parseFloat(px(0)), ly = parseFloat(py(0));
      const rx = parseFloat(px(w)), ry = parseFloat(py(fh));
      const mx = (lx+rx)/2;
      return `${svgOpen}
  <!-- 접힌 종이 전체 윤곽 (점선) -->
  <rect x="${lx}" y="${ly}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}"
        fill="#fef3c7" stroke="#d97706" stroke-width="1.5" stroke-dasharray="5,3"/>
  <!-- 색칠된 삼각형: 아래쪽 삼각형 (밑변=W, 높이=foldH) -->
  <polygon points="${lx},${ly} ${rx},${ry} ${lx},${ry}"
           fill="#fde68a" stroke="#d97706" stroke-width="2"/>
  <!-- 대각선 절단선 -->
  <line x1="${lx}" y1="${ly}" x2="${rx}" y2="${ry}"
        stroke="#b45309" stroke-width="2.5"/>
  <!-- 원래 세로 라벨 (접기 전) -->
  ${oh ? `<text x="${rx+8}" y="${ly+12}" font-size="9" fill="#92400e" font-family="sans-serif">(원래 ${oh}cm)</text>` : ''}
  <!-- 치수: 가로 W, 세로 foldH -->
  <text x="${mx}" y="${ry+16}" text-anchor="middle" font-size="10" fill="#b45309" font-family="sans-serif" font-weight="bold">가로 ${w}cm</text>
  <text x="${lx-22}" y="${(ly+ry)/2+4}" text-anchor="middle" font-size="10" fill="#b45309" font-family="sans-serif" font-weight="bold">${fh}cm</text>
  <!-- "접은 후" 안내 텍스트 -->
  <text x="${mx}" y="${ly-8}" text-anchor="middle" font-size="9" fill="#92400e" font-family="sans-serif">← 반으로 접은 종이 →</text>
</svg>`;
    }

    // ── 테두리 색칠 (직사각형 안에 직사각형) ────────────────
    if (type === 'shaded_border') {
      const { W: w, H: h, iW, iH } = shape;
      const PAD = 30;
      const sc = Math.min((W-PAD*2)/w, (H-PAD*2)/h);
      const ox = (W-w*sc)/2, oy = (H-h*sc)/2;
      const px = x => (ox+x*sc).toFixed(1), py = y => (oy+y*sc).toFixed(1);
      const bx = (w-iW)/2, by = (h-iH)/2;
      return `${svgOpen}
  <rect x="${px(0)}" y="${py(0)}" width="${(w*sc).toFixed(1)}" height="${(h*sc).toFixed(1)}" fill="#fed7aa" stroke="#ea580c" stroke-width="2"/>
  <rect x="${px(bx)}" y="${py(by)}" width="${(iW*sc).toFixed(1)}" height="${(iH*sc).toFixed(1)}" fill="white" stroke="#ea580c" stroke-width="1.5"/>
  <text x="${W/2}" y="${parseFloat(py(0))-8}" text-anchor="middle" font-size="10" fill="#c2410c" font-family="sans-serif" font-weight="bold">${w}cm</text>
  <text x="${parseFloat(px(0))-10}" y="${H/2}" text-anchor="middle" font-size="10" fill="#c2410c" font-family="sans-serif" font-weight="bold" transform="rotate(-90,${parseFloat(px(0))-10},${H/2})">${h}cm</text>
</svg>`;
    }

    // ── 직사각형 − 삼각형 색칠 ──────────────────────────────
    if (type === 'shaded_rect_tri') {
      const { W: w, H: h, bT } = shape;
      const PAD = 36;
      const sc = Math.min((W-PAD*2)/w, (H-PAD*2)/h);
      const ox = (W-w*sc)/2, oy = (H-h*sc)/2;
      const px = x => (ox+x*sc).toFixed(1), py = y => (oy+y*sc).toFixed(1);
      return `${svgOpen}
  <rect x="${px(0)}" y="${py(0)}" width="${(w*sc).toFixed(1)}" height="${(h*sc).toFixed(1)}" fill="#fed7aa" stroke="#ea580c" stroke-width="2"/>
  <polygon points="${px(0)},${py(h)} ${px(bT)},${py(0)} ${px(0)},${py(0)}" fill="white" stroke="#ea580c" stroke-width="1.5"/>
  <text x="${W/2}" y="${parseFloat(py(h))+15}" text-anchor="middle" font-size="10" fill="#c2410c" font-family="sans-serif" font-weight="bold">${w}cm</text>
  <text x="${parseFloat(px(0))-12}" y="${H/2}" text-anchor="middle" font-size="10" fill="#c2410c" font-family="sans-serif" font-weight="bold" transform="rotate(-90,${parseFloat(px(0))-12},${H/2})">${h}cm</text>
</svg>`;
    }

    return null; // 특수 처리 없음 → 기존 폴리곤 방식 사용
  },

  // ── 치수선 SVG 생성 ──────────────────────────────────────────
  // atSvg: render()에서 이미 SVG 픽셀로 변환된 위치값
  _dimLine({ axis, a, b, atSvg, label, small }, px, py, tc = '#4c1d95', lc = '#a78bfa') {
    const fs  = small ? 9.5 : 11;
    const sw  = 1;

    if (axis === 'h') {
      // 수평 치수선: a~b는 x(shape coords), atSvg는 y(SVG pixels)
      const sx1 = px(a), sx2 = px(b), sy = atSvg;
      const mx  = (sx1 + sx2) / 2;
      return `
  <line x1="${sx1}" y1="${sy}" x2="${sx2}" y2="${sy}" stroke="${lc}" stroke-width="${sw}" stroke-dasharray="4,2"/>
  <line x1="${sx1}" y1="${+sy-4}" x2="${sx1}" y2="${+sy+4}" stroke="${lc}" stroke-width="${sw}"/>
  <line x1="${sx2}" y1="${+sy-4}" x2="${sx2}" y2="${+sy+4}" stroke="${lc}" stroke-width="${sw}"/>
  <rect x="${mx-15}" y="${+sy-fs-2}" width="30" height="${fs+4}" fill="white" opacity="0.85" rx="3"/>
  <text x="${mx}" y="${+sy-1}" text-anchor="middle" font-size="${fs}" fill="${tc}" font-family="sans-serif" font-weight="bold">${label}</text>`;
    }

    if (axis === 'v') {
      // 수직 치수선: a~b는 y(shape coords), atSvg는 x(SVG pixels)
      const sy1 = py(a), sy2 = py(b), sx = atSvg;
      const my  = (sy1 + sy2) / 2;
      return `
  <line x1="${sx}" y1="${sy1}" x2="${sx}" y2="${sy2}" stroke="${lc}" stroke-width="${sw}" stroke-dasharray="4,2"/>
  <line x1="${+sx-4}" y1="${sy1}" x2="${+sx+4}" y2="${sy1}" stroke="${lc}" stroke-width="${sw}"/>
  <line x1="${+sx-4}" y1="${sy2}" x2="${+sx+4}" y2="${sy2}" stroke="${lc}" stroke-width="${sw}"/>
  <rect x="${+sx-28}" y="${my-fs/2-2}" width="26" height="${fs+4}" fill="white" opacity="0.85" rx="3"/>
  <text x="${+sx-4}" y="${+my+fs/2-1}" text-anchor="end" font-size="${fs}" fill="${tc}" font-family="sans-serif" font-weight="bold">${label}</text>`;
    }

    return '';
  },
};

window.ShapeRenderer = ShapeRenderer;
if (typeof module !== 'undefined') module.exports = ShapeRenderer;
