import { Modal } from "./Modal";
import { View, Pressable } from "react-native";
import { c, s } from "app/styles";
import { CMText } from "./CMText";
import { SelectOneOf } from "./SelectOneOf";
import { Spacer } from "app/Space";
import { AuthStatus, getRecommendedMissThreshold } from "app/utils/user_state";
import {
  getAppState,
  useAppState,
  useUserState,
  quick,
  useSidebarState,
} from "app/utils/app_state";
import { BP, useResponsive } from "app/utils/useResponsive";
import { cloneDeep } from "lodash-es";
import { useHovering } from "app/hooks/useHovering";

export const SettingsButtons = () => {
  const [user, ratingDescription, authStatus] = useAppState((s) => [
    s.userState.user,
    s.userState.getUserRatingDescription(),
    s.userState.authStatus,
  ]);
  const [mode] = useSidebarState(([s]) => [s.mode]);
  const needsLogin =
    authStatus === AuthStatus.Unauthenticated ||
    (authStatus === AuthStatus.Authenticated && user?.temporary);
  let responsive = useResponsive();
  return (
    <View style={s(c.row, c.gap(responsive.switch(12, [BP.md, 16])))}>
      {mode === "home" && (
        <SettingButton
          title={"Other tools"}
          icon={"fa-sharp fa-bars"}
          onPress={() => {
            quick((s) => {
                s.navigationState.push("/directory");
            });
          }}
        />
      )}
      <SettingButton
        title={"Settings"}
        icon={"fa-sharp fa-gear"}
        onPress={() => {
          quick((s) => {
            quick((s) => {
              s.userState.profileModalOpen = true;
            });
          });
        }}
      />
      {needsLogin && (
        <SettingButton
          title={"Log in"}
          icon={"fa-sharp fa-user"}
          onPress={() => {
            quick((s) => {
              s.navigationState.push("/login");
            });
          }}
        />
      )}
    </View>
  );
};

export const SettingButton = ({ title, icon, onPress }) => {
  const { hovering, hoveringProps } = useHovering();
  let responsive = useResponsive();
  let color = c.colors.textTertiary;
  if (hovering) {
    color = c.colors.textSecondary;
  }
  return (
    <Pressable
      onPress={onPress}
      style={s(
        c.row,
        c.alignCenter,
        c.px(responsive.switch(0, [BP.md, 8])),
        c.py(8)
        // c.bg(hovering ? c.grays[14] : c.grays[6])
      )}
      {...hoveringProps}
    >
      <i style={s(c.fg(color), c.fontSize(12))} className={icon}></i>
      <Spacer width={responsive.switch(4, [BP.md, 8])} />
      <CMText style={s(c.fg(color), c.weightSemiBold)}>{title}</CMText>
    </Pressable>
  );
};
