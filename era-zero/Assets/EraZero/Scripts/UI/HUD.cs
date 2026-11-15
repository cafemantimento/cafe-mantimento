using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UIElements;

namespace EraZero
{
    /// <summary>
    /// Toda a interface do jogo: barras de status, missão, relógio, barra rápida,
    /// avisos, inventário, fabricação e os menus (início, pausa, morte).
    /// </summary>
    public class HUD : MonoBehaviour
    {
        VisualElement root, hud;
        // status
        VisualElement fHealth, fHunger, fThirst, fStamina, fTemp;
        Label vHealth, vHunger, vThirst, vStamina, vTemp, tempHint;
        // topo
        Label compass, clock;
        // missão
        VisualElement questList;
        Label questTitle;
        // centro
        VisualElement crosshair;
        Label prompt, buildStatus, buildName;
        // barra rápida
        readonly VisualElement[] hotSlots = new VisualElement[Inventory.HotbarSize];
        readonly Label[] hotLabels = new Label[Inventory.HotbarSize];
        readonly Label[] hotCounts = new Label[Inventory.HotbarSize];
        readonly VisualElement[] hotIcons = new VisualElement[Inventory.HotbarSize];
        Label selectedName;
        // era
        VisualElement eraFill;
        Label eraLabel;
        // avisos
        VisualElement toastBox;
        readonly List<Toast> toasts = new List<Toast>();
        VisualElement bannerBox;
        Label bannerTitle, bannerText;
        float bannerUntil;
        VisualElement damageFlash;
        float flash;
        // telas
        VisualElement menuScreen, pauseScreen, deathScreen, invScreen, inputWarning;
        Button continueBtn;
        // inventário
        readonly VisualElement[] invSlots = new VisualElement[Inventory.Size];
        readonly Label[] invLabels = new Label[Inventory.Size];
        readonly Label[] invCounts = new Label[Inventory.Size];
        readonly VisualElement[] invIcons = new VisualElement[Inventory.Size];
        VisualElement recipeList;
        Label itemInfo;
        int pickedSlot = -1;
        bool invDirty = true;

        class Toast { public VisualElement el; public Label label; public float until; public string key; public int amount; }

        GameManager gm;

        public void Init()
        {
            gm = GameManager.I;
            var go = gameObject;
            go.SetActive(false);
            var doc = go.AddComponent<UIDocument>();
            var ps = ScriptableObject.CreateInstance<PanelSettings>();
            ps.scaleMode = PanelScaleMode.ScaleWithScreenSize;
            ps.referenceResolution = new Vector2Int(1920, 1080);
            ps.screenMatchMode = PanelScreenMatchMode.MatchWidthOrHeight;
            ps.match = 0.5f;
            doc.panelSettings = ps;
            go.SetActive(true);

            root = doc.rootVisualElement;
            root.pickingMode = PickingMode.Ignore;
            UIK.Fill(root);
            var font = LoadFont();
            if (font != null) root.style.unityFontDefinition = new StyleFontDefinition(FontDefinition.FromFont(font));
            root.style.color = UIK.Text;

            BuildHud();
            BuildInventory();
            BuildMenus();

            gm.Inventory.Changed += () => invDirty = true;
            gm.Quests.Changed += RefreshQuests;
            gm.Stats.Damaged += _ => flash = 0.45f;
            GameEvents.Notify += OnNotify;
            GameEvents.Banner += OnBanner;
            GameEvents.ItemGathered += OnGathered;
            RefreshQuests();
        }

        void OnDestroy()
        {
            GameEvents.Notify -= OnNotify;
            GameEvents.Banner -= OnBanner;
            GameEvents.ItemGathered -= OnGathered;
        }

        static Font LoadFont()
        {
            foreach (var n in new[] { "LegacyRuntime.ttf", "Arial.ttf" })
            {
                try
                {
                    var f = Resources.GetBuiltinResource<Font>(n);
                    if (f != null) return f;
                }
                catch (System.Exception) { }
            }
            return null;
        }

        // =====================================================================
        //  HUD
        // =====================================================================

