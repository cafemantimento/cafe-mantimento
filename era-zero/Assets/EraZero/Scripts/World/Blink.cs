using UnityEngine;

namespace EraZero
{
    public class Blink : MonoBehaviour
    {
        Renderer r;
        void Awake() => r = GetComponent<Renderer>();
        void Update() { if (r) r.enabled = Mathf.Repeat(Time.time, 1.2f) < 0.6f; }
    }
}
