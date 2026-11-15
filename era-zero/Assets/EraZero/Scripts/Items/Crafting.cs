using System.Collections.Generic;
using System.Text;

namespace EraZero
{
    public class Cost
    {
        public string id;
        public int amount;
        public Cost(string id, int amount) { this.id = id; this.amount = amount; }
    }

    public class Recipe
    {
        public string result;
        public int amount = 1;
        public int era = 1;
        public Cost[] costs;
    }

    /// <summary>Receitas de fabricação. Novas eras vão acrescentar receitas aqui.</summary>
    public static class Crafting
    {
        public static readonly List<Recipe> Recipes = new List<Recipe>
        {
            R("machado_pedra", 1, C("madeira", 4), C("pedra", 3), C("fibra", 4)),
            R("picareta_pedra", 1, C("madeira", 4), C("pedra", 4), C("fibra", 4), C("silex", 1)),
            R("lanca", 1, C("madeira", 6), C("silex", 2), C("fibra", 6)),
            R("fogueira", 1, C("madeira", 8), C("pedra", 6)),
            R("fundacao_madeira", 1, C("madeira", 12), C("fibra", 4)),
            R("parede_madeira", 1, C("madeira", 8), C("fibra", 3)),
            R("parede_porta", 1, C("madeira", 8), C("fibra", 3)),
            R("teto_madeira", 1, C("madeira", 8), C("fibra", 3)),
            R("saco_dormir", 1, C("fibra", 15), C("couro", 3)),
        };

        static Recipe R(string id, int amount, params Cost[] costs) => new Recipe { result = id, amount = amount, costs = costs };
        static Cost C(string id, int n) => new Cost(id, n);

        public static bool CanCraft(Inventory inv, Recipe r)
        {
            foreach (var c in r.costs) if (!inv.Has(c.id, c.amount)) return false;
            return true;
        }

        public static bool Craft(Inventory inv, Recipe r)
        {
            if (!CanCraft(inv, r)) return false;
            foreach (var c in r.costs) inv.Remove(c.id, c.amount);
            int left = inv.Add(r.result, r.amount);
            if (left > 0)
            {
                // sem espaço: devolve os materiais
                foreach (var c in r.costs) inv.Add(c.id, c.amount);
                GameEvents.RaiseNotify("Inventário cheio", UIK.Red);
                return false;
            }
            GameEvents.RaiseItemCrafted(r.result);
            GameEvents.RaiseNotify("Fabricado: " + ItemDB.Name(r.result), UIK.Cyan);
            return true;
        }

        public static string CostText(Recipe r)
        {
            var sb = new StringBuilder();
            for (int i = 0; i < r.costs.Length; i++)
            {
                if (i > 0) sb.Append("  ");
                sb.Append(r.costs[i].amount).Append(' ').Append(ItemDB.Name(r.costs[i].id));
            }
            return sb.ToString();
        }
    }
}
