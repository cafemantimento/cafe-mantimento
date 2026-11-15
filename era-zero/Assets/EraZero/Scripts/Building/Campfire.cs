using System.Collections.Generic;
using UnityEngine;

namespace EraZero
{
    /// <summary>Fogueira: aquece, ilumina e assa carne.</summary>
    public class Campfire : MonoBehaviour, IInteractable
    {
        public const float WarmRadius = 7f;
        const float CookSeconds = 6f;
        static readonly List<Campfire> all = new List<Campfire>();

        Light fireLight;
        Transform[] flames;
        int raw;
        int cooked;
        float cookTimer;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        static void ResetList() => all.Clear();

        public static bool WarmthAt(Vector3 p)
        {
            foreach (var f in all)
                if (f != null && (f.transform.position - p).sqrMagnitude < WarmRadius * WarmRadius) return true;
            return false;
        }

        public void Init()
        {
            var flameMat = MaterialLib.Emissive("chama", new Color(1f, 0.55f, 0.15f), new Color(4f, 1.6f, 0.3f));
            var coreMat = MaterialLib.Emissive("chama_nucleo", new Color(1f, 0.85f, 0.4f), new Color(5f, 3.5f, 1.2f));
            flames = new Transform[4];
            for (int i = 0; i < flames.Length; i++)
            {
                var mesh = MeshFactory.Cone(0.18f - i * 0.02f, 0.6f - i * 0.08f, 6, 0.3f, i);
                var go = MeshFactory.MeshObject("Chama", transform, mesh, i == 0 ? coreMat : flameMat);
                go.transform.localPosition = new Vector3((i - 1.5f) * 0.08f, 0.15f, (i % 2) * 0.08f - 0.04f);
                go.GetComponent<MeshRenderer>().shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
                flames[i] = go.transform;
            }
            fireLight = new GameObject("Luz").AddComponent<Light>();
            fireLight.transform.SetParent(transform, false);
            fireLight.transform.localPosition = new Vector3(0, 0.8f, 0);
            fireLight.type = LightType.Point;
            fireLight.color = new Color(1f, 0.6f, 0.3f);
            fireLight.range = 14f;
            fireLight.shadows = LightShadows.Soft;
        }

        void OnEnable() => all.Add(this);
        void OnDisable() => all.Remove(this);

        void Update()
        {
            float t = Time.time;
            if (fireLight != null) fireLight.intensity = 2.2f + Mathf.PerlinNoise(t * 6f, 0f) * 0.9f;
            if (flames != null)
                for (int i = 0; i < flames.Length; i++)
                {
                    float n = Mathf.PerlinNoise(t * 7f + i * 3.1f, i);
                    flames[i].localScale = new Vector3(1f, 0.7f + n * 0.7f, 1f);
                    flames[i].localRotation = Quaternion.Euler((n - 0.5f) * 12f, t * 40f + i * 90f, 0);
                }

            if (raw > 0)
            {
                cookTimer += Time.deltaTime;
                if (cookTimer >= CookSeconds)
                {
                    cookTimer = 0f;
                    raw--;
                    cooked++;
                }
            }
        }

        public string Prompt(PlayerInteraction p)
        {
            if (cooked > 0) return $"[E] Pegar {cooked} Carne Assada" + (raw > 0 ? $"   (assando mais {raw})" : "");
            int have = GameManager.I.Inventory.Count("carne_crua");
            if (have > 0) return $"[E] Colocar {have} Carne Crua para assar";
            if (raw > 0) return $"Assando carne... {raw} restante(s)";
            return "Fogueira: aquece e assa carne crua";
        }

        public void Interact(PlayerInteraction p)
        {
            var inv = GameManager.I.Inventory;
            if (cooked > 0)
            {
                int left = inv.Add("carne_assada", cooked);
                int got = cooked - left;
                cooked = left;
                if (got > 0)
                {
                    GameEvents.RaiseItemCooked("carne_assada", got);
                    GameEvents.RaiseNotify($"+{got} Carne Assada", UIK.Amber);
                }
                return;
            }
            int have = inv.Count("carne_crua");
            if (have > 0 && inv.Remove("carne_crua", have))
            {
                raw += have;
                GameEvents.RaiseNotify($"Assando {have} carne(s)...", UIK.Amber);
            }
        }
    }
}
