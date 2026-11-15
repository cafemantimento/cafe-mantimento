using System.Collections;
using UnityEngine;

namespace EraZero
{
    public enum NodeType { Tree, Rock, Bush, Scrap }

    /// <summary>
    /// Árvore, rocha, arbusto ou sucata. Cada golpe dá recursos na hora (como no Ark).
    /// Quando acaba, some e volta a crescer depois de alguns minutos.
    /// </summary>
    public class ResourceNode : MonoBehaviour, IDamageable
    {
        const float RespawnSeconds = 300f;

        public NodeType type;
        public string displayName;
        float maxHp = 100f;
        float hp;
        bool depleted;
        float respawnAt;
        float shake;
        Vector3 basePos;
        Quaternion baseRot;
        Vector3 baseScale;
        Renderer[] renderers;
        Collider[] colliders;

        public void Setup(NodeType t, string name)
        {
            type = t;
            displayName = name;
            maxHp = t == NodeType.Bush ? 40f : t == NodeType.Scrap ? 80f : 100f;
            hp = maxHp;
            renderers = GetComponentsInChildren<Renderer>();
            colliders = GetComponentsInChildren<Collider>();
            enabled = false; // só roda Update quando está tremendo ou esperando renascer
        }

        ToolType Preferred => type == NodeType.Tree ? ToolType.Axe
                            : type == NodeType.Rock || type == NodeType.Scrap ? ToolType.Pickaxe
                            : ToolType.None;

        public string HitPrompt(ItemDef held)
        {
            string verb = type == NodeType.Tree ? "Cortar" : type == NodeType.Bush ? "Colher" : "Quebrar";
            string tip = "";
            var tool = held != null ? held.tool : ToolType.None;
            if (Preferred == ToolType.Axe && tool != ToolType.Axe) tip = "  (machado rende mais)";
            if (Preferred == ToolType.Pickaxe && tool != ToolType.Pickaxe) tip = "  (picareta rende mais)";
            return $"[Clique] {verb} {displayName}{tip}";
        }

        public void TakeHit(HitInfo hit)
        {
            if (depleted) return;
            bool good = Preferred != ToolType.None && hit.tool == Preferred;
            float dmg = type == NodeType.Bush ? 10f : good ? 25f : 12f;
            hp -= dmg;

            var inv = GameManager.I.Inventory;
            switch (type)
            {
                case NodeType.Tree:
                    Give(inv, "madeira", good ? 3 : 1);
                    if (Random.value < 0.15f) Give(inv, "fibra", 1);
                    break;
                case NodeType.Rock:
                    Give(inv, "pedra", good ? 3 : 1);
                    float flintChance = hit.tool == ToolType.Axe ? 0.5f : good ? 0.25f : 0.1f;
                    if (Random.value < flintChance) Give(inv, "silex", 1);
                    break;
                case NodeType.Bush:
                    Give(inv, "frutinha", 2);
                    Give(inv, "fibra", 2);
                    break;
                case NodeType.Scrap:
                    Give(inv, "sucata", good ? 2 : 1);
                    break;
            }

            Chips.Spawn(hit.point, type == NodeType.Tree ? new Color(0.6f, 0.45f, 0.28f)
                                  : type == NodeType.Bush ? new Color(0.3f, 0.5f, 0.2f)
                                  : type == NodeType.Scrap ? new Color(0.5f, 0.3f, 0.2f)
                                  : new Color(0.6f, 0.6f, 0.6f));

            if (!enabled) { basePos = transform.position; baseRot = transform.rotation; baseScale = transform.localScale; }
            shake = 0.18f;
            enabled = true;

            if (hp <= 0f) StartCoroutine(Deplete(hit.source != null ? hit.source.transform.position : transform.position));
        }

        static void Give(Inventory inv, string id, int amount)
        {
            int left = inv.Add(id, amount);
            int got = amount - left;
            if (got > 0) GameEvents.RaiseItemGathered(id, got);
            if (left > 0) GameEvents.RaiseNotify("Inventário cheio", UIK.Red);
        }

        IEnumerator Deplete(Vector3 from)
        {
            depleted = true;
            respawnAt = float.MaxValue;
            shake = 0f;
            transform.position = basePos;
            if (type == NodeType.Tree)
            {
                foreach (var c in colliders) c.enabled = false;
                var away = transform.position - from; away.y = 0;
                if (away.sqrMagnitude < 0.01f) away = Vector3.forward;
                var axis = Vector3.Cross(Vector3.up, away.normalized);
                float angle = 0f, speed = 10f;
                while (angle < 88f)
                {
                    speed += 160f * Time.deltaTime;
                    float step = Mathf.Min(speed * Time.deltaTime, 88f - angle);
                    transform.RotateAround(basePos, axis, step);
                    angle += step;
                    yield return null;
                }
                yield return new WaitForSeconds(1.2f);
                Chips.Spawn(transform.position + away.normalized * 3f + Vector3.up * 0.5f, new Color(0.3f, 0.45f, 0.2f), 14);
            }
            else
            {
                float t = 0f;
                while (t < 0.25f)
                {
                    t += Time.deltaTime;
                    transform.localScale = baseScale * (1f - t / 0.25f);
                    yield return null;
                }
            }
            foreach (var r in renderers) r.enabled = false;
            foreach (var c in colliders) c.enabled = false;
            respawnAt = Time.time + RespawnSeconds;
        }

        void Update()
        {
            if (shake > 0f)
            {
                shake -= Time.deltaTime;
                transform.position = basePos + Random.insideUnitSphere * 0.04f * (shake / 0.18f);
                if (shake <= 0f && !depleted) { transform.position = basePos; enabled = false; }
                return;
            }
            if (depleted && Time.time > respawnAt)
            {
                var player = GameManager.I.Player;
                if (player != null && Vector3.Distance(player.transform.position, basePos) < 15f)
                {
                    respawnAt = Time.time + 20f; // não renasce na frente do jogador
                    return;
                }
                transform.SetPositionAndRotation(basePos, baseRot);
                transform.localScale = baseScale;
                foreach (var r in renderers) r.enabled = true;
                foreach (var c in colliders) c.enabled = true;
                hp = maxHp;
                depleted = false;
                enabled = false;
            }
        }
    }

    /// <summary>Lascas que voam ao acertar algo.</summary>
    public static class Chips
    {
        public static void Spawn(Vector3 at, Color color, int count = 6)
        {
            var mat = MaterialLib.Get("lasca_" + ColorUtility.ToHtmlStringRGB(color), color);
            for (int i = 0; i < count; i++)
            {
                var go = new GameObject("Lasca");
                go.layer = 2;
                go.transform.position = at + Random.insideUnitSphere * 0.2f;
                go.transform.rotation = Random.rotation;
                go.transform.localScale = Vector3.one * Random.Range(0.05f, 0.12f);
                go.AddComponent<MeshFilter>().sharedMesh = MeshFactory.Primitive(PrimitiveType.Cube);
                go.AddComponent<MeshRenderer>().sharedMaterial = mat;
                go.AddComponent<BoxCollider>();
                var rb = go.AddComponent<Rigidbody>();
                rb.mass = 0.05f;
                rb.AddForce(Random.insideUnitSphere * 2.5f + Vector3.up * 2.5f, ForceMode.VelocityChange);
                Object.Destroy(go, 1.2f);
            }
        }
    }
}
