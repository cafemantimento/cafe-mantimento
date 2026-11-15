using System;
using System.Collections.Generic;
using UnityEngine;

namespace EraZero
{
    [Serializable]
    public class PieceRecord
    {
        public string id;
        public Vector3 pos;
        public float rotY;
        public int cellX, cellZ;
        public string edgeKey;
        public float floorTop;
    }

    /// <summary>
    /// Construção por encaixe: fundações numa grade de 3 m, paredes nas bordas,
    /// tetos sobre as fundações. Fogueira e saco de dormir são livres.
    /// O jogador segura a peça na barra rápida e vê um holograma de onde ela vai ficar.
    /// </summary>
    public class BuildingSystem : MonoBehaviour
    {
        const float Range = 7f;

        public bool IsActive => pieceId != null;
        public string Status { get; private set; } = "";
        public bool StatusValid { get; private set; }
        public string PieceName => pieceId != null ? ItemDB.Name(pieceId) : "";

        readonly Dictionary<Vector2Int, float> foundations = new Dictionary<Vector2Int, float>();
        readonly HashSet<string> walls = new HashSet<string>();
        readonly HashSet<Vector2Int> roofs = new HashSet<Vector2Int>();
        readonly List<BuildPiece> placed = new List<BuildPiece>();

        public int FoundationCount => foundations.Count;
        public int WallCount => walls.Count;
        public int RoofCount => roofs.Count;

        string pieceId;
        GameObject ghost;
        float freeYaw;

        struct Placement
        {
            public bool has, valid;
            public string reason;
            public Vector3 pos;
            public float rotY;
            public Vector2Int cell;
            public string edge;
            public float floorTop;
        }
        Placement current;

        public void SetPiece(string id)
        {
            if (id == pieceId) return;
            pieceId = id;
            if (ghost != null) Destroy(ghost);
            ghost = null;
            if (id != null)
            {
                ghost = BuildPieces.Create(id, true);
                ghost.SetActive(false);
            }
        }

        void Update()
        {
            Status = "";
            if (!IsActive || GameManager.I.State != GameState.Playing || GameManager.I.Stats.IsDead)
            {
                if (ghost != null) ghost.SetActive(false);
                return;
            }

            if (GameInput.Down(KeyCode.R)) freeYaw = (freeYaw + 45f) % 360f;

            var cam = GameManager.I.Player.Cam;
            var ray = cam.ViewportPointToRay(new Vector3(0.5f, 0.5f, 0));
            current = Compute(ray);

            ghost.SetActive(current.has);
            if (current.has)
            {
                ghost.transform.SetPositionAndRotation(current.pos, Quaternion.Euler(0, current.rotY, 0));
                BuildPieces.SetGhostColor(ghost, current.valid);
            }
            StatusValid = current.has && current.valid;
            Status = !current.has ? "Mire no chão para posicionar" : current.valid ? "[Clique] Construir" + (BuildPieces.IsGrid(pieceId) ? "" : "   [R] Girar") : current.reason;

            if (current.has && current.valid && GameInput.MouseDown(0))
            {
                var inv = GameManager.I.Inventory;
                if (!inv.Has(pieceId, 1)) return;
                Place(pieceId, current.pos, current.rotY, current.cell, current.edge, current.floorTop);
                inv.Remove(pieceId, 1);
                GameEvents.RaisePiecePlaced(pieceId);
            }
        }

