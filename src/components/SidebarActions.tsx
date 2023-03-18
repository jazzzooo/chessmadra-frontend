import { Pressable, View } from "react-native";
// import { ExchangeRates } from "app/ExchangeRate";
import { c, s } from "app/styles";
import { Spacer } from "app/Space";
import {
  forEachRight,
  isEmpty,
  findLastIndex,
  findLast,
  filter,
  map,
  last,
  isNil,
  dropRight,
  cloneDeep,
} from "lodash-es";
import { intersperse } from "app/utils/intersperse";
import { CMText } from "./CMText";
import {
  quick,
  useBrowsingState,
  useRepertoireState,
  useSidebarState,
} from "app/utils/app_state";
import { useResponsive } from "app/utils/useResponsive";
import { getSidebarPadding } from "./RepertoireBrowsingView";
import { useHovering } from "app/hooks/useHovering";
import { lineToPgn, pgnToLine, RepertoireMiss } from "app/utils/repertoire";
import { lineToPositions } from "app/utils/chess";
import { getNameEcoCodeIdentifier } from "app/utils/eco_codes";
import { trackEvent } from "app/hooks/useTrackEvent";

export interface SidebarAction {
  rightText?: string;
  onPress: () => void;
  text: string;
  right?: React.ReactNode;
  subtext?: string;
  style: "primary" | "focus" | "secondary" | "tertiary" | "wide";
}

