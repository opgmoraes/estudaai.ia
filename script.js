const API_KEY = "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";
const API_URL = "https://api.mistral.ai/v1/chat/completions";

let currentTurboStep = 0;
const turboSteps = [];

async function chamarIA(mensagem, maxTokens = 2000) {
    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "mistral-7b-instruct",
                messages: [{ role: "user", content: mensagem }],
                max_tokens: maxTokens,
                temperature: 0.7
            })
        });

        if (!resposta.ok) {
            throw new Error(`Erro na API: ${resposta.status}`);
        }

        const dados = await resposta.json();
        return dados.choices[0].message.content;
    } catch (erro) {
        console.error("Erro:", erro);
        throw erro;
    }
}

function showLoading(elementId = 'resultado') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Processando sua solicitação...</p>
            </div>
        `;
        element.classList.remove('hidden');
    }
}

function showResult(content, elementId = 'resultado') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = content;
        element.classList.remove('hidden');
    }
}

function carregarFuncao(funcao) {
    const area = document.getElementById('area-conteudo');

    switch(funcao) {
        case 'pomodoro':
            carregarPomodoro();
            break;
        case 'resumo':
            area.innerHTML = `
                <h2>Gerador de Resumo</h2>
                <p>Crie resumos detalhados em segundos</p>
                <div class="form-group">
                    <label for="materia">Matéria/Assunto:</label>
                    <input type="text" id="materia" placeholder="Ex: Biologia, História, Matemática">
                </div>
                <div class="form-group">
                    <label for="conteudo">Conteúdo específico (opcional):</label>
                    <textarea id="conteudo" placeholder="Descreva os tópicos que deseja incluir"></textarea>
                </div>
                <div class="form-group">
                    <label for="pdf-upload">Importar PDF (opcional):</label>
                    <input type="file" id="pdf-upload" accept=".pdf">
                </div>
                <button onclick="gerarResumo()">Gerar Resumo</button>
                <div id="resultado" class="resultado hidden"></div>
            `;
            break;

        case 'planejamento':
            area.innerHTML = `
                <h2>Criar Planejamento de Estudos</h2>
                <p>Receba um plano de estudos otimizado</p>
                <div class="form-group">
                    <label for="plano-materias">Matérias:</label>
                    <textarea id="plano-materias" placeholder="Liste as matérias que precisa estudar"></textarea>
                </div>
                <div class="form-group">
                    <label for="plano-conteudo">Conteúdo específico (opcional):</label>
                    <textarea id="plano-conteudo" placeholder="Tópicos que deseja focar"></textarea>
                </div>
                <div class="form-group">
                    <label for="plano-tipo">Tipo de prova:</label>
                    <select id="plano-tipo">
                        <option value="Vestibular">Vestibular</option>
                        <option value="ENEM">ENEM</option>
                        <option value="Concurso">Concurso</option>
                        <option value="Prova semestral">Prova semestral</option>
                        <option value="Outro">Outro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="plano-tempo">Horas disponíveis por dia:</label>
                    <input type="number" id="plano-tempo" min="1" max="12" value="2">
                </div>
                <div class="form-group">
                    <label for="plano-dias">Dias até a prova:</label>
                    <input type="number" id="plano-dias" min="1" value="7">
                </div>
                <div class="form-group">
                    <label for="plano-data">Data da prova:</label>
                    <input type="date" id="plano-data">
                </div>
                <button onclick="gerarPlano()">Criar Planejamento</button>
                <div id="resultado" class="resultado hidden"></div>
            `;
            break;

        case 'quiz':
            area.innerHTML = `
                <h2>Gerador de Quiz</h2>
                <p>Teste seu conhecimento</p>
                <div class="form-group">
                    <label for="quiz-materia">Matéria:</label>
                    <input type="text" id="quiz-materia" placeholder="Ex: Matemática, História">
                </div>
                <div class="form-group">
                    <label for="quiz-conteudo">Conteúdo específico (opcional):</label>
                    <textarea id="quiz-conteudo" placeholder="Descreva os tópicos que deseja incluir no quiz"></textarea>
                </div>
                <div class="form-group">
                    <label for="quiz-quantidade">Quantidade de questões:</label>
                    <select id="quiz-quantidade">
                        <option value="10">10 questões</option>
                        <option value="20">20 questões</option>
                        <option value="50">50 questões</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="quiz-dificuldade">Dificuldade:</label>
                    <select id="quiz-dificuldade">
                        <option value="fácil">Fácil</option>
                        <option value="média" selected>Média</option>
                        <option value="difícil">Difícil</option>
                    </select>
                </div>
                <button onclick="gerarQuiz()">Gerar Quiz</button>
                <div id="resultado" class="resultado hidden"></div>
            `;
            break;

        case 'turbo':
            area.innerHTML = `
                <h2>Modo Turbo ⚡</h2>
                <p>Estudo de emergência para provas próximas</p>
                <div class="form-group">
                    <label for="turbo-materia">Matéria Principal:</label>
                    <input type="text" id="turbo-materia" placeholder="Matéria que mais precisa estudar">
                </div>
                <div class="form-group">
                    <label for="turbo-data">Data da Prova:</label>
                    <input type="date" id="turbo-data">
                </div>
                <div class="form-group">
                    <label for="turbo-horas">Horas disponíveis por dia:</label>
                    <input type="number" id="turbo-horas" min="1" max="12" value="2">
                </div>
                <div class="form-group">
                    <label for="turbo-topicos">Tópicos mais importantes (opcional):</label>
                    <textarea id="turbo-topicos" placeholder="Quais tópicos são mais importantes?"></textarea>
                </div>
                <button onclick="iniciarModoTurbo()">Iniciar Modo Turbo</button>
                <div id="turbo-progresso" class="hidden">
                    <div class="progress-bar">
                        <div id="turbo-barra" class="progress"></div>
                    </div>
                </div>
                <div id="turbo-etapas" class="resultado hidden"></div>
            `;
            break;

        default:
            area.innerHTML = `
                <div class="mensagem-inicial">
                    <h2>Bem-vindo ao Estuda AÍ!</h2>
                    <p>Selecione uma funcionalidade para começar</p>
                </div>
            `;
    }
}

function gerarPDF(elementId = 'resultado') {
    const { jsPDF } = window.jspdf;
    const element = document.getElementById(elementId);
    
    if (!element) {
        alert('Nada para gerar PDF');
        return;
    }

    showLoading(elementId);
    
    html2canvas(element).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('resumo-estuda-ai.pdf');
        showResult(element.innerHTML, elementId);
    });
}

function animateProgressBar(duration = 2000) {
    let progress = 0;
    const barra = document.getElementById('turbo-barra');
    const increment = 100 / (duration / 50);
    const interval = setInterval(() => {
        progress += increment;
        barra.style.width = `${Math.min(progress, 100)}%`;
        if (progress >= 100) clearInterval(interval);
    }, 50);
}

function ativarModoEscuro(conteudo) {
    document.body.innerHTML = `
        <div class="turbo-mode">
            <div class="turbo-content">
                ${conteudo}
                <button onclick="sairModoTurbo()">Sair do Modo Turbo</button>
            </div>
        </div>
    `;
}

function sairModoTurbo() {
    document.location.reload();
}

// AUTENTICAÇÃO
function mostrarTela(tela) {
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("cadastro-form").classList.add("hidden");
  document.getElementById("recuperar-form").classList.add("hidden");

  if (tela === "cadastro") document.getElementById("cadastro-form").classList.remove("hidden");
  else if (tela === "recuperar") document.getElementById("recuperar-form").classList.remove("hidden");
  else document.getElementById("login-form").classList.remove("hidden");
}

function fazerLogin() {
  const email = document.getElementById("login-email").value;
  const senha = document.getElementById("login-senha").value;

  const dados = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuario = dados.find(u => u.email === email && u.senha === senha);

  if (usuario) {
    document.getElementById("login-area").classList.add("hidden");
    document.getElementById("home-area").classList.remove("hidden");
  } else {
    alert("Email ou senha incorretos");
  }
}

function cadastrarUsuario() {
  const nome = document.getElementById("cadastro-nome").value;
  const email = document.getElementById("cadastro-email").value;
  const nascimento = document.getElementById("cadastro-nascimento").value;
  const senha = document.getElementById("cadastro-senha").value;

  if (!nome || !email || !nascimento || !senha) {
    alert("Preencha todos os campos");
    return;
  }

  const dados = JSON.parse(localStorage.getItem("usuarios")) || [];
  if (dados.some(u => u.email === email)) {
    alert("Email já cadastrado");
    return;
  }

  dados.push({ nome, email, nascimento, senha });
  localStorage.setItem("usuarios", JSON.stringify(dados));
  alert("Cadastro realizado com sucesso!");
  mostrarTela("login");
}

function recuperarSenha() {
  const email = document.getElementById("recuperar-email").value;
  const nascimento = document.getElementById("recuperar-nascimento").value;

  const dados = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuario = dados.find(u => u.email === email && u.nascimento === nascimento);

  if (usuario) {
    alert(`Sua senha é: ${usuario.senha}`);
  } else {
    alert("Dados não encontrados");
  }
}

// TEMA ESCURO
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  updateDarkModeButton();
}

function updateDarkModeButton() {
  const darkMode = localStorage.getItem('darkMode') === 'true';
  const toggleBtn = document.querySelector('.toggle-dark-mode');
  if (toggleBtn) {
    toggleBtn.innerHTML = darkMode ? '☀️' : '🌙';
    toggleBtn.style.backgroundColor = darkMode ? 'var(--secondary)' : 'var(--accent)';
    toggleBtn.style.color = darkMode ? 'white' : 'var(--secondary)';
  }
}

// Inicialização do tema
document.addEventListener('DOMContentLoaded', function() {
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }
  
  if (!document.querySelector('.toggle-dark-mode')) {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-dark-mode';
    toggleBtn.title = 'Alternar tema';
    toggleBtn.onclick = toggleDarkMode;
    document.body.appendChild(toggleBtn);
    updateDarkModeButton();
  }
});