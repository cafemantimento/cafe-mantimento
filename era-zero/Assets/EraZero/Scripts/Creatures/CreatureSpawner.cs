using System.Collections.Generic;
using UnityEngine;

namespace EraZero
{
    /// <summary>Mantém javalis pelo Vale e solta lobos perto do jogador à noite.</summary>
    public class CreatureSpawner : MonoBehaviour
    {
        const int BoarTarget = 10;
        const int WolfMaxNight = 3;

        readonly List<Creature> creatures = new List<Creature>();
        float tick;

        public void Init()
        {
            for (int i = 0; i < BoarTarget; i++) SpawnAwayFromPlayer(CreatureKind.Boar, 30f, 170f);
        }

        public bool HostileNear(Vector3 p, float radius)
        {
            foreach (var c in creatures)
                if (c != null && c.IsHostile && (c.transform.position - p).sqrMagnitude < radius * radius) return true;
            return false;
        }

        void Update()
        {
            if (GameManager.I.State != GameState.Playing) return;
            tick -= Time.deltaTime;
            if (tick > 0f) return;
            tick = 8f;

            creatures.RemoveAll(c => c == null);
            int boars = 0, wolves = 0;
            foreach (var c in creatures)
            {
                if (c.IsDead) continue;
                if (c.kind == CreatureKind.Boar) boars++; else wolves++;
            }

            if (boars < BoarTarget) SpawnAwayFromPlayer(CreatureKind.Boar, 60f, 170f);

            var night = GameManager.I.DayNight.IsNight;
            var player = GameManager.I.Player.transform.position;
            if (night && wolves < WolfMaxNight && Random.value < 0.45f)
                SpawnNear(CreatureKind.Wolf, player, 40f, 55f);

            if (!night)
                foreach (var c in creatures)
                    if (c != null && c.kind == CreatureKind.Wolf && !c.IsDead && (c.transform.position - player).magnitude > 60f)
                        Destroy(c.gameObject);
        }

        void SpawnAwayFromPlayer(CreatureKind kind, float minDist, float maxRadius)
        {
            var w = WorldGenerator.I;
            var player = GameManager.I.Player != null ? GameManager.I.Player.transform.position : Vector3.zero;
            for (int i = 0; i < 20; i++)
            {
                var p = new Vector3(Random.Range(-maxRadius, maxRadius), 0, Random.Range(-maxRadius, maxRadius));
                if ((p - new Vector3(player.x, 0, player.z)).magnitude < minDist) continue;
                if (TrySpawn(kind, p)) return;
            }
        }

        void SpawnNear(CreatureKind kind, Vector3 center, float minR, float maxR)
        {
            for (int i = 0; i < 12; i++)
            {
                var dir = Quaternion.Euler(0, Random.Range(0f, 360f), 0) * Vector3.forward;
                var p = center + dir * Random.Range(minR, maxR);
                if (TrySpawn(kind, p)) return;
            }
        }

        bool TrySpawn(CreatureKind kind, Vector3 p)
        {
            var w = WorldGenerator.I;
            if (!w.InsidePlayable(p, 45f)) return false;
            float h = w.Height(p.x, p.z);
            if (h < WorldGenerator.WaterLevel + 0.5f || w.Steepness(p.x, p.z) > 28f) return false;
            p.y = h;
            creatures.Add(Creature.Create(kind, p));
            return true;
        }
    }
}