        void BuildHud()
        {
            hud = UIK.El(root, "hud");
            UIK.Fill(hud);
            hud.pickingMode = PickingMode.Ignore;

            damageFlash = UIK.El(hud);
            UIK.Fill(damageFlash);
            damageFlash.style.backgroundColor = new Color(0.8f, 0.05f, 0.05f, 0f);
            damageFlash.pickingMode = PickingMode.Ignore;

            // ---- status (topo esquerdo)
            var status = UIK.PanelBox(hud);
            UIK.Abs(status, 36, 32);
            UIK.Size(status, 340, null);
            var head = UIK.Row(status);
            head.style.justifyContent = Justify.SpaceBetween;
            var who = UIK.El(head);
            UIK.Eyebrow(who, "Sobrevivente");
            UIK.Txt(who, "JOGADOR", 20, UIK.Text, true);
            var era = UIK.El(head);
            era.style.alignItems = Align.FlexEnd;
            UIK.Eyebrow(era, "Era");
            UIK.Txt(era, "I", 26, UIK.Cyan, true);
            StatRow(status, "VIDA", UIK.HealthCol, out fHealth, out vHealth);
            StatRow(status, "FOME", UIK.HungerCol, out fHunger, out vHunger);
            StatRow(status, "SEDE", UIK.ThirstCol, out fThirst, out vThirst);
            StatRow(status, "ENERGIA", UIK.StaminaCol, out fStamina, out vStamina);
            StatRow(status, "TEMP.", UIK.Amber, out fTemp, out vTemp);
            tempHint = UIK.Txt(status, "", 13, UIK.Muted);
            tempHint.style.marginTop = 6;

            // ---- missão (esquerda)
            var quest = UIK.PanelBox(hud);
            UIK.Abs(quest, 36, 300);
            UIK.Size(quest, 370, null);
            UIK.Eyebrow(quest, "Missão · Era I", UIK.Cyan);
            questTitle = UIK.Txt(quest, "", 22, UIK.Text, true);
            questTitle.style.marginTop = 2; questTitle.style.marginBottom = 6;
            questList = UIK.El(quest);

            // ---- bússola (topo centro)
            var comp = UIK.PanelBox(hud);
            UIK.Abs(comp, null, 30);
            comp.style.left = Length.Percent(50);
            comp.style.translate = new Translate(Length.Percent(-50), 0);
            UIK.Pad(comp, 8, 26);
            compass = UIK.Txt(comp, "N", 20, UIK.Text, true);
            compass.style.unityTextAlign = TextAnchor.MiddleCenter;
            compass.style.minWidth = 160;

            // ---- relógio (topo direito)
            var clk = UIK.PanelBox(hud);
            UIK.Abs(clk, null, 30, 36);
            UIK.Pad(clk, 10, 16);
            clock = UIK.Txt(clk, "", 19, UIK.Text, true);

            // ---- avisos
            toastBox = UIK.El(hud);
            UIK.Abs(toastBox, null, 92, 36);
            UIK.Size(toastBox, 380, null);
            toastBox.style.alignItems = Align.FlexEnd;
            toastBox.pickingMode = PickingMode.Ignore;

            // ---- mira e dica de interação
            crosshair = UIK.El(hud);
            UIK.Abs(crosshair);
            crosshair.style.left = Length.Percent(50);
            crosshair.style.top = Length.Percent(50);
            UIK.Size(crosshair, 6, 6);
            crosshair.style.translate = new Translate(-3, -3);
            crosshair.style.backgroundColor = new Color(1, 1, 1, 0.9f);
            UIK.Radius(crosshair, 3);

            prompt = UIK.Txt(hud, "", 19, UIK.Text, true);
            UIK.Abs(prompt);
            prompt.style.left = Length.Percent(50);
            prompt.style.top = Length.Percent(54);
            prompt.style.translate = new Translate(Length.Percent(-50), 0);
            prompt.style.unityTextAlign = TextAnchor.UpperCenter;
            prompt.style.backgroundColor = new Color(0, 0, 0, 0.35f);
            UIK.Radius(prompt, 4);
            UIK.Pad(prompt, 6, 12);

            // ---- construção
            var build = UIK.PanelBox(hud);
            UIK.Abs(build, null, null, null, 175);
            build.style.left = Length.Percent(50);
            build.style.translate = new Translate(Length.Percent(-50), 0);
            build.style.alignItems = Align.Center;
            build.name = "build";
            UIK.Eyebrow(build, "Modo construção", UIK.Cyan);
            buildName = UIK.Txt(build, "", 20, UIK.Text, true);
            buildStatus = UIK.Txt(build, "", 15, UIK.Text);

            // ---- barra rápida
            selectedName = UIK.Txt(hud, "", 19, UIK.Text, true);
            UIK.Abs(selectedName, null, null, null, 120);
            selectedName.style.left = Length.Percent(50);
            selectedName.style.translate = new Translate(Length.Percent(-50), 0);

            var bar = UIK.Row(hud);
            UIK.Abs(bar, null, null, null, 32);
            bar.style.left = Length.Percent(50);
            bar.style.translate = new Translate(Length.Percent(-50), 0);
            for (int i = 0; i < Inventory.HotbarSize; i++)
            {
                var slot = SlotElement(bar, 74, out hotIcons[i], out hotLabels[i], out hotCounts[i]);
                slot.style.marginLeft = 4; slot.style.marginRight = 4;
                var k = UIK.Txt(slot, (i + 1).ToString(), 13, UIK.Muted, true);
                UIK.Abs(k, 6, 3);
                hotSlots[i] = slot;
            }

            // ---- progresso da era (baixo esquerdo)
            var eraBox = UIK.PanelBox(hud);
            UIK.Abs(eraBox, 36, null, null, 32);
            UIK.Size(eraBox, 420, null);
            var eraHead = UIK.Row(eraBox);
            eraHead.style.justifyContent = Justify.SpaceBetween;
            UIK.Eyebrow(eraHead, "Progresso da civilização");
            eraLabel = UIK.Txt(eraHead, "", 14, UIK.Amber, true);
            var eras = UIK.Row(eraBox);
            eras.style.marginTop = 10;
            for (int i = 0; i < QuestSystem.EraNames.Length; i++)
            {
                var col = UIK.El(eras);
                col.style.flexGrow = 1;
                col.style.alignItems = Align.Center;
                var dot = UIK.El(col);
                UIK.Size(dot, 14, 14);
                UIK.Radius(dot, 7);
                UIK.BorderAll(dot, 2, i == 0 ? UIK.Amber : new Color(1, 1, 1, 0.25f));
                dot.style.backgroundColor = i == 0 ? new Color(1f, 0.71f, 0.28f, 0.35f) : new Color(0, 0, 0, 0.3f);
                var name = UIK.Txt(col, QuestSystem.EraNames[i], 12, i == 0 ? UIK.Amber : UIK.Muted, true);
                name.style.marginTop = 4;
            }
            var eraTrackRow = UIK.Row(eraBox);
            eraTrackRow.style.marginTop = 8;
            eraFill = UIK.Bar(eraTrackRow, UIK.Amber, 5);

            // ---- atalhos (baixo direito)
            var keys = UIK.El(hud);
            UIK.Abs(keys, null, null, 36, 32);
            keys.style.alignItems = Align.FlexEnd;
            keys.pickingMode = PickingMode.Ignore;
            foreach (var (label, key) in new[] { ("Inventário e fabricação", "Tab"), ("Interagir / pegar", "E"), ("Comer item selecionado", "Botão direito"), ("Desmontar construção", "X"), ("Correr", "Shift"), ("Salvar", "F5"), ("Pausa", "Esc") })
            {
                var r = UIK.Row(keys);
                r.style.marginTop = 5;
                var t = UIK.Txt(r, label, 15, UIK.Text, true);
                t.style.marginRight = 8;
                var kb = UIK.Txt(r, key, 13, UIK.Text, true);
                kb.style.backgroundColor = new Color(0.04f, 0.07f, 0.1f, 0.75f);
                UIK.BorderAll(kb, 1, new Color(1, 1, 1, 0.45f));
                kb.style.borderBottomWidth = 3;
                UIK.Radius(kb, 4);
                UIK.Pad(kb, 3, 8);
            }

            // ---- faixa central (dia novo, era concluída, história)
            bannerBox = UIK.El(hud);
            UIK.Abs(bannerBox, null, 170);
            bannerBox.style.left = Length.Percent(50);
            bannerBox.style.translate = new Translate(Length.Percent(-50), 0);
            bannerBox.style.alignItems = Align.Center;
            bannerBox.style.maxWidth = 760;
            bannerBox.pickingMode = PickingMode.Ignore;
            bannerTitle = UIK.Txt(bannerBox, "", 40, UIK.Text, true);
            bannerTitle.style.letterSpacing = 6;
            bannerText = UIK.Txt(bannerBox, "", 18, UIK.Text);
            bannerText.style.unityTextAlign = TextAnchor.UpperCenter;
            bannerText.style.marginTop = 6;
            bannerText.style.backgroundColor = new Color(0, 0, 0, 0.35f);
            UIK.Pad(bannerText, 8, 16);
            UIK.Radius(bannerText, 6);
            UIK.Show(bannerBox, false);
        }

