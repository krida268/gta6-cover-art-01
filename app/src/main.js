// Vice Light Cover Studio — editor wiring.
// Owns the state, the photo tray, layout/grade pickers, panel pan + zoom,
// undo/redo history and PNG export. The drawing itself lives in cover.js.
(function () {
  'use strict';

  var Cover = window.ViceLightCover;
  var $ = function (id) { return document.getElementById(id); };

  var SIZES = {
    '1080x1080': { w: 1080, h: 1080 },
    '1080x1350': { w: 1080, h: 1350 },
    '1920x1080': { w: 1920, h: 1080 },
  };

  // ------------------------------------------------------------- state
  var photoSeq = 0;
  var state = {
    layout: 'hero3',
    grade: 'sunset',
    size: '1080x1080',
    caption: 'GOLDEN HOUR',
    subtitle: 'chasing the last light',
    badge: 'EST. 2026 · VICE LIGHT',
    stars: 4,
    grain: true,
    vignette: true,
    showBadge: true,
    showTitle: true,
    selectedPanel: 0,
    photos: [], // {id, img, name}
    panels: [], // {photoId, x, y, zoom, flip}
  };

  var history = [];
  var historyIndex = -1;

  function photosMap() {
    var m = new Map();
    state.photos.forEach(function (p) { m.set(p.id, p.img); });
    return m;
  }

  function panelCount() {
    return Cover.layoutById(state.layout).panels.length;
  }

  function ensurePanels() {
    var n = panelCount();
    while (state.panels.length < n) {
      state.panels.push({ photoId: null, x: 0, y: 0, zoom: 1, flip: false });
    }
    state.panels.length = n;
    if (state.selectedPanel >= n) state.selectedPanel = 0;
  }

  function autoFillPanels() {
    if (!state.photos.length) return;
    for (var i = 0; i < state.panels.length; i++) {
      if (!state.panels[i].photoId) {
        state.panels[i].photoId = state.photos[i % state.photos.length].id;
      }
    }
  }

  function snapshot() {
    return JSON.stringify({
      layout: state.layout, grade: state.grade, size: state.size,
      caption: state.caption, subtitle: state.subtitle, badge: state.badge,
      stars: state.stars, grain: state.grain, vignette: state.vignette,
      showBadge: state.showBadge, showTitle: state.showTitle,
      selectedPanel: state.selectedPanel,
      panels: state.panels,
    });
  }

  function restore(json) {
    var s = JSON.parse(json);
    var keepPhotos = state.photos;
    Object.assign(state, s);
    state.photos = keepPhotos;
    ensurePanels();
    syncControls();
    render();
  }

  function pushHistory() {
    history.length = historyIndex + 1;
    history.push(snapshot());
    if (history.length > 60) history.shift();
    historyIndex = history.length - 1;
    updateHistoryButtons();
  }

  function undo() {
    if (historyIndex <= 0) return;
    historyIndex -= 1;
    restore(history[historyIndex]);
    updateHistoryButtons();
  }

  function redo() {
    if (historyIndex >= history.length - 1) return;
    historyIndex += 1;
    restore(history[historyIndex]);
    updateHistoryButtons();
  }

  function updateHistoryButtons() {
    $('undoBtn').disabled = historyIndex <= 0;
    $('redoBtn').disabled = historyIndex >= history.length - 1;
  }

  // ------------------------------------------------------------ rendering
  var canvas = $('previewCanvas');
  var renderQueued = false;
  function render() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(function () {
      renderQueued = false;
      var size = SIZES[state.size];
      if (canvas.width !== size.w || canvas.height !== size.h) {
        canvas.width = size.w;
        canvas.height = size.h;
      }
      Cover.drawCover(canvas, state, photosMap());
      updateSelectedLabel();
    });
  }

  function updateSelectedLabel() {
    var crop = state.panels[state.selectedPanel];
    var name = 'no photo';
    if (crop && crop.photoId) {
      var p = state.photos.find(function (x) { return x.id === crop.photoId; });
      if (p) name = p.name;
    }
    $('selectedPanelLabel').textContent =
      'Panel ' + (state.selectedPanel + 1) + ' of ' + panelCount() + ' — ' + name;
    var slider = $('zoomSlider');
    if (crop) slider.value = String(crop.zoom || 1);
  }

  // --------------------------------------------------------- photo loading
  function addPhoto(img, name) {
    var photo = { id: 'p' + (++photoSeq), img: img, name: name || ('Photo ' + photoSeq) };
    state.photos.push(photo);
    buildTray();
    autoFillPanels();
    pushHistory();
    render();
    return photo;
  }

  function loadImageFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () { resolve(img); };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function loadSample(url, name) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = url;
    }).then(function (img) { return addPhoto(img, name); });
  }

  function loadDefaultSamples() {
    // The two kit sample photos, so the editor opens with art already in it.
    return Promise.all([
      loadSample('samples/pier.jpg', 'Pier — sample'),
      loadSample('samples/boulevard.jpg', 'Boulevard — sample'),
    ]).catch(function () { /* samples are a bonus, not a requirement */ });
  }

  function buildTray() {
    var tray = $('photoTray');
    tray.innerHTML = '';
    if (!state.photos.length) {
      var empty = document.createElement('span');
      empty.className = 'empty';
      empty.textContent = 'No photos yet — add one to begin.';
      tray.appendChild(empty);
      return;
    }
    state.photos.forEach(function (photo) {
      var thumb = document.createElement('img');
      thumb.className = 'thumb' + (pickedPhotoId === photo.id ? ' picked' : '');
      thumb.src = photo.img.src;
      thumb.alt = photo.name;
      thumb.title = photo.name + ' — click, then click a panel';
      thumb.draggable = true;
      thumb.addEventListener('click', function () {
        pickedPhotoId = photo.id;
        buildTray();
      });
      thumb.addEventListener('dragstart', function (ev) {
        ev.dataTransfer.setData('text/vice-photo', photo.id);
      });
      tray.appendChild(thumb);
    });
  }

  var pickedPhotoId = null;

  // ------------------------------------------------------ layout + grades
  function buildPickers() {
    var lg = $('layoutGrid');
    Cover.LAYOUTS.forEach(function (layout) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = layout.name;
      b.dataset.layout = layout.id;
      b.addEventListener('click', function () {
        state.layout = layout.id;
        ensurePanels();
        autoFillPanels();
        syncPickers();
        pushHistory();
        render();
      });
      lg.appendChild(b);
    });
    var gg = $('gradeGrid');
    Cover.GRADES.forEach(function (grade) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.grade = grade.id;
      var sw = document.createElement('span');
      sw.className = 'swatch';
      sw.style.background = grade.swatch;
      b.appendChild(sw);
      b.appendChild(document.createTextNode(grade.name));
      b.addEventListener('click', function () {
        state.grade = grade.id;
        syncPickers();
        pushHistory();
        render();
      });
      gg.appendChild(b);
    });
  }

  function syncPickers() {
    document.querySelectorAll('#layoutGrid button').forEach(function (b) {
      b.classList.toggle('active', b.dataset.layout === state.layout);
    });
    document.querySelectorAll('#gradeGrid button').forEach(function (b) {
      b.classList.toggle('active', b.dataset.grade === state.grade);
    });
  }

  function buildStars() {
    var row = $('starRow');
    for (var i = 1; i <= 5; i++) {
      (function (n) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = '★';
        b.setAttribute('aria-label', n + ' stars');
        b.addEventListener('click', function () {
          state.stars = n;
          syncStars();
          pushHistory();
          render();
        });
        row.appendChild(b);
      })(i);
    }
    syncStars();
  }

  function syncStars() {
    document.querySelectorAll('#starRow button').forEach(function (b, i) {
      b.classList.toggle('lit', i < state.stars);
    });
  }

  function syncControls() {
    $('captionInput').value = state.caption;
    $('subtitleInput').value = state.subtitle;
    $('badgeInput').value = state.badge;
    $('grainToggle').checked = state.grain;
    $('vignetteToggle').checked = state.vignette;
    $('badgeToggle').checked = state.showBadge;
    $('titleToggle').checked = state.showTitle;
    document.querySelectorAll('input[name="exportSize"]').forEach(function (r) {
      r.checked = r.value === state.size;
    });
    syncPickers();
    syncStars();
    buildTray();
  }

  // ------------------------------------------------- panel hit test + pan
  function panelRects() {
    var size = SIZES[state.size];
    var W = size.w, H = size.h;
    var titleFrac = state.showTitle !== false ? (W > H ? 0.24 : 0.21) : 0;
    var artH = Math.round(H * (1 - titleFrac));
    return Cover.layoutById(state.layout).panels.map(function (p) {
      return {
        x: p.x * W, y: p.y * artH, w: p.w * W, h: p.h * artH, rot: p.rot || 0,
      };
    });
  }

  function hitPanel(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    var px = (clientX - rect.left) * (canvas.width / rect.width);
    var py = (clientY - rect.top) * (canvas.height / rect.height);
    var rects = panelRects();
    // Topmost panel wins: test in reverse paint order.
    for (var i = rects.length - 1; i >= 0; i--) {
      var r = rects[i];
      var lx = px - (r.x + r.w / 2), ly = py - (r.y + r.h / 2);
      if (r.rot) {
        var a = (-r.rot * Math.PI) / 180;
        var rx = lx * Math.cos(a) - ly * Math.sin(a);
        var ry = lx * Math.sin(a) + ly * Math.cos(a);
        lx = rx; ly = ry;
      }
      if (Math.abs(lx) <= r.w / 2 && Math.abs(ly) <= r.h / 2) return i;
    }
    return -1;
  }

  function panelPhotoOverflow(index) {
    var crop = state.panels[index];
    var photo = state.photos.find(function (p) { return p.id === crop.photoId; });
    if (!photo) return null;
    var rect = panelRects()[index];
    var iw = photo.img.naturalWidth, ih = photo.img.naturalHeight;
    var scale = Math.max(rect.w / iw, rect.h / ih) * (crop.zoom || 1);
    return { rect: rect, dw: iw * scale, dh: ih * scale, crop: crop };
  }

  var drag = null;

  function bindCanvas() {
    canvas.addEventListener('pointerdown', function (ev) {
      var index = hitPanel(ev.clientX, ev.clientY);
      if (index < 0) return;
      state.selectedPanel = index;
      if (pickedPhotoId) {
        state.panels[index].photoId = pickedPhotoId;
        pickedPhotoId = null;
        buildTray();
        pushHistory();
        render();
        return;
      }
      var info = panelPhotoOverflow(index);
      drag = { index: index, x: ev.clientX, y: ev.clientY, info: info, moved: false };
      canvas.setPointerCapture(ev.pointerId);
      updateSelectedLabel();
    });
    canvas.addEventListener('pointermove', function (ev) {
      if (!drag) return;
      var rect = canvas.getBoundingClientRect();
      var dx = (ev.clientX - drag.x) * (canvas.width / rect.width);
      var dy = (ev.clientY - drag.y) * (canvas.height / rect.height);
      if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
      var info = drag.info;
      if (info) {
        var ox = Math.max(1, (info.dw - info.rect.w) / 2);
        var oy = Math.max(1, (info.dh - info.rect.h) / 2);
        info.crop.x = Math.max(-1, Math.min(1, (info.crop.x || 0) + dx / ox));
        info.crop.y = Math.max(-1, Math.min(1, (info.crop.y || 0) + dy / oy));
      }
      drag.x = ev.clientX;
      drag.y = ev.clientY;
      render();
    });
    canvas.addEventListener('pointerup', function () {
      if (drag && drag.moved) pushHistory();
      drag = null;
    });
    canvas.addEventListener('wheel', function (ev) {
      var index = hitPanel(ev.clientX, ev.clientY);
      if (index < 0) return;
      ev.preventDefault();
      var crop = state.panels[index];
      crop.zoom = Math.max(1, Math.min(3, (crop.zoom || 1) * (1 - ev.deltaY * 0.001)));
      state.selectedPanel = index;
      render();
    }, { passive: false });

    // Drop files or a dragged tray photo onto a panel.
    var frame = $('previewFrame');
    frame.addEventListener('dragover', function (ev) {
      ev.preventDefault();
      frame.classList.add('dragging');
    });
    frame.addEventListener('dragleave', function () { frame.classList.remove('dragging'); });
    frame.addEventListener('drop', function (ev) {
      ev.preventDefault();
      frame.classList.remove('dragging');
      var photoId = ev.dataTransfer.getData('text/vice-photo');
      var index = hitPanel(ev.clientX, ev.clientY);
      if (photoId && index >= 0) {
        state.panels[index].photoId = photoId;
        state.selectedPanel = index;
        pushHistory();
        render();
        return;
      }
      var files = Array.prototype.slice.call(ev.dataTransfer.files || [])
        .filter(function (f) { return f.type.indexOf('image/') === 0; });
      files.forEach(function (f) {
        loadImageFile(f).then(function (img) { addPhoto(img, f.name); });
      });
    });
  }

  // --------------------------------------------------------------- export
  function exportPNG(width, height) {
    var out = Cover.exportCover(state, photosMap(), width, height);
    out.toBlob(function (blob) {
      if (!blob) return;
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'vice-light-cover-' + width + 'x' + height + '.png';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        URL.revokeObjectURL(a.href);
        a.remove();
      }, 1000);
    }, 'image/png');
  }

  function bindControls() {
    $('fileInput').addEventListener('change', function (ev) {
      var files = Array.prototype.slice.call(ev.target.files || []);
      files.forEach(function (f) {
        loadImageFile(f).then(function (img) { addPhoto(img, f.name); });
      });
      ev.target.value = '';
    });
    $('sampleBtn').addEventListener('click', function () { loadDefaultSamples(); });
    $('undoBtn').addEventListener('click', undo);
    $('redoBtn').addEventListener('click', redo);

    $('captionInput').addEventListener('input', function (ev) {
      state.caption = ev.target.value;
      render();
    });
    $('captionInput').addEventListener('change', pushHistory);
    $('subtitleInput').addEventListener('input', function (ev) {
      state.subtitle = ev.target.value;
      render();
    });
    $('subtitleInput').addEventListener('change', pushHistory);
    $('badgeInput').addEventListener('input', function (ev) {
      state.badge = ev.target.value;
      render();
    });
    $('badgeInput').addEventListener('change', pushHistory);

    $('zoomSlider').addEventListener('input', function (ev) {
      var crop = state.panels[state.selectedPanel];
      if (crop) { crop.zoom = Number(ev.target.value); render(); }
    });
    $('zoomSlider').addEventListener('change', pushHistory);
    $('flipBtn').addEventListener('click', function () {
      var crop = state.panels[state.selectedPanel];
      if (crop) { crop.flip = !crop.flip; pushHistory(); render(); }
    });
    $('centerBtn').addEventListener('click', function () {
      var crop = state.panels[state.selectedPanel];
      if (crop) { crop.x = 0; crop.y = 0; crop.zoom = 1; pushHistory(); render(); }
    });

    $('grainToggle').addEventListener('change', function (ev) {
      state.grain = ev.target.checked; pushHistory(); render();
    });
    $('vignetteToggle').addEventListener('change', function (ev) {
      state.vignette = ev.target.checked; pushHistory(); render();
    });
    $('badgeToggle').addEventListener('change', function (ev) {
      state.showBadge = ev.target.checked; pushHistory(); render();
    });
    $('titleToggle').addEventListener('change', function (ev) {
      state.showTitle = ev.target.checked; pushHistory(); render();
    });

    document.querySelectorAll('input[name="exportSize"]').forEach(function (r) {
      r.addEventListener('change', function () {
        state.size = r.value;
        pushHistory();
        render();
      });
    });

    $('exportSquareBtn').addEventListener('click', function () { exportPNG(1080, 1080); });
    $('exportPortraitBtn').addEventListener('click', function () { exportPNG(1080, 1350); });
    $('exportWideBtn').addEventListener('click', function () { exportPNG(1920, 1080); });
  }

  // ------------------------------------------------------------------ boot
  function boot() {
    // The ?shot=cover scene paints its own full-frame canvas and wipes the
    // editor DOM, so the editor must not boot underneath it.
    if (window.__viceShotCover) return;
    ensurePanels();
    buildPickers();
    buildStars();
    buildTray();
    bindControls();
    bindCanvas();
    syncControls();
    pushHistory();
    render();
    loadDefaultSamples().then(function () {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(render);
      }
    });
    // Handle for play tests and the shot scenes.
    window.__viceLight = {
      state: state,
      render: render,
      exportPNG: exportPNG,
      loadSample: loadSample,
      addPhoto: addPhoto,
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
