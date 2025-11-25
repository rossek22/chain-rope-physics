// Получаем canvas и 2D-контекст
// Get canvas and 2D drawing context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

// Физические параметры:
// gravity — сила гравитации (Gravity force)
// friction — трение, замедляет движение (Friction to slow movement)
// constraintIterations — число итераций фиксации расстояния (Number of constraint iterations)
const gravity = 0.5;
const friction = 0.98;
const constraintIterations = 30;

// Расстояние между точками и количество сегментов
// Spacing between points and number of segments
let spacing = 25;
let segmentCount = 30;
let isChain = false; // Режим: false = верёвка, true = цепь
// Mode: false = rope, true = chain

// Класс точки — узел в нашей верёвке или цепи
// Point class — a node in the rope or chain
class Point {
  constructor(x, y, pinned = false) {
    this.x = x;
    this.y = y;
    this.oldx = x; // Для вычисления скорости — предыдущая позиция
    this.oldy = y;
    this.pinned = pinned; // Закреплена ли точка (не двигается)
  }

  update() {
    if (this.pinned) return; // Закреплённые точки не двигаются
    // Вычисляем скорость по разнице с предыдущей позицией и применяем трение
    let vx = (this.x - this.oldx) * friction;
    let vy = (this.y - this.oldy) * friction;

    this.oldx = this.x;
    this.oldy = this.y;
    // Обновляем позицию с учетом скорости и гравитации
    this.x += vx;
    this.y += vy + gravity;
  }

  constrain() {
    // Ограничиваем точку в пределах canvas
    this.x = Math.max(0, Math.min(canvas.width, this.x));
    this.y = Math.max(0, Math.min(canvas.height, this.y));
  }
}

// Класс связи между двумя точками (стик)
// Stick class connecting two points
class Stick {
  constructor(p0, p1) {
    this.p0 = p0;
    this.p1 = p1;
    this.length = spacing; // Длина связки должна быть постоянной
  }

  update() {
    // Рассчитываем текущее расстояние между точками
    let dx = this.p1.x - this.p0.x;
    let dy = this.p1.y - this.p0.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    let diff = dist - this.length;
    let percent = diff / dist / 2;

    let offsetX = dx * percent;
    let offsetY = dy * percent;

    // Сдвигаем точки для сохранения длины стека, если они не закреплены
    if (!this.p0.pinned) {
      this.p0.x += offsetX;
      this.p0.y += offsetY;
    }
    if (!this.p1.pinned) {
      this.p1.x -= offsetX;
      this.p1.y -= offsetY;
    }
  }

  draw() {
    if (isChain) {
      // Рисуем цепь: звенья — эллипсы, повернутые по направлению
      ctx.save();
      const dx = this.p1.x - this.p0.x;
      const dy = this.p1.y - this.p0.y;
      const angle = Math.atan2(dy, dx);
      ctx.translate(this.p0.x, this.p0.y);
      ctx.rotate(angle);
      ctx.strokeStyle = "#777";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(spacing / 2, 0, spacing / 2.2, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else {
      // Рисуем верёвку — простая линия между точками
      ctx.strokeStyle = "#fa0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.p0.x, this.p0.y);
      ctx.lineTo(this.p1.x, this.p1.y);
      ctx.stroke();
    }
  }
}

let points = [],
  sticks = [];

// Создаем структуру верёвки или цепи
// Create rope or chain structure
function createRopeOrChain() {
  points = [];
  sticks = [];
  const usedSpacing = isChain ? 18 : 25; // Для цепи — более плотные звенья
  spacing = usedSpacing;

  for (let i = 0; i < segmentCount; i++) {
    const pinned = i === 0; // Закрепляем первый узел
    const p = new Point(300, 100 + i * spacing, pinned);
    points.push(p);
    if (i > 0) sticks.push(new Stick(points[i - 1], p));
  }
}

// Обновление отображаемого режима (rope / chain)
// Update displayed mode text
function updateModeText() {
  document.getElementById("mode").textContent = isChain ? "Chain" : "Rope";
}

// Инициализация
createRopeOrChain();
updateModeText();

let selected = null; // Текущая выбранная точка для перетаскивания
let isDragging = false;

// Обработка начала перетаскивания мышью
// Mouse down event - start dragging point if close
canvas.addEventListener("mousedown", (e) => {
  const mx = e.clientX,
    my = e.clientY;
  for (const p of points) {
    const dx = p.x - mx,
      dy = p.y - my;
    // Проверяем, находится ли мышь близко к точке (радиус ~20px)
    if (dx * dx + dy * dy < 400) {
      selected = p;
      selected.oldx = mx;
      selected.oldy = my;
      selected.x = mx;
      selected.y = my;
      isDragging = true;
      break;
    }
  }
});

// Обработка движения мыши - перетаскиваем выбранную точку
// Mouse move event - drag selected point
canvas.addEventListener("mousemove", (e) => {
  if (isDragging && selected) {
    selected.x = e.clientX;
    selected.y = e.clientY;
    selected.oldx = e.clientX;
    selected.oldy = e.clientY;
  }
});

// Обработка отпускания кнопки мыши или ухода курсора с canvas
// Mouse up or leave - stop dragging
["mouseup", "mouseleave"].forEach((evt) =>
  canvas.addEventListener(evt, () => {
    selected = null;
    isDragging = false;
  })
);

// Обработка клавиш:
// R - веревка, C - цепь, + / = - добавить сегменты, - - убрать сегменты
window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (key === "r") {
    isChain = false;
    createRopeOrChain();
    updateModeText();
  } else if (key === "c") {
    isChain = true;
    createRopeOrChain();
    updateModeText();
  } else if (key === "+" || key === "=") {
    segmentCount += 5;
    createRopeOrChain();
  } else if (key === "-") {
    segmentCount = Math.max(5, segmentCount - 5);
    createRopeOrChain();
  }
});

