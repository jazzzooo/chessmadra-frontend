import { Spacer } from "~/components/Space";
import { isEmpty } from "lodash-es";
import { useResponsive } from "~/utils/useResponsive";
import { SidebarTemplate } from "./SidebarTemplate";
import {
  quick,
  useSidebarState,
} from "~/utils/app_state";
import { CMText } from "./CMText";
import { s, c } from "~/utils/styles";
import { PlayFromHere } from "./TargetCoverageReachedView";
import { Show } from "solid-js";

export const TransposedView = () => {
  const responsive = useResponsive();
  const [planSections] = useSidebarState(([s]) => [s.planSections]);
  console.log({ planSections });

  return (
    <SidebarTemplate
      header={"You've transposed into an existing line"}
      actions={[
        {
          onPress: () => {
            quick((s) => {
              s.repertoireState.browsingState.addPendingLine();
            });
          },
          style: "primary",
          text: "Save this move order to my repertoire",
        },
      ]}
      bodyPadding={true}
    >
      <>
        <CMText
          style={s(
            c.weightRegular,
            c.fontSize(12),
            c.fg(c.colors.textSecondary)
          )}
        >
          You don't need to add anything else. All of your moves from this
          position will still apply
        </CMText>
        <Show when={!isEmpty(planSections)}>
          <>
            <Spacer height={24} />
            <PlayFromHere isolated />
          </>
        </Show>
      </>
    </SidebarTemplate>
  );
};
