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
    const bW = Math.max(...xs) - Math.min(...xs);
    const bH = Math.max(...ys) - Math.min(...ys);
    const scale = Math.min((width - 2 * PAD) / bW, (height - 2 * PAD) / bH);
    const ox = PAD - Math.min(...xs) * scale;
    const oy = PAD - Math.min(...ys) * scale;

    const px = x => +(ox + x * scale).toFixed(1);
    const py = y => +(oy + y * scale).toFixed(1);

    const poly = geo.points.map(([x, y]) => `${px(x)},${py(y)}`).join(' ');

    let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">
  <polygon points="${poly}" fill="#ede9fe" stroke="#7c3aed" stroke-width="2.5" stroke-linejoin="round"/>`;

    for (const dim of geo.dims) {
      svg += this._dimLine(dim, px, py);
    }

    svg += '\n</svg>';
    return svg;
  },

  // ── 도형별 기하 정보 ─────────────────────────────────────────
  _geometry(shape) {
    const { type } = shape;

    if (type === 'L') {
      // ㄱ자: 전체 W×H, 오른쪽 위 w×h 잘림
      const { W, H, w, h } = shape;
      return {
        points: [[0,0],[W-w,0],[W-w,h],[W,h],[W,H],[0,H]],
        dims: [
          { axis:'h', a:0,    b:W,   at: -10,  label:`${W}` },
          { axis:'v', a:0,    b:H,   at: -10,  label:`${H}` },
          { axis:'h', a:W-w,  b:W,   at: h+12, label:`${w}`, small:true },
          { axis:'v', a:0,    b:h,   at: W+10, label:`${h}`, small:true },
        ],
      };
    }

    if (type === 'stair') {
      // 계단: 아래 W1×H1 + 위 W2×H2
      const { W1, H1, W2, H2 } = shape;
      return {
        points: [[0,0],[W2,0],[W2,H2],[W1,H2],[W1,H1+H2],[0,H1+H2]],
        dims: [
          { axis:'h', a:0,  b:W2, at: -10,       label:`${W2}`, small:true },
          { axis:'h', a:0,  b:W1, at: H1+H2+12,  label:`${W1}`, below:true },
          { axis:'v', a:0,  b:H2, at: W2+10,      label:`${H2}`, small:true },
          { axis:'v', a:H2, b:H1+H2, at: W1+10,   label:`${H1}`, small:true },
        ],
      };
    }

    if (type === 'U') {
      // ㄷ자: 전체 W×H, 오른쪽 중앙 w×h 뚫림
      const { W, H, w, h } = shape;
      const gy = (H - h) / 2; // 뚫린 부분 시작 y
      return {
        points: [[0,0],[W,0],[W,gy],[W-w,gy],[W-w,gy+h],[W,gy+h],[W,H],[0,H]],
        dims: [
          { axis:'h', a:0,   b:W,   at: -10,    label:`${W}` },
          { axis:'v', a:0,   b:H,   at: -10,    label:`${H}` },
          { axis:'h', a:W-w, b:W,   at: H/2,    label:`${w}`, small:true, mid:true },
          { axis:'v', a:gy,  b:gy+h,at: W+10,   label:`${h}`, small:true },
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
          { axis:'h', a:0,  b:hw,    at: vy+hh+12, label:`${hw}`, below:true },
          { axis:'v', a:0,  b:vh,    at: vx-12,    label:`${vh}` },
          { axis:'h', a:vx, b:vx+vw, at: -10,      label:`${vw}`, small:true },
          { axis:'v', a:vy, b:vy+hh, at: hw+10,    label:`${hh}`, small:true },
        ],
      };
    }

    return { points: [], dims: [] };
  },

  // ── 특수 도형 SVG 렌더러 ─────────────────────────────────────
  _renderSpecial(shape, W, H) {
    const { type } = shape;
    const tc = '#4c1d95', lc = '#a78bfa';
    const vb = `viewBox="0 0 ${W} ${H}"`;
    const svgOpen = `<svg ${vb} xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">`;

    // ── 원에 내접하는 마름모 ─────────────────────────────────
    if (type === 'circle_rhombus') {
      const { r } = shape;
      const cx = W/2, cy = H/2;
      const sr = Math.min(W, H) * 0.38; // SVG 반지름
      const top=[cx,cy-sr], right=[cx+sr,cy], bot=[cx,cy+sr], left=[cx-sr,cy];
      const pts = `${top} ${right} ${bot} ${left}`.replace(/,/g,' ').replace(/ +/g,' ');
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

    // ── 가로 반 접기 ─────────────────────────────────────────
    if (type === 'paper_fold') {
      const { W: w, H: fh, origH: oh } = shape;
      const PAD = 36;
      const sc = Math.min((W-PAD*2)/w, (H-PAD*2)/(oh||fh*2));
      const ox = (W - w*sc)/2, oy = (H - (oh||fh*2)*sc)/2;
      const px = x => (ox+x*sc).toFixed(1), py = y => (oy+y*sc).toFixed(1);
      const foldY = oh ? oh/2 : fh;
      return `${svgOpen}
  <rect x="${px(0)}" y="${py(0)}" width="${(w*sc).toFixed(1)}" height="${((oh||fh*2)*sc).toFixed(1)}" fill="#fef3c7" stroke="#d97706" stroke-width="1.5" stroke-dasharray="5,3"/>
  <line x1="${px(0)}" y1="${py(foldY)}" x2="${px(w)}" y2="${py(foldY)}" stroke="#b45309" stroke-width="2" stroke-dasharray="6,3"/>
  <polygon points="${px(0)},${py(foldY)} ${px(w)},${py(foldY)} ${px(0)},${py(oh||fh*2)}" fill="#fde68a" stroke="#d97706" stroke-width="2"/>
  <text x="${(parseFloat(px(0))+parseFloat(px(w)))/2}" y="${parseFloat(py(oh||fh*2))+15}" text-anchor="middle" font-size="10" fill="#b45309" font-family="sans-serif" font-weight="bold">가로 ${w}cm</text>
  <text x="${parseFloat(px(0))-22}" y="${(parseFloat(py(foldY))+parseFloat(py(oh||fh*2)))/2}" text-anchor="middle" font-size="10" fill="#b45309" font-family="sans-serif" font-weight="bold">${fh}cm</text>
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
  _dimLine({ axis, a, b, at, label, small, below, mid }, px, py) {
    const fs  = small ? 9.5 : 11;
    const tc  = '#4c1d95';   // 텍스트 색
    const lc  = '#a78bfa';   // 선 색
    const sw  = 1;

    if (axis === 'h') {
      // 수평 치수선: a~b 구간, y=at
      const sx1 = px(a), sx2 = px(b), sy = py(at);
      const mx  = (sx1 + sx2) / 2;
      const textY = sy - 3;
      return `
  <line x1="${sx1}" y1="${sy}" x2="${sx2}" y2="${sy}" stroke="${lc}" stroke-width="${sw}" stroke-dasharray="4,2"/>
  <line x1="${sx1}" y1="${sy-4}" x2="${sx1}" y2="${sy+4}" stroke="${lc}" stroke-width="${sw}"/>
  <line x1="${sx2}" y1="${sy-4}" x2="${sx2}" y2="${sy+4}" stroke="${lc}" stroke-width="${sw}"/>
  <rect x="${mx-15}" y="${textY-fs}" width="30" height="${fs+4}" fill="white" opacity="0.85" rx="3"/>
  <text x="${mx}" y="${textY}" text-anchor="middle" font-size="${fs}" fill="${tc}" font-family="sans-serif" font-weight="bold">${label}</text>`;
    }

    if (axis === 'v') {
      // 수직 치수선: a~b 구간, x=at
      const sy1 = py(a), sy2 = py(b), sx = px(at);
      const my  = (sy1 + sy2) / 2;
      return `
  <line x1="${sx}" y1="${sy1}" x2="${sx}" y2="${sy2}" stroke="${lc}" stroke-width="${sw}" stroke-dasharray="4,2"/>
  <line x1="${sx-4}" y1="${sy1}" x2="${sx+4}" y2="${sy1}" stroke="${lc}" stroke-width="${sw}"/>
  <line x1="${sx-4}" y1="${sy2}" x2="${sx+4}" y2="${sy2}" stroke="${lc}" stroke-width="${sw}"/>
  <rect x="${sx-28}" y="${my-fs/2-2}" width="26" height="${fs+4}" fill="white" opacity="0.85" rx="3"/>
  <text x="${sx-4}" y="${my+fs/2-1}" text-anchor="end" font-size="${fs}" fill="${tc}" font-family="sans-serif" font-weight="bold">${label}</text>`;
    }

    return '';
  },
};

window.ShapeRenderer = ShapeRenderer;
if (typeof module !== 'undefined') module.exports = ShapeRenderer;
