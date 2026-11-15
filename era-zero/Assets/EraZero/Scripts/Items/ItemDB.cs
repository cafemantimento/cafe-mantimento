using System.Collections.Generic;
using UnityEngine;

namespace EraZero
{
    public enum ItemKind { Resource, Tool, Food, Placeable }
    public enum ToolType { None, Axe, Pickaxe, Spear }

    public class ItemDef
    {
        public string id;
        public string name;
        public string shortName;     // texto curto mostrado no ícone até termos ícones de verdade
        public string description;
        public ItemKind kind;
        public Color color;
        public int maxStack = 100;
        public ToolType tool = ToolType.None;
        public float damage = 6f;    // dano ao acertar algo segurando este item
        public float hunger, thirst, health; // efeitos ao comer
        public string pieceId;       // peça de construção que este item coloca
    }

    /// <summary>Lista de todos os itens do jogo. Para criar um item novo, adicione uma linha aqui.</summary>
    public static class ItemDB
    {
        static readonly Dictionary<string, ItemDef> defs = new Dictionary<string, ItemDef>();
        public static IEnumerable<ItemDef> All => defs.Values;

        static ItemDB()
        {
            // Recursos
            Res("madeira", "Madeira", "MAD", new Color(0.62f, 0.43f, 0.24f), "Corte árvores para conseguir. Um machado rende mais.");
            Res("pedra", "Pedra", "PED", new Color(0.62f, 0.64f, 0.66f), "Quebre rochas para conseguir. Uma picareta rende mais.");
            Res("fibra", "Fibra", "FIB", new Color(0.55f, 0.72f, 0.32f), "Colete em arbustos. Serve para amarrar ferramentas e construções.");
            Res("silex", "Sílex", "SLX", new Color(0.30f, 0.32f, 0.38f), "Pedra afiada. Sai das rochas, principalmente com machado.");
            Res("sucata", "Sucata de Metal", "SUC", new Color(0.62f, 0.38f, 0.26f), "Restos do mundo antigo. Será essencial na Era Industrial.");
            Res("couro", "Couro", "COU", new Color(0.55f, 0.36f, 0.22f), "Tirado de animais abatidos.");

            // Comida
            Food("frutinha", "Frutinhas", "FRU", new Color(0.78f, 0.18f, 0.28f), 8, 4, 0, "Mata um pouco a fome e a sede.");
            Food("carne_crua", "Carne Crua", "CRU", new Color(0.85f, 0.35f, 0.38f), 10, 0, -6, "Comer crua faz mal. Asse numa fogueira.");
            Food("carne_assada", "Carne Assada", "ASS", new Color(0.65f, 0.34f, 0.16f), 38, 0, 4, "Comida de verdade. Mata bastante a fome.");

            // Ferramentas
            Tool("machado_pedra", "Machado de Pedra", "MCH", ToolType.Axe, 22f, "Corta árvores muito mais rápido.");
            Tool("picareta_pedra", "Picareta de Pedra", "PIC", ToolType.Pickaxe, 20f, "Quebra rochas e sucata muito mais rápido.");
            Tool("lanca", "Lança", "LAN", ToolType.Spear, 34f, "Arma para caçar e se defender de lobos.");

            // Construção
            Piece("fundacao_madeira", "Fundação de Madeira", "FUN", "Base de toda construção. Encaixa em grade de 3 metros.");
            Piece("parede_madeira", "Parede de Madeira", "PAR", "Encaixa na borda de uma fundação.");
            Piece("parede_porta", "Parede com Porta", "PRT", "Parede com passagem para entrar no abrigo.");
            Piece("teto_madeira", "Teto de Madeira", "TET", "Cobre uma fundação. Abrigo coberto protege do frio.");
            Piece("fogueira", "Fogueira", "FOG", "Aquece, ilumina a noite e assa carne.");
            Piece("saco_dormir", "Saco de Dormir", "SAC", "Define onde você renasce. À noite, permite dormir até o amanhecer.");
        }

        static void Res(string id, string name, string s, Color c, string desc) =>
            defs[id] = new ItemDef { id = id, name = name, shortName = s, color = c, kind = ItemKind.Resource, description = desc };

        static void Food(string id, string name, string s, Color c, float hunger, float thirst, float health, string desc) =>
            defs[id] = new ItemDef { id = id, name = name, shortName = s, color = c, kind = ItemKind.Food, maxStack = 30, hunger = hunger, thirst = thirst, health = health, description = desc };

        static void Tool(string id, string name, string s, ToolType t, float dmg, string desc) =>
            defs[id] = new ItemDef { id = id, name = name, shortName = s, color = new Color(0.55f, 0.6f, 0.66f), kind = ItemKind.Tool, maxStack = 1, tool = t, damage = dmg, description = desc };

        static void Piece(string id, string name, string s, string desc) =>
            defs[id] = new ItemDef { id = id, name = name, shortName = s, color = new Color(0.37f, 0.88f, 1f), kind = ItemKind.Placeable, maxStack = 20, pieceId = id, description = desc };

        public static ItemDef Get(string id)
        {
            if (string.IsNullOrEmpty(id)) return null;
            return defs.TryGetValue(id, out var d) ? d : null;
        }

        public static string Name(string id) => Get(id)?.name ?? id;
    }
}
