const sessionTypes = {
  focus: { label: 'Focus', duration: 25 * 60, color: '#7f9dff', accent: '#54ceff' },
  shortBreak: { label: 'Short Break', duration: 5 * 60, color: '#7de4c8', accent: '#44d4b3' },
  longBreak: { label: 'Long Break', duration: 15 * 60, color: '#ffb46f', accent: '#ff9362' },
};

const progressCircle = document.getElementById('progressCircle');
const sessionType = document.getElementById('sessionType');
const sessionLabel = document.getElementById('sessionLabel');
const timeLabel = document.getElementById('timeLabel');
const startPauseBtn = document.getElementById('startPauseBtn');
const resetBtn = document.getElementById('resetBtn');
const presetButtons = document.querySelectorAll('.preset-btn');

const radius = 110;
const circumference = 2 * Math.PI * radius;
progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = `${circumference}`;

let activeMode = 'focus';
let remainingSeconds = sessionTypes[activeMode].duration;
let timer = null;
let isRunning = false;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function updateUI() {
  const session = sessionTypes[activeMode];
  const progress = remainingSeconds / session.duration;
  const offset = circumference * (1 - progress);
  progressCircle.style.strokeDashoffset = `${offset}`;
  document.documentElement.style.setProperty('--focus', session.color);
  document.documentElement.style.setProperty('--ring-gradient-start', session.accent);
  document.documentElement.style.setProperty('--ring-gradient-end', session.color);
  sessionType.textContent = `${session.label} Session`;
  sessionLabel.textContent = session.label;
  timeLabel.textContent = formatTime(remainingSeconds);
  startPauseBtn.textContent = isRunning ? 'Pause' : 'Start';

  document.body.style.background = `radial-gradient(circle at top left, ${hexToRgba(session.color, 0.14)}, transparent 20%),
    radial-gradient(circle at bottom right, ${hexToRgba(session.accent, 0.12)}, transparent 18%),
    linear-gradient(180deg, #0b1222 0%, #090f1e 46%, #0c1630 100%)`;
}

function hexToRgba(hex, alpha) {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function playChime() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = 520;
  gain.gain.value = 0.0001;
  gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.38);

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.4);
}

function switchMode(mode) {
  activeMode = mode;
  remainingSeconds = sessionTypes[mode].duration;
  presetButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === mode);
  });
  if (isRunning) {
    clearInterval(timer);
    isRunning = false;
  }
  updateUI();
}

function tick() {
  if (remainingSeconds <= 0) {
    clearInterval(timer);
    isRunning = false;
    playChime();
    startPauseBtn.textContent = 'Start';
    return;
  }
  remainingSeconds -= 1;
  updateUI();
}

startPauseBtn.addEventListener('click', () => {
  if (isRunning) {
    clearInterval(timer);
    isRunning = false;
  } else {
    timer = setInterval(tick, 1000);
    isRunning = true;
  }
  updateUI();
});

resetBtn.addEventListener('click', () => {
  clearInterval(timer);
  isRunning = false;
  remainingSeconds = sessionTypes[activeMode].duration;
  updateUI();
});

presetButtons.forEach((button) => {
  button.addEventListener('click', () => switchMode(button.dataset.mode));
});

updateUI();
