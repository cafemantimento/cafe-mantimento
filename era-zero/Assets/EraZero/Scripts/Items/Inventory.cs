using System;

namespace EraZero
{
    [Serializable]
    public class ItemStack
    {
        public string id;
        public int count;
        public ItemDef Def => ItemDB.Get(id);
    }

    /// <summary>
    /// Inventário de 32 espaços. Os 8 primeiros são a barra rápida (teclas 1 a 8).
    /// </summary>
    public class Inventory
    {
        public const int Size = 32;
        public const int HotbarSize = 8;

        public readonly ItemStack[] slots = new ItemStack[Size];
        public event Action Changed;

        public void NotifyChanged() => Changed?.Invoke();

        /// <summary>Adiciona itens. Devolve quantos não couberam.</summary>
        public int Add(string id, int amount)
        {
            var def = ItemDB.Get(id);
            if (def == null || amount <= 0) return amount;
            int left = amount;

            for (int i = 0; i < Size && left > 0; i++)
            {
                var s = slots[i];
                if (s == null || s.id != id || s.count >= def.maxStack) continue;
                int add = Math.Min(left, def.maxStack - s.count);
                s.count += add;
                left -= add;
            }

            bool hotbarFirst = def.kind != ItemKind.Resource;
            for (int n = 0; n < Size && left > 0; n++)
            {
                int i = hotbarFirst ? n : (n + HotbarSize) % Size;
                if (slots[i] != null) continue;
                int add = Math.Min(left, def.maxStack);
                slots[i] = new ItemStack { id = id, count = add };
                left -= add;
            }

            if (left != amount) Changed?.Invoke();
            return left;
        }

        public int Count(string id)
        {
            int total = 0;
            foreach (var s in slots) if (s != null && s.id == id) total += s.count;
            return total;
        }

        public bool Has(string id, int amount) => Count(id) >= amount;

        public bool Remove(string id, int amount)
        {
            if (!Has(id, amount)) return false;
            int left = amount;
            for (int i = Size - 1; i >= 0 && left > 0; i--)
            {
                var s = slots[i];
                if (s == null || s.id != id) continue;
                int take = Math.Min(left, s.count);
                s.count -= take;
                left -= take;
                if (s.count <= 0) slots[i] = null;
            }
            Changed?.Invoke();
            return true;
        }

        public void RemoveFromSlot(int index, int amount)
        {
            var s = slots[index];
            if (s == null) return;
            s.count -= amount;
            if (s.count <= 0) slots[index] = null;
            Changed?.Invoke();
        }

        public void Swap(int a, int b)
        {
            if (a == b) return;
            var sa = slots[a];
            var sb = slots[b];
            if (sa != null && sb != null && sa.id == sb.id)
            {
                int max = sa.Def.maxStack;
                int move = Math.Min(sa.count, max - sb.count);
                sb.count += move;
                sa.count -= move;
                if (sa.count <= 0) slots[a] = null;
            }
            else
            {
                slots[a] = sb;
                slots[b] = sa;
            }
            Changed?.Invoke();
        }

        public void Clear()
        {
            for (int i = 0; i < Size; i++) slots[i] = null;
            Changed?.Invoke();
        }
    }
}
