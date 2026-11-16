# Era Zero

Jogo de sobrevivência 3D em mundo aberto, low-poly, feito em JavaScript com Three.js.
Sobreviva no Vale, explore 8 biomas, conheça cerca de 30 espécies de animais e reconstrua a civilização, da Era Primitiva à Era Industrial, no mesmo mundo.

## Onde jogar

| Versão | Como abrir | Salvamento |
|---|---|---|
| Página no Claude | https://claude.ai/artifact/7k2HMkBGAYHmCyeQ3MtJSE | Conta Claude de cada jogador (privado) + aparelho |
| Windows | Baixe `EraZero-Instalador-*.exe` ou `EraZero-Portatil-*.exe` na página de Releases (versão `era-zero-latest`) | Aparelho; nuvem com login Firebase |
| Android | Baixe `EraZero-Android.apk` na mesma página | Aparelho; nuvem com login Firebase |
| Navegador (PWA) | Hospede o conteúdo de `EraZero-Web.zip` (ou rode `tools/build.py`) em qualquer site HTTPS; o navegador oferece "Instalar" | Aparelho; nuvem com login Firebase |

Os downloads ficam em: `https://github.com/cafemantimento/cafe-mantimento/releases/tag/era-zero-latest`

## Controles

**Computador:** WASD andar · mira no cursor do mouse · botão direito + arrastar (ou mouse na borda, ou setas) gira a câmera · clique golpear/construir · E pegar/usar · F comer/usar · G beber do cantil · Tab inventário · V câmera 1ª/3ª pessoa · Shift correr · Espaço pular · X desmontar · R girar peça · Esc pausa · F11 tela cheia (Windows).

**Celular:** joystick à esquerda, arraste à direita para olhar, botões GOLPEAR, PULAR, USAR, CORRER, BEBER, Câmera, Inventário e Pausa. Jogue com a tela deitada.

## Estrutura do projeto

```
era-zero-web/
  index.html            página do jogo (interface e estilos)
  js/                   código, um módulo por sistema
    core.js             itens, receitas, missões das eras, inventário
    settings.js         qualidade gráfica e volumes
    render.js           cena, luz, céu
    world.js            relevo, biomas, rio, oceano, vegetação, recursos, locais, cavernas
    items.js            raridade, equipamentos, baús, tesouros, chuva de meteoros, conquistas
    building.js         construção por encaixe, forja, baú
    animals.js          espécies, modelos, animações, comportamento
    player.js           movimento, colisão, sobrevivência, câmera
    interact.js         mira, coleta, uso de objetos
    weather.js          clima, descobertas, sons de ambiente
    audio.js            sons (Kenney) e música por bioma
    ui.js, uiext.js     interface e telas
    modes.js            modos de jogo
    save.js, cloud.js   salvamento por modo, conta Claude, sincronização
    firebase.js         login e nuvem da versão independente
    net.js, avatar.js   multiplayer
    main.js             carregamento e laço principal
    lib/                Three.js r128, GLTFLoader, SkeletonUtils, Firebase (compat)
  assets/               modelos e sons (ver assets/LICENCAS.md)
  icons/                ícones do app
  tools/build.py        gera dist/ (PWA) usado por todas as versões
  desktop/              app de Windows (Electron)
  mobile/               app de Android (Capacitor)
  firebase-config.js    configuração do Firebase (preencher)
  firestore.rules       regras de segurança do banco
  backup/               cópia da versão anterior
```

## Rodar localmente

```bash
cd era-zero-web
python3 tools/build.py          # gera dist/
cd dist && python3 -m http.server 8080
# abra http://localhost:8080
```

## Gerar os instaláveis

Automático: cada envio para o ramo do projeto roda o fluxo **Era Zero - compilar e publicar** (`.github/workflows/era-zero-build.yml`), que gera e testa as versões web, Windows e Android e publica tudo na Release `era-zero-latest`.

Manual:

```bash
# Windows (num PC com Windows)
python3 tools/build.py desktop/app
cd desktop && npm install && npm run dist:win    # arquivos em desktop/release/

# Android (precisa do Android SDK e Java 17)
python3 tools/build.py mobile/www
cd mobile && npm install && npx cap add android && npx capacitor-assets generate --android
cd android && ./gradlew assembleDebug            # app/build/outputs/apk/debug/app-debug.apk
```

O APK gerado é de "debug" (instala em qualquer Android, mas não serve para a Play Store). Para publicar na Play Store é preciso uma chave de assinatura própria.

## Ativar login com e-mail e senha (Firebase)

1. Crie um projeto em https://console.firebase.google.com (gratuito).
2. **Authentication > Sign-in method**: ative "E-mail/senha".
3. **Firestore Database**: crie o banco (modo produção).
4. **Firestore > Regras**: cole o conteúdo de `firestore.rules` e publique. Elas garantem que cada jogador só lê e escreve os próprios dados.
5. **Configurações do projeto > Seus apps > Web**: registre um app e copie o `firebaseConfig` para `firebase-config.js`.
6. Envie a mudança: o fluxo de compilação gera tudo de novo com o login ativo.

Dentro da página do Claude, o login continua sendo a conta Claude (o Claude bloqueia conexões com servidores externos como o Firebase).

## Atualizações

- PWA: o service worker detecta a versão nova e mostra "Nova versão disponível". O progresso nunca fica no cache, então atualizar não apaga nada.
- Saves têm número de versão (`v:3`); saves antigos são convertidos automaticamente.
- Um save mais antigo nunca substitui um mais novo salvo em outro aparelho.

## Licenças

Recursos de terceiros: todos CC0 (Quaternius e Kenney). Detalhes em `assets/LICENCAS.md`.
