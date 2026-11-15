using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace EraZero
{
    [Serializable]
    public class SaveData
    {
        public int version = 1;
        public Vector3 playerPos;
        public float playerYaw;
        public float health, hunger, thirst, stamina;
        public ItemStack[] slots;
        public float hour;
        public int day;
        public Vector3 respawn;
        public List<PieceRecord> pieces;
        public int[] quests;
    }

    /// <summary>Salva o jogo num arquivo no computador (F5 salva, também salva sozinho a cada 3 minutos).</summary>
    public static class SaveSystem
    {
        public static string FilePath => Path.Combine(Application.persistentDataPath, "erazero_save.json");
        public static bool HasSave => File.Exists(FilePath);

        public static void Save(GameManager gm)
        {
            var data = new SaveData
            {
                playerPos = gm.Player.transform.position,
                playerYaw = gm.Player.transform.eulerAngles.y,
                health = gm.Stats.Health,
                hunger = gm.Stats.Hunger,
                thirst = gm.Stats.Thirst,
                stamina = gm.Stats.Stamina,
                slots = new ItemStack[Inventory.Size],
                hour = gm.DayNight.Hour,
                day = gm.DayNight.Day,
                respawn = gm.RespawnPoint,
                pieces = gm.Building.Export(),
                quests = gm.Quests.ExportProgress()
            };
            for (int i = 0; i < Inventory.Size; i++)
            {
                var s = gm.Inventory.slots[i];
                data.slots[i] = s != null ? new ItemStack { id = s.id, count = s.count } : new ItemStack { id = "", count = 0 };
            }
            try
            {
                File.WriteAllText(FilePath, JsonUtility.ToJson(data, true));
                GameEvents.RaiseNotify("Jogo salvo", UIK.Green);
            }
            catch (Exception e)
            {
                Debug.LogError("Erro ao salvar: " + e.Message);
                GameEvents.RaiseNotify("Não foi possível salvar", UIK.Red);
            }
        }

        public static bool Load(GameManager gm)
        {
            if (!HasSave) return false;
            SaveData data;
            try { data = JsonUtility.FromJson<SaveData>(File.ReadAllText(FilePath)); }
            catch (Exception e)
            {
                Debug.LogError("Erro ao carregar: " + e.Message);
                return false;
            }
            if (data == null) return false;

            gm.Inventory.Clear();
            if (data.slots != null)
                for (int i = 0; i < Inventory.Size && i < data.slots.Length; i++)
                {
                    var s = data.slots[i];
                    gm.Inventory.slots[i] = s != null && ItemDB.Get(s.id) != null && s.count > 0 ? new ItemStack { id = s.id, count = s.count } : null;
                }
            gm.Inventory.NotifyChanged();

            gm.Stats.ResetStats(1f);
            gm.Stats.Health = data.health > 0 ? data.health : 50f;
            gm.Stats.Hunger = data.hunger;
            gm.Stats.Thirst = data.thirst;
            gm.Stats.Stamina = data.stamina;
            gm.DayNight.Hour = data.hour;
            gm.DayNight.Day = Mathf.Max(1, data.day);
            gm.RespawnPoint = data.respawn;
            gm.Building.Import(data.pieces);
            gm.Quests.Import(data.quests);
            gm.Player.Teleport(data.playerPos + Vector3.up * 0.2f, data.playerYaw);
            return true;
        }

        public static void Delete()
        {
            try { if (HasSave) File.Delete(FilePath); } catch (Exception) { }
        }
    }
}
