using System.Collections.Generic;
using UnityEngine;

namespace EraZero
{
    /// <summary>
    /// Gera o mapa do Vale: relevo, texturas do chão, lago, árvores, rochas,
    /// arbustos, itens no chão e as ruínas ao norte.
    /// </summary>
    public class WorldGenerator : MonoBehaviour
    {
        public const float Size = 400f;
        public const float MaxHeight = 90f;
        public const float WaterLevel = 6f;
        const int HeightRes = 257;
        const int AlphaRes = 256;

        public static WorldGenerator I { get; private set; }

        public Terrain Terrain { get; private set; }
        public Vector3 SpawnPoint { get; private set; }
        public Vector3 RuinsCenter { get; private set; }

        float ox, oz;
        Vector2 lakeCenter;
        const float LakeRadius = 55f;
        Vector2 ruinsUV;
        System.Random rnd;
        Transform props;

        public void Generate(int seed)
        {
            I = this;
            rnd = new System.Random(seed);
            ox = (float)rnd.NextDouble() * 1000f;
            oz = (float)rnd.NextDouble() * 1000f;
            lakeCenter = new Vector2(Size / 2 + 85f, Size / 2 - 55f);
            ruinsUV = new Vector2(Size / 2 - 20f, Size / 2 + 125f);

            props = new GameObject("Vale").transform;
            BuildTerrain();
            BuildWater();

            SpawnPoint = new Vector3(0f, Height(0f, 0f) + 0.2f, 0f);
            RuinsCenter = ToWorld(ruinsUV);
            RuinsCenter = new Vector3(RuinsCenter.x, Height(RuinsCenter.x, RuinsCenter.z), RuinsCenter.z);

            Scatter();
            BuildRuins();
        }

        Vector3 ToWorld(Vector2 uv) => new Vector3(uv.x - Size / 2, 0, uv.y - Size / 2);

        public float Height(float x, float z) => Terrain.SampleHeight(new Vector3(x, 0, z)) + Terrain.transform.position.y;
        public float Height(Vector3 p) => Height(p.x, p.z);

        public float Steepness(float x, float z)
        {
            float nx = Mathf.Clamp01((x + Size / 2) / Size);
            float nz = Mathf.Clamp01((z + Size / 2) / Size);
            return Terrain.terrainData.GetSteepness(nx, nz);
        }

        public bool InsidePlayable(Vector3 p, float margin = 40f)
        {
            float half = Size / 2 - margin;
            return Mathf.Abs(p.x) < half && Mathf.Abs(p.z) < half;
        }

        // ---------------- Relevo ----------------

        float Fbm(float x, float y, int octaves)
        {
            float sum = 0, amp = 0.5f, freq = 1f, norm = 0;
            for (int i = 0; i < octaves; i++)
            {
                sum += Mathf.PerlinNoise(x * freq, y * freq) * amp;
                norm += amp;
                amp *= 0.5f;
                freq *= 2.03f;
            }
            return sum / norm;
        }

        static float Smooth(float t) { t = Mathf.Clamp01(t); return t * t * (3 - 2 * t); }

        float RawHeight(float u, float v)
        {
            float n = Fbm(u * 0.0055f + ox, v * 0.0055f + oz, 5);
            float h = 2f + n * 26f;
            h += (Mathf.PerlinNoise(u * 0.035f + oz, v * 0.035f + ox) - 0.5f) * 2.5f;

            // montanhas na borda do mapa (limite natural do mundo)
            float dx = Mathf.Abs(u - Size / 2) / (Size / 2);
            float dz = Mathf.Abs(v - Size / 2) / (Size / 2);
            float d = Mathf.Max(dx, dz);
            if (d > 0.72f)
            {
                float t = (d - 0.72f) / 0.28f;
                float ridge = 1f - Mathf.Abs(Mathf.PerlinNoise(u * 0.02f + ox, v * 0.02f + oz) * 2f - 1f);
                h += t * t * (45f + ridge * 25f);
            }

            // lago
            float ld = Vector2.Distance(new Vector2(u, v), lakeCenter);
            if (ld < LakeRadius) h = Mathf.Lerp(h, 1.5f, Smooth(1f - ld / LakeRadius));

            // clareira inicial
            float sd = Vector2.Distance(new Vector2(u, v), new Vector2(Size / 2, Size / 2));
            if (sd < 45f) h = Mathf.Lerp(h, 11f, Smooth(1f - sd / 45f) * 0.9f);

            // planalto das ruínas
            float rd = Vector2.Distance(new Vector2(u, v), ruinsUV);
            if (rd < 40f) h = Mathf.Lerp(h, 13f, Smooth(1f - rd / 40f) * 0.95f);

            return Mathf.Max(h, 0.5f);
        }

