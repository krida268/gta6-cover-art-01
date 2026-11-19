// Vice Light Cover Studio — screenshot scenes.
// ?shot=cover  draws the exported cover full-frame at the requested size
//               (the app's own drawing of its PNG export, the allowed way to
//               show an exported cover in a screenshot).
// ?shot=editor shows the editor with a sample photo loaded.
// Both set window.__shotReady once the frame is painted.
(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var shot = params.get('shot');
  if (!shot) return;

  // Cover mode wipes the editor DOM, so tell main.js (which boots on
  // DOMContentLoaded, after this script) not to boot the editor at all.
  if (shot === 'cover') window.__viceShotCover = true;

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  }

  function fontsReady() {
    if (document.fonts && document.fonts.ready) {
      return Promise.all([
        document.fonts.load('16px Anton'),
        document.fonts.load('16px Pacifico'),
        document.fonts.ready,
      ]).catch(function () { return null; });
    }
    return Promise.resolve(null);
  }

  function markReady() {
    window.__shotReady = true;
  }

  function shotCover() {
    var w = Number(params.get('w')) || 1920;
    var h = Number(params.get('h')) || 1080;
    var layout = params.get('layout') || 'hero3';
    var grade = params.get('grade') || 'sunset';
    var caption = params.get('caption') || 'GOLDEN HOUR';
    var subtitle = params.get('subtitle') || 'chasing the last light';
    var photo = params.get('photo') || 'pier';
    var stars = Number(params.get('stars')) || 4;

    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.objectFit = 'contain';
    canvas.style.display = 'block';
    canvas.style.background = '#000';
    document.body.innerHTML = '';
    document.body.style.margin = '0';
    document.body.style.background = '#000';
    document.body.appendChild(canvas);

    var want = photo === 'both' ? ['pier', 'boulevard'] : [photo];
    Promise.all(want.map(function (name) {
      return loadImage('samples/' + name + '.jpg');
    })).then(function (imgs) {
      var photos = new Map();
      var panels = [];
      var count = window.ViceLightCover.layoutById(layout).panels.length;
      for (var i = 0; i < count; i++) {
        var img = imgs[i % imgs.length];
        var id = 'shot-' + i;
        photos.set(id, img);
        panels.push({ photoId: id, x: 0, y: 0, zoom: 1.12, flip: false });
      }
      return fontsReady().then(function () {
        window.ViceLightCover.drawCover(canvas, {
          layout: layout,
          grade: grade,
          caption: caption,
          subtitle: subtitle,
          badge: 'EST. 2026 · VICE LIGHT',
          stars: stars,
          grain: true,
          vignette: true,
          showBadge: true,
          showTitle: true,
          panels: panels,
        }, photos);
        markReady();
      });
    }).catch(function () {
      // Even if a sample fails, paint the cover so the shot still exists.
      fontsReady().then(function () {
        window.ViceLightCover.drawCover(canvas, {
          layout: layout, grade: grade, caption: caption, subtitle: subtitle,
          badge: 'EST. 2026 · VICE LIGHT', stars: stars,
          grain: true, vignette: true, showBadge: true, showTitle: true,
          panels: [],
        }, new Map());
        markReady();
      });
    });
  }

  function shotEditor() {
    var caption = params.get('caption');
    var layout = params.get('layout');
    var grade = params.get('grade');
    var size = params.get('size') || '1920x1080';
    var app = window.__viceLight;
    if (!app) { setTimeout(shotEditor, 50); return; }
    if (caption) {
      app.state.caption = caption;
      var input = document.getElementById('captionInput');
      if (input) input.value = caption;
    }
    if (layout) app.state.layout = layout;
    if (grade) app.state.grade = grade;
    app.state.size = size;
    // The editor boots with the sample photos already loading; wait until
    // they are in, then point every panel at them (cycling the two photos)
    // instead of rebuilding the photo list and orphaning panel references.
    function photosReady() {
      return app.state.photos.length >= 2 &&
        app.state.photos.every(function (p) { return p.img.complete; });
    }
    function finish() {
      var count = window.ViceLightCover.layoutById(app.state.layout).panels.length;
      var panels = [];
      for (var i = 0; i < count; i++) {
        panels.push({
          photoId: app.state.photos[i % app.state.photos.length].id,
          x: 0, y: 0, zoom: 1.12, flip: false,
        });
      }
      app.state.panels = panels;
      app.state.selectedPanel = 0;
      var sizeInput = document.querySelector('input[name="exportSize"][value="' + size + '"]');
      if (sizeInput) sizeInput.checked = true;
      fontsReady().then(function () {
        app.render();
        setTimeout(markReady, 400);
      });
    }
    if (photosReady()) { finish(); return; }
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      if (photosReady() || tries > 100) {
        clearInterval(timer);
        finish();
      }
    }, 100);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (shot === 'cover') shotCover();
    else if (shot === 'editor') shotEditor();
  });
})();
