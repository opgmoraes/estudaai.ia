let quizData = [];
let respostasUsuario = [];
let currentQuestion = 0;

async function gerarQuiz() {
    const materia = document.getElementById('quiz-materia').value;
    const conteudo = document.getElementById('quiz-conteudo').value;
    const quantidade = document.getElementById('quiz-quantidade').value;
    const dificuldade = document.getElementById('quiz-dificuldade').value;

    if (!materia) {
        alert('Por favor, informe pelo menos a matéria');
        return;
    }

    showLoading('resultado');

    const prompt = `Gere um quiz com ${quantidade} questões sobre ${materia}.
    ${conteudo ? `Foque especialmente em: ${conteudo}` : ''}
    Dificuldade: ${dificuldade}.

    Formato requerido para cada questão (em JSON):
    {
        "question": "Texto da pergunta",
        "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
        "answer": "Índice da resposta correta (0 a 3)",
        "explanation": "Explicação detalhada da resposta"
    }

    Retorne APENAS um array JSON válido com todas as questões, sem comentários ou texto adicional.`;

    try {
        const quizJSON = await chamarIA(prompt, 4000);
        
        // Limpar a string JSON para remover possíveis markdown
        const cleanJSON = quizJSON.replace(/```json/g, '').replace(/```/g, '').trim();
        
        if (!isValidJSON(cleanJSON)) {
            showResult(`<p>❌ Erro ao gerar quiz: resposta inválida da IA</p><pre>${quizJSON}</pre>`, 'resultado');
            return;
        }

        quizData = JSON.parse(cleanJSON);
        respostasUsuario = new Array(quizData.length).fill(null);
        mostrarQuestao(0);
    } catch (error) {
        showResult(`<p>Erro ao gerar quiz: ${error.message}</p>`, 'resultado');
    }
}

function mostrarQuestao(index) {
    if (index < 0 || index >= quizData.length) return;

    currentQuestion = index;
    const questao = quizData[index];

    let optionsHTML = '';
    questao.options.forEach((option, i) => {
        const selected = respostasUsuario[index] === i ? 'selected' : '';
        optionsHTML += `
            <div class="quiz-option ${selected}" onclick="selecionarResposta(${index}, ${i})">
                ${String.fromCharCode(65 + i)}. ${option}
            </div>
        `;
    });

    document.getElementById('resultado').innerHTML = `
        <div class="quiz-question">
            <h4>Questão ${index + 1} de ${quizData.length}</h4>
            <p>${questao.question}</p>
            <div class="quiz-options">${optionsHTML}</div>
        </div>

        <div class="quiz-navigation">
            ${index > 0 ? `<button onclick="mostrarQuestao(${index - 1})">Anterior</button>` : ''}
            ${index < quizData.length - 1 ? `<button onclick="mostrarQuestao(${index + 1})">Próxima</button>` : ''}
            ${index === quizData.length - 1 ? `<button onclick="finalizarQuiz()" class="secondary">Finalizar Quiz</button>` : ''}
        </div>
    `;
}

function selecionarResposta(questaoIndex, respostaIndex) {
    respostasUsuario[questaoIndex] = respostaIndex;
    mostrarQuestao(questaoIndex);
}

function finalizarQuiz() {
    let acertos = 0;
    let resultadosHTML = '';

    quizData.forEach((questao, index) => {
        const respostaUsuario = respostasUsuario[index];
        const acertou = respostaUsuario === questao.answer;

        if (acertou) acertos++;

        resultadosHTML += `
            <div class="quiz-result-item ${acertou ? 'correct' : 'incorrect'}">
                <p><strong>Questão ${index + 1}:</strong> ${questao.question}</p>
                <p>Sua resposta: ${String.fromCharCode(65 + respostaUsuario)}. ${questao.options[respostaUsuario]}</p>
                <p>Resposta correta: ${String.fromCharCode(65 + questao.answer)}. ${questao.options[questao.answer]}</p>
                <p class="explanation">Explicação: ${questao.explanation}</p>
            </div>
        `;
    });

    const porcentagem = Math.round((acertos / quizData.length) * 100);

    document.getElementById('resultado').innerHTML = `
        <div id="quiz-score">
            <h3>Resultado do Quiz</h3>
            <p>Você acertou ${acertos} de ${quizData.length} questões (${porcentagem}%)</p>
        </div>
        <div id="quiz-feedback">${resultadosHTML}</div>
        <button onclick="carregarFuncao('quiz')">Criar Novo Quiz</button>
    `;
}

function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}