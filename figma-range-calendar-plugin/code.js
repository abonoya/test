// fx RangeCalendar Creator Plugin
// Design tokens from fx2 Figma design system

var C = {
  white:       { r: 1,     g: 1,     b: 1     },
  textPrimary: { r: 0.173, g: 0.173, b: 0.173 },
  textQuinary: { r: 0.612, g: 0.612, b: 0.612 },
  green500:    { r: 0.082, g: 0.722, b: 0.263 },
  green200:    { r: 0.792, g: 0.988, b: 0.792 },
  green800:    { r: 0,     g: 0.439, b: 0.192 },
};

function solid(color) {
  return [{ type: 'SOLID', color: color }];
}

var fontFamily = 'Pretendard Variable';

function makeText(chars, weight, size, lh, color) {
  var t = figma.createText();
  t.fontName = { family: fontFamily, style: weight || 'Regular' };
  t.fontSize = size || 14;
  if (lh) t.lineHeight = { value: lh, unit: 'PIXELS' };
  t.fills = solid(color || C.textPrimary);
  t.textAlignHorizontal = 'CENTER';
  t.characters = chars;
  return t;
}

figma.loadFontAsync({ family: 'Pretendard Variable', style: 'Regular' })
  .then(function() { return figma.loadFontAsync({ family: 'Pretendard Variable', style: 'Medium' }); })
  .catch(function() {
    fontFamily = 'Inter';
    return figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
      .then(function() { return figma.loadFontAsync({ family: 'Inter', style: 'Medium' }); });
  })
  .then(function() {

    // Layout constants
    var CAL_W  = 250;
    var CAL_H  = 296;
    var PAD    = 6;
    var INNER  = 238;
    var HDR_H  = 40;
    var DOW_H  = 32;
    var CW     = 34;
    var CH     = 32;
    var RGAP   = 4;
    var GX     = PAD;
    var DOW_Y  = PAD + HDR_H;
    var GRID_Y = DOW_Y + DOW_H;

    // ===== ROOT FRAME =====
    var cal = figma.createFrame();
    cal.name = 'fx RangeCalendar';
    cal.resize(CAL_W, CAL_H);
    cal.fills = solid(C.white);
    cal.clipsContent = true;

    // ===== HEADER =====
    var hdr = figma.createFrame();
    hdr.name = 'Calendar/header';
    hdr.resize(INNER, HDR_H);
    hdr.x = PAD;
    hdr.y = PAD;
    hdr.fills = solid(C.white);

    // Left button
    var lBtn = figma.createFrame();
    lBtn.name = 'fx IconButton (prev)';
    lBtn.resize(28, 28);
    lBtn.x = 3;
    lBtn.y = 6;
    lBtn.fills = [];
    lBtn.cornerRadius = 8;
    var lTxt = makeText('<', 'Regular', 14, 20, C.textPrimary);
    lTxt.x = Math.round((28 - lTxt.width) / 2);
    lTxt.y = Math.round((28 - lTxt.height) / 2);
    lBtn.appendChild(lTxt);
    hdr.appendChild(lBtn);

    // Month label
    var monthTxt = makeText('2026년 5월', 'Medium', 14, 20, C.textPrimary);
    monthTxt.x = Math.round((INNER - monthTxt.width) / 2);
    monthTxt.y = Math.round((HDR_H - monthTxt.height) / 2);
    hdr.appendChild(monthTxt);

    // Right button
    var rBtn = figma.createFrame();
    rBtn.name = 'fx IconButton (next)';
    rBtn.resize(28, 28);
    rBtn.x = INNER - 3 - 28;
    rBtn.y = 6;
    rBtn.fills = [];
    rBtn.cornerRadius = 8;
    var rTxt = makeText('>', 'Regular', 14, 20, C.textPrimary);
    rTxt.x = Math.round((28 - rTxt.width) / 2);
    rTxt.y = Math.round((28 - rTxt.height) / 2);
    rBtn.appendChild(rTxt);
    hdr.appendChild(rBtn);

    cal.appendChild(hdr);

    // ===== DAY OF WEEK ROW =====
    var DAYS = ['일', '월', '화', '수', '목', '금', '토'];
    for (var i = 0; i < 7; i++) {
      var dcell = figma.createFrame();
      dcell.name = '<DatePicker>.dateItem';
      dcell.resize(CW, DOW_H);
      dcell.x = GX + i * CW;
      dcell.y = DOW_Y;
      dcell.fills = [];
      dcell.cornerRadius = 5;
      var dt = makeText(DAYS[i], 'Regular', 13, 18, C.textQuinary);
      dt.x = Math.round((CW - dt.width) / 2);
      dt.y = Math.round((DOW_H - dt.height) / 2);
      dcell.appendChild(dt);
      cal.appendChild(dcell);
    }

    // ===== DATE GRID =====
    // s: 0=default  1=between  2=selected
    // p: 0=none  1=start  2=right  3=center  4=left  5=end
    var GRID = [
      [
        {n:'26',o:1,s:0,p:0},{n:'27',o:1,s:0,p:0},{n:'28',o:1,s:0,p:0},
        {n:'29',o:1,s:0,p:0},{n:'30',o:1,s:0,p:0},{n:'1',o:0,s:0,p:0},{n:'2',o:0,s:0,p:0}
      ],
      [
        {n:'3',o:0,s:0,p:0},{n:'4',o:0,s:0,p:0},{n:'5',o:0,s:0,p:0},
        {n:'6',o:0,s:0,p:0},{n:'7',o:0,s:0,p:0},{n:'8',o:0,s:0,p:0},{n:'9',o:0,s:0,p:0}
      ],
      [
        {n:'10',o:0,s:2,p:1},{n:'11',o:0,s:1,p:3},{n:'12',o:0,s:1,p:3},
        {n:'13',o:0,s:1,p:3},{n:'14',o:0,s:1,p:3},{n:'15',o:0,s:1,p:3},{n:'16',o:0,s:1,p:2}
      ],
      [
        {n:'17',o:0,s:1,p:4},{n:'18',o:0,s:1,p:3},{n:'19',o:0,s:1,p:3},
        {n:'20',o:0,s:2,p:5},{n:'21',o:0,s:0,p:0},{n:'22',o:0,s:0,p:0},{n:'23',o:0,s:0,p:0}
      ],
      [
        {n:'24',o:0,s:0,p:0},{n:'25',o:0,s:0,p:0},{n:'26',o:0,s:0,p:0},
        {n:'27',o:0,s:0,p:0},{n:'28',o:0,s:0,p:0},{n:'29',o:0,s:0,p:0},{n:'30',o:0,s:0,p:0}
      ],
      [
        {n:'31',o:0,s:0,p:0},{n:'1',o:1,s:0,p:0},{n:'2',o:1,s:0,p:0},
        {n:'3',o:1,s:0,p:0},{n:'4',o:1,s:0,p:0},{n:'5',o:1,s:0,p:0},{n:'6',o:1,s:0,p:0}
      ]
    ];

    for (var row = 0; row < GRID.length; row++) {
      for (var col = 0; col < 7; col++) {
        var d = GRID[row][col];
        var ox = GX + col * CW;
        var oy = GRID_Y + row * (CH + RGAP);

        // Outer frame (range background strip)
        var outer = figma.createFrame();
        outer.name = 'RangeCalendar/date';
        outer.resize(CW, CH);
        outer.x = ox;
        outer.y = oy;

        if (d.s > 0) {
          outer.fills = solid(C.green200);
          if (d.p === 1 || d.p === 4) {
            outer.topLeftRadius    = 8;
            outer.bottomLeftRadius = 8;
            outer.topRightRadius   = 0;
            outer.bottomRightRadius = 0;
          } else if (d.p === 2 || d.p === 5) {
            outer.topRightRadius    = 8;
            outer.bottomRightRadius = 8;
            outer.topLeftRadius     = 0;
            outer.bottomLeftRadius  = 0;
          } else {
            outer.cornerRadius = 0;
          }
        } else {
          outer.fills = [];
        }

        // Inner frame (green pill for selected)
        var inner = figma.createFrame();
        inner.name = 'wrapper';
        inner.resize(CW, CH);
        inner.x = 0;
        inner.y = 0;
        inner.cornerRadius = 8;
        inner.fills = (d.s === 2) ? solid(C.green500) : [];

        // Text
        var textColor, textWeight;
        if (d.o) {
          textColor = C.textQuinary; textWeight = 'Regular';
        } else if (d.s === 2) {
          textColor = C.white; textWeight = 'Medium';
        } else if (d.s === 1) {
          textColor = C.green800; textWeight = 'Medium';
        } else {
          textColor = C.textPrimary; textWeight = 'Regular';
        }

        var txt = makeText(d.n, textWeight, 14, 20, textColor);
        txt.x = Math.round((CW - txt.width) / 2);
        txt.y = Math.round((CH - txt.height) / 2);

        inner.appendChild(txt);
        outer.appendChild(inner);
        cal.appendChild(outer);
      }
    }

    figma.currentPage.appendChild(cal);
    figma.viewport.scrollAndZoomIntoView([cal]);
    figma.closePlugin('✅ fx RangeCalendar 생성 완료!');
  })
  .catch(function(err) {
    figma.closePlugin('❌ 오류: ' + (err.message || String(err)));
  });
