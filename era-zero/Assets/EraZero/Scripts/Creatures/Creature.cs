using UnityEngine;

namespace EraZero
{
    public enum CreatureKind { Boar, Wolf }

    /// <summary>
    /// Animais do Vale. Javalis fogem quando atacados; lobos caçam à noite.
    /// Depois de abatido, o corpo pode ser golpeado para tirar carne e couro (como no Ark).
    /// </summary>
    public class Creature : MonoBehaviour, IDamageable
    {
        enum State { Wander, Idle, Flee, Chase, Dead }

        public CreatureKind kind;
        public bool IsHostile => kind == CreatureKind.Wolf && state != State.Dead;
        public bool IsDead => state == State.Dead;

        string displayName;
        float maxHp, hp;
        float walkSpeed, runSpeed;
        State state = State.Idle;
        Vector3 target;
        float stateTimer;
        float attackTimer;
        float legPhase;
        int harvestLeft;
        float deadTime;
        Transform body;
        Transform[] legs;
        Renderer[] renderers;
        float hurtFlash;

        public static Creature Create(CreatureKind kind, Vector3 pos)
        {
            var go = new GameObject(kind == CreatureKind.Boar ? "Javali" : "Lobo");
            go.transform.position = pos;
            go.transform.rotation = Quaternion.Euler(0, Random.Range(0f, 360f), 0);
            var c = go.AddComponent<Creature>();
            c.kind = kind;
            c.Build();
            return c;
        }

        void Build()
        {
            body = new GameObject("Corpo").transform;
            body.SetParent(transform, false);
            legs = new Transform[4];

            if (kind == CreatureKind.Boar)
            {
                displayName = "Javali"; maxHp = 60f; walkSpeed = 1.6f; runSpeed = 6.5f;
                var fur = MaterialLib.Get("javali", new Color(0.35f, 0.25f, 0.18f));
                var dark = MaterialLib.Get("javali_escuro", new Color(0.2f, 0.14f, 0.1f));
                var snout = MaterialLib.Get("focinho", new Color(0.75f, 0.5f, 0.45f));
                var tusk = MaterialLib.Get("presa", new Color(0.92f, 0.9f, 0.82f));
                MeshFactory.Shape(PrimitiveType.Sphere, body, new Vector3(0, 0.62f, 0), new Vector3(0.75f, 0.7f, 1.3f), fur);
                MeshFactory.Shape(PrimitiveType.Cube, body, new Vector3(0, 0.95f, -0.05f), new Vector3(0.12f, 0.12f, 0.9f), dark);
                var head = MeshFactory.Shape(PrimitiveType.Cube, body, new Vector3(0, 0.62f, 0.72f), new Vector3(0.45f, 0.42f, 0.45f), fur).transform;
                MeshFactory.Shape(PrimitiveType.Cylinder, head, new Vector3(0, -0.1f, 0.6f), new Vector3(0.55f, 0.3f, 0.55f), snout, new Vector3(90, 0, 0));
                MeshFactory.Shape(PrimitiveType.Cube, head, new Vector3(0.28f, -0.2f, 0.55f), new Vector3(0.08f, 0.3f, 0.08f), tusk, new Vector3(-30, 0, 0));
                MeshFactory.Shape(PrimitiveType.Cube, head, new Vector3(-0.28f, -0.2f, 0.55f), new Vector3(0.08f, 0.3f, 0.08f), tusk, new Vector3(-30, 0, 0));
                MeshFactory.Shape(PrimitiveType.Cube, head, new Vector3(0.3f, 0.5f, -0.1f), new Vector3(0.2f, 0.35f, 0.08f), dark);
                MeshFactory.Shape(PrimitiveType.Cube, head, new Vector3(-0.3f, 0.5f, -0.1f), new Vector3(0.2f, 0.35f, 0.08f), dark);
                BuildLegs(dark, 0.25f, 0.45f, 0.42f, 0.4f);
                AddCollider(new Vector3(0, 0.62f, 0.1f), new Vector3(0.8f, 0.8f, 1.7f));
            }
            else
            {
                displayName = "Lobo"; maxHp = 50f; walkSpeed = 2.2f; runSpeed = 7.2f;
                var fur = MaterialLib.Get("lobo", new Color(0.42f, 0.42f, 0.44f));
                var dark = MaterialLib.Get("lobo_escuro", new Color(0.22f, 0.22f, 0.24f));
                var eye = MaterialLib.Emissive("olho_lobo", new Color(1f, 0.8f, 0.2f), new Color(3f, 2.2f, 0.4f));
                MeshFactory.Shape(PrimitiveType.Sphere, body, new Vector3(0, 0.8f, 0), new Vector3(0.55f, 0.6f, 1.35f), fur);
                var head = MeshFactory.Shape(PrimitiveType.Cube, body, new Vector3(0, 1.05f, 0.78f), new Vector3(0.38f, 0.36f, 0.42f), fur).transform;
                MeshFactory.Shape(PrimitiveType.Cube, head, new Vector3(0, -0.15f, 0.7f), new Vector3(0.5f, 0.45f, 0.7f), dark);
                MeshFactory.Shape(PrimitiveType.Cube, head, new Vector3(0.28f, 0.6f, -0.1f), new Vector3(0.2f, 0.45f, 0.1f), dark, new Vector3(0, 0, -10));
                MeshFactory.Shape(PrimitiveType.Cube, head, new Vector3(-0.28f, 0.6f, -0.1f), new Vector3(0.2f, 0.45f, 0.1f), dark, new Vector3(0, 0, 10));
                MeshFactory.Shape(PrimitiveType.Sphere, head, new Vector3(0.24f, 0.15f, 0.5f), Vector3.one * 0.13f, eye);
                MeshFactory.Shape(PrimitiveType.Sphere, head, new Vector3(-0.24f, 0.15f, 0.5f), Vector3.one * 0.13f, eye);
                MeshFactory.Shape(PrimitiveType.Cube, body, new Vector3(0, 0.95f, -0.85f), new Vector3(0.14f, 0.14f, 0.6f), dark, new Vector3(-35, 0, 0));
                BuildLegs(dark, 0.18f, 0.6f, 0.5f, 0.2f);
                AddCollider(new Vector3(0, 0.8f, 0.15f), new Vector3(0.6f, 0.9f, 1.8f));
            }
            hp = maxHp;
            renderers = GetComponentsInChildren<Renderer>();
        }

