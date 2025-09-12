async function iniciarModoTurbo() {
    const materia = document.getElementById('turbo-materia').value;
    const dataProva = document.getElementById('turbo-data').value;
    const horas = document.getElementById('turbo-horas').value;
    const topicos = document.getElementById('turbo-topicos').value;

    if (!materia || !dataProva) {
        alert('Por favor, informe a matéria e a data da prova');
        return;
    }

    const hoje = new Date();
    const provaDate = new Date(dataProva);
    const diffTime = provaDate - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
        alert('A data da prova já passou!');
        return;
    }

    showLoading('turbo-etapas');
    document.getElementById('turbo-progresso').classList.remove('hidden');

    const prompt = `Crie um plano de estudo TURBO para ${materia} com apenas ${diffDays} dias até a prova.
    ${topicos ? `Tópicos mais importantes: ${topicos}` : ''}
    Horas disponíveis por dia: ${horas}

    O plano deve incluir:
    1. Um resumo ultra-focado com os conceitos mais importantes (máximo 500 palavras)
    2. Um quiz intensivo com as "pegadinhas" mais comuns (5 questões)
    3. Um cronograma de estudo dividido por dias/horas
    4. Técnicas de memorização acelerada
    5. Priorização do que é essencial saber

    Formato de resposta (em HTML):
    <div class="turbo-section">
        <h2>📝 Resumo Turbo</h2>
        <!-- conteúdo do resumo -->
    </div>
    <div class="turbo-section">
        <h2>📅 Cronograma de Emergência (${diffDays} dias)</h2>
        <!-- conteúdo do cronograma -->
    </div>
    <div class="turbo-section">
        <h2>⚡ Quiz Intensivo</h2>
        <!-- conteúdo do quiz -->
    </div>
    <div class="turbo-section">
        <h2>💡 Dicas Turbo</h2>
        <!-- dicas de estudo -->
    </div>

    Retorne APENAS o conteúdo em HTML, sem comentários ou observações.`;

    try {
        const turbo = await chamarIA(prompt, 4000);
        document.getElementById('turbo-etapas').innerHTML = turbo;
        document.getElementById('turbo-etapas').classList.remove('hidden');
        animateProgressBar();
        
        // Ativar modo escuro
        ativarModoEscuro(`
            <h2>Modo Turbo ⚡ - ${materia}</h2>
            <p>${diffDays} dias até a prova | ${horas} horas/dia</p>
            ${turbo}
            <div class="progress-bar">
                <div id="turbo-barra" class="progress" style="width: 100%"></div>
            </div>
        `);
    } catch (error) {
        document.getElementById('turbo-etapas').innerHTML = `<p>Erro ao iniciar modo turbo: ${error.message}</p>`;
        document.getElementById('turbo-etapas').classList.remove('hidden');
    }
}