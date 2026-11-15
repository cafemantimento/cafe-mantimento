using System;
using UnityEngine;

namespace EraZero
{
    /// <summary>Vida, fome, sede, energia e temperatura do sobrevivente.</summary>
    public class PlayerStats : MonoBehaviour
    {
        public const float Max = 100f;
        public const float ColdLimit = 10f;

        public float Health = Max;
        public float Hunger = Max;
        public float Thirst = Max;
        public float Stamina = Max;
        public float FeelsTemp { get; private set; } = 20f;
        public bool NearFire { get; private set; }
        public bool Sheltered { get; private set; }
        public bool IsDead { get; private set; }

        public event Action Died;
        public event Action<float> Damaged;

        float staminaDelay;
        float shelterCheck;

        public void ResetStats(float fraction)
        {
            Health = Max * fraction;
            Hunger = Mathf.Max(Hunger, Max * fraction);
            Thirst = Mathf.Max(Thirst, Max * fraction);
            Stamina = Max;
            IsDead = false;
        }

        void Update()
        {
            if (IsDead || GameManager.I.State != GameState.Playing) return;
            float dt = Time.deltaTime;

            // temperatura
            NearFire = Campfire.WarmthAt(transform.position);
            shelterCheck -= dt;
            if (shelterCheck <= 0f)
            {
                shelterCheck = 0.5f;
                Sheltered = Physics.Raycast(transform.position + Vector3.up * 1.7f, Vector3.up, out var hit, 6f, ~(1 << 2), QueryTriggerInteraction.Ignore)
                            && hit.collider.GetComponentInParent<BuildPiece>() != null;
            }
            float ambient = GameManager.I.DayNight.AmbientTemp;
            FeelsTemp = ambient + (NearFire ? 15f : 0f) + (Sheltered ? 6f : 0f);
            bool cold = FeelsTemp < ColdLimit;

            // fome e sede
            Hunger = Mathf.Max(0f, Hunger - (cold ? 0.11f : 0.07f) * dt);
            Thirst = Mathf.Max(0f, Thirst - 0.1f * dt);

            // energia
            if (staminaDelay > 0f) staminaDelay -= dt;
            else Stamina = Mathf.Min(Max, Stamina + (cold ? 7f : 14f) * dt);

            // vida
            float drain = 0f;
            if (Hunger <= 0f) drain += 1f;
            if (Thirst <= 0f) drain += 1.2f;
            if (cold) drain += 0.35f;
            if (drain > 0f) Damage(drain * dt, false);
            else if (Hunger > 40f && Thirst > 40f && Health < Max) Health = Mathf.Min(Max, Health + 0.6f * dt);
        }

        public bool UseStamina(float amount)
        {
            if (Stamina < amount) return false;
            Stamina -= amount;
            staminaDelay = 0.8f;
            return true;
        }

        public void Damage(float amount, bool flash = true)
        {
            if (IsDead) return;
            Health -= amount;
            if (flash) Damaged?.Invoke(amount);
            if (Health <= 0f)
            {
                Health = 0f;
                IsDead = true;
                Died?.Invoke();
            }
        }

        public void Eat(ItemDef food)
        {
            Hunger = Mathf.Clamp(Hunger + food.hunger, 0, Max);
            Thirst = Mathf.Clamp(Thirst + food.thirst, 0, Max);
            if (food.health < 0) Damage(-food.health);
            else Health = Mathf.Clamp(Health + food.health, 0, Max);
        }

        public void Drink(float amount) => Thirst = Mathf.Min(Max, Thirst + amount);
    }
}