        Placement Compute(Ray ray)
        {
            var p = new Placement();
            bool hit = Physics.Raycast(ray, out var h, Range, ~(1 << 2), QueryTriggerInteraction.Ignore);
            var player = GameManager.I.Player.transform.position;
            var world = WorldGenerator.I;

            if (BuildPieces.IsFoundation(pieceId))
            {
                if (!hit) return p;
                var hitPiece = h.collider.GetComponentInParent<BuildPiece>();
                var cell = CellOf(h.point);
                float top;
                if (hitPiece != null && BuildPieces.IsFoundation(hitPiece.id))
                {
                    // encaixa ao lado de uma fundação existente, na mesma altura
                    var local = h.point - CellCenter(hitPiece.cell);
                    var dir = Mathf.Abs(local.x) > Mathf.Abs(local.z) ? new Vector2Int(local.x > 0 ? 1 : -1, 0) : new Vector2Int(0, local.z > 0 ? 1 : -1);
                    cell = hitPiece.cell + dir;
                    top = hitPiece.floorTop;
                }
                else
                {
                    CornerHeights(cell, out float min, out float max);
                    if (max - min > 1.8f) return Fail(ref p, CellCenter(cell, max), 0, "Terreno inclinado demais");
                    top = max + 0.15f;
                }
                CornerHeights(cell, out float mn, out float mx);
                p.has = true;
                p.pos = CellCenter(cell, top);
                p.cell = cell;
                p.floorTop = top;
                if (foundations.ContainsKey(cell)) return Fail(ref p, p.pos, 0, "Já existe uma fundação aqui");
                if (mx > top + 0.4f) return Fail(ref p, p.pos, 0, "O chão aqui é mais alto que o piso");
                if (top - mn > BuildPieces.FoundationDepth + 0.6f) return Fail(ref p, p.pos, 0, "Muito alto em relação ao chão");
                if (mn < WorldGenerator.WaterLevel - 0.3f) return Fail(ref p, p.pos, 0, "Não dá para construir na água");
                if (InsideCell(player, cell) && player.y < top + 0.2f) return Fail(ref p, p.pos, 0, "Saia de cima do lugar da fundação");
                p.valid = true;
                return p;
            }

            if (BuildPieces.IsWall(pieceId))
            {
                if (!hit) return p;
                var point = h.point - ray.direction * 0.05f;
                var cell = CellOf(point);
                if (!foundations.TryGetValue(cell, out float top))
                {
                    p.has = true;
                    return Fail(ref p, new Vector3(point.x, h.point.y, point.z), 0, "Paredes precisam de uma fundação");
                }
                var c = CellCenter(cell);
                float lx = point.x - (c.x - 1.5f), lz = point.z - (c.z - 1.5f);
                float n = 3f - lz, s = lz, e = 3f - lx, w = lx;
                float best = Mathf.Min(Mathf.Min(n, s), Mathf.Min(e, w));
                string key; Vector3 pos; float rot;
                if (best == n) { key = $"{cell.x}:{cell.y}:H"; pos = new Vector3(c.x, top, c.z + 1.5f); rot = 0; }
                else if (best == s) { key = $"{cell.x}:{cell.y - 1}:H"; pos = new Vector3(c.x, top, c.z - 1.5f); rot = 0; }
                else if (best == e) { key = $"{cell.x}:{cell.y}:V"; pos = new Vector3(c.x + 1.5f, top, c.z); rot = 90; }
                else { key = $"{cell.x - 1}:{cell.y}:V"; pos = new Vector3(c.x - 1.5f, top, c.z); rot = 90; }
                p.has = true; p.pos = pos; p.rotY = rot; p.cell = cell; p.edge = key; p.floorTop = top;
                if (walls.Contains(key)) return Fail(ref p, pos, rot, "Já existe uma parede aqui");
                p.valid = true;
                return p;
            }

            if (BuildPieces.IsRoof(pieceId))
            {
                var point = hit ? h.point - ray.direction * 0.05f : ray.GetPoint(4f);
                var cell = CellOf(point);
                if (!foundations.TryGetValue(cell, out float top))
                {
                    if (!hit) return p;
                    p.has = true;
                    return Fail(ref p, CellCenter(cell, point.y), 0, "O teto precisa de uma fundação embaixo");
                }
                p.has = true;
                p.pos = CellCenter(cell, top + BuildPieces.WallHeight);
                p.cell = cell; p.floorTop = top;
                if (roofs.Contains(cell)) return Fail(ref p, p.pos, 0, "Já existe um teto aqui");
                p.valid = true;
                return p;
            }

            // peças livres (fogueira, saco de dormir)
            if (!hit) return p;
            p.has = true;
            p.pos = h.point;
            p.rotY = GameManager.I.Player.transform.eulerAngles.y + freeYaw;
            if (h.normal.y < 0.7f) return Fail(ref p, p.pos, p.rotY, "Superfície inclinada demais");
            if (h.point.y < WorldGenerator.WaterLevel - 0.1f) return Fail(ref p, p.pos, p.rotY, "Não dá para colocar na água");
            var half = pieceId == "saco_dormir" ? new Vector3(0.5f, 0.2f, 1.05f) : new Vector3(0.65f, 0.3f, 0.65f);
            var hits = Physics.OverlapBox(p.pos + Vector3.up * (half.y + 0.05f), half, Quaternion.Euler(0, p.rotY, 0), ~(1 << 2), QueryTriggerInteraction.Ignore);
            foreach (var c in hits)
            {
                var bp = c.GetComponentInParent<BuildPiece>();
                if (bp != null && BuildPieces.IsFoundation(bp.id)) continue;
                if (c is TerrainCollider) continue;
                return Fail(ref p, p.pos, p.rotY, "Tem algo no caminho");
            }
            p.valid = true;
            return p;
        }

        static Placement Fail(ref Placement p, Vector3 pos, float rot, string reason)
        {
            p.has = true;
            p.valid = false;
            p.pos = pos;
            p.rotY = rot;
            p.reason = reason;
            return p;
        }