        void BuildLegs(Material mat, float thick, float length, float zOff, float xOff)
        {
            int i = 0;
            foreach (var pos in new[] { new Vector3(xOff / 2 + 0.05f, length, zOff), new Vector3(-xOff / 2 - 0.05f, length, zOff), new Vector3(xOff / 2 + 0.05f, length, -zOff), new Vector3(-xOff / 2 - 0.05f, length, -zOff) })
            {
                var pivot = new GameObject("Perna").transform;
                pivot.SetParent(body, false);
                pivot.localPosition = pos;
                MeshFactory.Shape(PrimitiveType.Cube, pivot, new Vector3(0, -length / 2, 0), new Vector3(thick, length, thick), mat);
                legs[i++] = pivot;
            }
        }

        void AddCollider(Vector3 center, Vector3 size)
        {
            var col = gameObject.AddComponent<BoxCollider>();
            col.center = center;
            col.size = size;
        }

        // ---------------- comportamento ----------------

        void Update()
        {
            if (GameManager.I.State != GameState.Playing) return;
            float dt = Time.deltaTime;
            var playerT = GameManager.I.Player.transform;
            var toPlayer = playerT.position - transform.position;
            float dist = toPlayer.magnitude;

            if (hurtFlash > 0f)
            {
                hurtFlash -= dt;
                body.localScale = Vector3.one * (1f + hurtFlash * 0.4f);
            }

            if (state == State.Dead)
            {
                if (Time.time - deadTime > 90f) Destroy(gameObject);
                return;
            }

            stateTimer -= dt;
            float speed = 0f;
            switch (state)
            {
                case State.Idle:
                    if (stateTimer <= 0f) PickWander();
                    break;
                case State.Wander:
                    speed = walkSpeed;
                    if (stateTimer <= 0f || Flat(target - transform.position).magnitude < 1f) { state = State.Idle; stateTimer = Random.Range(2f, 6f); }
                    break;
                case State.Flee:
                    speed = runSpeed;
                    target = transform.position - toPlayer.normalized * 10f;
                    if (stateTimer <= 0f) { state = State.Idle; stateTimer = 2f; }
                    break;
                case State.Chase:
                    speed = runSpeed;
                    target = playerT.position;
                    attackTimer -= dt;
                    if (dist < 2.1f)
                    {
                        speed = 0f;
                        if (attackTimer <= 0f && !GameManager.I.Stats.IsDead)
                        {
                            attackTimer = 1.3f;
                            GameManager.I.Stats.Damage(9f);
                            hurtFlash = 0.15f;
                        }
                    }
                    if (dist > 45f) { state = State.Idle; stateTimer = 3f; }
                    break;
            }

            if (kind == CreatureKind.Wolf && state != State.Chase && !GameManager.I.Stats.IsDead)
            {
                float aggro = GameManager.I.DayNight.IsNight ? 26f : 12f;
                if (dist < aggro) state = State.Chase;
            }
            if (GameManager.I.Stats.IsDead && state == State.Chase) { state = State.Idle; stateTimer = 4f; }

            if (speed > 0f) MoveTowards(target, speed, dt);
            AnimateLegs(speed, dt);
        }

