import { View } from "react-native";
// import { ExchangeRates } from "~/ExchangeRate";
import { c, s } from "~/utils/styles";
import { Spacer } from "~/components/Space";
import { isNil } from "lodash-es";
import { useIsMobile } from "~/utils/isMobile";
import { CMText } from "./CMText";
import { useRepertoireState, useDebugState } from "~/utils/app_state";
import { RepertoireHome } from "./RepertoireHome";

export const RepertoireBuilder = () => {
  const isMobile = useIsMobile();
  const [underConstruction, debugUi] = useDebugState((s) => [
    s.underConstruction,
    s.debugUi,
  ]);

  if (underConstruction && !debugUi) {
    return (
      <View style={s(c.column, c.center)}>
        {!isMobile && <Spacer height={48} />}
        <i
          className="fa-sharp fa-hammer"
          style={s(c.fontSize(32), c.fg(c.grays[80]))}
        />
        <Spacer height={12} />
        <CMText style={s(c.fontSize(18), c.weightSemiBold)}>
          Under construction
        </CMText>
        <Spacer height={12} />
        <CMText style={s()}>
          Doing some housekeeping, will be down for a few hours, sorry!
        </CMText>
      </View>
    );
  } else {
    return <SidebarLayout mode="home" shared={false} />;
  }
};
