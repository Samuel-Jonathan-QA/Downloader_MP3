import os
import json
# Removemos 'after_this_request' e 'cleanup_temp_files' pois a exclusão é imediata após a leitura para memória.
from flask import Flask, render_template, request, jsonify, send_file
from yt_dlp import YoutubeDL
from io import BytesIO

# Configuração básica do Flask para buscar templates e estáticos na pasta 'frontend'
app = Flask(
    __name__, 
    template_folder='../frontend', 
    static_folder='../frontend', 
    static_url_path='/frontend'
)

# Define o nome BASE do arquivo de saída
OUTPUT_BASENAME = "audio_temp"
FINAL_FILENAME = OUTPUT_BASENAME + ".mp3"

# --- Rota Principal ---
@app.route('/')
def index():
    return render_template('index.html')

# --- Rota para Obter Metadados do Vídeo ---
@app.route('/get_metadata', methods=['POST'])
def get_metadata():
    url = request.form.get('url')
    if not url:
        return jsonify({"error": "URL do YouTube é obrigatória."}), 400

    ydl_opts = {
        'skip_download': True,
        'quiet': True,
        'extract_flat': True,
        'force_generic_extractor': False,
    }

    try:
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            thumbnail_url = info.get('thumbnail')
            thumbnails = info.get('thumbnails', [])
            if thumbnails:
                thumbnail_url = thumbnails[-1]['url']
                
            return jsonify({
                "url": url,
                "title": info.get('title', 'Título Desconhecido'),
                "thumbnail_url": thumbnail_url or "https://placehold.co/400x225/FFC0CB/E02899?text=Sem+Preview"
            })
            
    except Exception as e:
        app.logger.error(f"Erro ao obter metadados para {url}: {e}")
        return jsonify({"error": "Link inválido ou não suportado."}), 500

# --- Rota para Download e Conversão do MP3 (AGORA SEM BLOQUEIO) ---
@app.route('/download_mp3', methods=['POST'])
def download_mp3():
    url = request.form.get('url')
    title = request.form.get('title', 'download_audio')
    
    if not url:
        return jsonify({"error": "URL do YouTube é obrigatória."}), 400

    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': OUTPUT_BASENAME, # Nome BASE sem extensão
        'quiet': True,
        'no_warnings': True,
    }
    
    try:
        # 1. Tenta limpar o arquivo antigo antes do novo download
        if os.path.exists(FINAL_FILENAME):
            try:
                os.remove(FINAL_FILENAME)
                app.logger.info(f"Limpeza de arquivo antigo: {FINAL_FILENAME} removido com sucesso.")
            except Exception as e:
                # Se falhar, registra e continua (o yt-dlp tentará sobrescrever)
                app.logger.warning(f"Aviso: Não foi possível remover o arquivo antigo {FINAL_FILENAME}. Continuando...")
        
        # 2. Download e Conversão (cria o FINAL_FILENAME no disco)
        with YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        if not os.path.exists(FINAL_FILENAME):
            raise Exception("yt-dlp não conseguiu criar o arquivo MP3 final.")
            
        # 3. LEITURA PARA MEMÓRIA E EXCLUSÃO IMEDIATA DO DISCO (A SOLUÇÃO DO BLOQUEIO)
        file_data = None
        
        # O bloco 'with open...finally' garante que o arquivo é fechado
        # e deletado no DISCO antes de ser enviado pelo Flask.
        try:
            # 3.1 Abre o arquivo binário
            with open(FINAL_FILENAME, 'rb') as f:
                # 3.2 Lê todo o conteúdo para a memória (BytesIO)
                file_data = BytesIO(f.read())
            
            # 3.3 O handle do arquivo já foi fechado pelo 'with open'. Agora podemos deletar imediatamente.
            os.remove(FINAL_FILENAME)
            app.logger.info(f"Sucesso: Arquivo {FINAL_FILENAME} lido para memória e excluído do disco ANTES do envio.")
            
        except Exception as file_error:
            # Se falhar a leitura ou a exclusão aqui, o erro é interno
            raise Exception(f"Erro ao ler/apagar arquivo do disco: {file_error}")


        # 4. Prepara o envio do conteúdo EM MEMÓRIA (BytesIO)
        safe_title = ''.join(c for c in title if c.isalnum() or c in (' ', '_')).rstrip()
        filename_for_client = f"{safe_title}.mp3"
        
        # 5. Envia o conteúdo EM MEMÓRIA (BytesIO) para o cliente
        return send_file(
            file_data, # Enviando o buffer de memória (BytesIO)
            as_attachment=True,
            download_name=filename_for_client,
            mimetype='audio/mp3'
        )

    except Exception as e:
        app.logger.error(f"Erro no download/conversão para {url}: {e}")
        
        # Tenta limpar o arquivo do disco em caso de falha antes do envio
        if os.path.exists(FINAL_FILENAME):
            try:
                os.remove(FINAL_FILENAME)
            except:
                pass 
        
        error_message = str(e) if 'ERROR:' in str(e) else "Erro desconhecido durante o processamento."
        return jsonify({"error": error_message}), 500

# --- Configurações de Execução ---
if __name__ == '__main__':
    os.makedirs('../frontend', exist_ok=True)
    app.run(debug=True)