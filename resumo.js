async function gerarResumo() {
    const materia = document.getElementById('materia').value;
    const conteudo = document.getElementById('conteudo').value;
    const pdfFile = document.getElementById('pdf-upload').files[0];

    if (!materia) {
        alert('Por favor, informe pelo menos a matéria/assunto');
        return;
    }

    showLoading('resultado');

    let prompt = `Crie um resumo detalhado e bem organizado sobre ${materia}.\n`;
    prompt += conteudo ? `Foque especialmente nos seguintes tópicos: ${conteudo}\n\n` : '\n';
    
    if (pdfFile) {
        prompt += `Inclua também informações relevantes do PDF anexado pelo usuário.\n\n`;
    }

    prompt += `O resumo deve:
    - Ser altamente informativo e preciso
    - Ter uma estrutura lógica com títulos e subtítulos
    - Incluir conceitos-chave, definições importantes e exemplos
    - Usar marcadores para listas quando apropriado
    - Ser formatado em HTML para exibição web (use tags como h2, h3, p, ul, li, strong)
    - Ter no mínimo 1000 palavras

    Retorne APENAS o conteúdo do resumo em formato HTML, sem comentários ou observações.`;

    try {
        const resumo = await chamarIA(prompt, 3000);
        const resultadoHTML = `
            ${resumo}
            <button onclick="gerarPDF('resultado')" class="pdf-button">Gerar PDF</button>
        `;
        showResult(resultadoHTML, 'resultado');
    } catch (error) {
        showResult(`<p>Erro ao gerar resumo: ${error.message}</p>`, 'resultado');
    }
}