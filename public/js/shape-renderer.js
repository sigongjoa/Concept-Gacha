// ============================================================
// ShapeRenderer — 복잡한 도형 SVG 렌더러
// shape 객체 → SVG 문자열 반환
// ============================================================

const ShapeRenderer = {

  // ── 공개 API ────────────────────────────────────────────────
  render(shape, { width = 280, height = 210 } = {}) {
    if (!shape || !shape.type) return '';
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