        void BuildTerrain()
        {
            var td = new TerrainData
            {
                heightmapResolution = HeightRes,
                alphamapResolution = AlphaRes,
                baseMapResolution = 512
            };
            td.size = new Vector3(Size, MaxHeight, Size);

            var heights = new float[HeightRes, HeightRes];
            for (int z = 0; z < HeightRes; z++)
                for (int x = 0; x < HeightRes; x++)
                {
                    float u = x / (float)(HeightRes - 1) * Size;
                    float v = z / (float)(HeightRes - 1) * Size;
                    heights[z, x] = RawHeight(u, v) / MaxHeight;
                }
            td.SetHeights(0, 0, heights);

            td.terrainLayers = new[]
            {
                Layer(TextureGen.Ground(new Color(0.30f, 0.45f, 0.18f), new Color(0.42f, 0.55f, 0.22f), 11), 7f),  // grama
                Layer(TextureGen.Ground(new Color(0.42f, 0.34f, 0.22f), new Color(0.52f, 0.44f, 0.30f), 23), 6f),  // terra
                Layer(TextureGen.Ground(new Color(0.40f, 0.40f, 0.42f), new Color(0.55f, 0.55f, 0.56f), 37), 9f),  // rocha
                Layer(TextureGen.Ground(new Color(0.70f, 0.64f, 0.48f), new Color(0.80f, 0.74f, 0.58f), 51), 5f),  // areia
            };

            var alphas = new float[AlphaRes, AlphaRes, 4];
            for (int z = 0; z < AlphaRes; z++)
                for (int x = 0; x < AlphaRes; x++)
                {
                    float nx = x / (float)(AlphaRes - 1);
                    float nz = z / (float)(AlphaRes - 1);
                    float h = td.GetInterpolatedHeight(nx, nz);
                    float steep = td.GetSteepness(nx, nz);
                    float patch = Mathf.PerlinNoise(nx * 18f + ox, nz * 18f + oz);

                    float sand = Smooth((WaterLevel + 1.6f - h) / 1.2f);
                    float rock = Mathf.Max(Smooth((steep - 26f) / 10f), Smooth((h - 40f) / 8f));
                    float dirt = Smooth((patch - 0.58f) / 0.12f) * (1 - rock);
                    float grass = Mathf.Max(0f, 1f - sand - rock - dirt);
                    float sum = grass + dirt + rock + sand + 0.0001f;
                    alphas[z, x, 0] = grass / sum;
                    alphas[z, x, 1] = dirt / sum;
                    alphas[z, x, 2] = rock / sum;
                    alphas[z, x, 3] = sand / sum;
                }
            td.SetAlphamaps(0, 0, alphas);

            var go = Terrain.CreateTerrainGameObject(td);
            go.name = "Terreno";
            go.transform.position = new Vector3(-Size / 2, 0, -Size / 2);
            Terrain = go.GetComponent<Terrain>();
            Terrain.heightmapPixelError = 4;
            Terrain.basemapDistance = 250;
            var mat = MaterialLib.TerrainMaterial();
            if (mat != null) Terrain.materialTemplate = mat;
        }

        static TerrainLayer Layer(Texture2D tex, float tile)
        {
            return new TerrainLayer { diffuseTexture = tex, tileSize = new Vector2(tile, tile), smoothness = 0.05f };
        }

        void BuildWater()
        {
            var water = GameObject.CreatePrimitive(PrimitiveType.Cube);
            water.name = "Agua";
            water.transform.SetParent(props);
            water.transform.position = new Vector3(0, WaterLevel - 0.5f, 0);
            water.transform.localScale = new Vector3(Size, 1f, Size);
            water.GetComponent<MeshRenderer>().sharedMaterial =
                MaterialLib.Transparent("agua", new Color(0.12f, 0.36f, 0.48f, 0.72f), Color.black);
            water.GetComponent<Collider>().isTrigger = true;
            water.layer = 4; // camada "Water" que já existe em todo projeto Unity
            water.AddComponent<WaterVolume>();
        }

