// fx RangeCalendar Creator Plugin
// Design tokens from fx2 Figma design system

const C = {
  white:       { r: 1,     g: 1,     b: 1     }, // #ffffff
  textPrimary: { r: 0.173, g: 0.173, b: 0.173 }, // #2c2c2c
  textQuinary: { r: 0.612, g: 0.612, b: 0.612 }, // #9c9c9c
  green500:    { r: 0.082, g: 0.722, b: 0.263 }, // #14b843
  green200:    { r: 0.792, g: 0.988, b: 0.792 }, // #cafcca
  green800:    { r: 0,     g: 0.439, b: 0.192 }, // #007031
};

function solid(color) {
  return [{ type: 'SOLID', color }];
}

async function main() {
  // Load fonts (fallback to Inter if Pretendard Variable unavailable)
  let fontFamily = 'Pretendard Variable';
  try {
    await figma.loadFontAsync({ family: fontFamily, style: 'Regular' });
    await figma.loadFontAsync({ family: fontFamily, style: 'Medium' });
  } catch (e) {
    fontFamily = 'Inter';
    await figma.loadFontAsync({ family: fontFamily, style: 'Regular' });
    await figma.loadFontAsync({ family: fontFamily, style: 'Medium' });
  }

  function makeText(chars, opts = {}) {
    const t = figma.createText();
    t.fontName = { family: fontFamily, style: opts.weight || 'Regular' };
    t.fontSize = opts.size || 14;
    if (opts.lh) t.lineHeight = { value: opts.lh, unit: 'PIXELS' };
    t.fills = solid(opts.color || C.textPrimary);
    t.textAlignHorizontal = 'CENTER';
    t.textAutoResize = 'WIDTH_AND_HEIGHT';
    t.characters = chars;
    return t;
  }

  function makeChevron(direction) {
    // direction: 'left' | 'right'
    const pathData = direction === 'left'
      ? 'M 10 4 L 5 9 L 10 14'
      : 'M 5 4 L 10 9 L 5 14';
    const v = figma.createVector();
    v.vectorPaths = [{ windingRule: 'NONZERO', data: pathData }];
    v.strokes = solid(C.textPrimary);
    v.fills = [];
    v.strokeWeight = 1.5;
    v.strokeCap = 'ROUND';
    v.strokeJoin = 'ROUND';
    return v;
  }

  // Layout constants (from Figma design)
  const CAL_W = 250;
  const CAL_H = 296;
  const PAD   = 6;    // calendar padding
  const INNER = CAL_W - PAD * 2; // 238
  const HDR_H = 40;   // header height (28px button + 6px*2 padding)
  const DOW_H = 32;   // day-of-week row height
  const CW    = 34;   // cell width
  const CH    = 32;   // cell height
  const RGAP  = 4;    // row gap
  const GX    = PAD;  // grid x start
  const DOW_Y = PAD + HDR_H;         // 46
  const GRID_Y = DOW_Y + DOW_H;      // 78

  // ===================== ROOT FRAME =====================
  const cal = figma.createFrame();
  cal.name = 'fx RangeCalendar';
  cal.resize(CAL_W, CAL_H);
  cal.fills = solid(C.white);
  cal.clipsContent = true;

  // ===================== HEADER =====================
  const hdr = figma.createFrame();
  hdr.name = 'Calendar/header';
  hdr.resize(INNER, HDR_H);
  hdr.x = PAD;
  hdr.y = PAD;
  hdr.fills = solid(C.white);

  // Left nav button
  const lBtn = figma.createFrame();
  lBtn.name = 'fx IconButton';
  lBtn.resize(28, 28);
  lBtn.x = 3;
  lBtn.y = 6;
  lBtn.fills = [];
  lBtn.cornerRadius = 8;
  lBtn.layoutMode = 'HORIZONTAL';
  lBtn.primaryAxisAlignItems = 'CENTER';
  lBtn.counterAxisAlignItems = 'CENTER';
  lBtn.layoutSizingHorizontal = 'FIXED';
  lBtn.layoutSizingVertical = 'FIXED';

  const lv = makeChevron('left');
  lBtn.appendChild(lv);
  hdr.appendChild(lBtn);

  // Month/year label — centered in header
  const monthTxt = makeText('2026년 5월', { weight: 'Medium', color: C.textPrimary });
  monthTxt.x = Math.round((INNER - monthTxt.width) / 2);
  monthTxt.y = Math.round((HDR_H - monthTxt.height) / 2);
  hdr.appendChild(monthTxt);

  // Right nav button
  const rBtn = figma.createFrame();
  rBtn.name = 'fx IconButton';
  rBtn.resize(28, 28);
  rBtn.x = INNER - 3 - 28; // 207
  rBtn.y = 6;
  rBtn.fills = [];
  rBtn.cornerRadius = 8;
  rBtn.layoutMode = 'HORIZONTAL';
  rBtn.primaryAxisAlignItems = 'CENTER';
  rBtn.counterAxisAlignItems = 'CENTER';
  rBtn.layoutSizingHorizontal = 'FIXED';
  rBtn.layoutSizingVertical = 'FIXED';

  const rv = makeChevron('right');
  rBtn.appendChild(rv);
  hdr.appendChild(rBtn);

  cal.appendChild(hdr);

  // ===================== DAY OF WEEK ROW =====================
  const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

  for (let i = 0; i < 7; i++) {
    const cell = figma.createFrame();
    cell.name = '<DatePicker>.dateItem';
    cell.resize(CW, DOW_H);
    cell.x = GX + i * CW;
    cell.y = DOW_Y;
    cell.fills = [];
    cell.cornerRadius = 5;

    const t = makeText(DAYS[i], { size: 13, lh: 18, color: C.textQuinary });
    t.x = Math.round((CW - t.width) / 2);
    t.y = Math.round((DOW_H - t.height) / 2);
    cell.appendChild(t);
    cal.appendChild(cell);
  }

  // ===================== DATE GRID =====================
  //
  // Calendar: May 2026 (May 1 = Friday, col index 5)
  // Range selected: May 10 (Sun) → May 20 (Wed)
  //
  // State codes:  0=default  1=between  2=selected
  // Pos codes:    0=none  1=start  2=right  3=center  4=left  5=end
  //
  // Row 3: 10(sel/start), 11-15(btw/center), 16(btw/right)
  // Row 4: 17(btw/left), 18-19(btw/center), 20(sel/end), 21-23(default)

  const GRID = [
    // Row 0: Apr 26-30, May 1-2
    [
      {n:'26',o:1,s:0,p:0}, {n:'27',o:1,s:0,p:0}, {n:'28',o:1,s:0,p:0},
      {n:'29',o:1,s:0,p:0}, {n:'30',o:1,s:0,p:0},
      {n:'1', o:0,s:0,p:0}, {n:'2', o:0,s:0,p:0},
    ],
    // Row 1: May 3-9
    [
      {n:'3',o:0,s:0,p:0}, {n:'4',o:0,s:0,p:0}, {n:'5',o:0,s:0,p:0},
      {n:'6',o:0,s:0,p:0}, {n:'7',o:0,s:0,p:0}, {n:'8',o:0,s:0,p:0},
      {n:'9',o:0,s:0,p:0},
    ],
    // Row 2: May 10 (range start) → 16 (right edge of row)
    [
      {n:'10',o:0,s:2,p:1}, {n:'11',o:0,s:1,p:3}, {n:'12',o:0,s:1,p:3},
      {n:'13',o:0,s:1,p:3}, {n:'14',o:0,s:1,p:3}, {n:'15',o:0,s:1,p:3},
      {n:'16',o:0,s:1,p:2},
    ],
    // Row 3: 17 (left edge) → 19, 20 (range end), 21-23
    [
      {n:'17',o:0,s:1,p:4}, {n:'18',o:0,s:1,p:3}, {n:'19',o:0,s:1,p:3},
      {n:'20',o:0,s:2,p:5}, {n:'21',o:0,s:0,p:0}, {n:'22',o:0,s:0,p:0},
      {n:'23',o:0,s:0,p:0},
    ],
    // Row 4: May 24-30
    [
      {n:'24',o:0,s:0,p:0}, {n:'25',o:0,s:0,p:0}, {n:'26',o:0,s:0,p:0},
      {n:'27',o:0,s:0,p:0}, {n:'28',o:0,s:0,p:0}, {n:'29',o:0,s:0,p:0},
      {n:'30',o:0,s:0,p:0},
    ],
    // Row 5: May 31, Jun 1-6
    [
      {n:'31',o:0,s:0,p:0}, {n:'1',o:1,s:0,p:0}, {n:'2',o:1,s:0,p:0},
      {n:'3',o:1,s:0,p:0},  {n:'4',o:1,s:0,p:0}, {n:'5',o:1,s:0,p:0},
      {n:'6',o:1,s:0,p:0},
    ],
  ];

  for (let row = 0; row < GRID.length; row++) {
    for (let col = 0; col < 7; col++) {
      const d = GRID[row][col];
      const ox = GX + col * CW;
      const oy = GRID_Y + row * (CH + RGAP);

      // ── Outer frame: range background strip ──
      const outer = figma.createFrame();
      outer.name = 'RangeCalendar/date';
      outer.resize(CW, CH);
      outer.x = ox;
      outer.y = oy;

      if (d.s > 0) {
        // Between or selected: show green200 strip
        outer.fills = solid(C.green200);
        // Round left corners for start/left-edge positions
        if (d.p === 1 || d.p === 4) {
          outer.topLeftRadius    = 8;
          outer.bottomLeftRadius = 8;
          outer.topRightRadius   = 0;
          outer.bottomRightRadius = 0;
        // Round right corners for end/right-edge positions
        } else if (d.p === 2 || d.p === 5) {
          outer.topRightRadius    = 8;
          outer.bottomRightRadius = 8;
          outer.topLeftRadius     = 0;
          outer.bottomLeftRadius  = 0;
        } else {
          // Center: no radius (continuous strip)
          outer.cornerRadius = 0;
        }
      } else {
        outer.fills = [];
      }

      // ── Inner frame: green pill for selected dates ──
      const inner = figma.createFrame();
      inner.name = 'wrapper';
      inner.resize(CW, CH);
      inner.x = 0;
      inner.y = 0;
      inner.cornerRadius = 8;
      inner.fills = d.s === 2 ? solid(C.green500) : [];

      // ── Text ──
      let textColor, textWeight;
      if (d.o) {
        // Other month: gray
        textColor  = C.textQuinary;
        textWeight = 'Regular';
      } else if (d.s === 2) {
        // Selected (start/end): white bold
        textColor  = C.white;
        textWeight = 'Medium';
      } else if (d.s === 1) {
        // Between range: dark green
        textColor  = C.green800;
        textWeight = 'Medium';
      } else {
        // Default: primary text
        textColor  = C.textPrimary;
        textWeight = 'Regular';
      }

      const txt = makeText(d.n, { weight: textWeight, color: textColor, lh: 20 });
      txt.x = Math.round((CW - txt.width) / 2);
      txt.y = Math.round((CH - txt.height) / 2);

      inner.appendChild(txt);
      outer.appendChild(inner);
      cal.appendChild(outer);
    }
  }

  // Place on current page and zoom into view
  figma.currentPage.appendChild(cal);
  figma.viewport.scrollAndZoomIntoView([cal]);
}

main()
  .then(() => figma.closePlugin('✅ fx RangeCalendar 생성 완료!'))
  .catch(err => figma.closePlugin('❌ 오류: ' + (err.message || String(err))));