// ------------------------- ВЕТЕР -------------------------
// Wind source variables
let windActive = false;
let windX = 0;
let windY = 0;
let windStrength = 1;

// Tooltip для силы ветра
const tooltip = document.createElement("div");
tooltip.style.position = "fixed";
tooltip.style.bottom = "20px";
tooltip.style.left = "50%";
tooltip.style.transform = "translateX(-50%)";
tooltip.style.background = "rgba(0,0,0,0.7)";
tooltip.style.color = "#fff";
tooltip.style.padding = "6px 12px";
tooltip.style.borderRadius = "6px";
tooltip.style.fontFamily = "sans-serif";
tooltip.style.fontSize = "14px";
tooltip.style.display = "none";
document.body.appendChild(tooltip);

let tooltipTimeout = null;
function showTooltip(text) {
  tooltip.textContent = text;
  tooltip.style.display = "block";
  if (tooltipTimeout) clearTimeout(tooltipTimeout);
  tooltipTimeout = setTimeout(() => {
    tooltip.style.display = "none";
  }, 2000);
}

// Активация/деактивация источника ветра
canvas.addEventListener("mousedown", (e) => {
  if (e.target === canvas && !isDragging) {
    windActive = true;
    windX = e.clientX;
    windY = e.clientY;
  }
});

canvas.addEventListener("mouseup", () => {
  windActive = false;
});

// Двигаем источник вместе с мышью
canvas.addEventListener("mousemove", (e) => {
  if (windActive) {
    windX = e.clientX;
    windY = e.clientY;
  }
});

// Меняем силу колёсиком
window.addEventListener("wheel", (e) => {
  if (windActive) {
    windStrength += e.deltaY * -0.01;
    if (windStrength < 0.1) windStrength = 0.1;
    if (windStrength > 5) windStrength = 5;
    showTooltip("Wind strength: " + windStrength.toFixed(2));
  }
});

// ------------------- АННИМАЦИЯ ВЕТРА --------------------
// helper: находим ближайшую точку веревки к позиции (x,y)
function findNearestPoint(x, y) {
  if (!points.length) return null;
  let nearest = points[0];
  let minSq = (points[0].x - x) ** 2 + (points[0].y - y) ** 2;
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    const sq = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (sq < minSq) {
      minSq = sq;
      nearest = p;
    }
  }
  return nearest;
}

// класс частицы-линиии ветра (как на скрине — капсулы)
class WindParticle {
  constructor(x, y, angle, speed, width, height) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.angle = angle;
    this.life = 1; // от 1 до 0
    this.width = width;
    this.height = height;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    // плавное уменьшение жизни, зависящее от скорости (чтобы быстрее летящие исчезали чуть быстрее)
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    this.life -= 0.01 + Math.min(0.03, speed * 0.005);
    // если частица дошла близко до верёвки — сразу гасим
    const nearest = findNearestPoint(this.x, this.y);
    if (nearest) {
      const dx = nearest.x - this.x;
      const dy = nearest.y - this.y;
      if (dx * dx + dy * dy < 100) {
        // внутри ~10px
        this.life = 0;
      }
    }
  }

  // рисуем как капсулу, выровненную по движению, с радиусом высоты/2
  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.globalAlpha = Math.max(0, this.life);
    const w = this.width;
    const h = this.height;
    const r = h / 2;
    ctx.beginPath();
    // левый полукруг
    ctx.moveTo(-w / 2 + r, -h / 2);
    ctx.arc(-w / 2 + r, 0, r, -Math.PI / 2, Math.PI / 2);
    // верх линия
    ctx.lineTo(w / 2 - r, h / 2);
    // правый полукруг
    ctx.arc(w / 2 - r, 0, r, Math.PI / 2, (3 * Math.PI) / 2);
    // ниж линия
    ctx.closePath();
    // заливка светло-серой, как на скрине
    ctx.fillStyle = "rgba(170,170,170,0.95)";
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

