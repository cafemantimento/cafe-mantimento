using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

namespace EraZero
{
    /// <summary>
    /// Cria e reaproveita materiais. Funciona tanto no projeto "Universal 3D" (URP)
    /// quanto no "3D (Built-In)", escolhendo o shader certo automaticamente.
    /// </summary>
    public static class MaterialLib
    {
        static readonly Dictionary<string, Material> cache = new Dictionary<string, Material>();
        static Shader litShader;
        static bool? urp;

        public static bool IsURP
        {
            get
            {
                if (!urp.HasValue) urp = GraphicsSettings.currentRenderPipeline != null;
                return urp.Value;
            }
        }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        static void ResetCache()
        {
            cache.Clear();
            litShader = null;
            urp = null;
        }

        static Shader Lit
        {
            get
            {
                if (litShader != null) return litShader;
                litShader = IsURP ? Shader.Find("Universal Render Pipeline/Lit") : Shader.Find("Standard");
                if (litShader == null) litShader = Shader.Find("Standard");
                return litShader;
            }
        }

        public static Material Get(string key, Color color, float smoothness = 0.15f, float metallic = 0f)
        {
            if (cache.TryGetValue(key, out var m) && m != null) return m;
            m = new Material(Lit) { name = key, enableInstancing = true };
            SetColor(m, color);
            m.SetFloat("_Glossiness", smoothness);
            m.SetFloat("_Smoothness", smoothness);
            m.SetFloat("_Metallic", metallic);
            cache[key] = m;
            return m;
        }

        public static Material Emissive(string key, Color color, Color emission)
        {
            if (cache.TryGetValue(key, out var m) && m != null) return m;
            m = Get(key, color, 0.2f);
            m.EnableKeyword("_EMISSION");
            m.globalIlluminationFlags = MaterialGlobalIlluminationFlags.RealtimeEmissive;
            m.SetColor("_EmissionColor", emission);
            return m;
        }

        public static Material Transparent(string key, Color color, Color emission)
        {
            if (cache.TryGetValue(key, out var m) && m != null) return m;
            m = new Material(Lit) { name = key };
            MakeTransparent(m);
            SetColor(m, color);
            m.SetFloat("_Glossiness", 0.9f);
            m.SetFloat("_Smoothness", 0.9f);
            if (emission != Color.black)
            {
                m.EnableKeyword("_EMISSION");
                m.SetColor("_EmissionColor", emission);
            }
            cache[key] = m;
            return m;
        }

        public static void SetColor(Material m, Color c)
        {
            if (m.HasProperty("_BaseColor")) m.SetColor("_BaseColor", c);
            if (m.HasProperty("_Color")) m.SetColor("_Color", c);
        }

        public static void SetEmission(Material m, Color c)
        {
            m.EnableKeyword("_EMISSION");
            m.SetColor("_EmissionColor", c);
        }

        static void MakeTransparent(Material m)
        {
            if (IsURP)
            {
                m.SetFloat("_Surface", 1f);
                m.SetFloat("_Blend", 0f);
                m.SetOverrideTag("RenderType", "Transparent");
                m.EnableKeyword("_SURFACE_TYPE_TRANSPARENT");
            }
            else
            {
                m.SetFloat("_Mode", 3f);
                m.SetOverrideTag("RenderType", "Transparent");
                m.EnableKeyword("_ALPHABLEND_ON");
                m.DisableKeyword("_ALPHATEST_ON");
                m.DisableKeyword("_ALPHAPREMULTIPLY_ON");
            }
            m.SetInt("_SrcBlend", (int)BlendMode.SrcAlpha);
            m.SetInt("_DstBlend", (int)BlendMode.OneMinusSrcAlpha);
            m.SetInt("_SrcBlendAlpha", (int)BlendMode.One);
            m.SetInt("_DstBlendAlpha", (int)BlendMode.OneMinusSrcAlpha);
            m.SetInt("_ZWrite", 0);
            m.renderQueue = (int)RenderQueue.Transparent;
        }

        public static Material TerrainMaterial()
        {
            if (!IsURP) return null; // no Built-In o Unity usa o material padrão do terreno
            var s = Shader.Find("Universal Render Pipeline/Terrain/Lit");
            return s != null ? new Material(s) : null;
        }

        public static Material Skybox()
        {
            var s = Shader.Find("Skybox/Procedural");
            return s != null ? new Material(s) : null;
        }
    }
}
