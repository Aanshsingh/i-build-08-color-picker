function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const num = parseInt(hex, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
 
function rgbToHex(r, g, b) {
  return (
    '#' +
    [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')
  );
}
 
function hsvToRgb(h, s, v) {
  s /= 100;
  v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}
 
// ---------- Elements ----------
const colorBox = document.querySelector('.colorBox');
const opacityContainer = document.querySelector('.opacitySlider');
const opacityPercentage = document.querySelector('.opacityPercentage');
const colorSelected = document.querySelector('.colorselected');
const colorsRow = document.querySelector('.colors');
const eyeDrop = document.querySelector('.eyeDrop');
 
// ---------- State ----------
let currentHex = '#0a84ff';
let currentOpacity = 100;
 
// ---------- Build opacity slider (input + fill overlay) ----------
const opacityFill = document.createElement('div');
opacityFill.className = 'fill-overlay';
opacityContainer.appendChild(opacityFill);
 
const opacityInput = document.createElement('input');
opacityInput.type = 'range';
opacityInput.min = 0;
opacityInput.max = 100;
opacityInput.value = 100;
opacityContainer.appendChild(opacityInput);
 
opacityPercentage.textContent = '100%';
 
// ---------- Build current swatch fill ----------
const currentFill = document.createElement('div');
currentFill.className = 'fill';
colorSelected.appendChild(currentFill);
 
function updateCurrentDisplay() {
  const rgb = hexToRgb(currentHex);
  currentFill.style.background = `rgba(${rgb.r},${rgb.g},${rgb.b},${currentOpacity / 100})`;
  opacityFill.style.background = `linear-gradient(to right, rgba(${rgb.r},${rgb.g},${rgb.b},0), rgba(${rgb.r},${rgb.g},${rgb.b},1))`;
}
 
function setColor(hex, { fromSaved = false } = {}) {
  currentHex = hex;
  updateCurrentDisplay();
  document.querySelectorAll('.saved-swatch:not(.add-btn)').forEach((el) => {
    el.classList.toggle('selected', fromSaved && el.dataset.color === hex);
  });
  if (!fromSaved) {
    document.querySelectorAll('.swatch-cell').forEach((c) => {
      c.classList.toggle('selected', c.dataset.color === hex);
    });
  }
}
 
// ---------- Build grid palette inside .colorBox ----------
const rows = 9;
const cols = 12;
const gridCells = [];
 
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const cell = document.createElement('div');
    cell.className = 'swatch-cell';
    let hex;
    if (r === 0) {
      const t = c / (cols - 1);
      const v = Math.round(255 * (1 - t));
      hex = rgbToHex(v, v, v);
    } else {
      const hue = (c / cols) * 360;
      const rowT = (r - 1) / (rows - 2);
      let s, v;
      if (rowT < 0.5) {
        s = 90;
        v = 40 + rowT * 2 * 60;
      } else {
        v = 100;
        s = 90 - (rowT - 0.5) * 2 * 80;
      }
      const rgb = hsvToRgb(hue, s, v);
      hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    }
    cell.style.background = hex;
    cell.dataset.color = hex;
    cell.addEventListener('click', () => setColor(hex));
    colorBox.appendChild(cell);
    gridCells.push(cell);
  }
}
// preselect a blue cell similar to the reference screenshot
gridCells[Math.floor(rows / 2) * cols + 2].classList.add('selected');
 
// ---------- Saved swatches inside .colors ----------
const defaultSwatches = [
  '#0a84ff',
  '#ffffff',
  '#e0729a',
  '#3d2b8e',
  '#c9b8f5',
  '#f5a623',
  '#f0908a',
  '#f0432e',
  '#f16a5c',
];
 
function addSavedSwatch(hex, selected = false) {
  const el = document.createElement('div');
  el.className = 'saved-swatch' + (selected ? ' selected' : '');
  el.style.background = hex;
  el.dataset.color = hex;
  el.addEventListener('click', () => setColor(hex, { fromSaved: true }));
  colorsRow.insertBefore(el, addBtn);
}
 
const addBtn = document.createElement('button');
addBtn.className = 'saved-swatch add-btn';
addBtn.textContent = '+';
addBtn.setAttribute('aria-label', 'Add swatch');
colorsRow.appendChild(addBtn);
 
defaultSwatches.forEach((hex, i) => addSavedSwatch(hex, i === 0));
 
addBtn.addEventListener('click', () => {
  addSavedSwatch(currentHex);
});
 
// ---------- Opacity events ----------
opacityInput.addEventListener('input', () => {
  currentOpacity = parseInt(opacityInput.value, 10);
  opacityPercentage.textContent = currentOpacity + '%';
  updateCurrentDisplay();
});
 
// ---------- Eyedropper ----------
eyeDrop.addEventListener('click', async () => {
  if (window.EyeDropper) {
    try {
      eyeDrop.classList.add('active');
      const ed = new EyeDropper();
      const result = await ed.open();
      setColor(result.sRGBHex);
    } catch (e) {
      // cancelled
    } finally {
      eyeDrop.classList.remove('active');
    }
  } else {
    alert('Eyedropper is not supported in this browser.');
  }
});
 
// ---------- Init ----------
updateCurrentDisplay();