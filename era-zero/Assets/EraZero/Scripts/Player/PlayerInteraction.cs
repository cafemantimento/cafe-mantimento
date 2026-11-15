using UnityEngine;

namespace EraZero
{
    /// <summary>
    /// Mira, golpes, coleta, uso de itens e a barra rápida (1 a 8).
    /// </summary>
    public class PlayerInteraction : MonoBehaviour
    {
        public const float Reach = 3.6f;
        const float SwingCooldown = 0.55f;

        public int SelectedSlot { get; private set; }
        public string Prompt { get; private set; } = "";
        public bool HitMarker => Time.time - lastHitTime < 0.12f;

        PlayerController controller;
        PlayerStats stats;
        HeldItemView view;
        float nextSwing;
        float lastHitTime;

        public ItemStack SelectedStack => GameManager.I.Inventory.slots[SelectedSlot];
        public ItemDef SelectedDef => SelectedStack?.Def;

        public void Init(HeldItemView heldView)
        {
            controller = GetComponent<PlayerController>();
            stats = GetComponent<PlayerStats>();
            view = heldView;
            GameManager.I.Inventory.Changed += RefreshHeld;
            RefreshHeld();
        }

        void OnDestroy()
        {
            if (GameManager.I != null && GameManager.I.Inventory != null) GameManager.I.Inventory.Changed -= RefreshHeld;
        }

        public void Select(int slot)
        {
            SelectedSlot = Mathf.Clamp(slot, 0, Inventory.HotbarSize - 1);
            RefreshHeld();
        }

        void RefreshHeld()
        {
            var def = SelectedDef;
            view.Show(def);
            GameManager.I.Building.SetPiece(def != null && def.kind == ItemKind.Placeable ? def.pieceId : null);
        }

        void Update()
        {
            Prompt = "";
            if (GameManager.I.State != GameState.Playing || stats.IsDead) return;

            // barra rápida
            for (int i = 0; i < Inventory.HotbarSize; i++)
                if (GameInput.Down(KeyCode.Alpha1 + i)) Select(i);
            float scroll = GameInput.Scroll;
            if (scroll > 0.01f) Select((SelectedSlot + Inventory.HotbarSize - 1) % Inventory.HotbarSize);
            else if (scroll < -0.01f) Select((SelectedSlot + 1) % Inventory.HotbarSize);

            var building = GameManager.I.Building;
            var ray = controller.Cam.ViewportPointToRay(new Vector3(0.5f, 0.5f, 0));
            bool hasHit = Physics.Raycast(ray, out var hit, Reach, ~(1 << 2), QueryTriggerInteraction.Collide);

            IInteractable interactable = null;
            IDamageable damageable = null;
            BuildPiece piece = null;
            if (hasHit)
            {
                interactable = hit.collider.GetComponentInParent<IInteractable>();
                damageable = hit.collider.GetComponentInParent<IDamageable>();
                piece = hit.collider.GetComponentInParent<BuildPiece>();
            }

            // E: interagir
            if (interactable != null)
            {
                Prompt = interactable.Prompt(this);
                if (GameInput.Down(KeyCode.E)) interactable.Interact(this);
            }

            // X: desmontar peça construída
            if (piece != null && !building.IsActive)
            {
                if (string.IsNullOrEmpty(Prompt)) Prompt = $"[X] Desmontar {ItemDB.Name(piece.id)}";
                else Prompt += $"\n[X] Desmontar {ItemDB.Name(piece.id)}";
                if (GameInput.Down(KeyCode.X)) building.Demolish(piece);
            }

            // modo construção: o clique coloca a peça (tratado no BuildingSystem)
            if (building.IsActive) return;

            if (damageable != null && interactable == null)
                Prompt = damageable.HitPrompt(SelectedDef);

            // clique esquerdo: golpear (segurar continua golpeando)
            if (GameInput.Mouse(0) && Time.time >= nextSwing)
            {
                nextSwing = Time.time + SwingCooldown;
                view.Swing();
                if (damageable != null && stats.UseStamina(3f))
                {
                    var def = SelectedDef;
                    damageable.TakeHit(new HitInfo
                    {
                        damage = def != null && def.kind == ItemKind.Tool ? def.damage : 6f,
                        tool = def != null ? def.tool : ToolType.None,
                        point = hit.point,
                        source = this
                    });
                    lastHitTime = Time.time;
                }
            }

            // clique direito: comer o item selecionado
            if (GameInput.MouseDown(1))
            {
                var def = SelectedDef;
                if (def != null && def.kind == ItemKind.Food)
                {
                    stats.Eat(def);
                    GameManager.I.Inventory.RemoveFromSlot(SelectedSlot, 1);
                    GameEvents.RaiseNotify("Comeu: " + def.name, UIK.Amber);
                }
            }
        }
    }
}
