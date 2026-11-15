using UnityEngine;
using UnityEngine.Rendering;

namespace EraZero
{
    /// <summary>
    /// Ciclo de dia e noite: um dia inteiro dura 20 minutos reais.
    /// Controla o sol, a lua, o céu, a neblina e a temperatura.
    /// </summary>
    public class DayNightCycle : MonoBehaviour
    {
        public float DayLengthSeconds = 1200f;
        public float Hour = 8f;
        public int Day = 1;
        public Light Sun { get; private set; }
        public float AmbientTemp { get; private set; } = 20f;

        Material sky;

        public bool IsNight => Hour < 6f || Hour >= 19f;
        public string Clock => $"{Mathf.FloorToInt(Hour):00}:{Mathf.FloorToInt((Hour % 1f) * 60f):00}";

        public void Init(Light existingSun)
        {
            Sun = existingSun;
            if (Sun == null)
            {
                Sun = new GameObject("Sol").AddComponent<Light>();
                Sun.type = LightType.Directional;
            }
            Sun.shadows = LightShadows.Soft;
            Sun.shadowStrength = 0.85f;

            sky = MaterialLib.Skybox();
            if (sky != null)
            {
                RenderSettings.skybox = sky;
                sky.SetFloat("_SunSize", 0.035f);
                sky.SetFloat("_SunSizeConvergence", 6f);
                sky.SetFloat("_AtmosphereThickness", 1.0f);
            }
            RenderSettings.sun = Sun;
            RenderSettings.ambientMode = AmbientMode.Trilight;
            RenderSettings.fog = true;
            RenderSettings.fogMode = FogMode.ExponentialSquared;
            Apply();
        }

        void Update()
        {
            Hour += 24f / DayLengthSeconds * Time.deltaTime;
            if (Hour >= 24f)
            {
                Hour -= 24f;
                Day++;
                GameEvents.RaiseDayStarted(Day);
                GameEvents.RaiseBanner($"DIA {Day}", "Você sobreviveu a mais uma noite.");
            }
            Apply();
        }

        public void SkipToMorning()
        {
            if (Hour >= 6f) { Day++; GameEvents.RaiseDayStarted(Day); }
            Hour = 6.2f;
            Apply();
        }

        static readonly Color NightSky = new Color(0.05f, 0.07f, 0.14f);
        static readonly Color DaySky = new Color(0.55f, 0.66f, 0.80f);
        static readonly Color DuskSky = new Color(0.85f, 0.50f, 0.36f);

        void Apply()
        {
            float sunElev = (Hour / 24f) * 360f - 90f;           // 6h = horizonte, 12h = topo
            float sinElev = Mathf.Sin(sunElev * Mathf.Deg2Rad);
            float day = Mathf.Clamp01(sinElev * 2.5f);              // 0 à noite, 1 de dia
            float dusk = Mathf.Clamp01(1f - Mathf.Abs(sinElev) * 4f); // forte perto do nascer/pôr do sol

            if (sinElev > -0.02f)
            {
                Sun.transform.rotation = Quaternion.Euler(Mathf.Max(sunElev, 2f), 160f, 0f);
                Sun.intensity = 1.25f * Mathf.Clamp01(sinElev * 4f + 0.05f);
                Sun.color = Color.Lerp(new Color(1f, 0.62f, 0.38f), new Color(1f, 0.96f, 0.9f), Mathf.Clamp01(sinElev * 2.2f));
            }
            else
            {
                // lua
                Sun.transform.rotation = Quaternion.Euler(Mathf.Max(-sunElev, 8f), 340f, 0f);
                Sun.intensity = 0.22f * Mathf.Clamp01(-sinElev * 4f);
                Sun.color = new Color(0.62f, 0.72f, 1f);
            }

            var skyCol = Color.Lerp(NightSky, DaySky, day);
            skyCol = Color.Lerp(skyCol, DuskSky, dusk * 0.6f);
            RenderSettings.ambientSkyColor = skyCol * (0.55f + day * 0.45f);
            RenderSettings.ambientEquatorColor = Color.Lerp(new Color(0.05f, 0.06f, 0.1f), new Color(0.45f, 0.45f, 0.4f), day) + DuskSky * dusk * 0.15f;
            RenderSettings.ambientGroundColor = Color.Lerp(new Color(0.02f, 0.03f, 0.05f), new Color(0.22f, 0.2f, 0.15f), day);

            RenderSettings.fogColor = Color.Lerp(new Color(0.04f, 0.05f, 0.09f), new Color(0.68f, 0.74f, 0.8f), day) + DuskSky * dusk * 0.25f;
            RenderSettings.fogDensity = Mathf.Lerp(0.009f, 0.0045f, day);

            if (sky != null)
            {
                sky.SetFloat("_Exposure", Mathf.Lerp(0.12f, 1.25f, day) + dusk * 0.25f);
                MaterialLib.SetColor(sky, Color.Lerp(new Color(0.3f, 0.35f, 0.55f), new Color(0.5f, 0.5f, 0.5f), day));
                if (sky.HasProperty("_SkyTint")) sky.SetColor("_SkyTint", Color.Lerp(new Color(0.25f, 0.3f, 0.5f), new Color(0.5f, 0.5f, 0.5f), day));
                if (sky.HasProperty("_GroundColor")) sky.SetColor("_GroundColor", Color.Lerp(new Color(0.05f, 0.05f, 0.07f), new Color(0.4f, 0.38f, 0.35f), day));
            }

            AmbientTemp = Mathf.Lerp(7f, 25f, day) + dusk * 2f;
        }
    }
}
