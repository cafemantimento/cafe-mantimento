using UnityEngine;

namespace EraZero
{
    /// <summary>Movimento em primeira pessoa: andar, correr, pular e olhar.</summary>
    [RequireComponent(typeof(CharacterController))]
    public class PlayerController : MonoBehaviour
    {
        public float walkSpeed = 4.5f;
        public float sprintSpeed = 7.5f;
        public float jumpHeight = 1.3f;
        public float gravity = -20f;
        public float mouseSensitivity = 2.2f;

        public Camera Cam { get; private set; }
        public bool IsSprinting { get; private set; }
        public float Pitch => pitch;

        CharacterController cc;
        PlayerStats stats;
        float pitch;
        float yVel;
        Vector3 planarVel;

        public void Init(Camera cam)
        {
            cc = GetComponent<CharacterController>();
            stats = GetComponent<PlayerStats>();
            Cam = cam;
            Cam.transform.SetParent(transform, false);
            Cam.transform.localPosition = new Vector3(0, 1.65f, 0);
            Cam.transform.localRotation = Quaternion.identity;
            Cam.nearClipPlane = 0.05f;
            Cam.farClipPlane = 700f;
            Cam.fieldOfView = 70f;
        }

        public void Teleport(Vector3 pos, float yaw)
        {
            cc.enabled = false;
            transform.position = pos;
            transform.rotation = Quaternion.Euler(0, yaw, 0);
            cc.enabled = true;
            yVel = 0;
            planarVel = Vector3.zero;
        }

        void Update()
        {
            if (cc == null) return;
            bool control = GameManager.I.State == GameState.Playing;
            float dt = Time.deltaTime;

            if (control)
            {
                float mx = GameInput.MouseX * mouseSensitivity;
                float my = GameInput.MouseY * mouseSensitivity;
                transform.Rotate(0, mx, 0);
                pitch = Mathf.Clamp(pitch - my, -85f, 85f);
                Cam.transform.localRotation = Quaternion.Euler(pitch, 0, 0);
            }

            Vector2 input = control ? GameInput.Move : Vector2.zero;
            bool wantSprint = control && GameInput.Key(KeyCode.LeftShift) && input.y > 0.1f;
            IsSprinting = wantSprint && stats.Stamina > 1f;
            if (IsSprinting) stats.UseStamina(14f * dt);

            float speed = IsSprinting ? sprintSpeed : walkSpeed;
            if (stats.Hunger <= 0f || stats.Thirst <= 0f) speed *= 0.8f;
            var target = (transform.right * input.x + transform.forward * input.y) * speed;
            float accel = cc.isGrounded ? 14f : 3f;
            planarVel = Vector3.MoveTowards(planarVel, target, accel * speed * dt);

            if (cc.isGrounded)
            {
                if (yVel < 0) yVel = -2f;
                if (control && GameInput.Down(KeyCode.Space) && stats.UseStamina(8f))
                    yVel = Mathf.Sqrt(jumpHeight * -2f * gravity);
            }
            yVel += gravity * dt;

            cc.Move((planarVel + Vector3.up * yVel) * dt);

            // nunca cair para fora do mapa
            if (transform.position.y < -20f && WorldGenerator.I != null)
                Teleport(GameManager.I.RespawnPoint, transform.eulerAngles.y);
        }
    }
}
