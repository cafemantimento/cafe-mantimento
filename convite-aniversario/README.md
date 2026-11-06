# Convite animado de aniversário (vertical 9:16)

- `convite-aniversario.mp4`: vídeo final, 1080x1920 (Full HD vertical), 30 fps, 31 s, H.264 + AAC.
- `fonte/`: código usado para gerar o vídeo:
  - `voice.sh`: gera a fala com espeak-ng + MBROLA (voz `mb-br4`, deixada mais aguda para soar infantil).
  - `audio.py`: compõe a trilha infantil (ukulele, marimba, sinos e percussão), mistura com a voz e calcula a sincronia da boca (`timing.json`).
  - `scene.html`: cena 3D em three.js (personagem, ilha tropical, balões, presentes, estrelas, confete) com os textos animados por cima.
  - `render.js`: renderiza quadro a quadro com Playwright e codifica com ffmpeg.

Para gerar de novo: `npm i three@0.160.0 @fontsource/fredoka @fontsource/baloo-2`, depois `bash voice.sh && python3 audio.py && node render.js full`.

## Convite digital (telas que deslizam)

- `convite-aniversario.html` (ou `site/index.html`, idêntico): um arquivo só, com fontes e música embutidas.
- Para publicar: arraste a pasta `site/` no Netlify Drop (app.netlify.com/drop) e mande o link.

Visual: ilha pintada em aquarela (original), com céu de pôr do sol rosa, lilás e amarelo, nuvens andando, montanhas azuis, mar brilhando, clareira de terra laranja, troncos de coqueiro lilás e moitas com flores azuis, roxas e rosa. Pétalas caindo e brilhos.

Espaços para imagens: 5 quadros pontilhados "SUA IMAGEM AQUI" (Espaço 1 a 5). Preencha `imagens` no bloco CONVITE; para esconder os quadros vazios, use `mostrarEspacos: false`.
Telas: 1) envelope turquesa com selo roxo que abre com fumaça rosa e mostra "Convite Especial"; 2) foto em moldura ondulada, nome e faixa roxa com a idade; 3) mensagem; 4) moldura com data, horário e contagem regressiva; 5) local (Google Maps e Waze); 6) confirmar presença (WhatsApp); 7) sugestões de presentes (WhatsApp); 8) "Esperamos você!" e WhatsApp para dúvidas.

Para preencher, edite o bloco `CONVITE` ("EDITE AQUI") perto do fim do arquivo: `nome`, `idade`, `data` (AAAA-MM-DD), `hora` (HH:MM), `foto`, `imagens` (abertura, nome, mensagem, final: arquivos PNG sem fundo na mesma pasta), local, WhatsApp e `presentes`.