        void StatRow(VisualElement parent, string label, Color color, out VisualElement fill, out Label value)
        {
            var r = UIK.Row(parent);
            r.style.marginTop = 9;
            var l = UIK.Txt(r, label, 12, UIK.Muted, true);
            l.style.width = 64;
            fill = UIK.Bar(r, color);
            value = UIK.Txt(r, "100", 16, UIK.Text, true);
            value.style.width = 46;
            value.style.unityTextAlign = TextAnchor.MiddleRight;
        }

        VisualElement SlotElement(VisualElement parent, float size, out VisualElement icon, out Label label, out Label count)
        {
            var slot = UIK.El(parent);
            UIK.Size(slot, size, size);
            slot.style.backgroundColor = UIK.Panel;
            UIK.BorderAll(slot, 1, UIK.Border);
            UIK.Radius(slot, 6);
            slot.style.alignItems = Align.Center;
            slot.style.justifyContent = Justify.Center;

            icon = UIK.El(slot);
            UIK.Size(icon, size * 0.5f, size * 0.5f);
            UIK.Radius(icon, 5);
            icon.style.alignItems = Align.Center;
            icon.style.justifyContent = Justify.Center;
            icon.pickingMode = PickingMode.Ignore;
            label = UIK.Txt(icon, "", 12, Color.white, true);

            count = UIK.Txt(slot, "", 14, UIK.Text, true);
            UIK.Abs(count, null, null, 6, 3);
            return slot;
        }