        // ---------------- Vegetação e recursos ----------------

        float R01() => (float)rnd.NextDouble();
        float Range(float a, float b) => a + (b - a) * R01();

        bool TryPoint(out Vector3 p, float minHeight, float maxSteep, float avoidSpawn, float avoidRuins)
        {
            for (int tries = 0; tries < 30; tries++)
            {
                float x = Range(-Size / 2 + 30, Size / 2 - 30);
                float z = Range(-Size / 2 + 30, Size / 2 - 30);
                float h = Height(x, z);
                if (h < minHeight) continue;
                if (Steepness(x, z) > maxSteep) continue;
                if (new Vector2(x, z).magnitude < avoidSpawn) continue;
                if (Vector2.Distance(new Vector2(x, z), new Vector2(RuinsCenter.x, RuinsCenter.z)) < avoidRuins) continue;
                p = new Vector3(x, h, z);
                return true;
            }
            p = Vector3.zero;
            return false;
        }

        void Scatter()
        {
            var bark = MaterialLib.Get("casca", new Color(0.36f, 0.25f, 0.16f));
            var pine = MaterialLib.Get("pinheiro", new Color(0.16f, 0.32f, 0.17f));
            var leaf = MaterialLib.Get("folha", new Color(0.30f, 0.46f, 0.18f));
            var rockMat = MaterialLib.Get("rocha", new Color(0.50f, 0.50f, 0.50f), 0.1f);
            var bushMat = MaterialLib.Get("arbusto", new Color(0.24f, 0.42f, 0.16f));
            var berryMat = MaterialLib.Get("fruta", new Color(0.8f, 0.12f, 0.2f), 0.6f);

            var pineMeshes = new Mesh[3];
            for (int i = 0; i < 3; i++) pineMeshes[i] = PineMesh(i);
            var oakMeshes = new Mesh[2];
            for (int i = 0; i < 2; i++) oakMeshes[i] = OakMesh(i);
            var rockMeshes = new Mesh[4];
            for (int i = 0; i < 4; i++) rockMeshes[i] = MeshFactory.Lumpy(0.22f, 100 + i, 1);
            var bushMeshes = new Mesh[2];
            for (int i = 0; i < 2; i++) bushMeshes[i] = BushMesh(i);

            var trees = new GameObject("Arvores").transform; trees.SetParent(props);
            for (int i = 0; i < 420; i++)
            {
                if (!TryPoint(out var p, WaterLevel + 1.2f, 30f, 9f, 30f)) continue;
                bool isPine = R01() < 0.65f || p.y > 25f;
                var mesh = isPine ? pineMeshes[i % 3] : oakMeshes[i % 2];
                var go = MeshFactory.MeshObject(isPine ? "Pinheiro" : "Arvore", trees, mesh, bark, isPine ? pine : leaf);
                go.transform.position = p - Vector3.up * 0.2f;
                go.transform.rotation = Quaternion.Euler(0, Range(0, 360), 0);
                go.transform.localScale = Vector3.one * Range(0.8f, 1.3f);
                var col = go.AddComponent<CapsuleCollider>();
                col.radius = 0.45f; col.height = 5f; col.center = new Vector3(0, 2.5f, 0);
                var node = go.AddComponent<ResourceNode>();
                node.Setup(NodeType.Tree, isPine ? "Pinheiro" : "Árvore");
            }

            var rocks = new GameObject("Rochas").transform; rocks.SetParent(props);
            for (int i = 0; i < 170; i++)
            {
                if (!TryPoint(out var p, WaterLevel + 0.3f, 40f, 7f, 25f)) continue;
                var go = MeshFactory.MeshObject("Rocha", rocks, rockMeshes[i % 4], rockMat);
                float s = Range(0.9f, 2.1f);
                go.transform.position = p + Vector3.up * (s * 0.25f);
                go.transform.rotation = Quaternion.Euler(Range(-10, 10), Range(0, 360), Range(-10, 10));
                go.transform.localScale = new Vector3(s * Range(1f, 1.4f), s * Range(0.6f, 0.9f), s);
                go.AddComponent<MeshCollider>().sharedMesh = rockMeshes[i % 4];
                go.AddComponent<ResourceNode>().Setup(NodeType.Rock, "Rocha");
            }

            var bushes = new GameObject("Arbustos").transform; bushes.SetParent(props);
            for (int i = 0; i < 160; i++)
            {
                if (!TryPoint(out var p, WaterLevel + 0.6f, 28f, 5f, 15f)) continue;
                var go = MeshFactory.MeshObject("Arbusto", bushes, bushMeshes[i % 2], bushMat, berryMat);
                go.transform.position = p;
                go.transform.rotation = Quaternion.Euler(0, Range(0, 360), 0);
                go.transform.localScale = Vector3.one * Range(0.8f, 1.2f);
                var col = go.AddComponent<SphereCollider>();
                col.radius = 0.75f; col.center = new Vector3(0, 0.55f, 0);
                go.AddComponent<ResourceNode>().Setup(NodeType.Bush, "Arbusto de Frutinhas");
            }

            // Galhos e pedras soltas no chão: o primeiro recurso que o jogador pega com as mãos
            var ground = new GameObject("ItensNoChao").transform; ground.SetParent(props);
            for (int i = 0; i < 140; i++)
            {
                float spread = i < 40 ? 50f : Size / 2 - 40;
                float x = Range(-spread, spread), z = Range(-spread, spread);
                float h = Height(x, z);
                if (h < WaterLevel + 0.3f || Steepness(x, z) > 30f) continue;
                var p = new Vector3(x, h, z);
                if (i % 2 == 0) Pickup.CreateStick(ground, p, Range(0, 360));
                else Pickup.CreateStone(ground, p, rockMeshes[i % 4], rockMat, R01() < 0.35f);
            }
        }

