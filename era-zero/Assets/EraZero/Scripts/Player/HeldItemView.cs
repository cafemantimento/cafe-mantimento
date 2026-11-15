using UnityEngine;

namespace EraZero
{
    /// <summary>Mostra na tela o item que o jogador está segurando, com animação de golpe.</summary>
    public class HeldItemView : MonoBehaviour
    {
        Transform holder;
        GameObject current;
        string currentId = "__none";
        float swingT = 1f;
        Vector3 restPos = new Vector3(0.38f, -0.36f, 0.62f);
        Quaternion restRot = Quaternion.Euler(8f, -12f, 0f);
        float bob;

        public void Init()
        {
            holder = new GameObject("Mao").transform;
            holder.SetParent(transform, false);
            holder.localPosition = restPos;
            holder.localRotation = restRot;
        }

        public void Swing()
        {
            if (swingT >= 0.6f) swingT = 0f;
        }

        public void Show(ItemDef def)
        {
            string id = def != null ? def.id : "";
            if (id == currentId) return;
            currentId = id;
            if (current != null) Destroy(current);
            current = Build(def);
            current.transform.SetParent(holder, false);
            MeshFactory.SetLayerRecursive(current, 2);
            foreach (var r in current.GetComponentsInChildren<Renderer>())
                r.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
        }

        GameObject Build(ItemDef def)
        {
            var root = new GameObject("Item");
            var t = root.transform;
            var skin = MaterialLib.Get("pele", new Color(0.76f, 0.56f, 0.42f));
            var wood = MaterialLib.Get("cabo", new Color(0.5f, 0.35f, 0.2f));
            var stone = MaterialLib.Get("cabeca_pedra", new Color(0.45f, 0.46f, 0.48f));
            var flint = MaterialLib.Get("silex", new Color(0.2f, 0.22f, 0.28f), 0.6f);

            if (def == null)
            {
                MeshFactory.Shape(PrimitiveType.Cube, t, new Vector3(0, -0.05f, 0), new Vector3(0.11f, 0.11f, 0.28f), skin);
                return root;
            }
            switch (def.tool)
            {
                case ToolType.Axe:
                    MeshFactory.Shape(PrimitiveType.Cylinder, t, new Vector3(0, 0.05f, 0), new Vector3(0.045f, 0.3f, 0.045f), wood);
                    MeshFactory.Shape(PrimitiveType.Cube, t, new Vector3(0.07f, 0.3f, 0), new Vector3(0.18f, 0.12f, 0.06f), stone);
                    MeshFactory.Shape(PrimitiveType.Cube, t, new Vector3(0, 0.3f, 0), new Vector3(0.06f, 0.06f, 0.07f), MaterialLib.Get("fibra_amarra", new Color(0.55f, 0.6f, 0.3f)));
                    return root;
                case ToolType.Pickaxe:
                    MeshFactory.Shape(PrimitiveType.Cylinder, t, new Vector3(0, 0.05f, 0), new Vector3(0.045f, 0.3f, 0.045f), wood);
                    MeshFactory.Shape(PrimitiveType.Cube, t, new Vector3(0, 0.32f, 0), new Vector3(0.36f, 0.06f, 0.06f), stone, new Vector3(0, 0, 8));
                    return root;
                case ToolType.Spear:
                    MeshFactory.Shape(PrimitiveType.Cylinder, t, new Vector3(0, 0.15f, 0.1f), new Vector3(0.035f, 0.6f, 0.035f), wood, new Vector3(70, 0, 0));
                    MeshFactory.Shape(PrimitiveType.Cube, t, new Vector3(0, 0.36f, 0.7f), new Vector3(0.05f, 0.05f, 0.16f), flint, new Vector3(-20, 0, 45));
                    return root;
            }
            if (def.kind == ItemKind.Placeable)
            {
                var holo = MaterialLib.Emissive("plano_construcao", new Color(0.1f, 0.25f, 0.3f), new Color(0.2f, 0.8f, 1f));
                MeshFactory.Shape(PrimitiveType.Cube, t, new Vector3(0, 0, 0), new Vector3(0.22f, 0.02f, 0.3f), holo, new Vector3(-30, 0, 0));
                return root;
            }
            var mat = MaterialLib.Get("item_" + def.id, def.color);
            MeshFactory.Shape(def.kind == ItemKind.Food ? PrimitiveType.Sphere : PrimitiveType.Cube, t, Vector3.zero, Vector3.one * 0.13f, mat);
            return root;
        }

        void Update()
        {
            if (holder == null) return;
            var player = GameManager.I.Player;
            float speed = player != null && player.IsSprinting ? 11f : 7f;
            bool moving = GameManager.I.State == GameState.Playing && GameInput.Move.sqrMagnitude > 0.01f;
            bob = moving ? bob + Time.deltaTime * speed : Mathf.Lerp(bob, 0f, Time.deltaTime * 4f);
            var bobOffset = new Vector3(Mathf.Cos(bob) * 0.012f, Mathf.Abs(Mathf.Sin(bob)) * 0.018f, 0f);

            Quaternion swingRot = Quaternion.identity;
            Vector3 swingPos = Vector3.zero;
            if (swingT < 1f)
            {
                swingT = Mathf.Min(1f, swingT + Time.deltaTime / 0.42f);
                float k = swingT < 0.35f ? swingT / 0.35f : 1f - (swingT - 0.35f) / 0.65f;
                k = Mathf.Sin(k * Mathf.PI * 0.5f);
                swingRot = Quaternion.Euler(-70f * k, 15f * k, 25f * k);
                swingPos = new Vector3(-0.12f, 0.05f, 0.12f) * k;
            }
            holder.localPosition = restPos + bobOffset + swingPos;
            holder.localRotation = restRot * swingRot;
        }
    }
}
