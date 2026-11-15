using UnityEngine;

namespace EraZero
{
    /// <summary>Item solto no chão que o jogador pega com E.</summary>
    public class Pickup : MonoBehaviour, IInteractable
    {
        public string itemId;
        public int amount = 1;
        public string displayName;
        public string extraItem;
        public string storyId;
        public string storyTitle;
        public string storyText;

        public string Prompt(PlayerInteraction p) =>
            string.IsNullOrEmpty(storyId) ? $"[E] Pegar {displayName}" : $"[E] Examinar {displayName}";

        public void Interact(PlayerInteraction p)
        {
            var inv = GameManager.I.Inventory;
            if (!string.IsNullOrEmpty(itemId))
            {
                if (inv.Add(itemId, amount) > 0) { GameEvents.RaiseNotify("Inventário cheio", UIK.Red); return; }
                GameEvents.RaiseItemGathered(itemId, amount);
            }
            if (!string.IsNullOrEmpty(extraItem) && inv.Add(extraItem, 1) == 0)
                GameEvents.RaiseItemGathered(extraItem, 1);

            if (!string.IsNullOrEmpty(storyId))
            {
                GameEvents.RaiseStoryFound(storyId);
                GameEvents.RaiseBanner(storyTitle, storyText);
            }
            Destroy(gameObject);
        }

        static Pickup Base(Transform parent, string name, Vector3 pos, float radius)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            go.transform.position = pos;
            var col = go.AddComponent<SphereCollider>();
            col.isTrigger = true;
            col.radius = radius;
            col.center = new Vector3(0, 0.15f, 0);
            return go.AddComponent<Pickup>();
        }

        public static void CreateStick(Transform parent, Vector3 pos, float yaw)
        {
            var p = Base(parent, "Galho", pos, 0.5f);
            p.itemId = "madeira"; p.amount = 2; p.displayName = "Galhos";
            var mat = MaterialLib.Get("galho", new Color(0.45f, 0.32f, 0.2f));
            MeshFactory.Shape(PrimitiveType.Cylinder, p.transform, new Vector3(0, 0.06f, 0), new Vector3(0.07f, 0.6f, 0.07f), mat, new Vector3(90, yaw, 0));
            MeshFactory.Shape(PrimitiveType.Cylinder, p.transform, new Vector3(0.12f, 0.08f, 0.1f), new Vector3(0.05f, 0.4f, 0.05f), mat, new Vector3(90, yaw + 40, 0));
        }

        public static void CreateStone(Transform parent, Vector3 pos, Mesh mesh, Material mat, bool withFlint)
        {
            var p = Base(parent, "PedraSolta", pos, 0.45f);
            p.itemId = "pedra"; p.amount = 2; p.displayName = withFlint ? "Pedras e Sílex" : "Pedras";
            if (withFlint) p.extraItem = "silex";
            var go = MeshFactory.MeshObject("Pedra", p.transform, mesh, mat);
            go.transform.localPosition = new Vector3(0, 0.08f, 0);
            go.transform.localScale = new Vector3(0.28f, 0.18f, 0.24f);
            if (withFlint)
            {
                var f = MeshFactory.MeshObject("Silex", p.transform, mesh, MaterialLib.Get("silex", new Color(0.2f, 0.22f, 0.28f), 0.6f));
                f.transform.localPosition = new Vector3(0.2f, 0.06f, 0.05f);
                f.transform.localScale = new Vector3(0.14f, 0.1f, 0.12f);
            }
        }

        public static void CreateRadio(Transform parent, Vector3 pos)
        {
            var p = Base(parent, "Radio", pos, 0.6f);
            p.storyId = "radio";
            p.displayName = "Rádio Quebrado";
            p.itemId = "sucata"; p.amount = 3;
            p.storyTitle = "UM SINAL NO RÁDIO";
            p.storyText = "Entre chiados, uma voz gravada repete: \"...aqui é a Estação Aurora... a rede caiu... quem ouvir, siga para o leste...\". Alguém, ou alguma coisa, ainda está transmitindo.";
            var body = MaterialLib.Get("radio", new Color(0.18f, 0.2f, 0.22f), 0.4f);
            var metal = MaterialLib.Get("metal_claro", new Color(0.7f, 0.72f, 0.75f), 0.6f, 0.6f);
            MeshFactory.Shape(PrimitiveType.Cube, p.transform, new Vector3(0, 0.15f, 0), new Vector3(0.5f, 0.3f, 0.2f), body);
            MeshFactory.Shape(PrimitiveType.Cylinder, p.transform, new Vector3(-0.12f, 0.15f, -0.105f), new Vector3(0.16f, 0.01f, 0.16f), metal, new Vector3(90, 0, 0));
            MeshFactory.Shape(PrimitiveType.Cylinder, p.transform, new Vector3(0.18f, 0.45f, 0), new Vector3(0.015f, 0.2f, 0.015f), metal, new Vector3(0, 0, -20));
            var led = MeshFactory.Shape(PrimitiveType.Sphere, p.transform, new Vector3(0.15f, 0.2f, -0.105f), Vector3.one * 0.04f,
                MaterialLib.Emissive("led_vermelho", new Color(1f, 0.2f, 0.1f), new Color(3f, 0.4f, 0.2f)));
            led.AddComponent<Blink>();
            var light = new GameObject("Luz").AddComponent<Light>();
            light.transform.SetParent(p.transform, false);
            light.transform.localPosition = new Vector3(0, 0.4f, -0.4f);
            light.type = LightType.Point; light.range = 3f; light.intensity = 1.2f; light.color = new Color(1f, 0.3f, 0.2f);
        }
    }
}
