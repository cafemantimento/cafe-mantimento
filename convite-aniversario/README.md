# Convite animado de aniversário (vertical 9:16)

- `convite-aniversario.mp4`: vídeo final, 1080x1920 (Full HD vertical), 30 fps, 31 s, H.264 + AAC.
- `fonte/`: código usado para gerar o vídeo:
  - `voice.sh`: gera a fala com espeak-ng + MBROLA (voz `mb-br4`, deixada mais aguda para soar infantil).
  - `audio.py`: compõe a trilha infantil (ukulele, marimba, sinos e percussão), mistura com a voz e calcula a sincronia da boca (`timing.json`).
  - `scene.html`: cena 3D em three.js (personagem, ilha tropical, balões, presentes, estrelas, confete) com os textos animados por cima.
  - `render.js`: renderiza quadro a quadro com Playwright e codifica com ffmpeg.

Para gerar de novo: `npm i three@0.160.0 @fontsource/fredoka @fontsource/baloo-2`, depois `bash voice.sh && python3 audio.py && node render.js full`.

## Convite interativo (página que abre e rola)

- `convite-aniversario.html`: arquivo único com tudo embutido.
- `site/`: a mesma página separada em arquivos, pronta para hospedar (Netlify Drop, GitHub Pages).

Fluxo: toca no envelope, o convite abre, o mascote fala o convite com música, e aparece "Arraste para baixo". Rolando, vêm as seções:
1. Convite ("Vem pra festa!")
2. Onde vai ser: Papelaria Central, endereço, mapa e botões Google Maps e Waze
3. Confirmar presença: nome e quantidade de pessoas, enviado pelo WhatsApp
4. Sugestões de presentes: a pessoa marca o que vai dar e avisa pelo WhatsApp
5. WhatsApp (19) 97137-6208
6. Avaliação 5,0 (13 avaliações)
7. Esperamos você! (beijinho, enviar convite, ver de novo)

Para mudar a lista de presentes ou o WhatsApp, edite o bloco `window.CONVITE` ("EDITE AQUI") no `index.html`.
