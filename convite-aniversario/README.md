# Convite animado de aniversário (vertical 9:16)

- `convite-aniversario.mp4`: vídeo final, 1080x1920 (Full HD vertical), 30 fps, 31 s, H.264 + AAC.
- `fonte/`: código usado para gerar o vídeo:
  - `voice.sh`: gera a fala com espeak-ng + MBROLA (voz `mb-br4`, deixada mais aguda para soar infantil).
  - `audio.py`: compõe a trilha infantil (ukulele, marimba, sinos e percussão), mistura com a voz e calcula a sincronia da boca (`timing.json`).
  - `scene.html`: cena 3D em three.js (personagem, ilha tropical, balões, presentes, estrelas, confete) com os textos animados por cima.
  - `render.js`: renderiza quadro a quadro com Playwright e codifica com ffmpeg.

Para gerar de novo: `npm i three@0.160.0 @fontsource/fredoka @fontsource/baloo-2`, depois `bash voice.sh && python3 audio.py && node render.js full`.

## Convite digital (abre e rola)

- `convite-aniversario.html` (ou `site/index.html`, idêntico): um arquivo só, com fontes e música embutidas.
- Para publicar: arraste a pasta `site/` no Netlify Drop (app.netlify.com/drop) e mande o link.

Fluxo: envelope com selo de flor, toca e abre, aparece o cartão "Aloha! Você está convidado", com foto, nome, idade, data, horário e contagem regressiva. Depois vêm: Onde vai ser (Papelaria Central, Google Maps, Waze, avaliações), Confirme presença (WhatsApp), Sugestões de presentes (WhatsApp), Dúvidas (WhatsApp) e "Esperamos você!". Há um menu fixo embaixo e um botão de música.

Para preencher nome, idade, data, horário, foto e presentes, edite o bloco `CONVITE` ("EDITE AQUI") perto do fim do arquivo.
