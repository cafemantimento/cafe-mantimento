using System;
using UnityEngine;

namespace EraZero
{
    /// <summary>
    /// Eventos globais do jogo. Os sistemas (missões, interface, conquistas) escutam
    /// estes eventos em vez de depender diretamente uns dos outros.
    /// </summary>
    public static class GameEvents
    {
        public static event Action<string, int> ItemGathered;
        public static event Action<string> ItemCrafted;
        public static event Action<string> PiecePlaced;
        public static event Action<string, int> ItemCooked;
        public static event Action<int> DayStarted;
        public static event Action<string> StoryFound;
        public static event Action<string, Color> Notify;
        public static event Action<string, string> Banner;

        public static void RaiseItemGathered(string id, int amount) => ItemGathered?.Invoke(id, amount);
        public static void RaiseItemCrafted(string id) => ItemCrafted?.Invoke(id);
        public static void RaisePiecePlaced(string id) => PiecePlaced?.Invoke(id);
        public static void RaiseItemCooked(string id, int amount) => ItemCooked?.Invoke(id, amount);
        public static void RaiseDayStarted(int day) => DayStarted?.Invoke(day);
        public static void RaiseStoryFound(string id) => StoryFound?.Invoke(id);
        public static void RaiseNotify(string text) => Notify?.Invoke(text, UIK.Text);
        public static void RaiseNotify(string text, Color color) => Notify?.Invoke(text, color);
        public static void RaiseBanner(string title, string subtitle) => Banner?.Invoke(title, subtitle);

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        static void ResetAll()
        {
            ItemGathered = null; ItemCrafted = null; PiecePlaced = null; ItemCooked = null;
            DayStarted = null; StoryFound = null; Notify = null; Banner = null;
        }
    }
}
