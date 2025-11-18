<h1 align="center">YouTube MP3 Downloader | Gliter-Pink & Cyber Blue</h1>

<p align="center">
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"/></a>
  <a href="https://flask.palletsprojects.com/"><img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white"/></a>
  <a href="https://www.w3.org/html/"><img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/></a>
  <a href="https://www.javascript.com/"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/></a>
  <img src="https://img.shields.io/badge/Status-Estável-green?style=for-the-badge"/>
</p>

---

## 🎯 Sobre o Projeto: Conversão de Áudio com Temas Dinâmicos

O **YouTube MP3 Downloader** é uma aplicação *Full-Stack* desenvolvida para simplificar a conversão de vídeos do YouTube em arquivos MP3. O foco do projeto é oferecer uma **interface de usuário (UI) limpa e responsiva**, com uma experiência de download fluida via AJAX.

O sistema utiliza a robustez do **Python/Flask** no *backend* para o processamento de áudio (download e conversão) e um *frontend* totalmente baseado em **JavaScript Vanilla e CSS** para gerenciar o estado e fornecer *feedback* imediato.

### 🖼️ Estética e Temas
O grande diferencial é a capacidade de alternar instantaneamente entre dois temas visuais usando variáveis CSS:
* **Gliter-Pink 💖:** Tema padrão, focado em uma estética suave e moderna.
  
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1a0981c0-2624-40d0-b870-4e6b9c9a24b8" />

* **Cyber Blue 🤖:** Tema escuro e futurista, com toques neon.
  
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/4ab8298e-9c0b-4148-b73f-db151c0500d7" />

---

## 📋 Módulos e Funcionalidades

### 1. Metadados e Prévia
Utiliza o Flask para consultar o link do YouTube, garantindo que o vídeo seja válido antes de iniciar qualquer conversão.
- **Status:** ✅ Completo

### 2. Conversão Assíncrona (Backend)
O servidor lida com o *streaming* do áudio e sua conversão para MP3, retornando o arquivo como um *Blob* para o navegador.
- **Status:** ✅ Completo (Download e conversão)

### 3. Gerenciamento de Tema
Aplica classes CSS dinamicamente no corpo do documento (`<body>`) para trocar o esquema de cores e o texto do título da aplicação.
- **Status:** ✅ Completo (Persistência do tema via `localStorage`)
---


https://github.com/user-attachments/assets/43f9d83c-8cd9-4636-ad43-058ee588d3dd


---

## ⚙️ Tecnologias Principais

| Categoria | Tecnologia | Uso Principal |
| :--- | :--- | :--- |
| **Backend** | **Python (Flask)** | API REST para `/get_metadata` e `/download_mp3`. |
| **Manipulação** | **Pytube** | Biblioteca de download de streams do YouTube. |
| **Frontend** | **JavaScript Vanilla** | Lógica de UI, AJAX (Fetch API) e gerenciamento de estado. |
| **Estilização** | **CSS3** | Layout responsivo, animações e sistema de temas dinâmicos. |

---

## 🚀 Guia de Execução Local

### 🧩 1️⃣ Backend (API Python/Flask)

Certifique-se de que as bibliotecas `Flask` e `Pytube` estão instaladas:

```bash
# Instalar dependências
pip install Flask pytube

# Iniciar o servidor Flask 
python app.py
```
---

### 💻 2️⃣ Frontend (Acesso)

O frontend é servido automaticamente pelo Flask. Acesse a URL:

```bash

[http://127.0.0.1:5000/](http://127.0.0.1:5000/)
```

<p align="center">💻 Automação, café e paciência — nessa ordem.</p>
