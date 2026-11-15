# ERA ZERO — protótipo da Era I

Jogo de sobrevivência: você acorda num vale 20 anos depois do Apagão e reconstrói a civilização, da fogueira até os robôs.

Esta é a **versão 0.1**, com a Era I (Primitiva) jogável.

---

## Como abrir no seu computador (passo a passo)

### 1. Instalar o Unity (uma vez só)
1. Baixe e instale o **Unity Hub**: https://unity.com/download
2. Abra o Unity Hub, vá em **Installs** e clique em **Install Editor**.
3. Escolha a versão **Unity 6 (LTS)**, a que vier marcada como recomendada.

### 2. Criar o projeto (uma vez só)
1. No Unity Hub, vá em **Projects** e clique em **New project**.
2. Escolha o modelo **Universal 3D**.
3. Dê o nome **EraZero** e clique em **Create project**. A primeira abertura demora alguns minutos.

### 3. Colocar o jogo dentro do projeto
1. Baixe o código do jogo neste link (é um arquivo .zip):
   https://github.com/cafemantimento/cafe-mantimento/archive/refs/heads/claude/vibrant-faraday-b9hlhl.zip
2. Extraia o .zip.
3. Lá dentro, entre em `era-zero/Assets/` e **copie a pasta `EraZero`**.
4. Cole essa pasta dentro da pasta **Assets** do seu projeto. Ela fica em `Documentos/.../EraZero/Assets` (no Unity, clique com o botão direito em "Assets" e depois em "Show in Explorer" para abrir a pasta).

### 4. Ligar o teclado clássico (uma vez só)
1. No Unity, menu **Edit > Project Settings**.
2. Clique em **Player** e abra **Other Settings**.
3. Em **Active Input Handling**, escolha **Both**.
4. O Unity vai pedir para reiniciar. Aceite.

### 5. Jogar
1. Na janela **Project**, abra `Assets/Scenes/SampleScene` (se não estiver aberta).
2. Aperte o botão **Play** (▶) no topo.
3. Dica: no canto da aba **Game**, ative **Play Maximized** (ou "Maximize On Play") para jogar em tela cheia.

O jogo cria o mapa sozinho quando você aperta Play. Não precisa arrastar nada.

### Quando sair uma versão nova
Baixe o .zip de novo, apague a pasta `Assets/EraZero` antiga do projeto e cole a nova no lugar.

---

## Controles

| Tecla | Ação |
|---|---|
| W A S D | Andar |
| Mouse | Olhar |
| Shift | Correr |
| Espaço | Pular |
| Clique esquerdo (segurar) | Golpear: cortar árvore, quebrar pedra, colher arbusto, atacar, construir |
| Clique direito | Comer o item selecionado |
| E | Pegar itens, beber água, usar fogueira e saco de dormir |
| 1 a 8 / rodinha do mouse | Escolher item da barra rápida |
| Tab ou I | Inventário e fabricação |
| R | Girar fogueira e saco de dormir |
| X | Desmontar uma construção (devolve a peça) |
| F5 | Salvar (o jogo também salva sozinho a cada 3 minutos) |
| Esc | Pausa |

## O que tem na versão 0.1
- Mapa do Vale gerado por código, com lago, montanhas, florestas e as ruínas de uma cidade ao norte.
- Ciclo de dia e noite: um dia inteiro dura 20 minutos, e a noite é fria e escura.
- Sobrevivência: vida, fome, sede, energia e temperatura.
- Coleta no estilo Ark: cada golpe dá recursos na hora, e ferramentas certas rendem mais.
- Fabricação: machado, picareta, lança, fogueira, peças de construção e saco de dormir.
- Construção por encaixe: fundação, paredes, parede com porta e teto, com holograma azul (pode) ou vermelho (não pode).
- Animais: javalis (fogem) e lobos (caçam à noite). Depois de abater, golpeie o corpo para tirar carne e couro.
- Fogueira que aquece, ilumina e assa carne.
- Saco de dormir: ponto de renascimento e pular a noite.
- 8 missões da Era I e a primeira pista da história (o rádio nas ruínas).
- Menu inicial, pausa, tela de morte, salvar e continuar.

## Ainda não tem (próximas versões)
- Multiplayer (vem na próxima etapa, junto com a Era II).
- Modelos 3D, sons e músicas de verdade: hoje os gráficos são formas simples geradas por código.
- Nadar: dá para andar no fundo do lago.

## Onde fica o arquivo de save
`%USERPROFILE%\AppData\LocalLow\DefaultCompany\EraZero\erazero_save.json` (Windows).

## Se der algum erro
Abra a aba **Console** no Unity (menu Window > General > Console), tire um print das mensagens em vermelho e mande para o Claude.