        static void PaintSlot(ItemStack s, VisualElement icon, Label label, Label count)
        {
            var def = s?.Def;
            if (def == null)
            {
                icon.style.backgroundColor = new Color(0, 0, 0, 0);
                UIK.BorderAll(icon, 0, Color.clear);
                label.text = "";
                count.text = "";
                return;
            }
            var c = def.color;
            icon.style.backgroundColor = new Color(c.r * 0.6f, c.g * 0.6f, c.b * 0.6f, 0.9f);
            UIK.BorderAll(icon, 1, c);
            label.text = def.shortName;
            label.style.color = Color.white;
            count.text = def.maxStack > 1 ? s.count.ToString() : "";
        }

        // =====================================================================
        //  Inventário e fabricação
        // =====================================================================

        void BuildInventory()
        {
            invScreen = UIK.El(root, "inventario");
            UIK.Fill(invScreen);
            invScreen.style.backgroundColor = new Color(0.01f, 0.02f, 0.04f, 0.72f);
            invScreen.style.flexDirection = FlexDirection.Row;
            invScreen.style.justifyContent = Justify.Center;
            invScreen.style.alignItems = Align.Center;

            // inventário
            var left = UIK.PanelBox(invScreen, true);
            left.pickingMode = PickingMode.Position;
            left.style.marginRight = 18;
            UIK.Pad(left, 22, 24);
            UIK.Eyebrow(left, "Inventário", UIK.Cyan);
            var hint = UIK.Txt(left, "Clique num item e depois em outro espaço para mover. Botão direito numa comida para comer.", 14, UIK.Muted);
            hint.style.marginTop = 4; hint.style.marginBottom = 12; hint.style.maxWidth = 660;

            for (int row = 0; row < Inventory.Size / Inventory.HotbarSize; row++)
            {
                if (row == 0) UIK.Txt(left, "BARRA RÁPIDA (1-8)", 12, UIK.Muted, true).style.marginBottom = 4;
                if (row == 1) { var l = UIK.Txt(left, "MOCHILA", 12, UIK.Muted, true); l.style.marginTop = 12; l.style.marginBottom = 4; }
                var r = UIK.Row(left);
                r.pickingMode = PickingMode.Position;
                r.style.marginBottom = 6;
                for (int col = 0; col < Inventory.HotbarSize; col++)
                {
                    int i = row * Inventory.HotbarSize + col;
                    var slot = SlotElement(r, 76, out invIcons[i], out invLabels[i], out invCounts[i]);
                    slot.style.marginRight = 6;
                    slot.pickingMode = PickingMode.Position;
                    int idx = i;
                    slot.RegisterCallback<PointerDownEvent>(e => OnSlotClick(idx, e.button));
                    slot.RegisterCallback<PointerEnterEvent>(_ => ShowInfo(idx));
                    invSlots[i] = slot;
                }
            }
            itemInfo = UIK.Txt(left, "", 15, UIK.Text);
            itemInfo.style.marginTop = 10;
            itemInfo.style.minHeight = 44;
            itemInfo.style.maxWidth = 660;

            // fabricação
            var right = UIK.PanelBox(invScreen, true);
            right.pickingMode = PickingMode.Position;
            UIK.Size(right, 470, null);
            UIK.Pad(right, 22, 24);
            UIK.Eyebrow(right, "Fabricação · Era I", UIK.Cyan);
            var sv = new ScrollView(ScrollViewMode.Vertical);
            sv.style.maxHeight = 640;
            sv.style.marginTop = 10;
            right.Add(sv);
            recipeList = sv.contentContainer;

            UIK.Show(invScreen, false);
        }

