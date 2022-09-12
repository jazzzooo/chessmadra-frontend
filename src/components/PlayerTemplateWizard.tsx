import { Pressable, View } from "react-native";
// import { ExchangeRates } from "app/ExchangeRate";
import { c, s } from "app/styles";
import { Spacer } from "app/Space";
import { isEmpty } from "lodash-es";
import { useIsMobile } from "app/utils/isMobile";
import { intersperse } from "app/utils/intersperse";
import { RepertoireState } from "app/utils/repertoire_state";
import { GridLoader } from "react-spinners";
import { CMText } from "./CMText";
import { trackEvent } from "app/hooks/useTrackEvent";

const MOBILE_CUTOFF = 800;

export const PlayerTemplateWizard = ({ state }: { state: RepertoireState }) => {
  const isMobile = useIsMobile(MOBILE_CUTOFF);
  if (isEmpty(state.playerTemplates)) {
    return null;
  }
  return (
    <View style={s(c.column, c.fullWidth, c.justifyCenter, c.alignCenter)}>
      {state.inProgressUsingPlayerTemplate && (
        <GridLoader color={c.primaries[40]} size={20} />
      )}
      {!state.inProgressUsingPlayerTemplate && (
        <View style={s(c.column, c.fullWidth)}>
          {intersperse(
            state.playerTemplates.map((playerTemplate, i) => {
              return (
                <Pressable
                  onPress={() => {
                    state.usePlayerTemplate(playerTemplate.id);
                    trackEvent("import.from_player_template", {
                      player_template_id: playerTemplate.id,
                    });
                  }}
                >
                  <View
                    style={s(
                      c.bg(c.grays[15]),
                      c.br(4),
                      c.px(16),
                      c.py(16),
                      c.constrainWidth,
                      c.column
                    )}
                  >
                    <View style={s(c.row, c.alignCenter)}>
                      <img
                        src={playerTemplate.meta.image}
                        style={s(
                          c.size(isMobile ? 32 : 54),
                          c.round,
                          c.border(`2px solid ${c.grays[80]}`)
                        )}
                      />
                      <Spacer width={isMobile ? 12 : 16} />
                      <View style={s(c.column, c.flexible)}>
                        <CMText
                          style={s(
                            c.fg(c.colors.textPrimary),
                            c.weightSemiBold,
                            c.fontSize(isMobile ? 16 : 20)
                          )}
                        >
                          {playerTemplate.meta.title}
                        </CMText>
                      </View>
                    </View>
                    <Spacer height={12} />
                    <View style={s(c.row, c.flexWrap, c.gap(6))}>
                      {playerTemplate.meta.openings.map((x, i) => {
                        return (
                          <CMText
                            style={s(
                              c.px(isMobile ? 6 : 6),
                              c.py(isMobile ? 6 : 6),
                              c.fg(c.colors.textInverseSecondary),
                              c.fontSize(isMobile ? 14 : 14),
                              c.weightSemiBold,
                              c.br(2),
                              c.bg(c.grays[80])
                            )}
                          >
                            {x}
                          </CMText>
                        );
                      })}
                    </View>
                  </View>
                </Pressable>
              );
            }),
            (i) => {
              return (
                <Spacer height={12} width={12} isMobile={isMobile} key={i} />
              );
            }
          )}
        </View>
      )}
    </View>
  );
};
