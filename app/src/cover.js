// Vice Light Cover Studio — cover engine.
// Draws multi-panel GTA-poster-style cover art on a 2D canvas: layouts, colour
// grades, bold Anton lettering with a Pacifico neon subtitle, grain, vignette,
// a badge ribbon and a star heat meter. Pure canvas, no libraries, no network.
(function (global) {
  'use strict';

  // ---------------------------------------------------------------- layouts
  // Each layout lists its panels as fractions of the art area (the canvas
  // minus the title band). rot is a tilt in degrees around the panel centre.
  var LAYOUTS = [
    {
      id: 'hero3', name: 'Hero + Three',
      panels: [
        { x: 0.015, y: 0.02, w: 0.585, h: 0.96, rot: 0 },
        { x: 0.615, y: 0.02, w: 0.37, h: 0.306, rot: 0 },
        { x: 0.615, y: 0.347, w: 0.37, h: 0.306, rot: 0 },
        { x: 0.615, y: 0.673, w: 0.37, h: 0.306, rot: 0 },
      ],
    },
    {
      id: 'grid4', name: 'Four-Panel Grid',
      panels: [
        { x: 0.015, y: 0.02, w: 0.478, h: 0.47, rot: 0 },
        { x: 0.507, y: 0.02, w: 0.478, h: 0.47, rot: 0 },
        { x: 0.015, y: 0.51, w: 0.478, h: 0.47, rot: 0 },
        { x: 0.507, y: 0.51, w: 0.478, h: 0.47, rot: 0 },
      ],
    },
    {
      id: 'fullbleed', name: 'Full-Bleed + Strip',
      panels: [
        { x: 0, y: 0, w: 1, h: 1, rot: 0 },
        { x: 0.05, y: 0.66, w: 0.28, h: 0.28, rot: -3 },
        { x: 0.36, y: 0.69, w: 0.28, h: 0.28, rot: 2 },
        { x: 0.67, y: 0.66, w: 0.28, h: 0.28, rot: -2 },
      ],
    },
    {
      id: 'tilted', name: 'Tilted Snapshots',
      panels: [
        { x: 0.05, y: 0.04, w: 0.52, h: 0.60, rot: -5 },
        { x: 0.45, y: 0.09, w: 0.50, h: 0.56, rot: 4 },
        { x: 0.27, y: 0.56, w: 0.46, h: 0.36, rot: -2 },
      ],
    },
    {
      id: 'duo', name: 'Duo Portrait',
      panels: [
        { x: 0.015, y: 0.02, w: 0.478, h: 0.96, rot: 0 },
        { x: 0.507, y: 0.02, w: 0.478, h: 0.96, rot: 0 },
      ],
    },
    {
      id: 'nine', name: 'Nine-Panel Grid',
      panels: [
        { x: 0.015, y: 0.015, w: 0.315, h: 0.315, rot: 0 },
        { x: 0.342, y: 0.015, w: 0.315, h: 0.315, rot: 0 },
        { x: 0.669, y: 0.015, w: 0.315, h: 0.315, rot: 0 },
        { x: 0.015, y: 0.342, w: 0.315, h: 0.315, rot: 0 },
        { x: 0.342, y: 0.342, w: 0.315, h: 0.315, rot: 0 },
        { x: 0.669, y: 0.342, w: 0.315, h: 0.315, rot: 0 },
        { x: 0.015, y: 0.669, w: 0.315, h: 0.315, rot: 0 },
        { x: 0.342, y: 0.669, w: 0.315, h: 0.315, rot: 0 },
        { x: 0.669, y: 0.669, w: 0.315, h: 0.315, rot: 0 },
      ],
    },
  ];

  // ----------------------------------------------------------------- grades
  // A grade is a background gradient, a screen/overlay wash drawn over each
  // photo, a multiply tint, and the colours the lettering is filled with.
  var GRADES = [
    {
      id: 'sunset', name: 'Vice Sunset',
      bg: ['#160818', '#43102e', '#7a1e3c'],
      wash: ['#ffb347', '#ff5c8a', '#7b2ff7'],
      tint: '#ff7a3d', tintAlpha: 0.14,
      title: ['#ffe29a', '#ff7a3d', '#ff2e88'],
      subtitle: '#ffd166', glow: '#ff5c8a',
      swatch: 'linear-gradient(90deg,#ffb347,#ff5c8a,#7b2ff7)',
    },
    {
      id: 'neon', name: 'Neon Night',
      bg: ['#03030f', '#0d1030', '#241047'],
      wash: ['#2de2c5', '#ff5ce1', '#7b2ff7'],
      tint: '#2de2c5', tintAlpha: 0.12,
      title: ['#a5fbff', '#ff5ce1', '#b18cff'],
      subtitle: '#2de2c5', glow: '#ff5ce1',
      swatch: 'linear-gradient(90deg,#2de2c5,#ff5ce1,#7b2ff7)',
    },
    {
      id: 'gold', name: 'Palm Gold',
      bg: ['#170f04', '#33230a', '#5a3a10'],
      wash: ['#fff3c4', '#ffb347', '#ff7a3d'],
      tint: '#ffb347', tintAlpha: 0.16,
      title: ['#fffbe0', '#ffd166', '#ff9a3d'],
      subtitle: '#ffe9a8', glow: '#ffb347',
      swatch: 'linear-gradient(90deg,#fff3c4,#ffb347,#ff7a3d)',
    },
    {
      id: 'teal', name: 'Teal Pink',
      bg: ['#031318', '#0a2a33', '#123a4a'],
      wash: ['#7df9ff', '#ff7ad9', '#ff5c8a'],
      tint: '#2de2c5', tintAlpha: 0.13,
      title: ['#d8fff6', '#7df9ff', '#ff7ad9'],
      subtitle: '#7df9ff', glow: '#ff7ad9',
      swatch: 'linear-gradient(90deg,#7df9ff,#ff7ad9,#ff5c8a)',
    },
    {
      id: 'mono', name: 'Mono Noir',
      bg: ['#060606', '#141414', '#262626'],
      wash: ['#ffffff', '#c9c9c9', '#5a5a5a'],
      tint: '#ffffff', tintAlpha: 0.08,
      title: ['#ffffff', '#e8e8e8', '#9a9a9a'],
      subtitle: '#f0f0f0', glow: '#ffffff',
      swatch: 'linear-gradient(90deg,#ffffff,#9a9a9a,#333333)',
    },
  ];

  function layoutById(id) {
    for (var i = 0; i < LAYOUTS.length; i++) if (LAYOUTS[i].id === id) return LAYOUTS[i];
    return LAYOUTS[0];
  }
  function gradeById(id) {
    for (var i = 0; i < GRADES.length; i++) if (GRADES[i].id === id) return GRADES[i];
    return GRADES[0];
  }

  // ------------------------------------------------------------- grain tile
  var grainTile = null;
  function getGrainTile() {
    if (grainTile) return grainTile;
    var c = document.createElement('canvas');
    c.width = 160; c.height = 160;
    var g = c.getContext('2d');
    var img = g.createImageData(160, 160);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = 96 + Math.floor(Math.random() * 96);
      img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    grainTile = c;
    return c;
  }

  // ------------------------------------------------------------ photo cover
  // Draws img to cover rect, with a zoom and a pan (x, y in -1..1 of the
  // overflow). flip mirrors it horizontally.
  function drawPhotoInto(ctx, img, rect, crop) {
    var zoom = crop.zoom || 1;
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    var scale = Math.max(rect.w / iw, rect.h / ih) * zoom;
    var dw = iw * scale, dh = ih * scale;
    var ox = (rect.w - dw) / 2 + (crop.x || 0) * (dw - rect.w) * 0.5;
    var oy = (rect.h - dh) / 2 + (crop.y || 0) * (dh - rect.h) * 0.5;
    ctx.save();
    if (crop.flip) {
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.scale(-1, 1);
      ctx.translate(-(rect.x + rect.w / 2), -(rect.y + rect.h / 2));
    }
    ctx.drawImage(img, rect.x + ox, rect.y + oy, dw, dh);
    ctx.restore();
  }

  function roundedPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function starPath(ctx, cx, cy, r) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var ang = -Math.PI / 2 + (i * Math.PI) / 5;
      var rad = i % 2 === 0 ? r : r * 0.45;
      var px = cx + Math.cos(ang) * rad, py = cy + Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function linearGradient(ctx, x0, y0, x1, y1, stops) {
    var g = ctx.createLinearGradient(x0, y0, x1, y1);
    for (var i = 0; i < stops.length; i++) g.addColorStop(i / (stops.length - 1), stops[i]);
    return g;
  }

  // ------------------------------------------------------------ panel paint
  function paintPanel(ctx, img, rect, rot, grade, crop, isBackdrop) {
    var r = Math.max(4, Math.min(rect.w, rect.h) * 0.02);
    ctx.save();
    if (rot) {
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.translate(-(rect.x + rect.w / 2), -(rect.y + rect.h / 2));
    }
    roundedPath(ctx, rect.x, rect.y, rect.w, rect.h, isBackdrop ? 0 : r);
    ctx.clip();
    if (img) {
      drawPhotoInto(ctx, img, rect, crop);
    } else {
      // Empty panel: a deep grade-coloured placeholder with diagonal stripes.
      ctx.fillStyle = grade.bg[0];
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = Math.max(2, rect.w * 0.01);
      for (var d = -rect.h; d < rect.w; d += rect.w * 0.09) {
        ctx.beginPath();
        ctx.moveTo(rect.x + d, rect.y + rect.h);
        ctx.lineTo(rect.x + d + rect.h, rect.y);
        ctx.stroke();
      }
      ctx.restore();
    }
    // Sunset / neon wash: a diagonal overlay gradient, then a soft tint.
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = linearGradient(ctx, rect.x, rect.y, rect.x + rect.w, rect.y + rect.h, grade.wash);
    ctx.globalAlpha = 0.5;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = grade.tintAlpha;
    ctx.fillStyle = grade.tint;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    // Top light: a soft highlight so panels read as lit poster art.
    var hi = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h * 0.45);
    hi.addColorStop(0, 'rgba(255,255,255,0.16)');
    hi.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hi;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();

    // Ink border around the panel.
    ctx.save();
    if (rot) {
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.translate(-(rect.x + rect.w / 2), -(rect.y + rect.h / 2));
    }
    roundedPath(ctx, rect.x, rect.y, rect.w, rect.h, isBackdrop ? 0 : r);
    ctx.lineWidth = Math.max(3, Math.min(rect.w, rect.h) * 0.012);
    ctx.strokeStyle = 'rgba(8,4,10,0.92)';
    ctx.stroke();
    ctx.lineWidth = Math.max(1, Math.min(rect.w, rect.h) * 0.004);
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------ title block
  function fitFont(ctx, text, maxWidth, startSize, family) {
    var size = startSize;
    while (size > 14) {
      ctx.font = size + 'px ' + family;
      if (ctx.measureText(text).width <= maxWidth) return size;
      size -= 2;
    }
    ctx.font = size + 'px ' + family;
    return size;
  }

  function paintTitleBlock(ctx, W, H, band, grade, state) {
    var pad = Math.round(Math.min(W, H) * 0.03);
    // Scrim so the lettering pops on any photo.
    var scrim = ctx.createLinearGradient(0, band.y, 0, band.y + band.h);
    scrim.addColorStop(0, 'rgba(6,2,8,0)');
    scrim.addColorStop(0.35, 'rgba(6,2,8,0.72)');
    scrim.addColorStop(1, 'rgba(6,2,8,0.92)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, band.y, W, band.h);

    var title = (state.caption || 'GOLDEN HOUR').toUpperCase();
    var titleSize = fitFont(ctx, title, W - pad * 2, Math.round(band.h * 0.58), 'Anton, sans-serif');
    var cx = W / 2;
    var titleY = band.y + band.h * 0.52;

    ctx.save();
    ctx.translate(cx, titleY);
    ctx.rotate(-0.02);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = titleSize + 'px Anton, sans-serif';
    ctx.shadowColor = grade.glow;
    ctx.shadowBlur = Math.round(titleSize * 0.25);
    ctx.lineWidth = Math.max(3, titleSize * 0.07);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#ffffff';
    ctx.strokeText(title, 0, 0);
    ctx.shadowBlur = 0;
    ctx.fillStyle = linearGradient(ctx, -W / 2, 0, W / 2, 0, grade.title);
    ctx.fillText(title, 0, 0);
    ctx.restore();

    var sub = state.subtitle || '';
    if (sub) {
      var subSize = Math.max(16, Math.round(band.h * 0.17));
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = subSize + 'px Pacifico, cursive';
      ctx.shadowColor = grade.glow;
      ctx.shadowBlur = Math.round(subSize * 0.7);
      ctx.fillStyle = grade.subtitle;
      ctx.fillText(sub, cx, band.y + band.h * 0.82);
      ctx.restore();
    }

    // Star heat meter, bottom-right of the band.
    var stars = state.stars | 0;
    if (stars > 0) {
      var sr = Math.max(9, Math.round(band.h * 0.085));
      var total = sr * 2.4 * 5;
      var sx = W - pad - total;
      var sy = band.y + band.h * 0.86;
      for (var i = 0; i < 5; i++) {
        starPath(ctx, sx + sr + i * sr * 2.4, sy, sr);
        if (i < stars) {
          ctx.fillStyle = '#ffd166';
          ctx.shadowColor = '#ff9a3d';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.18)';
          ctx.fill();
        }
      }
    }
  }

  function paintBadge(ctx, W, H, grade, text) {
    if (!text) return;
    var fs = Math.max(13, Math.round(Math.min(W, H) * 0.022));
    ctx.save();
    ctx.font = fs + 'px Anton, sans-serif';
    var tw = ctx.measureText(text).width;
    var bw = tw + fs * 1.6, bh = fs * 1.9;
    ctx.translate(W * 0.06, H * 0.055);
    ctx.rotate(-0.10);
    ctx.fillStyle = '#ff2e88';
    ctx.shadowColor = 'rgba(255,46,136,0.7)';
    ctx.shadowBlur = 14;
    roundedPath(ctx, -bw / 2, -bh / 2, bw, bh, bh / 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 1);
    ctx.restore();
  }

  // -------------------------------------------------------------- main draw
  // state: { layout, grade, caption, subtitle, badge, stars, grain,
  //   vignette, showTitle, showBadge, panels: [{photoId,x,y,zoom,flip}] }
  // photos: Map of photoId -> HTMLImageElement.
  function drawCover(canvas, state, photos) {
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var grade = gradeById(state.grade);
    var layout = layoutById(state.layout);

    // Background: the grade's deep gradient.
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = linearGradient(ctx, 0, 0, W, H, grade.bg);
    ctx.fillRect(0, 0, W, H);

    var showTitle = state.showTitle !== false;
    var titleFrac = showTitle ? (W > H ? 0.24 : 0.21) : 0;
    var artH = Math.round(H * (1 - titleFrac));
    var art = { x: 0, y: 0, w: W, h: artH };

    // Panels, in layout order. The full-bleed layout's first panel is the
    // backdrop: it is painted without rounded corners, the strip on top.
    for (var i = 0; i < layout.panels.length; i++) {
      var p = layout.panels[i];
      var rect = {
        x: art.x + p.x * art.w,
        y: art.y + p.y * art.h,
        w: p.w * art.w,
        h: p.h * art.h,
      };
      var crop = (state.panels && state.panels[i]) || {};
      var img = crop.photoId && photos ? photos.get(crop.photoId) || null : null;
      paintPanel(ctx, img, rect, p.rot || 0, grade, crop, i === 0 && layout.id === 'fullbleed');
    }

    // Title band.
    if (showTitle) {
      paintTitleBlock(ctx, W, H, { x: 0, y: artH, w: W, h: H - artH }, grade, state);
    }

    // Badge ribbon on top of everything.
    if (state.showBadge !== false) paintBadge(ctx, W, H, grade, state.badge);

    // Grain, then vignette.
    if (state.grain !== false) {
      var tile = getGrainTile();
      var pattern = ctx.createPattern(tile, 'repeat');
      ctx.save();
      ctx.globalAlpha = 0.10;
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
    if (state.vignette !== false) {
      var vg = ctx.createRadialGradient(
        W / 2, H / 2, Math.min(W, H) * 0.42,
        W / 2, H / 2, Math.max(W, H) * 0.75
      );
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.42)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    }

    // Thin outer frame.
    ctx.strokeStyle = 'rgba(8,4,10,0.9)';
    ctx.lineWidth = Math.max(4, Math.min(W, H) * 0.006);
    ctx.strokeRect(0, 0, W, H);
  }

  function exportCover(state, photos, width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    drawCover(canvas, state, photos);
    return canvas;
  }

  global.ViceLightCover = {
    LAYOUTS: LAYOUTS,
    GRADES: GRADES,
    layoutById: layoutById,
    gradeById: gradeById,
    drawCover: drawCover,
    exportCover: exportCover,
  };
})(typeof window !== 'undefined' ? window : globalThis);