        Mesh PineMesh(int variant)
        {
            var trunk = new List<CombineInstance>
            {
                MeshFactory.Part(MeshFactory.Primitive(PrimitiveType.Cylinder), new Vector3(0, 2.2f, 0), Vector3.zero, new Vector3(0.45f, 2.2f, 0.45f))
            };
            var leaves = new List<CombineInstance>();
            float y = 2.0f;
            float r = 2.4f + variant * 0.2f;
            int layers = 3 + variant % 2;
            for (int i = 0; i < layers; i++)
            {
                float h = 2.8f - i * 0.25f;
                leaves.Add(MeshFactory.Part(MeshFactory.Cone(r, h, 8, 0.25f, variant * 10 + i), new Vector3(0, y, 0), new Vector3(0, i * 23f, 0), Vector3.one));
                y += h * 0.55f;
                r *= 0.74f;
            }
            return MeshFactory.Combine(trunk, leaves);
        }

        Mesh OakMesh(int variant)
        {
            var trunk = new List<CombineInstance>
            {
                MeshFactory.Part(MeshFactory.Primitive(PrimitiveType.Cylinder), new Vector3(0, 1.8f, 0), Vector3.zero, new Vector3(0.5f, 1.8f, 0.5f)),
                MeshFactory.Part(MeshFactory.Primitive(PrimitiveType.Cylinder), new Vector3(0.5f, 3.3f, 0), new Vector3(0, 0, -35f), new Vector3(0.25f, 0.9f, 0.25f))
            };
            var leaves = new List<CombineInstance>
            {
                MeshFactory.Part(MeshFactory.Lumpy(0.18f, 200 + variant, 1), new Vector3(0, 4.6f, 0), Vector3.zero, new Vector3(2.6f, 2.0f, 2.6f)),
                MeshFactory.Part(MeshFactory.Lumpy(0.2f, 210 + variant, 1), new Vector3(1.3f, 4.0f, 0.6f), Vector3.zero, new Vector3(1.6f, 1.4f, 1.6f)),
                MeshFactory.Part(MeshFactory.Lumpy(0.2f, 220 + variant, 1), new Vector3(-1.1f, 4.2f, -0.7f), Vector3.zero, new Vector3(1.7f, 1.5f, 1.7f))
            };
            return MeshFactory.Combine(trunk, leaves);
        }

