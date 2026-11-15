using UnityEngine;
using UnityEngine.UIElements;

namespace EraZero
{
    /// <summary>
    /// Cores e atalhos para montar a interface (UI Toolkit) por código,
    /// no mesmo visual da imagem de conceito.
    /// </summary>
    public static class UIK
    {
        public static readonly Color Panel = new Color(0.04f, 0.07f, 0.10f, 0.78f);
        public static readonly Color PanelSolid = new Color(0.05f, 0.08f, 0.11f, 0.96f);
        public static readonly Color Border = new Color(0.47f, 0.86f, 1f, 0.25f);
        public static readonly Color Track = new Color(1f, 1f, 1f, 0.09f);
        public static readonly Color Text = new Color(0.91f, 0.93f, 0.95f);
        public static readonly Color Muted = new Color(0.56f, 0.70f, 0.77f);
        public static readonly Color Cyan = new Color(0.37f, 0.88f, 1f);
        public static readonly Color Amber = new Color(1f, 0.71f, 0.28f);
        public static readonly Color Red = new Color(1f, 0.42f, 0.42f);
        public static readonly Color Green = new Color(0.49f, 1f, 0.6f);
        public static readonly Color HealthCol = new Color(0.93f, 0.32f, 0.32f);
        public static readonly Color HungerCol = new Color(0.95f, 0.62f, 0.2f);
        public static readonly Color ThirstCol = new Color(0.3f, 0.65f, 1f);
        public static readonly Color StaminaCol = new Color(0.4f, 0.9f, 0.5f);

        public static VisualElement El(VisualElement parent, string name = null)
        {
            var e = new VisualElement();
            if (name != null) e.name = name;
            parent?.Add(e);
            return e;
        }

        public static Label Txt(VisualElement parent, string text, float size, Color color, bool bold = false)
        {
            var l = new Label(text);
            l.style.fontSize = size;
            l.style.color = color;
            l.style.unityFontStyleAndWeight = bold ? FontStyle.Bold : FontStyle.Normal;
            l.style.marginLeft = 0; l.style.marginRight = 0; l.style.marginTop = 0; l.style.marginBottom = 0;
            l.style.paddingLeft = 0; l.style.paddingRight = 0; l.style.paddingTop = 0; l.style.paddingBottom = 0;
            l.style.whiteSpace = WhiteSpace.Normal;
            l.pickingMode = PickingMode.Ignore;
            parent?.Add(l);
            return l;
        }

        public static void Abs(VisualElement e, float? left = null, float? top = null, float? right = null, float? bottom = null)
        {
            e.style.position = Position.Absolute;
            if (left.HasValue) e.style.left = left.Value;
            if (top.HasValue) e.style.top = top.Value;
            if (right.HasValue) e.style.right = right.Value;
            if (bottom.HasValue) e.style.bottom = bottom.Value;
        }

        public static void Fill(VisualElement e)
        {
            Abs(e, 0, 0, 0, 0);
        }

        public static void Size(VisualElement e, float? w, float? h)
        {
            if (w.HasValue) e.style.width = w.Value;
            if (h.HasValue) e.style.height = h.Value;
        }

        public static void Pad(VisualElement e, float v, float h)
        {
            e.style.paddingTop = v; e.style.paddingBottom = v;
            e.style.paddingLeft = h; e.style.paddingRight = h;
        }

        public static void Radius(VisualElement e, float r)
        {
            e.style.borderTopLeftRadius = r; e.style.borderTopRightRadius = r;
            e.style.borderBottomLeftRadius = r; e.style.borderBottomRightRadius = r;
        }

        public static void BorderAll(VisualElement e, float w, Color c)
        {
            e.style.borderTopWidth = w; e.style.borderBottomWidth = w;
            e.style.borderLeftWidth = w; e.style.borderRightWidth = w;
            e.style.borderTopColor = c; e.style.borderBottomColor = c;
            e.style.borderLeftColor = c; e.style.borderRightColor = c;
        }

        public static VisualElement PanelBox(VisualElement parent, bool solid = false)
        {
            var e = El(parent);
            e.style.backgroundColor = solid ? PanelSolid : Panel;
            BorderAll(e, 1, Border);
            Radius(e, 6);
            Pad(e, 14, 16);
            e.pickingMode = PickingMode.Ignore;
            return e;
        }

        public static Label Eyebrow(VisualElement parent, string text, Color? color = null)
        {
            var l = Txt(parent, text.ToUpperInvariant(), 12, color ?? Muted, true);
            l.style.letterSpacing = 2;
            return l;
        }

        public static VisualElement Row(VisualElement parent, float gap = 0)
        {
            var r = El(parent);
            r.style.flexDirection = FlexDirection.Row;
            r.style.alignItems = Align.Center;
            r.pickingMode = PickingMode.Ignore;
            return r;
        }

        /// <summary>Barra de status. Devolve o preenchimento, cuja largura é a porcentagem.</summary>
        public static VisualElement Bar(VisualElement parent, Color color, float height = 10)
        {
            var track = El(parent);
            track.style.flexGrow = 1;
            track.style.height = height;
            track.style.backgroundColor = Track;
            Radius(track, 2);
            track.style.overflow = Overflow.Hidden;
            track.pickingMode = PickingMode.Ignore;
            var fill = El(track);
            fill.style.height = Length.Percent(100);
            fill.style.width = Length.Percent(100);
            fill.style.backgroundColor = color;
            Radius(fill, 2);
            fill.pickingMode = PickingMode.Ignore;
            return fill;
        }

        public static Button Btn(VisualElement parent, string text, System.Action onClick, bool primary = false)
        {
            var b = new Button(onClick) { text = text };
            b.style.fontSize = 18;
            b.style.unityFontStyleAndWeight = FontStyle.Bold;
            b.style.color = primary ? new Color(0.03f, 0.08f, 0.1f) : Text;
            b.style.backgroundColor = primary ? Cyan : new Color(1f, 1f, 1f, 0.06f);
            BorderAll(b, 1, primary ? Cyan : Border);
            Radius(b, 5);
            Pad(b, 10, 22);
            b.style.marginTop = 6; b.style.marginBottom = 6; b.style.marginLeft = 0; b.style.marginRight = 0;
            b.style.unityTextAlign = TextAnchor.MiddleCenter;
            var normal = b.style.backgroundColor.value;
            b.RegisterCallback<MouseEnterEvent>(_ => b.style.backgroundColor = primary ? new Color(0.55f, 0.93f, 1f) : new Color(1f, 1f, 1f, 0.14f));
            b.RegisterCallback<MouseLeaveEvent>(_ => b.style.backgroundColor = normal);
            parent?.Add(b);
            return b;
        }

        public static void Show(VisualElement e, bool show) => e.style.display = show ? DisplayStyle.Flex : DisplayStyle.None;
    }
}