export const SidebarActions = () => {
  const responsive = useResponsive();
  let buttons = [] as SidebarAction[];
  const [activeSide] = useSidebarState(([s]) => [s.activeSide]);
  let [
    hasPendingLineToAdd,
    isPastCoverageGoal,
    currentSide,
    addedLineState,
    submitFeedbackState,
    deleteLineState,
    currentLine,
    stageStack,
    currentEpd,
    nearestMiss,
    lineMiss,
    positionHistory,
    showPlansState,
    transposedState,
    mode,
    numDue,
  ] = useSidebarState(([s, bs, rs]) => [
    s.hasPendingLineToAdd,
    s.isPastCoverageGoal,
    s.currentSide,
    s.addedLineState,
    s.submitFeedbackState,
    s.deleteLineState,
    s.moveLog,
    s.sidebarOnboardingState.stageStack,
    s.currentEpd,
    cloneDeep(bs.getNearestMiss(s)),
    cloneDeep(bs.getMissInThisLine(s)),
    s.positionHistory,
    s.showPlansState,
    s.transposedState,
    s.mode,
    rs.numMovesDueFromEpd[activeSide]?.[s.currentEpd],
  ]);
  positionHistory = positionHistory ?? [];
  const [ecoCodeLookup] = useRepertoireState((s) => [s.ecoCodeLookup], {
    referenceEquality: true,
  });
  const [hasPlans] = useBrowsingState(([s, rs]) => [
    !isEmpty(
      rs.positionReports[s.sidebarState.currentSide][s.sidebarState.currentEpd]
        ?.plans
    ),
  ]);
  let reviewCurrentLineAction: SidebarAction = {
    onPress: () => {
      trackEvent(`${mode}.added_line_state.practice_line`);
      quick((s) => {
        s.repertoireState.reviewState.reviewLine(currentLine, activeSide);
      });
    },
    text: "Practice this line",
    style: "primary",
  };
  let continueAddingToThisLineAction: SidebarAction = {
    onPress: () => {
      quick((s) => {
        trackEvent(`${mode}.added_line_state.contrinue_this_line`);
        s.repertoireState.browsingState.moveSidebarState("right");
        s.repertoireState.browsingState.sidebarState.addedLineState.visible =
          false;
      });
    },
    text: "Continue adding to this line",
    style: "primary",
  };
  let addBiggestMissAction = () => {
    let miss = null;
    if (addedLineState.visible) {
      miss = nearestMiss ?? lineMiss;
    } else {
      miss = lineMiss;
    }
    if (isNil(miss)) {
      return;
    }
    let text = `Go to the next gap in your repertoire`;
    let line = pgnToLine(miss.lines[0]);
    let missPositions = lineToPositions(line);
    let missPositionsSet = new Set(missPositions);
    let currentOpeningName = last(
      filter(
        map(positionHistory, (epd) => {
          let ecoCode = ecoCodeLookup[epd];
          if (ecoCode) {
            return getNameEcoCodeIdentifier(ecoCode.fullName);
          }
        })
      )
    );
    let openingNameOfMiss = last(
      filter(
        map(missPositions, (epd) => {
          let ecoCode = ecoCodeLookup[epd];
          if (ecoCode) {
            return getNameEcoCodeIdentifier(ecoCode.fullName);
          }
        })
      )
    );

    let i = findLastIndex(positionHistory, (epd) => {
      if (missPositionsSet.has(epd)) {
        return true;
      }
      return false;
    });
    const isAtBiggestMiss = currentEpd === last(missPositions);
    if (miss && !isAtBiggestMiss) {
      buttons.push({
        onPress: () => {
          quick((s) => {
            trackEvent(`${mode}.added_line_state.next_gap`);
            s.repertoireState.browsingState.moveSidebarState("right");
            s.repertoireState.browsingState.dismissTransientSidebarState();
            let lastMatchingEpd = positionHistory[i];
            s.repertoireState.browsingState.chessboardState.playPgn(
              lineToPgn(line),
              {
                animated: true,
                fromEpd: lastMatchingEpd,
                animateLine: line.slice(i),
              }
            );
          });
        },
        text: text,
        style: "focus",
      });
    }
  };
  let showTogglePlansButton = true;
  if (submitFeedbackState.visible) {
    showTogglePlansButton = false;
    // This is taken care of by the delete line view, maybe bad though
  } else if (transposedState.visible) {
    showTogglePlansButton = false;
  } else if (showPlansState.visible) {
    showTogglePlansButton = false;
    // This is taken care of by the delete line view, maybe bad though
  } else if (deleteLineState.visible) {
    showTogglePlansButton = false;
    // This is taken care of by the delete line view, maybe bad though
  } else if (!isEmpty(stageStack)) {
    showTogglePlansButton = false;
    // Taken care of by onboarding
  } else if (addedLineState.visible) {
    addBiggestMissAction();
    buttons.push(reviewCurrentLineAction);
    buttons.push(continueAddingToThisLineAction);
  } else if (!hasPendingLineToAdd) {
    addBiggestMissAction();
  } else if (hasPendingLineToAdd) {
    buttons.push({
      onPress: () => {
        isPastCoverageGoal
          ? trackEvent(`${mode}.save_line`)
          : trackEvent(`${mode}.save_line_premature`);
        quick((s) => {
          s.repertoireState.browsingState.requestToAddCurrentLine();
        });
      },
      text: isPastCoverageGoal
        ? "Save this line to my repertoire"
        : "I'll finish this later, save my progress",
      style: "primary",
    });
  }
  if (showTogglePlansButton && hasPlans) {
    buttons.push({
      onPress: () => {
        quick((s) => {
          let bs = s.repertoireState.browsingState;
          bs.moveSidebarState("right");
          bs.sidebarState.showPlansState.visible = true;
          bs.sidebarState.showPlansState.coverageReached = false;
          bs.chessboardState.showPlans = true;
        });
      },
      text: "How to play from here",
      style: "primary",
    });
  }
  if (mode === "browse") {
    buttons = [];
    if (numDue > 0) {
      trackEvent(`${mode}.practice_due`);
      buttons.push({
        onPress: () => {
          quick((s) => {
            s.repertoireState.reviewState.startReview(activeSide, {
              side: activeSide,
              startLine: currentLine,
              startPosition: currentEpd,
            });
          });
        },
        text: `Practice ${numDue} moves which are due for review`,
        style: "primary",
      });
    }
    buttons.push({
      onPress: () => {
        quick((s) => {
          trackEvent(`${mode}.practice_all`);
          s.repertoireState.reviewState.startReview(activeSide, {
            side: activeSide,
            cram: true,
            startLine: currentLine,
            startPosition: currentEpd,
          });
        });
      },
      text: `Practice ALL moves from here`,
      style: "primary",
    });
  }
  // TODO: this is terrible, the views should just define their own actions
  if (mode === "review") {
    buttons = [];
  }
  if (mode === "overview") {
    buttons = [];
  }
  if (mode === "home") {
    buttons = [];
  }
  return (
    <View style={s(c.column, c.fullWidth)}>
      {intersperse(
        buttons.map((b, i) => <SidebarFullWidthButton key={i} action={b} />),
        () => {
          return <Spacer height={10} />;
        }
      )}
    </View>
  );
};
export const SidebarFullWidthButton = ({
  action,
}: {
  action: SidebarAction;
}) => {
  const responsive = useResponsive();
  const { hovering, hoveringProps } = useHovering();
  let py = 12;
  let backgroundColor,
    foregroundColor,
    subtextColor = null;
  let textStyles = s();
  if (action.style === "focus") {
    foregroundColor = c.grays[10];
    subtextColor = c.grays[20];
    if (hovering) {
      backgroundColor = c.grays[86];
    } else {
      backgroundColor = c.grays[82];
    }
  }
  if (action.style === "wide") {
    textStyles = s(textStyles, c.fontSize(18), c.weightBold);
    foregroundColor = c.colors.textPrimary;
    // subtextColor = c.grays[20];
    py = 20;
    if (hovering) {
      backgroundColor = c.grays[36];
    } else {
      backgroundColor = c.grays[30];
    }
  }
  if (action.style === "tertiary") {
    foregroundColor = c.colors.textTertiary;
    subtextColor = c.grays[20];
    if (hovering) {
      foregroundColor = c.colors.textSecondary;
    }
    // if (hovering) {
    //   backgroundColor = c.grays[8];
    // } else {
    //   backgroundColor = c.grays[16];
    // }
  }
  if (action.style === "secondary") {
    foregroundColor = c.colors.textSecondary;
    subtextColor = c.grays[20];
    if (hovering) {
      foregroundColor = c.colors.textPrimary;
    }
    // if (hovering) {
    //   backgroundColor = c.grays[8];
    // } else {
    //   backgroundColor = c.grays[16];
    // }
  }
  if (action.style === "primary") {
    foregroundColor = c.colors.textPrimary;
    subtextColor = c.grays[70];
    if (hovering) {
      backgroundColor = c.grays[36];
    } else {
      backgroundColor = c.grays[30];
    }
  }
  return (
    <Pressable
      onPress={action.onPress}
      {...hoveringProps}
      style={s(
        c.fullWidth,
        c.bg(backgroundColor),
        c.row,
        c.justifyBetween,
        c.alignCenter,
        c.py(py),
        c.px(getSidebarPadding(responsive)),
        action.style === "secondary" &&
          c.borderBottom(`1px solid ${c.colors.border}`)
      )}
      key={action.text}
    >
      <View style={s(c.column)}>
        <CMText
          style={s(
            c.fg(foregroundColor),
            action.style === "focus" ? c.weightBold : c.weightSemiBold,
            c.fontSize(14),
            textStyles
          )}
        >
          {action.text}
        </CMText>
        {action.subtext && (
          <>
            <Spacer height={4} />
            <CMText
              style={s(
                c.fg(subtextColor),
                action.style === "focus" ? c.weightBold : c.weightSemiBold,
                c.fontSize(14)
              )}
            >
              {action.subtext}
            </CMText>
          </>
        )}
      </View>
      <Spacer width={16} />
      {action.right ?? (
        <View style={s(c.row, c.center)}>
          {action.rightText && (
            <CMText
              style={s(
                c.fg(c.colors.textTertiary),
                action.style === "focus" ? c.weightBold : c.weightSemiBold,
                c.fontSize(12)
              )}
            >
              {action.rightText}
            </CMText>
          )}
          {/*
          <i
            className="fa-regular fa-arrow-right-long"
            style={s(c.fg(foregroundColor))}
          />
          */}
        </View>
      )}
    </Pressable>
  );
};