        void OnSlotClick(int idx, int button)
        {
            var inv = gm.Inventory;
            if (button == 1)
            {
                var def = inv.slots[idx]?.Def;
                if (def != null && def.kind == ItemKind.Food)
                {
                    gm.Stats.Eat(def);
                    inv.RemoveFromSlot(idx, 1);
                    GameEvents.RaiseNotify("Comeu: " + def.name, UIK.Amber);
                }
                return;
            }
            if (pickedSlot < 0)
            {
                if (inv.slots[idx] != null) pickedSlot = idx;
            }
            else
            {
                inv.Swap(pickedSlot, idx);
                pickedSlot = -1;
                gm.Interaction.Select(gm.Interaction.SelectedSlot);
            }
            invDirty = true;
        }

        void ShowInfo(int idx)
        {
            var def = gm.Inventory.slots[idx]?.Def;
            itemInfo.text = def == null ? "" : $"{def.name}\n{def.description}";
        }

        void RefreshInventory()
        {
            var inv = gm.Inventory;
            for (int i = 0; i < Inventory.Size; i++)
            {
                PaintSlot(inv.slots[i], invIcons[i], invLabels[i], invCounts[i]);
                UIK.BorderAll(invSlots[i], i == pickedSlot ? 2 : 1, i == pickedSlot ? UIK.Amber : UIK.Border);
            }

            recipeList.Clear();
            foreach (var r in Crafting.Recipes)
            {
                bool can = Crafting.CanCraft(inv, r);
                var def = ItemDB.Get(r.result);
                var card = UIK.El(recipeList);
                card.style.flexDirection = FlexDirection.Row;
                card.style.alignItems = Align.Center;
                card.style.marginBottom = 8;
                UIK.Pad(card, 10, 12);
                UIK.Radius(card, 6);
                UIK.BorderAll(card, 1, can ? new Color(0.37f, 0.88f, 1f, 0.45f) : new Color(1, 1, 1, 0.08f));
                card.style.backgroundColor = new Color(1, 1, 1, can ? 0.05f : 0.02f);

                var icon = UIK.El(card);
                UIK.Size(icon, 44, 44);
                UIK.Radius(icon, 5);
                icon.style.backgroundColor = new Color(def.color.r * 0.6f, def.color.g * 0.6f, def.color.b * 0.6f, 0.9f);
                UIK.BorderAll(icon, 1, def.color);
                icon.style.alignItems = Align.Center; icon.style.justifyContent = Justify.Center;
                UIK.Txt(icon, def.shortName, 11, Color.white, true);

                var info = UIK.El(card);
                info.style.flexGrow = 1;
                info.style.flexShrink = 1;
                info.style.marginLeft = 12; info.style.marginRight = 10;
                UIK.Txt(info, def.name, 17, can ? UIK.Text : UIK.Muted, true);
                var costs = UIK.Row(info);
                costs.style.flexWrap = Wrap.Wrap;
                costs.style.marginTop = 3;
                foreach (var c in r.costs)
                {
                    bool ok = inv.Has(c.id, c.amount);
                    var ct = UIK.Txt(costs, $"{inv.Count(c.id)}/{c.amount} {ItemDB.Name(c.id)}", 13, ok ? UIK.Green : UIK.Red);
                    ct.style.marginRight = 10;
                }

                var recipe = r;
                var btn = UIK.Btn(card, "Fabricar", () => { Crafting.Craft(gm.Inventory, recipe); }, can);
                btn.style.fontSize = 14;
                UIK.Pad(btn, 8, 12);
                btn.SetEnabled(can);
                if (!can) btn.style.opacity = 0.45f;
            }
            invDirty = false;
        }

