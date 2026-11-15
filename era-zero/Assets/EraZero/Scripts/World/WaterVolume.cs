using UnityEngine;

namespace EraZero
{
    /// <summary>Marca a água para o jogador poder beber.</summary>
    public class WaterVolume : MonoBehaviour, IInteractable
    {
        public string Prompt(PlayerInteraction p) => "[E] Beber água";

        public void Interact(PlayerInteraction p)
        {
            var s = GameManager.I.Stats;
            s.Drink(25f);
            GameEvents.RaiseNotify("Você bebeu água", UIK.Cyan);
        }
    }
}