export const SidebarSectionHeader = ({
  text,
  right,
}: {
  text: string;
  right?: React.ReactNode;
}) => {
  const responsive = useResponsive();
  return (
    <View
      style={s(
        c.row,
        c.justifyBetween,
        c.alignCenter,
        c.px(getSidebarPadding(responsive)),
        c.pb(8),
        c.borderBottom(`1px solid ${c.colors.border}`)
      )}
    >
      <CMText style={s(c.fontSize(14), c.fg(c.colors.textTertiary))}>
        {text}
      </CMText>
      {right}
    </View>
  );
};

const TogglePlansButton = () => {
  let [showPlans] = useBrowsingState(([s, rs]) => [
    s.chessboardState.showPlans,
  ]);
  const responsive = useResponsive();
  return (
    <Pressable
      style={s(
        c.row,
        c.fullWidth,
        c.alignCenter,
        c.bg(c.grays[10]),
        c.py(8),
        c.px(getSidebarPadding(responsive))
      )}
      onPress={() => {
        quick((s) => {
          let cs = s.repertoireState.browsingState.chessboardState;
          cs.showPlans = !cs.showPlans;
        });
      }}
    >
      <View style={s(c.row, c.alignCenter)}>
        <CMText style={s(c.fg(c.colors.textSecondary), c.weightSemiBold)}>
          Show some common plans?
        </CMText>
        <Spacer width={8} />
        <CMText
          style={s(
            c.bg(c.grays[80]),
            c.fontSize(9),
            c.px(5),
            c.py(3),
            c.round,
            c.caps,
            c.weightHeavy,
            c.fg(c.colors.textInverse)
          )}
        >
          Beta
        </CMText>
      </View>
      <Spacer width={12} grow />
      <i
        className={`fa-solid fa-toggle-${showPlans ? "on" : "off"}`}
        style={s(c.fg(c.grays[90]), c.fontSize(24))}
      />
    </Pressable>
  );
};