        Mesh BushMesh(int variant)
        {
            var body = new List<CombineInstance>
            {
                MeshFactory.Part(MeshFactory.Lumpy(0.25f, 300 + variant, 1), new Vector3(0, 0.55f, 0), Vector3.zero, new Vector3(0.9f, 0.65f, 0.9f)),
                MeshFactory.Part(MeshFactory.Lumpy(0.25f, 310 + variant, 1), new Vector3(0.45f, 0.45f, 0.2f), Vector3.zero, new Vector3(0.6f, 0.5f, 0.6f))
            };
            var berries = new List<CombineInstance>();
            var br = new System.Random(400 + variant);
            for (int i = 0; i < 14; i++)
            {
                var dir = new Vector3((float)br.NextDouble() - 0.5f, (float)br.NextDouble() * 0.6f, (float)br.NextDouble() - 0.5f).normalized;
                berries.Add(MeshFactory.Part(MeshFactory.Primitive(PrimitiveType.Sphere), new Vector3(0, 0.55f, 0) + dir * 0.85f, Vector3.zero, Vector3.one * 0.13f));
            }
            return MeshFactory.Combine(body, berries);
        }

        // ---------------- Ruínas ----------------

        void BuildRuins()
        {
            var root = new GameObject("Ruinas").transform;
            root.SetParent(props);
            root.position = RuinsCenter;
            var concrete = MaterialLib.Get("concreto", new Color(0.55f, 0.54f, 0.52f), 0.05f);
            var dark = MaterialLib.Get("concreto_escuro", new Color(0.33f, 0.33f, 0.34f), 0.05f);
            var rust = MaterialLib.Get("ferrugem", new Color(0.45f, 0.24f, 0.14f), 0.25f, 0.3f);
            var glass = MaterialLib.Get("vidro_sujo", new Color(0.18f, 0.24f, 0.26f), 0.7f);

            // prédio desmoronado
            Block(root, new Vector3(-8, 4, 6), new Vector3(10, 8, 0.6f), concrete);
            Block(root, new Vector3(-13, 3, 1), new Vector3(0.6f, 6, 10), concrete);
            Block(root, new Vector3(-3.5f, 2, 2), new Vector3(0.6f, 4, 8), concrete, new Vector3(0, 0, 4));
            Block(root, new Vector3(-8, 8.2f, 3), new Vector3(10, 0.4f, 6), dark, new Vector3(6, 0, -3));
            for (int i = 0; i < 4; i++)
                Block(root, new Vector3(-11 + i * 2.5f, 5.5f, 6.32f), new Vector3(1.2f, 1.4f, 0.05f), glass);

            // pilares e laje caída
            Block(root, new Vector3(8, 3, 8), new Vector3(0.8f, 6, 0.8f), concrete);
            Block(root, new Vector3(14, 2, 8), new Vector3(0.8f, 4, 0.8f), concrete);
            Block(root, new Vector3(11, 1.2f, 4), new Vector3(7, 0.5f, 5), dark, new Vector3(-12, 8, 15));
            Block(root, new Vector3(4, 0.6f, -6), new Vector3(3, 1.2f, 1.2f), concrete, new Vector3(0, 30, 5));
            Block(root, new Vector3(-6, 0.5f, -9), new Vector3(1.5f, 1f, 1.5f), dark, new Vector3(10, 20, 0));

            // carro abandonado
            var car = new GameObject("Carro").transform;
            car.SetParent(root, false);
            car.localPosition = new Vector3(3, 0, -1);
            car.localRotation = Quaternion.Euler(0, 35, 3);
            Block(car, new Vector3(0, 0.75f, 0), new Vector3(1.9f, 0.8f, 4.2f), rust);
            Block(car, new Vector3(0, 1.45f, -0.3f), new Vector3(1.7f, 0.7f, 2.2f), rust);
            Block(car, new Vector3(0, 1.45f, 0.82f), new Vector3(1.6f, 0.6f, 0.05f), glass, new Vector3(-30, 0, 0));
            foreach (var w in new[] { new Vector3(-0.95f, 0.35f, 1.3f), new Vector3(0.95f, 0.35f, 1.3f), new Vector3(-0.95f, 0.35f, -1.3f), new Vector3(0.95f, 0.35f, -1.3f) })
                MeshFactory.Shape(PrimitiveType.Cylinder, car, w, new Vector3(0.7f, 0.12f, 0.7f), dark, new Vector3(0, 0, 90));

            // poste caído
            Block(root, new Vector3(-2, 0.3f, 12), new Vector3(0.3f, 0.3f, 9), rust, new Vector3(0, 70, 0));

            // montes de sucata para quebrar
            for (int i = 0; i < 6; i++)
            {
                float a = i * 60f + 15f;
                var pos = RuinsCenter + Quaternion.Euler(0, a, 0) * Vector3.forward * Range(9f, 17f);
                pos.y = Height(pos.x, pos.z);
                var pile = MeshFactory.MeshObject("Sucata", root, MeshFactory.Lumpy(0.45f, 500 + i, 1), rust);
                pile.transform.position = pos;
                pile.transform.localScale = new Vector3(1.4f, 0.7f, 1.2f);
                pile.AddComponent<MeshCollider>().sharedMesh = pile.GetComponent<MeshFilter>().sharedMesh;
                pile.AddComponent<ResourceNode>().Setup(NodeType.Scrap, "Monte de Sucata");
            }

            // rádio: primeira pista da história
            var crate = Block(root, new Vector3(-6, 0.45f, 1.5f), new Vector3(0.9f, 0.9f, 0.9f), MaterialLib.Get("caixote", new Color(0.5f, 0.38f, 0.22f)));
            Pickup.CreateRadio(root, crate.transform.position + Vector3.up * 0.45f);
        }

