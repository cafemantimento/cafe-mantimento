using System.Collections.Generic;
using UnityEngine;

namespace EraZero
{
    /// <summary>
    /// Gera os modelos 3D do protótipo por código (estilo low-poly).
    /// Na fase de gráficos, estes modelos serão trocados por assets 3D de verdade.
    /// </summary>
    public static class MeshFactory
    {
        static readonly Dictionary<PrimitiveType, Mesh> primitives = new Dictionary<PrimitiveType, Mesh>();

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        static void ResetCache() => primitives.Clear();

        public static Mesh Primitive(PrimitiveType type)
        {
            if (primitives.TryGetValue(type, out var m) && m != null) return m;
            var go = GameObject.CreatePrimitive(type);
            m = go.GetComponent<MeshFilter>().sharedMesh;
            Object.Destroy(go);
            primitives[type] = m;
            return m;
        }

        /// <summary>Cone com faces retas (visual low-poly).</summary>
        public static Mesh Cone(float radius, float height, int segments, float jitter = 0f, int seed = 0)
        {
            var rnd = new System.Random(seed);
            var ring = new Vector3[segments];
            for (int i = 0; i < segments; i++)
            {
                float a = i * Mathf.PI * 2f / segments;
                float r = radius * (1f + (float)(rnd.NextDouble() - 0.5) * jitter);
                ring[i] = new Vector3(Mathf.Cos(a) * r, 0f, Mathf.Sin(a) * r);
            }
            var tip = new Vector3(0, height, 0);
            var verts = new List<Vector3>();
            var tris = new List<int>();
            for (int i = 0; i < segments; i++)
            {
                var a = ring[i];
                var b = ring[(i + 1) % segments];
                AddTri(verts, tris, a, tip, b);
                AddTri(verts, tris, a, b, Vector3.zero);
            }
            return Build(verts, tris);
        }

        /// <summary>Esfera deformada, usada para pedras, arbustos e copas de árvore.</summary>
        public static Mesh Lumpy(float noise, int seed, int subdivisions = 1)
        {
            var rnd = new System.Random(seed);
            float t = (1f + Mathf.Sqrt(5f)) / 2f;
            var v = new List<Vector3>
            {
                new Vector3(-1, t, 0), new Vector3(1, t, 0), new Vector3(-1, -t, 0), new Vector3(1, -t, 0),
                new Vector3(0, -1, t), new Vector3(0, 1, t), new Vector3(0, -1, -t), new Vector3(0, 1, -t),
                new Vector3(t, 0, -1), new Vector3(t, 0, 1), new Vector3(-t, 0, -1), new Vector3(-t, 0, 1)
            };
            for (int i = 0; i < v.Count; i++) v[i] = v[i].normalized;
            var f = new List<int>
            {
                0,11,5, 0,5,1, 0,1,7, 0,7,10, 0,10,11, 1,5,9, 5,11,4, 11,10,2, 10,7,6, 7,1,8,
                3,9,4, 3,4,2, 3,2,6, 3,6,8, 3,8,9, 4,9,5, 2,4,11, 6,2,10, 8,6,7, 9,8,1
            };
            for (int s = 0; s < subdivisions; s++)
            {
                var mid = new Dictionary<long, int>();
                var nf = new List<int>();
                for (int i = 0; i < f.Count; i += 3)
                {
                    int a = f[i], b = f[i + 1], c = f[i + 2];
                    int ab = Mid(v, mid, a, b), bc = Mid(v, mid, b, c), ca = Mid(v, mid, c, a);
                    nf.AddRange(new[] { a, ab, ca, b, bc, ab, c, ca, bc, ab, bc, ca });
                }
                f = nf;
            }
            for (int i = 0; i < v.Count; i++)
                v[i] *= 1f + (float)(rnd.NextDouble() - 0.5) * 2f * noise;

            var verts = new List<Vector3>();
            var tris = new List<int>();
            for (int i = 0; i < f.Count; i += 3)
                AddTri(verts, tris, v[f[i]], v[f[i + 2]], v[f[i + 1]]);
            return Build(verts, tris);
        }

        static int Mid(List<Vector3> v, Dictionary<long, int> cache, int a, int b)
        {
            long key = a < b ? ((long)a << 32) + b : ((long)b << 32) + a;
            if (cache.TryGetValue(key, out int idx)) return idx;
            v.Add(((v[a] + v[b]) * 0.5f).normalized);
            idx = v.Count - 1;
            cache[key] = idx;
            return idx;
        }

        static void AddTri(List<Vector3> verts, List<int> tris, Vector3 a, Vector3 b, Vector3 c)
        {
            int i = verts.Count;
            verts.Add(a); verts.Add(b); verts.Add(c);
            tris.Add(i); tris.Add(i + 1); tris.Add(i + 2);
        }

        static Mesh Build(List<Vector3> verts, List<int> tris)
        {
            var m = new Mesh();
            m.SetVertices(verts);
            m.SetTriangles(tris, 0);
            m.RecalculateNormals();
            m.RecalculateBounds();
            return m;
        }

        /// <summary>Junta várias partes num único modelo. Cada grupo vira um sub-material.</summary>
        public static Mesh Combine(params List<CombineInstance>[] groups)
        {
            var merged = new CombineInstance[groups.Length];
            for (int g = 0; g < groups.Length; g++)
            {
                var part = new Mesh();
                part.CombineMeshes(groups[g].ToArray(), true, true);
                merged[g] = new CombineInstance { mesh = part, transform = Matrix4x4.identity };
            }
            var result = new Mesh();
            result.CombineMeshes(merged, false, false);
            result.RecalculateBounds();
            return result;
        }

        public static CombineInstance Part(Mesh mesh, Vector3 pos, Vector3 euler, Vector3 scale)
        {
            return new CombineInstance { mesh = mesh, transform = Matrix4x4.TRS(pos, Quaternion.Euler(euler), scale) };
        }

        /// <summary>Cria um objeto visual simples (cubo, esfera...) sem colisor.</summary>
        public static GameObject Shape(PrimitiveType type, Transform parent, Vector3 localPos, Vector3 scale, Material mat, Vector3 euler = default)
        {
            var go = new GameObject(type.ToString());
            go.transform.SetParent(parent, false);
            go.transform.localPosition = localPos;
            go.transform.localRotation = Quaternion.Euler(euler);
            go.transform.localScale = scale;
            go.AddComponent<MeshFilter>().sharedMesh = Primitive(type);
            go.AddComponent<MeshRenderer>().sharedMaterial = mat;
            go.layer = parent != null ? parent.gameObject.layer : 0;
            return go;
        }

        public static GameObject MeshObject(string name, Transform parent, Mesh mesh, params Material[] mats)
        {
            var go = new GameObject(name);
            if (parent != null) go.transform.SetParent(parent, false);
            go.AddComponent<MeshFilter>().sharedMesh = mesh;
            go.AddComponent<MeshRenderer>().sharedMaterials = mats;
            return go;
        }

        public static void SetLayerRecursive(GameObject go, int layer)
        {
            go.layer = layer;
            foreach (Transform c in go.transform) SetLayerRecursive(c.gameObject, layer);
        }
    }
}
