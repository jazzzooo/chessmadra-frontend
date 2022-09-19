import { View } from "react-native";
// import { ExchangeRates } from "app/ExchangeRate";
import { c, s } from "app/styles";
import { Spacer } from "app/Space";
import { Button } from "app/components/Button";
import { useIsMobile } from "app/utils/isMobile";
const DEPTH_CUTOFF = 4;
import { CMText } from "./CMText";
import { useRepertoireState } from "app/utils/app_state";
import { LichessLogoIcon } from "./icons/LichessLogoIcon";
import { trackEvent } from "app/hooks/useTrackEvent";
import { useResponsive, BP } from "app/utils/useResponsive";

type BackControlsProps = {
  includeAnalyze?: boolean;
  extraButton?: any;
  height?: number;
};

export const BackControls: React.FC<BackControlsProps> = ({
  includeAnalyze,
  height,
  extraButton,
}) => {
  const bp = useResponsive();
  let [
    searchOnChessable,
    analyzeLineOnLichess,
    quick,
    currentLine,
    backToStartPosition,
    backOne,
  ] = useRepertoireState((s) => [
    s.searchOnChessable,
    s.analyzeLineOnLichess,
    s.quick,
    s.currentLine,
    s.backToStartPosition,
    s.backOne,
  ]);
  const isMobile = useIsMobile();
  let gap = isMobile ? 6 : 12;
  let foreground = c.grays[90];
  let textColor = c.fg(foreground);
  return (
    <View style={s(c.row, c.height(height ?? 48), c.selfStretch)}>
      <Button
        style={s(c.buttons.darkFloater, c.width(48), c.constrainHeight)}
        onPress={() => {
          backToStartPosition();
        }}
      >
        <i
          className="fa-sharp fa-angles-left"
          style={s(c.buttons.darkFloater.textStyles, c.fontSize(18), textColor)}
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
          className="fa-sharp fa-angle-left"
          style={s(c.buttons.darkFloater.textStyles, c.fontSize(18), textColor)}
        />
      </Button>
      {extraButton && (
        <>
          <Spacer width={gap} />
          {extraButton}
        </>
      )}
      {includeAnalyze && (
        <>
          <Spacer width={gap} />
          <Button
            style={s(c.buttons.darkFloater)}
            onPress={() => {
              trackEvent("repertoire.analyze_on_lichess");
              analyzeLineOnLichess(currentLine);
            }}
          >
            <View style={s(c.size(isMobile ? 20 : 22))}>
              <LichessLogoIcon color={foreground} />
            </View>
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
          </Button>
        </>
      )}
    </View>
  );
};
