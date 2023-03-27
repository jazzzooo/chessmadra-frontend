// import { ExchangeRates } from "~/ExchangeRate";
import { c, s } from "~/utils/styles";
import { Spacer } from "~/components/Space";
import { ChessboardView } from "~/components/chessboard/Chessboard";
import { isNil, sortBy } from "lodash-es";
import { TrainerLayout } from "~/components/TrainerLayout";
import { Button } from "~/components/Button";
import { useIsMobile } from "~/utils/isMobile";
import { intersperse } from "~/utils/intersperse";
import { CMText } from "./CMText";
import { useRepertoireState, quick } from "~/utils/app_state";
import { trackEvent } from "~/utils/trackEvent";
import { RepertoirePageLayout } from "./RepertoirePageLayout";
import { LichessLogoIcon } from "./icons/LichessLogoIcon";
import { pgnToLine } from "~/utils/repertoire";
import { SidebarTemplate } from "./SidebarTemplate";
import { SidebarAction } from "./SidebarActions";
import { pluralize } from "~/utils/pluralize";
import { View } from "./View";

export const ReviewText = ({
  date: dateString,
  numDue,
  inverse,
  overview,
}: {
  date: string;
  inverse?: boolean;
  overview?: boolean;
  numDue: number;
}) => {
  const textStyles = s(
    c.fg(c.grays[80]),
    c.weightSemiBold,
    c.fontSize(12),
    c.lineHeight("1.3rem")
  );
  const date = new Date(dateString);
  const numMovesDueFromHere = numDue;
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  let dueString = "";
  const seconds = diff / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  let color = c.grays[50];
  const prefix = overview ? `Next review in` : `Due in`;
  if (diff < 0) {
    color = inverse ? c.oranges[30] : c.oranges[70];
    dueString = `${numMovesDueFromHere} Due`;
  } else if (minutes < 60) {
    dueString = `${prefix} ${pluralize(Math.round(minutes), "minute")}`;
  } else if (hours < 24) {
    dueString = `${prefix} ${pluralize(Math.round(hours), "hour")}`;
  } else {
    dueString = `${prefix} ${pluralize(Math.round(days), "day")}`;
  }
  return (
    <>
      {
        <div style={s(c.row, c.alignCenter)}>
          <i
            style={s(c.fg(color), c.fontSize(12))}
            class="fa-regular fa-clock"
          ></i>
          <Spacer width={4} />
          <CMText style={s(textStyles, c.fg(color))}>{dueString}</CMText>
        </div>
      }
    </>
  );
};