        GameObject Block(Transform parent, Vector3 local, Vector3 size, Material mat, Vector3 euler = default)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            go.transform.SetParent(parent, false);
            go.transform.localPosition = local;
            go.transform.localRotation = Quaternion.Euler(euler);
            go.transform.localScale = size;
            go.GetComponent<MeshRenderer>().sharedMaterial = mat;
            // assenta no terreno
            var world = go.transform.position;
            float ground = Height(world.x, world.z);
            if (parent.name == "Ruinas") go.transform.position = new Vector3(world.x, ground + local.y - 0.15f, world.z);
            return go;
        }
    }

    /// <summary>Texturas do chão geradas por código (repetem sem emenda).</summary>
    public static class TextureGen
    {
        public static Texture2D Ground(Color a, Color b, int seed)
        {
            const int N = 128;
            var tex = new Texture2D(N, N, TextureFormat.RGBA32, true) { wrapMode = TextureWrapMode.Repeat, filterMode = FilterMode.Bilinear };
            var px = new Color[N * N];
            var rnd = new System.Random(seed);
            for (int y = 0; y < N; y++)
                for (int x = 0; x < N; x++)
                {
                    float n = TileNoise(x, y, 16, seed) * 0.55f + TileNoise(x, y, 8, seed + 1) * 0.3f + TileNoise(x, y, 4, seed + 2) * 0.15f;
                    float grain = (float)rnd.NextDouble() * 0.12f - 0.06f;
                    var c = Color.Lerp(a, b, n) * (1f + grain);
                    c.a = 1f;
                    px[y * N + x] = c;
                }
            tex.SetPixels(px);
            tex.Apply(true);
            return tex;
        }

        static float Hash(int x, int y, int seed)
        {
            unchecked
            {
                int h = x * 374761393 + y * 668265263 + seed * 1442695041;
                h = (h ^ (h >> 13)) * 1274126177;
                return ((h ^ (h >> 16)) & 0xFFFF) / 65535f;
            }
        }

        static float TileNoise(int x, int y, int cells, int seed)
        {
            const int N = 128;
            float fx = x / (float)N * cells, fy = y / (float)N * cells;
            int x0 = Mathf.FloorToInt(fx), y0 = Mathf.FloorToInt(fy);
            float tx = fx - x0, ty = fy - y0;
            tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
            int x1 = (x0 + 1) % cells, y1 = (y0 + 1) % cells;
            x0 %= cells; y0 %= cells;
            float a = Hash(x0, y0, seed), b = Hash(x1, y0, seed), c = Hash(x0, y1, seed), d = Hash(x1, y1, seed);
            return Mathf.Lerp(Mathf.Lerp(a, b, tx), Mathf.Lerp(c, d, tx), ty);
        }
    }
}