        // =====================================================================
        //  Menus
        // =====================================================================

        VisualElement Screen(string name, float dim)
        {
            var s = UIK.El(root, name);
            UIK.Fill(s);
            s.style.backgroundColor = new Color(0.01f, 0.02f, 0.04f, dim);
            s.style.alignItems = Align.Center;
            s.style.justifyContent = Justify.Center;
            UIK.Show(s, false);
            return s;
        }

        void BuildMenus()
        {
            // ---- menu inicial
            menuScreen = Screen("menu", 0.55f);
            var box = UIK.El(menuScreen);
            box.style.alignItems = Align.Center;
            box.style.width = 520;
            UIK.Eyebrow(box, "Protótipo · Era I", UIK.Cyan);
            var title = UIK.Txt(box, "ERA ZERO", 92, UIK.Text, true);
            title.style.letterSpacing = 10;
            var sub = UIK.Txt(box, "Vinte anos depois do Apagão, você acorda sozinho no Vale. Sobreviva, construa e reacenda a civilização.", 17, UIK.Muted);
            sub.style.unityTextAlign = TextAnchor.UpperCenter;
            sub.style.marginBottom = 26;
            var buttons = UIK.El(box);
            buttons.style.width = 320;
            continueBtn = UIK.Btn(buttons, "Continuar", () => gm.ContinueGame(), true);
            UIK.Btn(buttons, "Novo jogo", () => gm.NewGame(), false);
            UIK.Btn(buttons, "Sair", () => gm.QuitGame(), false);
            var help = UIK.Txt(box, "WASD andar · Mouse olhar · Clique golpear/coletar · E pegar · Tab inventário", 14, UIK.Muted);
            help.style.marginTop = 22;

            inputWarning = UIK.PanelBox(box, true);
            inputWarning.style.marginTop = 20;
            UIK.BorderAll(inputWarning, 1, UIK.Red);
            UIK.Txt(inputWarning, "O TECLADO AINDA NÃO ESTÁ LIGADO", 16, UIK.Red, true);
            UIK.Txt(inputWarning, "No Unity, vá em Edit > Project Settings > Player > Other Settings > Active Input Handling e escolha \"Both\". O Unity vai reiniciar. Depois é só apertar Play de novo.", 14, UIK.Text).style.marginTop = 6;
            UIK.Show(inputWarning, !GameInput.Available);

            // ---- pausa
            pauseScreen = Screen("pausa", 0.6f);
            var pbox = UIK.El(pauseScreen);
            pbox.style.width = 320;
            pbox.style.alignItems = Align.Stretch;
            var pt = UIK.Txt(pbox, "PAUSA", 44, UIK.Text, true);
            pt.style.unityTextAlign = TextAnchor.MiddleCenter;
            pt.style.marginBottom = 16;
            UIK.Btn(pbox, "Voltar ao jogo", () => gm.SetState(GameState.Playing), true);
            UIK.Btn(pbox, "Salvar", () => SaveSystem.Save(gm), false);
            UIK.Btn(pbox, "Salvar e sair", () => gm.QuitGame(), false);

            // ---- morte
            deathScreen = Screen("morte", 0.7f);
            deathScreen.style.backgroundColor = new Color(0.15f, 0.01f, 0.01f, 0.7f);
            var dbox = UIK.El(deathScreen);
            dbox.style.alignItems = Align.Center;
            UIK.Txt(dbox, "VOCÊ MORREU", 60, UIK.Red, true).style.letterSpacing = 6;
            var dt = UIK.Txt(dbox, "Você mantém seus itens. Fique de olho na fome, na sede e no frio da noite.", 17, UIK.Text);
            dt.style.marginTop = 8; dt.style.marginBottom = 20;
            var rb = UIK.Btn(dbox, "Renascer", () => gm.Respawn(), true);
            rb.style.width = 260;
        }

