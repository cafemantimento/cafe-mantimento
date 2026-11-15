using UnityEngine;

namespace EraZero
{
    /// <summary>Monta o visual (e colisores) de cada peça de construção.</summary>
    public static class BuildPieces
    {
        public const float Cell = 3f;
        public const float WallHeight = 3f;
        public const float FoundationDepth = 1.4f;

        public static bool IsFoundation(string id) => id == "fundacao_madeira";
        public static bool IsWall(string id) => id == "parede_madeira" || id == "parede_porta";
        public static bool IsRoof(string id) => id == "teto_madeira";
        public static bool IsGrid(string id) => IsFoundation(id) || IsWall(id) || IsRoof(id);

        public static GameObject Create(string id, bool ghost)
        {
            var root = new GameObject(ghost ? "Fantasma_" + id : id);
            var t = root.transform;
            var wood = MaterialLib.Get("madeira_tabua", new Color(0.56f, 0.40f, 0.24f));
            var woodDark = MaterialLib.Get("madeira_escura", new Color(0.38f, 0.26f, 0.15f));
            var stone = MaterialLib.Get("pedra_fogueira", new Color(0.45f, 0.45f, 0.46f));

            switch (id)
            {
                case "fundacao_madeira":
                    Box(t, new Vector3(0, -FoundationDepth / 2f - 0.05f, 0), new Vector3(Cell, FoundationDepth - 0.1f, Cell), woodDark, !ghost);
                    Box(t, new Vector3(0, -0.05f, 0), new Vector3(Cell, 0.1f, Cell), wood, !ghost);
                    for (int i = 0; i < 6; i++)
                        Box(t, new Vector3(-Cell / 2 + 0.25f + i * 0.5f, 0.002f, 0), new Vector3(0.03f, 0.01f, Cell - 0.02f), woodDark, false);
                    break;

                case "parede_madeira":
                    Box(t, new Vector3(0, WallHeight / 2, 0), new Vector3(Cell, WallHeight, 0.2f), wood, !ghost);
                    Posts(t, woodDark);
                    break;

                case "parede_porta":
                    Box(t, new Vector3(-1.05f, WallHeight / 2, 0), new Vector3(0.9f, WallHeight, 0.2f), wood, !ghost);
                    Box(t, new Vector3(1.05f, WallHeight / 2, 0), new Vector3(0.9f, WallHeight, 0.2f), wood, !ghost);
                    Box(t, new Vector3(0, 2.6f, 0), new Vector3(1.2f, 0.8f, 0.2f), wood, !ghost);
                    Posts(t, woodDark);
                    break;

                case "teto_madeira":
                    Box(t, new Vector3(0, 0.1f, 0), new Vector3(Cell + 0.1f, 0.2f, Cell + 0.1f), wood, !ghost);
                    for (int i = 0; i < 3; i++)
                        Box(t, new Vector3(-1f + i, -0.06f, 0), new Vector3(0.12f, 0.12f, Cell), woodDark, false);
                    break;

                case "fogueira":
                    for (int i = 0; i < 8; i++)
                    {
                        float a = i * 45f * Mathf.Deg2Rad;
                        var s = MeshFactory.Shape(PrimitiveType.Sphere, t, new Vector3(Mathf.Cos(a) * 0.5f, 0.08f, Mathf.Sin(a) * 0.5f), new Vector3(0.24f, 0.16f, 0.2f), stone);
                        s.transform.localRotation = Quaternion.Euler(0, i * 45f, 0);
                    }
                    MeshFactory.Shape(PrimitiveType.Cylinder, t, new Vector3(0, 0.12f, 0), new Vector3(0.1f, 0.38f, 0.1f), woodDark, new Vector3(90, 30, 0));
                    MeshFactory.Shape(PrimitiveType.Cylinder, t, new Vector3(0, 0.15f, 0), new Vector3(0.1f, 0.38f, 0.1f), woodDark, new Vector3(90, -40, 0));
                    MeshFactory.Shape(PrimitiveType.Cylinder, t, new Vector3(0, 0.18f, 0), new Vector3(0.09f, 0.34f, 0.09f), woodDark, new Vector3(90, 100, 0));
                    if (!ghost)
                    {
                        var col = root.AddComponent<BoxCollider>();
                        col.center = new Vector3(0, 0.2f, 0);
                        col.size = new Vector3(1.2f, 0.4f, 1.2f);
                        root.AddComponent<Campfire>().Init();
                    }
                    break;

                case "saco_dormir":
                    var cloth = MaterialLib.Get("tecido_verde", new Color(0.28f, 0.4f, 0.26f));
                    Box(t, new Vector3(0, 0.08f, 0), new Vector3(0.9f, 0.16f, 2.0f), cloth, !ghost);
                    Box(t, new Vector3(0, 0.17f, 0.75f), new Vector3(0.6f, 0.12f, 0.35f), MaterialLib.Get("couro_trav", new Color(0.55f, 0.4f, 0.28f)), false);
                    Box(t, new Vector3(0, 0.17f, -0.2f), new Vector3(0.92f, 0.04f, 1.2f), MaterialLib.Get("tecido_escuro", new Color(0.2f, 0.3f, 0.2f)), false);
                    if (!ghost) root.AddComponent<SleepingBag>();
                    break;
            }

            if (ghost)
            {
                MeshFactory.SetLayerRecursive(root, 2);
                foreach (var r in root.GetComponentsInChildren<Renderer>())
                    r.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
            }
            else
            {
                root.AddComponent<BuildPiece>().id = id;
            }
            return root;
        }

        static void Posts(Transform t, Material m)
        {
            Box(t, new Vector3(-Cell / 2 + 0.08f, WallHeight / 2, 0), new Vector3(0.18f, WallHeight, 0.26f), m, false);
            Box(t, new Vector3(Cell / 2 - 0.08f, WallHeight / 2, 0), new Vector3(0.18f, WallHeight, 0.26f), m, false);
        }

        static void Box(Transform parent, Vector3 pos, Vector3 size, Material mat, bool collider)
        {
            var go = MeshFactory.Shape(PrimitiveType.Cube, parent, pos, size, mat);
            if (collider) go.AddComponent<BoxCollider>();
        }

        public static void SetGhostColor(GameObject ghost, bool valid)
        {
            var mat = valid
                ? MaterialLib.Transparent("fantasma_ok", new Color(0.35f, 0.88f, 1f, 0.35f), new Color(0.1f, 0.6f, 0.8f))
                : MaterialLib.Transparent("fantasma_erro", new Color(1f, 0.3f, 0.3f, 0.35f), new Color(0.8f, 0.1f, 0.1f));
            foreach (var r in ghost.GetComponentsInChildren<Renderer>()) r.sharedMaterial = mat;
        }
    }
}
