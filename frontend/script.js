// Seleção de elementos DOM
const linkInput = document.getElementById('youtubeLink');
const checkButton = document.getElementById('checkButton');
const videoInfoDiv = document.getElementById('videoInfo');
const messageDiv = document.getElementById('message');
const thumbnailImg = document.getElementById('thumbnail');
const titleDiv = document.getElementById('videoTitle');
const downloadUrlInput = document.getElementById('downloadUrl');
const downloadTitleInput = document.getElementById('downloadTitle');
const downloadForm = document.getElementById('downloadForm');
const downloadButton = document.getElementById('downloadButton');
const appTitle = document.getElementById('app-title');
const appContainer = document.getElementById('app-container');

// --- Elementos do Tema ---
const themeCheckbox = document.getElementById('theme-checkbox');
const labelPink = document.getElementById('label-pink');
const labelBlue = document.getElementById('label-blue');
const defaultTheme = 'theme-pink';
const blueTheme = 'theme-blue';

// --------------------------------------------------------
// Lógica de Tema
// --------------------------------------------------------

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || defaultTheme;
    themeCheckbox.checked = savedTheme === blueTheme;
    setTheme(savedTheme);
}

function setTheme(theme) {
    document.body.classList.remove(defaultTheme, blueTheme);
    document.body.classList.add(theme);

    const isBlue = theme === blueTheme;

    appTitle.textContent = isBlue ? "Cyber Blue Downloader 🤖" : "Downloader Gliter-Pink 💖";

    labelPink.classList.toggle('active', !isBlue);
    labelBlue.classList.toggle('active', isBlue);

    localStorage.setItem('theme', theme);
}

themeCheckbox.addEventListener('change', () => {
    const newTheme = themeCheckbox.checked ? blueTheme : defaultTheme;
    setTheme(newTheme);
});

window.onload = initializeTheme;

// --------------------------------------------------------
// Lógica de UI e AJAX
// --------------------------------------------------------

/**
 * Exibe uma mensagem de status ou erro na UI.
 * @param {string} text - O texto da mensagem.
 * @param {boolean} isError - Se for true, usa o estilo de erro.
 */
function showMessage(text, isError = false) {
    messageDiv.textContent = text;
    messageDiv.className = isError ? 'error' : 'info';
    messageDiv.style.display = 'block';
}

/**
 * Reseta a interface para o estado inicial de inserção de link.
 * CORREÇÃO: Limpa os inputs ocultos do formulário de download.
 */
function resetUI() {
    // 1. Limpa o input principal
    linkInput.value = ''; 
    // 2. CORREÇÃO: Limpa os inputs ocultos para evitar download repetido
    downloadUrlInput.value = '';
    downloadTitleInput.value = '';
    // 3. Oculta a prévia
    videoInfoDiv.style.display = 'none';
    // 4. Garante que o botão Buscar esteja visível
    checkButton.style.display = 'block';
    checkButton.disabled = false;
    // 5. Limpa as mensagens de status
    messageDiv.style.display = 'none'; 
}


/**
 * Lida com o clique no botão "Buscar" para carregar a prévia do vídeo.
 */
async function handleCheckClick() {
    const youtubeLink = linkInput.value.trim();

    if (!youtubeLink) {
        showMessage('Por favor, insira um link do YouTube.', true);
        return;
    }

    // Oculta a prévia anterior e prepara a UI para a busca
    videoInfoDiv.style.display = 'none';
    downloadButton.disabled = true;
    checkButton.style.display = 'block'; 

    showMessage('Buscando dados do vídeo... (Aguarde um momento!)');
    checkButton.disabled = true;
    
    try {
        const response = await fetch('/get_metadata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `url=${encodeURIComponent(youtubeLink)}`
        });

        const data = await response.json();

        if (response.ok) {
            // SUCESSO: Exibir thumbnail e título
            titleDiv.textContent = data.title;
            thumbnailImg.src = data.thumbnail_url;
            
            downloadUrlInput.value = data.url;
            downloadTitleInput.value = data.title;

            videoInfoDiv.style.display = 'block'; 
            checkButton.style.display = 'none'; 
            
            showMessage('Prévia carregada! Clique em "Baixar MP3 Agora".', false);
            downloadButton.disabled = false;

        } else {
            // ERRO
            showMessage(`Erro: ${data.error || 'Link inválido ou problema no servidor.'}`, true);
            checkButton.style.display = 'block'; 
        }

    } catch (error) {
        // Erro de conexão com o servidor
        showMessage(`Erro de conexão. Verifique se o servidor está rodando. Erro: ${error.message}`, true);
        checkButton.style.display = 'block'; 
    } finally {
        checkButton.disabled = false;
    }
}

// --------------------------------------------------------
// Download com AJAX
// --------------------------------------------------------
downloadForm.onsubmit = async function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário (que recarregaria a página)

    const url = downloadUrlInput.value;
    const title = downloadTitleInput.value;

    // IMPEDE download se os campos ocultos estiverem vazios (após reset)
    if (!url || !title) {
        showMessage('Por favor, busque um link antes de tentar baixar.', true);
        downloadButton.disabled = true; // Garante que o botão fique desabilitado
        return;
    }

    showMessage('Processando e convertendo para MP3 no servidor... (Pode levar alguns segundos)', false);
    downloadButton.disabled = true;

    try {
        const response = await fetch('/download_mp3', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded' 
            },
            body: `url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
        });

        if (!response.ok) {
            const data = await response.json();
            showMessage(`Erro durante o download: ${data.error || 'Problema desconhecido no servidor.'}`, true);
            return;
        }

        // SUCESSO: Trata o arquivo binário (Blob) para iniciar o download
        const blob = await response.blob();
        
        let filename = `${title}.mp3`;
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
             const matches = contentDisposition.match(/filename="(.+?)"/);
             if (matches && matches[1]) {
                 filename = matches[1];
             }
        }

        // Inicia o download no navegador
        const urlObject = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = urlObject;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(urlObject);
        a.remove();
        
        // Sucesso e Reseta UI:
        showMessage(`Download de "${filename}" iniciado com sucesso!`, false);
        
        // CORREÇÃO: Desabilita o botão IMEDIATAMENTE e inicia o reset visual com atraso.
        downloadButton.disabled = true; 
        setTimeout(resetUI, 3000); 

    } catch (error) {
        showMessage(`Erro de rede ou falha na conversão: ${error.message}`, true);
    } 
    // NOTA: O bloco 'finally' foi removido para evitar reabilitar o botão de download após o sucesso.
    // O resetUI (após 3s) garante que a tela inicial seja restaurada.
}

// --------------------------------------------------------
// CORREÇÃO: Listener para resetar a UI visual sem limpar o valor do input.
// --------------------------------------------------------
linkInput.addEventListener('input', () => {
    // Oculta a prévia e a mensagem de status sempre que o usuário começar a digitar.
    videoInfoDiv.style.display = 'none';
    checkButton.style.display = 'block';
    checkButton.disabled = false;
    messageDiv.style.display = 'none'; 
});