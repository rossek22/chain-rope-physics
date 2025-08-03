# Physics Rope & Chain Simulation / Симуляция верёвки и цепи

## Description / Описание

This project is a simple physics simulation of a rope and a chain using HTML5 Canvas and JavaScript.  
You can switch between rope and chain modes by pressing **R** or **C** keys.  
Drag points with the mouse to interact. Increase or decrease segments with **+** and **-** keys.

Простой физический симулятор верёвки и цепи на HTML5 Canvas и JavaScript.  
Переключайтесь между режимами верёвки и цепи клавишами **R** и **C**.  
Перетаскивайте точки мышью для взаимодействия. Увеличивайте и уменьшайте количество сегментов клавишами **+** и **-**.

---

## How it works / Как это работает

The simulation is based on Verlet integration physics to model flexible ropes and chains.  
Instead of tracking velocity explicitly, Verlet integration uses the current and previous positions of points to estimate velocity implicitly.

Симуляция основана на физике с использованием интеграции Верле для моделирования гибких верёвок и цепей.  
Вместо явного отслеживания скорости, интеграция Верле использует текущие и предыдущие позиции точек для неявного вычисления скорости.

### Key Steps / Основные шаги:

1. **Point movement (Verlet integration):**  
   Each point stores its current position `(x, y)` and its previous position `(oldx, oldy)`.  
   Velocity is approximated as `(x - oldx, y - oldy)`.  
   The new position is updated by adding velocity and external forces like gravity:
```

vx = (x - oldx) \* friction
vy = (y - oldy) \* friction

oldx = x
oldy = y

x = x + vx
y = y + vy + gravity

```
This models inertia and gravity with friction slowing the motion over time.

2. **Constraints (sticks length):**
Points are connected by "sticks" that enforce a fixed length between two points.
For each stick, calculate the distance between points, then adjust the points' positions to maintain the stick length:
```

dx = p1.x - p0.x
dy = p1.y - p0.y
dist = sqrt(dx*dx + dy*dy)
diff = dist - stick_length
percent = diff / dist / 2

offsetX = dx \* percent
offsetY = dy \* percent

if p0 not pinned: p0.x += offsetX; p0.y += offsetY
if p1 not pinned: p1.x -= offsetX; p1.y -= offsetY

```
This ensures the rope/chain behaves like a flexible but inextensible string.

3. **Iterations:**
Multiple iterations of constraint solving per frame improve stability and realism.

---

## Features / Особенности

- Verlet integration physics for smooth rope/chain simulation
- Плавная симуляция с помощью интеграции Верле
- Chain mode draws chain links as rotated ellipses
- Режим цепи рисует звенья в виде эллипсов
- Rope mode draws simple lines
- Режим верёвки рисует простые линии
- Mouse interaction: drag points
- Взаимодействие мышью: перетаскивание точек
- Dynamic resizing of canvas on window resize
- Автоматическое изменение размера канваса при изменении окна

---

## Controls / Управление

| Key / Клавиша | Action / Действие                    |
|---------------|------------------------------------|
| R             | Switch to Rope mode / Верёвка       |
| C             | Switch to Chain mode / Цепь          |
| + / =         | Increase segment count / Увеличить количество сегментов |
| -             | Decrease segment count / Уменьшить количество сегментов |
| Mouse drag    | Drag points to interact / Перетаскивать точки мышью      |

---

## Usage / Использование

Simply open `index.html` in a modern web browser supporting Canvas.
Просто откройте `index.html` в современном браузере с поддержкой Canvas.

---

## License / Лицензия

MIT License

---

## Author / Автор

Rossek2