        static Vector2Int CellOf(Vector3 p) => new Vector2Int(Mathf.FloorToInt(p.x / BuildPieces.Cell), Mathf.FloorToInt(p.z / BuildPieces.Cell));
        static Vector3 CellCenter(Vector2Int c, float y = 0) => new Vector3(c.x * BuildPieces.Cell + BuildPieces.Cell / 2, y, c.y * BuildPieces.Cell + BuildPieces.Cell / 2);

        static bool InsideCell(Vector3 p, Vector2Int c)
        {
            var center = CellCenter(c);
            return Mathf.Abs(p.x - center.x) < 1.9f && Mathf.Abs(p.z - center.z) < 1.9f;
        }

        static void CornerHeights(Vector2Int cell, out float min, out float max)
        {
            var w = WorldGenerator.I;
            var c = CellCenter(cell);
            min = float.MaxValue; max = float.MinValue;
            for (int dx = -1; dx <= 1; dx++)
                for (int dz = -1; dz <= 1; dz++)
                {
                    float h = w.Height(c.x + dx * 1.45f, c.z + dz * 1.45f);
                    min = Mathf.Min(min, h);
                    max = Mathf.Max(max, h);
                }
        }

        // ---------------- registro de peças ----------------

        public BuildPiece Place(string id, Vector3 pos, float rotY, Vector2Int cell, string edge, float floorTop)
        {
            var go = BuildPieces.Create(id, false);
            go.transform.SetPositionAndRotation(pos, Quaternion.Euler(0, rotY, 0));
            var bp = go.GetComponent<BuildPiece>();
            bp.cell = cell;
            bp.edgeKey = edge;
            bp.floorTop = floorTop;
            if (BuildPieces.IsFoundation(id)) foundations[cell] = floorTop;
            else if (BuildPieces.IsWall(id)) walls.Add(edge);
            else if (BuildPieces.IsRoof(id)) roofs.Add(cell);
            placed.Add(bp);
            return bp;
        }

        public void Demolish(BuildPiece bp)
        {
            if (BuildPieces.IsFoundation(bp.id))
            {
                foreach (var other in placed)
                    if (other != bp && other.cell == bp.cell && (BuildPieces.IsRoof(other.id) || BuildPieces.IsWall(other.id)) && !HasOtherFoundationFor(other))
                    {
                        GameEvents.RaiseNotify("Desmonte antes as paredes e o teto desta fundação", UIK.Red);
                        return;
                    }
            }
            Unregister(bp);
            if (GameManager.I.Inventory.Add(bp.id, 1) == 0)
                GameEvents.RaiseNotify("Desmontado: " + ItemDB.Name(bp.id), UIK.Muted);
            Destroy(bp.gameObject);
        }

        bool HasOtherFoundationFor(BuildPiece wall)
        {
            if (!BuildPieces.IsWall(wall.id) || string.IsNullOrEmpty(wall.edgeKey)) return false;
            var parts = wall.edgeKey.Split(':');
            int x = int.Parse(parts[0]), z = int.Parse(parts[1]);
            var a = new Vector2Int(x, z);
            var b = parts[2] == "H" ? new Vector2Int(x, z + 1) : new Vector2Int(x + 1, z);
            var other = wall.cell == a ? b : a;
            return foundations.ContainsKey(other);
        }

        void Unregister(BuildPiece bp)
        {
            if (BuildPieces.IsFoundation(bp.id)) foundations.Remove(bp.cell);
            else if (BuildPieces.IsWall(bp.id)) walls.Remove(bp.edgeKey);
            else if (BuildPieces.IsRoof(bp.id)) roofs.Remove(bp.cell);
            placed.Remove(bp);
        }

        public List<PieceRecord> Export()
        {
            var list = new List<PieceRecord>();
            foreach (var bp in placed)
            {
                if (bp == null) continue;
                list.Add(new PieceRecord
                {
                    id = bp.id,
                    pos = bp.transform.position,
                    rotY = bp.transform.eulerAngles.y,
                    cellX = bp.cell.x,
                    cellZ = bp.cell.y,
                    edgeKey = bp.edgeKey,
                    floorTop = bp.floorTop
                });
            }
            return list;
        }

        public void Import(List<PieceRecord> records)
        {
            ClearAll();
            if (records == null) return;
            foreach (var r in records)
                if (ItemDB.Get(r.id) != null)
                    Place(r.id, r.pos, r.rotY, new Vector2Int(r.cellX, r.cellZ), r.edgeKey, r.floorTop);
        }

        public void ClearAll()
        {
            foreach (var bp in placed) if (bp != null) Destroy(bp.gameObject);
            placed.Clear();
            foundations.Clear();
            walls.Clear();
            roofs.Clear();
        }
    }
}