        public void OnStateChanged(GameState s)
        {
            if (root == null) return;
            UIK.Show(menuScreen, s == GameState.Menu);
            UIK.Show(pauseScreen, s == GameState.Paused);
            UIK.Show(deathScreen, s == GameState.Dead);
            UIK.Show(invScreen, s == GameState.Inventory);
            UIK.Show(hud, s != GameState.Menu);
            UIK.Show(continueBtn, SaveSystem.HasSave);
            if (s == GameState.Inventory) { pickedSlot = -1; invDirty = true; itemInfo.text = ""; }
        }

        // =====================================================================
        //  Avisos
        // =====================================================================

        void OnGathered(string id, int amount) => AddToast("gather_" + id, $"+{{0}} {ItemDB.Name(id)}", amount, UIK.Cyan);

        void OnNotify(string text, Color color) => AddToast(null, text, 0, color);

        void AddToast(string key, string text, int amount, Color color)
        {
            if (toastBox == null) return;
            if (key != null)
            {
                var existing = toasts.Find(t => t.key == key);
                if (existing != null)
                {
                    existing.amount += amount;
                    existing.label.text = string.Format(text, existing.amount);
                    existing.until = Time.unscaledTime + 3f;
                    return;
                }
            }
            var el = UIK.PanelBox(toastBox);
            UIK.Pad(el, 8, 14);
            el.style.marginBottom = 6;
            el.style.borderLeftWidth = 3;
            el.style.borderLeftColor = color;
            var label = UIK.Txt(el, key != null ? string.Format(text, amount) : text, 15, color == UIK.Text ? UIK.Text : color, true);
            label.style.maxWidth = 360;
            toasts.Add(new Toast { el = el, label = label, until = Time.unscaledTime + (key != null ? 3f : 4.5f), key = key, amount = amount });
            if (toasts.Count > 6) { toasts[0].el.RemoveFromHierarchy(); toasts.RemoveAt(0); }
        }

        void OnBanner(string title, string text)
        {
            if (bannerBox == null) return;
            bannerTitle.text = title;
            bannerText.text = text;
            UIK.Show(bannerText, !string.IsNullOrEmpty(text));
            UIK.Show(bannerBox, true);
            bannerUntil = Time.unscaledTime + 7f;
        }

        void RefreshQuests()
        {
            if (questList == null) return;
            questTitle.text = gm.Quests.EraComplete ? "Era I concluída!" : gm.Quests.Title;
            questList.Clear();
            foreach (var o in gm.Quests.Objectives)
            {
                var r = UIK.Row(questList);
                r.style.marginTop = 7;
                r.style.alignItems = Align.FlexStart;
                var box = UIK.El(r);
                UIK.Size(box, 15, 15);
                box.style.flexShrink = 0;
                box.style.marginTop = 2;
                UIK.BorderAll(box, 2, UIK.Cyan);
                UIK.Radius(box, 3);
                box.style.backgroundColor = o.Done ? UIK.Cyan : Color.clear;
                var t = UIK.Txt(r, o.text, 15, o.Done ? UIK.Muted : UIK.Text);
                t.style.flexGrow = 1;
                t.style.flexShrink = 1;
                t.style.marginLeft = 10;
                if (o.target > 1)
                {
                    var p = UIK.Txt(r, $"{o.progress}/{o.target}", 14, o.Done ? UIK.Muted : UIK.Amber, true);
                    p.style.marginLeft = 8;
                }
            }
        }

        // =====================================================================
        //  Atualização a cada quadro
        // =====================================================================

        static readonly string[] Dirs = { "N", "NE", "L", "SE", "S", "SO", "O", "NO" };

