
(function() {
  const canvas = document.getElementById('wheel');
  const ctx = canvas.getContext('2d');
  const namesInput = document.getElementById('names-input');
  const loadJsonBtn = document.getElementById('load-json');
  const applyNamesBtn = document.getElementById('apply-names');
  const saveLocalBtn = document.getElementById('save-local');
  const exportJsonBtn = document.getElementById('export-json');
  const spinBtn = document.getElementById('spin');
  const winnerEl = document.getElementById('winner');
  const durationInput = document.getElementById('duration');

  let names = [];
  let rotation = 0; // radians
  let spinning = false;

  // Generate a palette with distinct hues
  function generateColors(n) {
    const arr = [];
    for (let i = 0; i < n; i++) {
      const hue = Math.round((360 * i) / n);
      arr.push(`hsl(${hue} 75% 55%)`);
    }
    return arr;
  }

  function drawWheel() {
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2; const r = Math.min(W, H) / 2 - 8;
    ctx.clearRect(0, 0, W, H);

    if (!names.length) {
      // Empty state
      ctx.fillStyle = '#a7b0c3';
      ctx.font = '16px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Add some names to spin', cx, cy);
      return;
    }

    const colors = generateColors(names.length);
    const angle = (Math.PI * 2) / names.length;

    // Draw pointer (triangle) at top
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(0);
    ctx.beginPath();
    ctx.moveTo(0, -r - 6);
    ctx.lineTo(10, -r - 26);
    ctx.lineTo(-10, -r - 26);
    ctx.closePath();
    ctx.fillStyle = '#ffc857';
    ctx.fill();
    ctx.restore();

    // Draw segments
    for (let i = 0; i < names.length; i++) {
      const start = rotation + i * angle;
      const end = start + angle;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      // Segment separators
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(cx, cy);
      const mid = start + angle / 2;
      ctx.rotate(mid);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#0b1020';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.translate(r - 12, 0);
      const label = names[i];
      // Wrap/truncate to fit
      const maxWidth = r - 24;
      let text = label;
      // simple truncate with ellipsis
      function measure(text) { return ctx.measureText(text).width; }
      if (measure(text) > maxWidth) {
        while (text.length && measure(text + '…') > maxWidth) text = text.slice(0, -1);
        text += '…';
      }
      ctx.rotate(Math.PI / 2);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }

    // Outer border
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.stroke();
  }

  function pickIndexFromRotation(rot) {
    // Pointer is at angle -90deg (top). Convert rotation to index.
    const anglePer = (Math.PI * 2) / names.length;
    // Normalize angle so that 0 corresponds to first segment start at top.
    // The wheel is drawn starting at rotation + i*angle from +x, but pointer is at -y ( -90deg )
    const pointerAngle = -Math.PI / 2; // -90deg
    let a = pointerAngle - rot; // angle where 0 aligns with first segment start
    a = (a % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2); // normalize 0..2pi
    const idx = Math.floor(a / anglePer) % names.length;
    return idx;
  }

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function spin(durationMs) {
    if (!names.length || spinning) return;
    spinning = true; winnerEl.textContent = '';
    spinBtn.disabled = true; durationInput.disabled = true;

    const start = performance.now();
    // Random extra rotations between 4 and 8, plus final random offset
    const extraTurns = 4 + Math.random() * 4; // 4..8
    const finalOffset = Math.random() * Math.PI * 2;
    const startRotation = rotation;
    const targetRotation = startRotation + extraTurns * Math.PI * 2 + finalOffset;

    function frame(now) {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = easeOutQuart(t);
      rotation = startRotation + (targetRotation - startRotation) * eased;
      drawWheel();
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        spinning = false; spinBtn.disabled = false; durationInput.disabled = false;
        const idx = pickIndexFromRotation(rotation);
        const name = names[idx];
        winnerEl.textContent = `🎉 ${name}`;
      }
    }
    requestAnimationFrame(frame);
  }

  function setNames(newNames, {updateTextarea=true, persistLocal=false} = {}) {
    names = newNames.filter(n => n && n.trim()).map(n => n.trim());
    if (updateTextarea) namesInput.value = names.join('\n');
    if (persistLocal) localStorage.setItem('spinnerNames', JSON.stringify(names));
    rotation = 0; drawWheel(); winnerEl.textContent = '';
  }

  async function loadFromJson() {
    try {
      const res = await fetch('names.json', {cache: 'no-store'});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('names.json must be an array of strings');
      setNames(data, {updateTextarea:true});
    } catch (e) {
      alert('Could not load names.json. Make sure it exists in the repo root.\n' + e.message);
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(names, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'names.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Event listeners
  loadJsonBtn.addEventListener('click', loadFromJson);
  applyNamesBtn.addEventListener('click', () => {
    const list = namesInput.value.split(/\r?\n/);
    setNames(list);
  });
  saveLocalBtn.addEventListener('click', () => {
    const list = namesInput.value.split(/\r?\n/);
    setNames(list, {persistLocal:true});
    alert('Saved to this browser. GitHub repo not changed.');
  });
  exportJsonBtn.addEventListener('click', exportJson);
  spinBtn.addEventListener('click', () => {
    const secs = Math.max(1, Math.min(20, Number(durationInput.value) || 10));
    durationInput.value = String(secs);
    spin(secs * 1000);
  });

  // Init
  (function init() {
    // Prefer local storage if present
    const local = localStorage.getItem('spinnerNames');
    if (local) {
      try { setNames(JSON.parse(local)); return; } catch {}
    }
    // else try names.json, else defaults
    fetch('names.json', {cache: 'no-store'})
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(arr => setNames(Array.isArray(arr) ? arr : []))
      .catch(() => setNames(['Alice', 'Bob', 'Charlie', 'Dina', 'Ed', 'Fiona']));

    drawWheel();
  })();
})();
