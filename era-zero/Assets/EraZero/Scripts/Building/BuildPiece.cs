using UnityEngine;

namespace EraZero
{
    /// <summary>Marca um objeto como peça construída pelo jogador.</summary>
    public class BuildPiece : MonoBehaviour
    {
        public string id;
        public Vector2Int cell;
        public string edgeKey;
        public float floorTop;
    }
}
