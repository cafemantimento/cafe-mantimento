using UnityEngine;

namespace EraZero
{
    /// <summary>
    /// Ponto único de leitura de teclado e mouse. Se um dia trocarmos para o
    /// Input System novo (ou controle de videogame), só este arquivo muda.
    /// </summary>
    public static class GameInput
    {
        public static bool Available { get; private set; } = true;
        static bool hasMouseAxes = true;

        public static void Probe()
        {
            try
            {
                Input.GetKey(KeyCode.Space);
                Available = true;
            }
            catch (System.InvalidOperationException)
            {
                Available = false;
            }

            if (!Available) return;
            try { Input.GetAxisRaw("Mouse X"); hasMouseAxes = true; }
            catch (System.ArgumentException) { hasMouseAxes = false; }
        }

        public static bool Key(KeyCode k) => Available && Input.GetKey(k);
        public static bool Down(KeyCode k) => Available && Input.GetKeyDown(k);
        public static bool Mouse(int button) => Available && Input.GetMouseButton(button);
        public static bool MouseDown(int button) => Available && Input.GetMouseButtonDown(button);
        public static float MouseX => Available && hasMouseAxes ? Input.GetAxisRaw("Mouse X") : 0f;
        public static float MouseY => Available && hasMouseAxes ? Input.GetAxisRaw("Mouse Y") : 0f;
        public static float Scroll => Available ? Input.mouseScrollDelta.y : 0f;

        public static Vector2 Move
        {
            get
            {
                if (!Available) return Vector2.zero;
                float x = (Input.GetKey(KeyCode.D) ? 1 : 0) - (Input.GetKey(KeyCode.A) ? 1 : 0);
                float y = (Input.GetKey(KeyCode.W) ? 1 : 0) - (Input.GetKey(KeyCode.S) ? 1 : 0);
                var v = new Vector2(x, y);
                return v.sqrMagnitude > 1f ? v.normalized : v;
            }
        }
    }
}
