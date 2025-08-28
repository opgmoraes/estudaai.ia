let pomodoroInterval;
let tempoDecorrido = 0;
let timerAtivo = false;
let modoAtual = 'pomodoro'; // 'pomodoro', 'shortBreak', 'longBreak'
let contadorPomodoros = 0;
const localKey = "tempoPomodoro";

const modos = {
  pomodoro: {
    nome: 'Trabalho',
    tempo: 25 * 60,
    cor: 'var(--primary)'
  },
  shortBreak: {
    nome: 'Descanso',
    tempo: 5 * 60,
    cor: 'var(--success)'
  },
  longBreak: {
    nome: 'Descanso Longo',
    tempo: 15 * 60,
    cor: 'var(--accent)'
  }
};

function formatarTempo(segundos) {
  const m = String(Math.floor(segundos / 60)).padStart(2, '0');
  const s = String(segundos % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function atualizarDisplay() {
  const tempoRestante = modos[modoAtual].tempo - tempoDecorrido;
  document.getElementById('pomodoro-timer').textContent = formatarTempo(tempoRestante);
  
  // Atualizar mini timer
  const miniTimer = document.getElementById('mini-timer');
  if (miniTimer) miniTimer.textContent = formatarTempo(tempoRestante);
  
  // Atualizar progresso
  const progresso = (tempoDecorrido / modos[modoAtual].tempo) * 100;
  document.querySelector('.pomodoro-progress-fill').style.width = `${progresso}%`;
  document.querySelector('.pomodoro-progress-fill').style.backgroundColor = modos[modoAtual].cor;
  
  // Atualizar stats
  document.getElementById('pomodoro-count').textContent = contadorPomodoros;
  document.getElementById('short-break-count').textContent = localStorage.getItem('shortBreaks') || 0;
  document.getElementById('long-break-count').textContent = localStorage.getItem('longBreaks') || 0;
}

function alternarPomodoro() {
  if (timerAtivo) {
    clearInterval(pomodoroInterval);
    document.getElementById('playPause').textContent = '▶';
    if (document.getElementById('mini-playPause')) {
      document.getElementById('mini-playPause').textContent = '▶';
    }
  } else {
    document.getElementById('playPause').textContent = '⏸';
    if (document.getElementById('mini-playPause')) {
      document.getElementById('mini-playPause').textContent = '⏸';
    }
    pomodoroInterval = setInterval(() => {
      tempoDecorrido++;
      atualizarDisplay();
      
      // Verificar se o tempo acabou
      if (tempoDecorrido >= modos[modoAtual].tempo) {
        clearInterval(pomodoroInterval);
        timerAtivo = false;
        
        // Atualizar contadores
        if (modoAtual === 'pomodoro') {
          contadorPomodoros++;
          localStorage.setItem('pomodoros', contadorPomodoros);
          
          // A cada 4 pomodoros, sugerir descanso longo
          if (contadorPomodoros % 4 === 0) {
            alert('Hora de um descanso longo!');
            selecionarModo('longBreak');
          } else {
            alert('Hora de um descanso curto!');
            selecionarModo('shortBreak');
          }
        } else {
          if (modoAtual === 'shortBreak') {
            const shortBreaks = parseInt(localStorage.getItem('shortBreaks') || 0) + 1;
            localStorage.setItem('shortBreaks', shortBreaks);
          } else {
            const longBreaks = parseInt(localStorage.getItem('longBreaks') || 0) + 1;
            localStorage.setItem('longBreaks', longBreaks);
          }
        }
        
        resetarPomodoro();
      }
    }, 1000);
  }
  timerAtivo = !timerAtivo;
}

function resetarPomodoro() {
  clearInterval(pomodoroInterval);
  tempoDecorrido = 0;
  timerAtivo = false;
  document.getElementById('playPause').textContent = '▶';
  if (document.getElementById('mini-playPause')) {
    document.getElementById('mini-playPause').textContent = '▶';
  }
  atualizarDisplay();
}

function selecionarModo(modo) {
  modoAtual = modo;
  resetarPomodoro();
  
  // Atualizar botões de modo
  document.querySelectorAll('.pomodoro-mode').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.modo === modo) {
      btn.classList.add('active');
    }
  });
  
  // Atualizar cor do timer
  document.getElementById('pomodoro-timer').style.color = modos[modo].cor;
}

function iniciarModoPomodoro() {
  contadorPomodoros = parseInt(localStorage.getItem('pomodoros') || 0);
  
  const area = document.getElementById('area-conteudo');
  area.innerHTML = `
    <div class="pomodoro-fullscreen">
      <div class="pomodoro-container">
        <div class="pomodoro-header">
          <h2>Pomodoro 🍅</h2>
          <button class="pomodoro-close" onclick="carregarFuncao('voltar')">×</button>
        </div>
        
        <div class="pomodoro-modes">
          <button class="pomodoro-mode active" data-modo="pomodoro" onclick="selecionarModo('pomodoro')">Trabalho</button>
          <button class="pomodoro-mode" data-modo="shortBreak" onclick="selecionarModo('shortBreak')">Descanso</button>
          <button class="pomodoro-mode" data-modo="longBreak" onclick="selecionarModo('longBreak')">Descanso Longo</button>
        </div>
        
        <div id="pomodoro-timer" style="color: ${modos.pomodoro.cor}">25:00</div>
        
        <div class="pomodoro-progress">
          <div class="pomodoro-progress-bar">
            <div class="pomodoro-progress-fill"></div>
          </div>
        </div>
        
        <div class="pomodoro-botoes">
          <button id="playPause" onclick="alternarPomodoro()">▶</button>
          <button onclick="resetarPomodoro()">⟳</button>
        </div>
        
        <div class="pomodoro-stats">
          <div class="pomodoro-stat">
            <div>Pomodoros</div>
            <div class="pomodoro-stat-value" id="pomodoro-count">0</div>
          </div>
          <div class="pomodoro-stat">
            <div>Descansos</div>
            <div class="pomodoro-stat-value" id="short-break-count">0</div>
          </div>
          <div class="pomodoro-stat">
            <div>Descansos Longos</div>
            <div class="pomodoro-stat-value" id="long-break-count">0</div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  selecionarModo('pomodoro');
  iniciarMiniPomodoro();
}

function toggleMiniCard() {
  const miniCard = document.getElementById('mini-card');
  if (miniCard.style.display === 'block') {
    miniCard.style.display = 'none';
  } else {
    miniCard.style.display = 'block';
  }
}

function iniciarMiniPomodoro() {
  if (document.getElementById("mini-pomodoro")) return;
  
  const mini = document.createElement("div");
  mini.id = "mini-pomodoro";
  mini.innerHTML = `
    <div id="mini-tomato" onclick="toggleMiniCard()">🍅</div>
    <div id="mini-card">
      <div id="mini-timer">25:00</div>
      <button id="mini-playPause" onclick="alternarPomodoro()">▶</button>
      <button onclick="resetarPomodoro()">⟳</button>
      <button onclick="iniciarModoPomodoro()">Abrir Completo</button>
    </div>
  `;
  document.body.appendChild(mini);
}

function carregarPomodoro() {
  iniciarModoPomodoro();
} 