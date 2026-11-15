using System;
using System.Collections.Generic;

namespace EraZero
{
    public class Objective
    {
        public string id;
        public string text;
        public int target;
        public int progress;
        public bool Done => progress >= target;
    }

    /// <summary>
    /// Missões da Era I. Ao completar todas, a era é concluída.
    /// Cada era nova vai trazer a sua própria lista de objetivos.
    /// </summary>
    public class QuestSystem
    {
        public const int CurrentEra = 1;
        public static readonly string[] EraNames = { "Primitiva", "Industrial", "Elétrica", "Automação", "Robótica" };

        public readonly List<Objective> Objectives = new List<Objective>();
        public event Action Changed;
        public bool EraComplete { get; private set; }
        public string Title => "Primeiros Passos";

        public float Progress01
        {
            get
            {
                if (Objectives.Count == 0) return 0f;
                float sum = 0f;
                foreach (var o in Objectives) sum += Math.Min(1f, o.progress / (float)o.target);
                return sum / Objectives.Count;
            }
        }

        public QuestSystem()
        {
            Add("madeira", "Colete madeira", 15);
            Add("pedra", "Colete pedra", 10);
            Add("machado", "Fabrique um Machado de Pedra", 1);
            Add("fogueira", "Construa uma Fogueira", 1);
            Add("abrigo", "Erga um abrigo (fundação, 4 paredes, teto)", 6);
            Add("assar", "Cace e asse carne na fogueira", 1);
            Add("noite", "Sobreviva à primeira noite", 1);
            Add("radio", "Investigue as ruínas ao norte", 1);

            GameEvents.ItemGathered += OnGathered;
            GameEvents.ItemCrafted += OnCrafted;
            GameEvents.PiecePlaced += OnPlaced;
            GameEvents.ItemCooked += (id, n) => Advance("assar", n);
            GameEvents.DayStarted += day => { if (day >= 2) Advance("noite", 1); };
            GameEvents.StoryFound += id => { if (id == "radio") Advance("radio", 1); };
        }

        void Add(string id, string text, int target) => Objectives.Add(new Objective { id = id, text = text, target = target });

        Objective Get(string id) => Objectives.Find(o => o.id == id);

        void OnGathered(string item, int n)
        {
            if (item == "madeira") Advance("madeira", n);
            else if (item == "pedra") Advance("pedra", n);
        }

        void OnCrafted(string item)
        {
            if (item == "machado_pedra") Advance("machado", 1);
        }

        void OnPlaced(string piece)
        {
            if (piece == "fogueira") Advance("fogueira", 1);
            var b = GameManager.I.Building;
            int shelter = Math.Min(1, b.FoundationCount) + Math.Min(4, b.WallCount) + Math.Min(1, b.RoofCount);
            var o = Get("abrigo");
            if (shelter > o.progress) Advance("abrigo", shelter - o.progress);
        }

        void Advance(string id, int n)
        {
            var o = Get(id);
            if (o == null || o.Done) return;
            o.progress = Math.Min(o.target, o.progress + n);
            if (o.Done) GameEvents.RaiseNotify("Objetivo concluído: " + o.text, UIK.Green);
            Changed?.Invoke();
            CheckEra();
        }

        void CheckEra()
        {
            if (EraComplete) return;
            foreach (var o in Objectives) if (!o.Done) return;
            EraComplete = true;
            GameEvents.RaiseBanner("ERA I CONCLUÍDA", "Você domina o fogo, a pedra e a madeira. A Era Industrial chega na próxima atualização.");
            Changed?.Invoke();
        }

        // ---------------- salvar / carregar ----------------

        public int[] ExportProgress()
        {
            var arr = new int[Objectives.Count];
            for (int i = 0; i < arr.Length; i++) arr[i] = Objectives[i].progress;
            return arr;
        }

        public void Import(int[] progress)
        {
            for (int i = 0; i < Objectives.Count; i++)
                Objectives[i].progress = progress != null && i < progress.Length ? progress[i] : 0;
            EraComplete = true;
            foreach (var o in Objectives) if (!o.Done) EraComplete = false;
            Changed?.Invoke();
        }
    }
}
