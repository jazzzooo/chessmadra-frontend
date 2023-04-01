import { View } from "react-native";
// import { ExchangeRates } from "~/ExchangeRate";
import { c, s } from "~/utils/styles";
import { Spacer } from "~/components/Space";
import { Button } from "~/components/Button";
import { useIsMobile } from "~/utils/isMobile";
import { CMText } from "./CMText";
import { useRepertoireState, quick, useSidebarState } from "~/utils/app_state";
import { LichessLogoIcon } from "./icons/LichessLogoIcon";
import { trackEvent } from "~/utils/trackEvent";
import { useResponsive, BP } from "~/utils/useResponsive";
import { useRef } from "react";

type BackControlsProps = {
  includeAnalyze?: boolean;
  includeReview?: boolean;
  extraButton?: any;
  height?: number;
};

export const BackControls: React.FC<BackControlsProps> = ({
  includeAnalyze,
  includeReview,
  height,
  extraButton,
}) => {
  const bp = useResponsive();
  const layout = useRef(null);
  const [
    // searchOnChessable,
    analyzeLineOnLichess,
    currentLine,
    backToStartPosition,
    backOne,
  ] = useRepertoireState((s) => [
    // s.searchOnChessable,
    s.analyzeLineOnLichess,
    s.browsingState.chessboardState.moveLog,
    s.backToStartPosition,
    s.backOne,
  ]);

  const [activeSide] = useSidebarState(([s]) => [s.activeSide]);
  const isMobile = useIsMobile();
  const gap = isMobile ? 6 : 12;
  const foreground = c.grays[90];
  const textColor = c.fg(foreground);
  return (
    <div
      style={s(
        c.row,
        c.height(height ?? bp.switch(40, [BP.lg, 48])),
        c.selfStretch
      )}
      onLayout={({ nativeEvent: { layout: l } }) => {
        layout.current = l;
      }}
    >
      <Button
        style={s(c.buttons.darkFloater, c.width(48), c.constrainHeight)}
        onPress={() => {
          backToStartPosition();
        }}
      >
        <i
          class="fa-sharp fa-angles-left"
          style={s(
            c.buttons.darkFloater.textStyles,
            c.px(0),
            c.fontSize(18),
            textColor
          )}
        />
      </Button>
      <Spacer width={gap} />
      <Button
        style={s(c.buttons.darkFloater, c.grow, c.constrainHeight)}
        onPress={() => {
          backOne();
        }}
      >
        <i
          class="fa-sharp fa-angle-left"
          style={s(c.buttons.darkFloater.textStyles, c.fontSize(18), textColor)}
        />
      </Button>
      <Show when={extraButton }>
        <>
          <Spacer width={gap} />
          {extraButton}
        </>
        </Show>
        <Show when={includeAnalyze }>
        <>
          <Spacer width={gap} />
          <Button
            style={s(c.buttons.darkFloater)}
            onPress={() => {
              trackEvent("repertoire.analyze_on_lichess");
              analyzeLineOnLichess(currentLine);
            }}
          >
            <div style={s(c.size(isMobile ? 20 : 22))}>
              <LichessLogoIcon color={foreground} />
            </div>
            {layout.current?.width > 400 && (
              <>
                <Spacer width={8} />
                <CMText
                  style={s(
                    c.buttons.darkFloater.textStyles,
                    textColor,
                    c.weightRegular,
                    c.fontSize(14)
                  )}
                >
                  Analyze on Lichess
                </CMText>
              </>
            )}
          </Button>
        </>
        </Show>
        <Show when={includeReview }>
        <>
          <Spacer width={gap} />
          <Button
            style={s(c.buttons.darkFloater)}
            onPress={() => {
              quick((s) => {
                s.repertoireState.reviewState.startReview(activeSide, {
                  side: activeSide,
                  cram: true,
                  startLine:
                    s.repertoireState.browsingState.chessboardState.moveLog,
                  startPosition:
                    s.repertoireState.browsingState.chessboardState.getCurrentEpd(),
                });
              });
            }}
          >
            <CMText style={s(c.buttons.darkFloater.textStyles)}>
              <i class={"fa-duotone fa-cards-blank"} />
            </CMText>
          </Button>
        </>
        </Show>
    </div>
  );
};
