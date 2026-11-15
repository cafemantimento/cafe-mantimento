using UnityEngine;

namespace EraZero
{
    public enum GameState { Menu, Playing, Inventory, Paused, Dead }

    /// <summary>
    /// Cérebro do jogo. Cria o mundo, o jogador e a interface, e controla
    /// os estados (menu, jogando, inventário, pausa, morte).
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public const int WorldSeed = 2031;
        const float AutosaveSeconds = 180f;

        public static GameManager I { get; private set; }

        public GameState State { get; private set; } = GameState.Menu;
        public WorldGenerator World { get; private set; }
        public DayNightCycle DayNight { get; private set; }
        public PlayerController Player { get; private set; }
        public PlayerStats Stats { get; private set; }
        public PlayerInteraction Interaction { get; private set; }
        public Inventory Inventory { get; private set; }
        public QuestSystem Quests { get; private set; }
        public BuildingSystem Building { get; private set; }
        public CreatureSpawner Creatures { get; private set; }
        public HUD Hud { get; private set; }
        public Vector3 RespawnPoint;

        float autosaveTimer;

        void Awake()
        {
            I = this;
            GameInput.Probe();

            // limite de FPS para o computador não esquentar à toa
            QualitySettings.vSyncCount = 0;
            Application.targetFrameRate = 60;
            QualitySettings.shadowDistance = 90f;

            // reaproveita a câmera e a luz que já vêm na cena do Unity
            var cam = Camera.main;
            if (cam == null)
            {
                cam = new GameObject("Main Camera").AddComponent<Camera>();
                cam.gameObject.tag = "MainCamera";
                cam.gameObject.AddComponent<AudioListener>();
            }
            cam.clearFlags = CameraClearFlags.Skybox;
            Light sun = null;
            foreach (var l in FindObjectsByType<Light>(FindObjectsSortMode.None))
                if (l.type == LightType.Directional) { sun = l; break; }

            Inventory = new Inventory();
            Quests = new QuestSystem();

            World = gameObject.AddComponent<WorldGenerator>();
            World.Generate(WorldSeed);

            DayNight = new GameObject("DiaNoite").AddComponent<DayNightCycle>();
            DayNight.Init(sun);

            Building = gameObject.AddComponent<BuildingSystem>();
            CreatePlayer(cam);

            Creatures = gameObject.AddComponent<CreatureSpawner>();
            Creatures.Init();

            Hud = new GameObject("Interface").AddComponent<HUD>();
            Hud.Init();

            Stats.Died += OnDied;
            SetState(GameState.Menu);
        }

        void CreatePlayer(Camera cam)
        {
            var go = new GameObject("Jogador");
            go.layer = 2; // "Ignore Raycast": os raios de mira não acertam o próprio jogador
            var cc = go.AddComponent<CharacterController>();
            cc.height = 1.8f;
            cc.radius = 0.35f;
            cc.center = new Vector3(0, 0.9f, 0);
            cc.stepOffset = 0.45f;
            cc.slopeLimit = 48f;
            Stats = go.AddComponent<PlayerStats>();
            Player = go.AddComponent<PlayerController>();
            Player.Init(cam);
            var held = cam.gameObject.AddComponent<HeldItemView>();
            held.Init();
            Interaction = go.AddComponent<PlayerInteraction>();
            Interaction.Init(held);
            RespawnPoint = World.SpawnPoint;
            Player.Teleport(World.SpawnPoint, 20f);
        }

        // ---------------- estados ----------------

        public void SetState(GameState s)
        {
            State = s;
            bool playing = s == GameState.Playing;
            Time.timeScale = s == GameState.Paused || s == GameState.Menu ? 0f : 1f;
            Cursor.lockState = playing ? CursorLockMode.Locked : CursorLockMode.None;
            Cursor.visible = !playing;
            if (Hud != null) Hud.OnStateChanged(s);
        }

        public void NewGame()
        {
            SaveSystem.Delete();
            Inventory.Clear();
            Building.ClearAll();
            Quests.Import(null);
            Stats.ResetStats(1f);
            Stats.Hunger = PlayerStats.Max;
            Stats.Thirst = PlayerStats.Max;
            DayNight.Hour = 8f;
            DayNight.Day = 1;
            RespawnPoint = World.SpawnPoint;
            Player.Teleport(World.SpawnPoint, 20f);
            Interaction.Select(0);
            SetState(GameState.Playing);
            GameEvents.RaiseBanner("DIA 1", "Você acordou sozinho no Vale. Pegue galhos e pedras do chão, depois golpeie árvores e rochas.");
        }

        public void ContinueGame()
        {
            if (!SaveSystem.Load(this)) { NewGame(); return; }
            SetState(GameState.Playing);
            GameEvents.RaiseBanner($"DIA {DayNight.Day}", "Jogo carregado.");
        }

        public void Respawn()
        {
            Stats.ResetStats(0.6f);
            Player.Teleport(RespawnPoint, Player.transform.eulerAngles.y);
            SetState(GameState.Playing);
        }

        void OnDied()
        {
            SetState(GameState.Dead);
        }

        public void QuitGame()
        {
            if (State == GameState.Playing || State == GameState.Paused || State == GameState.Inventory) SaveSystem.Save(this);
            Application.Quit();
#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#endif
        }

        void Update()
        {
            switch (State)
            {
                case GameState.Playing:
                    if (GameInput.Down(KeyCode.Escape)) SetState(GameState.Paused);
                    else if (GameInput.Down(KeyCode.Tab) || GameInput.Down(KeyCode.I)) SetState(GameState.Inventory);
                    if (GameInput.Down(KeyCode.F5)) SaveSystem.Save(this);
                    if (GameInput.Down(KeyCode.F9) && SaveSystem.HasSave) ContinueGame();
                    autosaveTimer += Time.deltaTime;
                    if (autosaveTimer > AutosaveSeconds) { autosaveTimer = 0f; SaveSystem.Save(this); }
                    break;
                case GameState.Inventory:
                    if (GameInput.Down(KeyCode.Escape) || GameInput.Down(KeyCode.Tab) || GameInput.Down(KeyCode.I)) SetState(GameState.Playing);
                    break;
                case GameState.Paused:
                    if (GameInput.Down(KeyCode.Escape)) SetState(GameState.Playing);
                    break;
            }
        }

        void OnApplicationFocus(bool focus)
        {
            // ao voltar para a janela do jogo, prende o mouse de novo
            if (focus && State == GameState.Playing)
            {
                Cursor.lockState = CursorLockMode.Locked;
                Cursor.visible = false;
            }
        }
    }

    /// <summary>
    /// Inicia o jogo sozinho ao apertar Play em qualquer cena.
    /// </summary>
    public static class GameBootstrap
    {
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Start()
        {
            if (Object.FindFirstObjectByType<GameManager>() != null) return;
            new GameObject("EraZero").AddComponent<GameManager>();
        }
    }
}
