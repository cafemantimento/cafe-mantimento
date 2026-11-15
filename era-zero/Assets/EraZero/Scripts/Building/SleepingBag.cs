using UnityEngine;

namespace EraZero
{
    /// <summary>Saco de dormir: ponto de renascimento e pular a noite.</summary>
    public class SleepingBag : MonoBehaviour, IInteractable
    {
        public string Prompt(PlayerInteraction p) =>
            GameManager.I.DayNight.IsNight ? "[E] Dormir até o amanhecer" : "[E] Definir ponto de renascimento";

        public void Interact(PlayerInteraction p)
        {
            GameManager.I.RespawnPoint = transform.position + Vector3.up * 0.3f;
            if (GameManager.I.DayNight.IsNight)
            {
                if (GameManager.I.Creatures.HostileNear(transform.position, 25f))
                {
                    GameEvents.RaiseNotify("Não dá para dormir com lobos por perto!", UIK.Red);
                    return;
                }
                GameManager.I.DayNight.SkipToMorning();
                GameEvents.RaiseBanner("BOM DIA", "Você dormiu e acordou descansado.");
                GameManager.I.Stats.Stamina = PlayerStats.Max;
            }
            else GameEvents.RaiseNotify("Ponto de renascimento definido", UIK.Cyan);
        }
    }
}
