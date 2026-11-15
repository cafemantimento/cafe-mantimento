using UnityEngine;

namespace EraZero
{
    /// <summary>Algo que o jogador pode usar com a tecla E.</summary>
    public interface IInteractable
    {
        string Prompt(PlayerInteraction player);
        void Interact(PlayerInteraction player);
    }

    /// <summary>Algo que o jogador pode acertar com o clique (árvores, pedras, animais).</summary>
    public interface IDamageable
    {
        string HitPrompt(ItemDef heldItem);
        void TakeHit(HitInfo hit);
    }

    public struct HitInfo
    {
        public float damage;
        public ToolType tool;
        public Vector3 point;
        public PlayerInteraction source;
    }
}