let windParticles = [];

// применяем ветер: физика + спавн частиц (они направлены на верёвку и не разлетаются)
function applyWind() {
  if (!windActive) return;

  // --- 1) физика верёвки ---
  for (const p of points) {
    if (p.pinned) continue;

    const dx = p.x - windX;
    const dy = p.y - windY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 300) {
      const force = (1 - dist / 300) * windStrength;
      const angle = Math.atan2(dy, dx);

      p.oldx -= Math.cos(angle) * force;
      p.oldy -= Math.sin(angle) * force;
    }
  }

  // --- 2) визуализация потока ---
  const nearestTarget = findNearestPoint(windX, windY);
  const targetX = nearestTarget ? nearestTarget.x : windX;
  const targetY = nearestTarget ? nearestTarget.y : windY + 100;
  const angToTarget = Math.atan2(targetY - windY, targetX - windX);

  // количество полос зависит от силы
  const bandCount = Math.min(7, Math.max(3, Math.round(3 + windStrength * 2)));
  const spacing = 14; // расстояние между параллельными полосками
  const baseSpeed = 1.5 + windStrength * 0.6;

  for (
    let i = -Math.floor(bandCount / 2);
    i <= Math.floor(bandCount / 2);
    i++
  ) {
    // стартовая позиция — чуть смещена перпендикулярно направлению ветра
    const offsetX = Math.cos(angToTarget + Math.PI / 2) * i * spacing;
    const offsetY = Math.sin(angToTarget + Math.PI / 2) * i * spacing;
    const sx = windX + offsetX;
    const sy = windY + offsetY;

    // ширина/высота как на скрине: узкие прямоугольники
    const width = 50 + Math.random() * 40;
    const height = 5;

    const particle = new WindParticle(
      sx,
      sy,
      angToTarget,
      baseSpeed + Math.random() * 0.8,
      width,
      height
    );

    windParticles.push(particle);
  }
}

// --------------------------------------------------------

// Главный цикл анимации
// Main animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Обновляем положение всех точек
  for (const p of points) p.update();

  // Несколько итераций фиксации длины связей
  for (let i = 0; i < constraintIterations; i++) {
    for (const s of sticks) s.update();
    for (const p of points) p.constrain();
  }

  // Рисуем все связи
  for (const s of sticks) s.draw();

  // Применяем ветер (физика + спавн направленных частиц)
  applyWind();

  // Обновляем и рисуем частицы: они летят в сторону верёвки, не разлетаются
  for (let i = windParticles.length - 1; i >= 0; i--) {
    const wp = windParticles[i];
    wp.update();
    wp.draw(ctx);
    if (wp.life <= 0) windParticles.splice(i, 1);
  }

  requestAnimationFrame(animate);
}

let lastScreenX = window.screenX;
let lastScreenY = window.screenY;
let lastTime = performance.now();

function applyWindowInertia() {
  const now = performance.now();
  const dt = (now - lastTime) / 16.7; // нормализация к 60fps

  const dx = window.screenX - lastScreenX;
  const dy = window.screenY - lastScreenY;

  if (dx !== 0 || dy !== 0) {
    // скорость движения окна
    let vx = dx / dt;
    let vy = dy / dt;

    // коэффициент силы (уменьшаем влияние)
    const inertiaFactor = 0.03; // сила инерции
    vx *= inertiaFactor;
    vy *= inertiaFactor;

    // ограничение максимального импульса
    const maxImpulse = 15;
    if (vx > maxImpulse) vx = maxImpulse;
    if (vx < -maxImpulse) vx = -maxImpulse;
    if (vy > maxImpulse) vy = maxImpulse;
    if (vy < -maxImpulse) vy = -maxImpulse;

    // даём противоположный импульс (через oldx/oldy)
    for (const p of points) {
      if (p.pinned) continue;
      p.oldx += vx;
      p.oldy += vy;
    }
  }

  lastScreenX = window.screenX;
  lastScreenY = window.screenY;
  lastTime = now;

  requestAnimationFrame(applyWindowInertia);
}

applyWindowInertia();

animate();

// Обновляем размеры canvas при изменении окна
// Update canvas size on window resize
window.addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});
