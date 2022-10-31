import { View } from "react-native";
// import { ExchangeRates } from "app/ExchangeRate";
import { c, s } from "app/styles";
import { Spacer } from "app/Space";
import { Button } from "app/components/Button";
import { useIsMobile } from "app/utils/isMobile";
import { BeatLoader } from "react-spinners";
const DEPTH_CUTOFF = 4;
import { CMText } from "./CMText";
import { useAppState } from "app/utils/app_state";
import React, { useState } from "react";
import { AuthStatus } from "app/utils/user_state";
import { CMTextInput } from "./TextInput";
import { isNil } from "lodash-es";
import { Link } from "react-router-dom";

export const AdminPageLayout = ({ children }) => {
  const isMobile = useIsMobile();
  const [password, setPassword] = useState("");
  const [authStatus, user, becomeAdmin] = useAppState((s) => [
    s.userState.authStatus,
    s.userState.user,
    s.adminState.becomeAdmin,
  ]);
  let inner = children;
  if (
    authStatus === AuthStatus.Initial ||
    authStatus === AuthStatus.Authenticating
  ) {
    inner = <BeatLoader color={c.grays[100]} size={20} />;
  }
  console.log("user email", user);
  if (user && isNil(user?.email)) {
    inner = (
      <View style={s()}>
        <CMText style={s()}>
          Looks like you're not logged in, go
          <CMText style={s(c.fg(c.blues[55]), c.weightSemiBold, c.px(4))}>
            <Link to="/login">log in</Link>
          </CMText>
          first and then come back here:{" "}
        </CMText>
      </View>
    );
  } else if (user && !user?.isAdmin) {
    inner = (
      <View style={s(c.oldContainerStyles(isMobile))}>
        <CMText style={s()}>
          You don't seem to be an admin. Do you have the password?
        </CMText>
        <Spacer height={12} />
        <CMTextInput
          value={password}
          setValue={setPassword}
          style={s()}
          placeholder="Password"
        />
        <Spacer height={12} />
        <Button
          style={s(c.buttons.primary)}
          onPress={() => {
            becomeAdmin(password);
          }}
        >
          Become admin
        </Button>
      </View>
    );
  }

  return (
    <View style={s(c.oldContainerStyles(isMobile), c.center, c.pt(48))}>
      {inner}
    </View>
  );
};
