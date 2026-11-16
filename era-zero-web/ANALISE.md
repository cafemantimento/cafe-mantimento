# Era Zero — análise técnica e plano de desenvolvimento

Data: 16/11/2026. Cópia de segurança antes das grandes mudanças:
- arquivo `era-zero-web/backup/index-v2-2026-11-16.html`
- tag git `era-zero-web-v2`

## 1. Tecnologia atual

| Item | Situação |
|---|---|
| Linguagem | JavaScript (navegador), HTML e CSS |
| Motor 3D | Three.js r128 (WebGL), carregado do cdnjs |
| Estrutura | Um único arquivo `era-zero-web/index.html` (~220 KB): estilos, interface, sons e código do jogo |
| Renderização | Cena Three.js com terreno gerado por código (malha low-poly com cores por vértice), objetos instanciados (árvores, rochas, grama), sombras do sol, céu em shader de degradê, neblina, tone mapping ACES |
| Mundo | Gerado por semente fixa (2031): 400 × 400 m, lagos, ruínas, ~430 árvores, ~190 rochas, ~180 arbustos |
| Inventário | Vetor de 32 espaços em memória (`G.inv`); os 8 primeiros são a barra rápida |
| Save | `localStorage` do navegador + documento privado por conta Claude (`data/users/<id>/save`), via a capacidade `db` do artifact |
| Multiplayer | Capacidade `room` do artifact: presença em tempo real (posição, item, golpes, construções, árvores derrubadas) |
| Publicação | Artifact do Claude (página hospedada no claude.ai) |
| Projeto Unity | `era-zero/` (C#), versão anterior, não usada pela versão web |

## 2. O que dá para fazer sem trocar a tecnologia

| Pedido | Viável? | Como |
|---|---|---|
| Gráficos muito melhores | Sim | Modelos glTF reais (Quaternius, CC0) com `GLTFLoader` da Three.js; LOD e carregamento por região |
| Animais com animações | Sim | Pacote Quaternius "Ultimate Animated Animals" (CC0): veado, cervo, raposa, lobo, cavalo e outros, com animações de andar, galopar, comer, atacar, morrer etc. |
| Animais sem modelo pronto (onça, jacaré, tubarão...) | Parcial | Modelos low-poly próprios no mesmo estilo, ou outros pacotes CC0 encontrados depois |
| Biomas, clima, chuva, neve | Sim | Mapa maior dividido em regiões, partículas e sons por bioma |
| Sons reais | Sim | Kenney (CC0) já integrado. Freesound exige conta e chave de API; Pixabay e 3D Valley não abrem neste ambiente. Busco outros pacotes CC0 espelhados no GitHub |
| Raridade, itens especiais, modos | Sim | Lógica do jogo, sem dependência externa |
| Era II no mesmo mundo | Sim | As eras viram etapas de progresso no mesmo mapa e no mesmo save |
| Login Firebase dentro do Claude | **Não** | A página do artifact bloqueia conexões com qualquer servidor fora do Claude. O Firebase não consegue se conectar dali |
| Login real | Sim, de dois jeitos | (a) No Claude: a conta Claude já é um login real e cada jogador tem save próprio e privado. (b) Versão independente hospedada no GitHub Pages: Firebase Authentication + Firestore com regras de segurança |
| PWA instalável e offline | Sim, fora do Claude | O artifact não aceita service worker. A versão independente (GitHub Pages) vira PWA instalável no celular e no PC |
| Windows (.exe) | Sim | Electron. Os downloads do Electron funcionam aqui; o instalador final é gerado pelo GitHub Actions num Windows de verdade |
| Android (.apk) | Sim, via GitHub Actions | O Android SDK não baixa neste ambiente; o GitHub Actions tem o SDK e gera o APK (Capacitor) |
| Multiplayer | Já existe no Claude | Na versão independente, multiplayer precisaria de servidor (Firebase Realtime Database dá conta) |
| Atualizar sem perder dados | Sim | Save com número de versão e conversão automática de saves antigos |

## 3. Problemas encontrados no código atual

1. Tudo num arquivo só, o que deixa difícil crescer. Plano: separar em módulos (`mundo.js`, `animais.js`, `itens.js`, `ui.js`, `rede.js`, `save.js`) sem mudar o comportamento.
2. Os animais são feitos de caixas; o personagem também.
3. O mundo é pequeno (400 m) e de um bioma só; o terreno é uma malha única (não tem carregamento por região).
4. O save não tem número de versão nem resolução de conflito entre aparelhos (hoje vence o mais recente pelo horário).
5. Os animais não são compartilhados no multiplayer.

## 4. Plano por etapas (cada uma testada antes da próxima)

1. **Base** — separar em módulos, versão do save, tela de carregamento, menu de configurações (qualidade gráfica, volume). Nada de funcionalidade nova que quebre o que existe.
2. **Gráficos e mundo** — modelos Quaternius da natureza, mapa maior por regiões, biomas (temperado, tropical, savana, pântano, deserto, neve, ilhas, cavernas), clima (chuva, tempestade, neve, neblina).
3. **Animais** — modelos animados com comportamento (fome, fuga, caça, rotina dia/noite) e sons, distribuídos por bioma.
4. **Era II no mesmo mundo** — forja, metal, motor e veículos simples, desbloqueados pelo progresso.
5. **Itens e raridade** — 6 níveis de raridade, equipamentos com efeitos reais e equilibrados, obtidos por conquistas e exploração.
6. **Modos de jogo** — Sobrevivência, Exploração, Desafio, Construção e Cooperativo.
7. **Versão independente** — PWA no GitHub Pages, login Firebase, save na nuvem com funcionamento offline.
8. **Instaláveis** — Windows (Electron) e Android (Capacitor) gerados pelo GitHub Actions.
9. **Testes finais** — todos os itens da lista de testes obrigatórios.

## 5. O que depende do dono do projeto

- Criar um projeto no Firebase (gratuito) e enviar a configuração web dele (não é segredo; a segurança fica nas regras do banco).
- Ativar o GitHub Pages no repositório.
- Idealmente, um repositório só do jogo (hoje está dentro do repositório do café).
