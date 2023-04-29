// import { ExchangeRates } from "~/ExchangeRate";
import { c, s } from "~/utils/styles";
import { Spacer } from "~/components/Space";
import {
  isEmpty,
  findLastIndex,
  filter,
  map,
  last,
  isNil,
  cloneDeep,
} from "lodash-es";
import { CMText } from "./CMText";
import {
  quick,
  useBrowsingState,
  useRepertoireState,
  useSidebarState,
} from "~/utils/app_state";
import { useResponsive } from "~/utils/useResponsive";
import { lineToPgn, pgnToLine } from "~/utils/repertoire";
import { lineToPositions } from "~/utils/chess";
import { getNameEcoCodeIdentifier } from "~/utils/eco_codes";
import { trackEvent } from "~/utils/trackEvent";
import { Component, JSXElement, Show } from "solid-js";
import { useHovering } from "~/mocks";
import { Pressable } from "./Pressable";
import { Intersperse } from "./Intersperse";
import { clsx } from "~/utils/classes";

export interface SidebarAction {
  rightText?: string;
  onPress: () => void;
  class?: string;
  text: string;
  right?: JSXElement | string;
  subtext?: string;
  style: "primary" | "focus" | "secondary" | "tertiary" | "wide";
}

export const SidebarActions = () => {
  const [activeSide] = useSidebarState(([s]) => [s.activeSide]);
  let [
    hasPendingLineToAdd,
    isPastCoverageGoal,
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
    view,
  ] = useSidebarState(([s, bs, rs]) => [
    s.hasPendingLineToAdd,
    s.isPastCoverageGoal,
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
    rs.numMovesDueFromEpd?.[s.activeSide]?.[s.currentEpd],
    s.view,
  ]);
  positionHistory = positionHistory ?? [];
  const [ecoCodeLookup] = useRepertoireState((s) => [s.ecoCodeLookup]);
  const [hasPlans] = useBrowsingState(([s, rs]) => [
    !isEmpty(
      rs.positionReports[s.sidebarState.currentSide][s.sidebarState.currentEpd]
        ?.plans
    ),
  ]);
  const buttonsSig = () => {
    console.log("view is ", view(), hasPendingLineToAdd());
    let buttons: SidebarAction[] = [];
    const addBiggestMissAction = () => {
      let miss = null;
      if (addedLineState().visible) {
        miss = nearestMiss() ?? lineMiss();
      } else {
        miss = lineMiss();
      }
      if (isNil(miss)) {
        return;
      }
      const text = `Go to the next gap in your repertoire`;
      const line = pgnToLine(miss.lines[0]);
      const missPositions = lineToPositions(line);
      const missPositionsSet = new Set(missPositions);
      const currentOpeningName = last(
        filter(
          map(positionHistory(), (epd) => {
            const ecoCode = ecoCodeLookup()[epd];
            if (ecoCode) {
              return getNameEcoCodeIdentifier(ecoCode.fullName);
            }
          })
        )
      );
      const openingNameOfMiss = last(
        filter(
          map(missPositions, (epd) => {
            const ecoCode = ecoCodeLookup()[epd];
            if (ecoCode) {
              return getNameEcoCodeIdentifier(ecoCode.fullName);
            }
          })
        )
      );

      const i = findLastIndex(positionHistory(), (epd) => {
        if (missPositionsSet.has(epd)) {
          return true;
        }
        return false;
      });
      const isAtBiggestMiss = currentEpd() === last(missPositions);
      if (miss && !isAtBiggestMiss) {
        buttons.push({
          onPress: () => {
            quick((s) => {
              trackEvent(`${mode()}.added_line_state.next_gap`);
              s.repertoireState.browsingState.moveSidebarState("right");
              s.repertoireState.browsingState.dismissTransientSidebarState();
              const lastMatchingEpd = positionHistory()[i];
              s.repertoireState.browsingState.chessboard.playPgn(
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
    if (submitFeedbackState().visible) {
      showTogglePlansButton = false;
      // This is taken care of by the delete line view, maybe bad though
    } else if (transposedState().visible) {
      showTogglePlansButton = false;
    } else if (showPlansState().visible) {
      showTogglePlansButton = false;
      // This is taken care of by the delete line view, maybe bad though
    } else if (deleteLineState().visible) {
      showTogglePlansButton = false;
      // This is taken care of by the delete line view, maybe bad though
    } else if (!isEmpty(stageStack())) {
      showTogglePlansButton = false;
      // Taken care of by onboarding
    } else if (addedLineState().visible) {
      if (!addedLineState().loading) {
        addBiggestMissAction();
      }
    } else if (!hasPendingLineToAdd()) {
      addBiggestMissAction();
    } else if (hasPendingLineToAdd() && !view()) {
      buttons.push({
        onPress: () => {
          isPastCoverageGoal()
            ? trackEvent(`${mode()}.save_line`)
            : trackEvent(`${mode()}.save_line_premature`);
          quick((s) => {
            s.repertoireState.browsingState.requestToAddCurrentLine();
          });
        },
        text: isPastCoverageGoal()
          ? "Save this line to my repertoire"
          : "I'll finish this later, save my progress",
        style: "primary",
      });
    }
    if (showTogglePlansButton && hasPlans()) {
      buttons.push({
        onPress: () => {
          quick((s) => {
            const bs = s.repertoireState.browsingState;
            bs.moveSidebarState("right");
            bs.sidebarState.showPlansState.visible = true;
            bs.sidebarState.showPlansState.coverageReached = false;
            bs.chessboard.set((s) => (s.showPlans = true));
          });
        },
        text: "How to play from here",
        style: "primary",
      });
    }
    if (mode() === "browse") {
      buttons = [];
      if (numDue() > 0) {
        buttons.push({
          onPress: () => {
            trackEvent(`${mode()}.practice_due`);
            quick((s) => {
              s.repertoireState.reviewState.startReview(activeSide(), {
                side: activeSide(),
                startLine: currentLine(),
                startPosition: currentEpd(),
              });
            });
          },
          text: `Practice ${numDue()} moves which are due for review`,
          style: "primary",
        });
      }
      buttons.push({
        onPress: () => {
          quick((s) => {
            trackEvent(`${mode()}.practice_all`);
            s.repertoireState.reviewState.startReview(activeSide(), {
              side: activeSide(),
              cram: true,
              startLine: currentLine(),
              startPosition: currentEpd(),
            });
          });
        },
        text: `Practice ALL moves from here`,
        style: "primary",
      });
    }
    // TODO: this is terrible, the views should just define their own actions
    if (mode() === "review") {
      buttons = [];
    }
    if (mode() === "overview") {
      buttons = [];
    }
    if (mode() === "home") {
      buttons = [];
    }
    return buttons;
  };
  return (
    <div style={s(c.column, c.fullWidth)}>
      <Intersperse
        each={buttonsSig}
        separator={() => {
          return <Spacer height={10} />;
        }}
      >
        {(b, i) => <SidebarFullWidthButton action={b()} />}
      </Intersperse>
    </div>
  );
};
export const SidebarFullWidthButton = (props: { action: SidebarAction }) => {
  const responsive = useResponsive();
  const { hovering, hoveringProps } = useHovering();
  let py = 12;
  const styles = () => {
    let subtextColor = null;
    let textStyles = s();
    if (props.action.style === "focus") {
      subtextColor = c.grays[20];
    }
    if (props.action.style === "wide") {
      textStyles = s(textStyles, c.fontSize(18), c.weightBold);
      // subtextColor = c.grays[20];
      py = 20;
    }
    if (props.action.style === "tertiary") {
      subtextColor = c.grays[20];
    }
    if (props.action.style === "secondary") {
      subtextColor = c.grays[20];
    }
    if (props.action.style === "primary") {
      subtextColor = c.grays[70];
    }
    return {
      subtextColor,
      textStyles,
    };
  };
  return (
    <Pressable
      onPress={props.action.onPress}
      {...hoveringProps}
      class={clsx(
        "transition-colors",
        props.action.style !== "wide" && "min-h-sidebar-button",
        props.action.style === "secondary" &&
          "text-secondary &hover:bg-gray-18 &hover:text-primary",
        props.action.style === "tertiary" &&
          "text-tertiary &hover:text-primary",
        props.action.style === "wide" &&
          "bg-sidebar_button_primary &hover:bg-sidebar_button_primary_hover",
        props.action.style === "focus" &&
          "bg-gray-82 &hover:bg-gray-86 text-gray-10",
        props.action.style === "primary" &&
          "text-primary bg-sidebar_button_primary &hover:bg-sidebar_button_primary_hover",
        props.action.class
      )}
      style={s(
        c.fullWidth,
        c.row,
        c.justifyBetween,
        c.alignCenter,
        c.py(py),
        c.px(c.getSidebarPadding(responsive)),
        props.action.style === "secondary" &&
          c.borderBottom(`1px solid ${c.colors.border}`)
      )}
    >
      <div style={s(c.column)}>
        <CMText
          style={s(
            props.action.style === "focus" ? c.weightBold : c.weightSemiBold,
            c.fontSize(14),
            styles().textStyles
          )}
        >
          {props.action.text}
        </CMText>
        <Show when={props.action.subtext}>
          <>
            <Spacer height={4} />
            <CMText
              style={s(
                c.fg(styles().subtextColor),
                props.action.style === "focus"
                  ? c.weightBold
                  : c.weightSemiBold,
                c.fontSize(14)
              )}
            >
              {props.action.subtext}
            </CMText>
          </>
        </Show>
      </div>
      <Spacer width={16} />
      <Show when={props.action.right}>
        <div style={s(c.row, c.center)}>
          {typeof props.action.right === "string" ? (
            <CMText
              style={s(
                c.fg(c.colors.textTertiary),
                props.action.style === "focus"
                  ? c.weightBold
                  : c.weightSemiBold,
                c.fontSize(12)
              )}
            >
              {props.action.right}
            </CMText>
          ) : (
            <CMText style={s(c.fg(c.colors.textTertiary), c.fontSize(14))}>
              {props.action.right}
            </CMText>
          )}
        </div>
      </Show>
    </Pressable>
  );
};

export const SidebarSectionHeader = ({
  text,
  right,
}: {
  text: string;
  right?: JSXElement;
}) => {
  const responsive = useResponsive();
  return (
    <div
      style={s(
        c.row,
        c.justifyBetween,
        c.alignCenter,
        c.px(c.getSidebarPadding(responsive)),
        c.pb(12),
        c.borderBottom(`1px solid ${c.colors.border}`)
      )}
    >
      <CMText style={s(c.fontSize(14), c.fg(c.colors.textTertiary))}>
        {text}
      </CMText>
      {right}
    </div>
  );
};