        static Vector3 Flat(Vector3 v) { v.y = 0; return v; }

        void PickWander()
        {
            for (int i = 0; i < 8; i++)
            {
                var t = transform.position + Quaternion.Euler(0, Random.Range(0f, 360f), 0) * Vector3.forward * Random.Range(6f, 18f);
                if (Walkable(t)) { target = t; state = State.Wander; stateTimer = 12f; return; }
            }
            stateTimer = 2f;
        }

        static bool Walkable(Vector3 p)
        {
            var w = WorldGenerator.I;
            return w.InsidePlayable(p, 45f) && w.Height(p.x, p.z) > WorldGenerator.WaterLevel + 0.4f && w.Steepness(p.x, p.z) < 32f;
        }

        void MoveTowards(Vector3 goal, float speed, float dt)
        {
            var dir = Flat(goal - transform.position);
            if (dir.sqrMagnitude < 0.01f) return;
            var rot = Quaternion.LookRotation(dir.normalized);
            transform.rotation = Quaternion.RotateTowards(transform.rotation, rot, 360f * dt);
            var next = transform.position + transform.forward * speed * dt;
            if (!Walkable(next))
            {
                if (state == State.Wander || state == State.Flee) { target = transform.position - dir; stateTimer = Mathf.Min(stateTimer, 2f); }
                return;
            }
            next.y = WorldGenerator.I.Height(next.x, next.z);
            transform.position = next;
        }

        void AnimateLegs(float speed, float dt)
        {
            if (speed > 0.1f) legPhase += dt * speed * 3.2f;
            else legPhase = Mathf.Lerp(legPhase, Mathf.Round(legPhase / Mathf.PI) * Mathf.PI, dt * 5f);
            float swing = Mathf.Sin(legPhase) * (speed > 0.1f ? 32f : 0f);
            if (legs[0] == null) return;
            legs[0].localRotation = Quaternion.Euler(swing, 0, 0);
            legs[3].localRotation = Quaternion.Euler(swing, 0, 0);
            legs[1].localRotation = Quaternion.Euler(-swing, 0, 0);
            legs[2].localRotation = Quaternion.Euler(-swing, 0, 0);
            body.localPosition = new Vector3(0, Mathf.Abs(Mathf.Sin(legPhase)) * 0.04f * Mathf.Min(speed, 3f), 0);
        }

        // ---------------- dano e coleta ----------------

        public string HitPrompt(ItemDef held)
        {
            if (state == State.Dead) return $"[Clique] Tirar carne e couro do {displayName} ({harvestLeft})";
            return $"[Clique] Atacar {displayName}   {Mathf.CeilToInt(hp)}/{Mathf.CeilToInt(maxHp)}";
        }

        public void TakeHit(HitInfo hit)
        {
            var inv = GameManager.I.Inventory;
            if (state == State.Dead)
            {
                if (harvestLeft <= 0) return;
                harvestLeft--;
                bool tool = hit.tool != ToolType.None;
                Give(inv, "carne_crua", tool ? 2 : 1);
                if (Random.value < (tool ? 0.7f : 0.4f)) Give(inv, "couro", 1);
                Chips.Spawn(hit.point, new Color(0.6f, 0.15f, 0.15f), 4);
                if (harvestLeft <= 0) Destroy(gameObject, 0.2f);
                return;
            }

            hp -= hit.damage;
            hurtFlash = 0.2f;
            Chips.Spawn(hit.point, new Color(0.6f, 0.12f, 0.12f), 5);
            if (hp <= 0f) { Die(); return; }

            if (kind == CreatureKind.Boar)
            {
                // javali às vezes revida antes de fugir
                if (Random.value < 0.35f && (GameManager.I.Player.transform.position - transform.position).magnitude < 2.6f)
                    GameManager.I.Stats.Damage(6f);
                state = State.Flee;
                stateTimer = 6f;
            }
            else state = State.Chase;
        }

        static void Give(Inventory inv, string id, int n)
        {
            int left = inv.Add(id, n);
            if (n - left > 0) GameEvents.RaiseItemGathered(id, n - left);
            if (left > 0) GameEvents.RaiseNotify("Inventário cheio", UIK.Red);
        }

        void Die()
        {
            state = State.Dead;
            deadTime = Time.time;
            harvestLeft = kind == CreatureKind.Boar ? 4 : 3;
            transform.rotation *= Quaternion.Euler(0, 0, 90f);
            transform.position += Vector3.up * 0.35f;
            foreach (var l in legs) if (l != null) l.localRotation = Quaternion.identity;
            GameEvents.RaiseNotify($"{displayName} abatido. Golpeie para coletar carne e couro.", UIK.Amber);
        }
    }
}
