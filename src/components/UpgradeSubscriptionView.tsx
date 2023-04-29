import { createSignal } from "solid-js";
import { Spacer } from "~/components/Space";
import { useSidebarState, quick } from "~/utils/app_state";
import { clsx } from "~/utils/classes";
import { MAX_MOVES_FREE_TIER } from "~/utils/payment";
import { SidebarTemplate } from "./SidebarTemplate";

export const UpgradeSubscriptionView = (props: { pastLimit: boolean }) => {
  const [side] = useSidebarState(([s]) => [s.activeSide]);
  const [loading, setLoading] = createSignal(false);
  const requestProPlan = (annual: boolean) => {
    setLoading(true);
    quick((s) => {
      s.userState.getCheckoutLink(annual).then((url) => {
        console.log("url? ", url);
      });
    });
  };
  return (
    <SidebarTemplate
      actions={
        loading()
          ? []
          : [
              {
                onPress: () => {
                  requestProPlan(false);
                },
                text: "Upgrade to Pro - $5/mo",
                style: "primary",
              },
              {
                onPress: () => {
                  requestProPlan(true);
                },
                text: "Upgrade to Pro - $50/yr",
                subtext: "13% discount",
                style: "primary",
              },
            ]
      }
      header={
        props.pastLimit
          ? `You've reached the free tier limit for your ${side()} repertoire`
          : "Upgrade to Pro"
      }
      bodyPadding={true}
      loading={loading()}
    >
      <p class={clsx("text-secondary leading-5")}>
        On the free tier you can add {MAX_MOVES_FREE_TIER} moves to your
        repertoire for each side. Upgrade to Pro to take your repertoire to the
        next level!
      </p>
    </SidebarTemplate>
  );
};
