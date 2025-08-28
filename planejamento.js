async function gerarPlano() {
    const materias = document.getElementById('plano-materias').value;
    const conteudo = document.getElementById('plano-conteudo').value;
    const tipo = document.getElementById('plano-tipo').value;
    const horas = document.getElementById('plano-tempo').value;
    const dias = document.getElementById('plano-dias').value;
    const dataProva = document.getElementById('plano-data').value;

    if (!materias) {
        alert('Por favor, informe pelo menos as matérias');
        return;
    }

    showLoading('resultado');

    const prompt = `Crie um plano de estudos detalhado com as seguintes características:
    - Matérias: ${materias}
    ${conteudo ? `- Tópicos específicos: ${conteudo}` : ''}
    - Tipo de prova: ${tipo}
    - Tempo disponível: ${horas} horas por dia, ${dias} dias
    ${dataProva ? `- Data da prova: ${dataProva}` : ''}

    O plano deve:
    1. Dividir o tempo disponível de forma estratégica entre as matérias
    2. Priorizar conteúdos mais importantes para o tipo de prova
    3. Incluir períodos de revisão
    4. Sugerir técnicas de estudo adequadas
    5. Ter uma estrutura semanal clara
    6. Incluir metas diárias e semanais
    7. Ser formatado em HTML para exibição web (use tags como h2, h3, p, ul, li)

    Retorne APENAS o conteúdo do plano em HTML, sem comentários ou observações.`;

    try {
        const planejamento = await chamarIA(prompt, 3000);
        const resultadoHTML = `
            ${planejamento}
            <button onclick="gerarPDF('resultado')" class="pdf-button">Gerar PDF</button>
        `;
        showResult(resultadoHTML, 'resultado');
    } catch (error) {
        showResult(`<p>Erro ao gerar planejamento: ${error.message}</p>`, 'resultado');
    }
}