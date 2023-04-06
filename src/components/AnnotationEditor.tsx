// import { ExchangeRates } from "~/ExchangeRate";
import { c, s } from "~/utils/styles";
import { throttle } from "lodash-es";
import { CMText } from "./CMText";
import { Accessor, createSignal } from "solid-js";

export const MAX_ANNOTATION_LENGTH = 300;

export const AnnotationEditor = ({
  annotation: _annotation,
  onUpdate,
}: {
  annotation: Accessor<string>;
  onUpdate: (annotation: string) => void;
}) => {
  const [focus, setFocus] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const [annotation, setAnnotation] = createSignal(_annotation());
  // TODO: solid
  // const { fadeStyling } = useFadeAnimation(loading(), { duration: 300 });
  const fadeStyling = 100;
  let lastTimer: number | null = null;
  const updateDebounced = throttle(
    (annotation: string) => {
      setLoading(true);
      onUpdate(annotation);
      if (lastTimer) {
        window.clearTimeout(lastTimer);
        lastTimer = null;
      }
      lastTimer = window.setTimeout(() => {
        setLoading(false);
      }, 400);
    },
    400,
    { leading: true }
  );
  return (
    <div style={s(c.grow, c.relative)}>
      <div
        style={s(
          c.absolute,
          c.bottom(12),
          c.zIndex(100),
          c.right(12),
          c.left(12),
          c.row,
          c.justifyBetween,
          c.opacity(focus() ? 100 : 0)
        )}
      >
        <CMText style={s(c.fg(c.grays[50]), c.opacity(fadeStyling))}>
          <i class="fas fa-circle-notch fa-spin"></i>
        </CMText>
        <CMText
          style={s(
            annotation()?.length > MAX_ANNOTATION_LENGTH && c.weightBold,
            c.fg(
              annotation()?.length > MAX_ANNOTATION_LENGTH
                ? c.reds[60]
                : c.grays[50]
            )
          )}
        >
          {annotation()?.length ?? 0}/{MAX_ANNOTATION_LENGTH}
        </CMText>
      </div>
      <div style={s(c.bg(c.grays[20]), c.py(12), c.grow)}>
        <input
          multiline
          value={annotation() ?? ""}
          style={s(
            {
              fontFamily: "Inter",
            },
            c.grow,
            c.border("none"),
            c.br(0),
            c.px(12),
            c.pb(24),
            c.bg(c.grays[20]),
            c.fg(c.grays[90]),
            c.keyedProp("resize")("none")
          )}
          placeholder={'ex. "Intending Bg5 after d4"'}
          placeholderTextColor={c.grays[50]}
          onFocus={() => {
            setFocus(true);
          }}
          onBlur={() => {
            setFocus(false);
          }}
          onChange={(e: any) => {
            setAnnotation(e.target.value);
            if (e.target.value.length < MAX_ANNOTATION_LENGTH) {
              updateDebounced(e.target.value);
            }
          }}
        />
      </div>
    </div>
  );
};