        void Update()
        {
            if (gm == null || root == null) return;
            var st = gm.Stats;

            SetBar(fHealth, vHealth, st.Health);
            SetBar(fHunger, vHunger, st.Hunger);
            SetBar(fThirst, vThirst, st.Thirst);
            SetBar(fStamina, vStamina, st.Stamina);
            float temp = st.FeelsTemp;
            fTemp.style.width = Length.Percent(Mathf.Clamp01((temp + 5f) / 45f) * 100f);
            fTemp.style.backgroundColor = temp < PlayerStats.ColdLimit ? UIK.ThirstCol : temp > 30 ? UIK.HealthCol : UIK.Amber;
            vTemp.text = $"{Mathf.RoundToInt(temp)}°";
            tempHint.text = temp < PlayerStats.ColdLimit ? "Você está com frio. Fique perto de uma fogueira ou de um abrigo."
                          : st.NearFire ? "Aquecido pela fogueira" : st.Sheltered ? "Protegido no abrigo" : "";
            tempHint.style.color = temp < PlayerStats.ColdLimit ? UIK.ThirstCol : UIK.Muted;
            UIK.Show(tempHint, tempHint.text.Length > 0);

            float yaw = gm.Player.transform.eulerAngles.y;
            compass.text = $"{Dirs[Mathf.RoundToInt(yaw / 45f) % 8]}  ·  {Mathf.RoundToInt(yaw) % 360}°";
            clock.text = $"DIA {gm.DayNight.Day}  ·  {gm.DayNight.Clock}  ·  {(gm.DayNight.IsNight ? "Noite" : "Dia")}";

            // mira e dicas
            var inter = gm.Interaction;
            prompt.text = inter.Prompt;
            UIK.Show(prompt, !string.IsNullOrEmpty(inter.Prompt) && gm.State == GameState.Playing);
            crosshair.style.backgroundColor = inter.HitMarker ? UIK.Amber : new Color(1, 1, 1, 0.9f);
            float cs = inter.HitMarker ? 10 : 6;
            UIK.Size(crosshair, cs, cs);
            crosshair.style.translate = new Translate(-cs / 2, -cs / 2);

            var b = gm.Building;
            var buildBox = hud.Q("build");
            UIK.Show(buildBox, b.IsActive && gm.State == GameState.Playing);
            if (b.IsActive)
            {
                buildName.text = b.PieceName;
                buildStatus.text = b.Status;
                buildStatus.style.color = b.StatusValid ? UIK.Green : UIK.Red;
            }

            // barra rápida
            var inv = gm.Inventory;
            for (int i = 0; i < Inventory.HotbarSize; i++)
            {
                PaintSlot(inv.slots[i], hotIcons[i], hotLabels[i], hotCounts[i]);
                bool sel = i == inter.SelectedSlot;
                UIK.BorderAll(hotSlots[i], sel ? 2 : 1, sel ? UIK.Cyan : UIK.Border);
                hotSlots[i].style.backgroundColor = sel ? new Color(0.08f, 0.24f, 0.3f, 0.85f) : UIK.Panel;
            }
            var selDef = inter.SelectedDef;
            selectedName.text = selDef != null ? selDef.name.ToUpperInvariant() : "MÃOS LIVRES";

            // era
            float prog = gm.Quests.Progress01;
            eraFill.style.width = Length.Percent(prog * 100f);
            eraLabel.text = $"ERA I · {Mathf.RoundToInt(prog * 100f)}%";

            // inventário
            if (gm.State == GameState.Inventory && invDirty) RefreshInventory();

            // efeitos
            if (flash > 0f) flash = Mathf.Max(0f, flash - Time.unscaledDeltaTime);
            float lowHealth = st.Health < 25f ? (0.12f + Mathf.Sin(Time.unscaledTime * 4f) * 0.05f) : 0f;
            damageFlash.style.backgroundColor = new Color(0.8f, 0.05f, 0.05f, Mathf.Max(flash * 0.6f, lowHealth));

            for (int i = toasts.Count - 1; i >= 0; i--)
            {
                var t = toasts[i];
                float left = t.until - Time.unscaledTime;
                t.el.style.opacity = Mathf.Clamp01(left / 0.6f);
                if (left <= 0f) { t.el.RemoveFromHierarchy(); toasts.RemoveAt(i); }
            }

            if (bannerBox.style.display.value == DisplayStyle.Flex)
            {
                float left = bannerUntil - Time.unscaledTime;
                bannerBox.style.opacity = Mathf.Clamp01(left / 1.2f);
                if (left <= 0f) UIK.Show(bannerBox, false);
            }
        }

        static void SetBar(VisualElement fill, Label value, float v)
        {
            fill.style.width = Length.Percent(Mathf.Clamp(v, 0, 100));
            value.text = Mathf.CeilToInt(v).ToString();
        }
    }
}
