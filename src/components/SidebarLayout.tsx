import { ChessboardView } from "~/components/chessboard/Chessboard";
import { isEmpty, isNil } from "lodash-es";
import { CMText } from "./CMText";
import { RepertoirePageLayout } from "./RepertoirePageLayout";
import { BrowserSidebar } from "./BrowsingSidebar";
import { FadeInOut } from "./FadeInOut";
import { SettingsButtons } from "./Settings";
import { Animated, View } from "./View";
import {
  useRepertoireState,
  useAppState,
  useBrowsingState,
  useSidebarState,
  quick,
  getAppState,
} from "~/utils/app_state";
import { createEffect, createSignal } from "solid-js";
import { Button } from "./Button";
import { s, c } from "~/utils/styles";
import { BrowsingMode } from "~/utils/browsing_state";
import { BP, useResponsive } from "~/utils/useResponsive";
import { Spacer } from "~/components/Space";
import { Pressable } from "./Pressable";
import { intersperse } from "~/utils/intersperse";
import { trackEvent } from "~/utils/trackEvent";

export const VERTICAL_BREAKPOINT = BP.md;

export const SidebarLayout = ({
  shared,
  mode,
}: {
  shared?: boolean;
  mode: BrowsingMode;
}) => {
  // TODO solid
  let chessboardFrozen = () => false;
  // let chessboardFrozen = sideBarMode === "overview" || sideBarMode === "home";
  // if (onboardingStack.length > 0 || showingPlans) {
  //   chessboardFrozen = true;
  // }
  const [chessboardShownAnim] = useBrowsingState(([s]) => [
    s.chessboardShownAnim,
  ]);

  // useKeypress(["ArrowLeft", "ArrowRight"], (event) => {
  //   if (event.key === "ArrowLeft" && mode !== "review") {
  //     quick((s) => s.repertoireState.backOne());
  //   }
  // });
  // let { side: paramSide } = useParams();
  // useEffect(() => {
  //   if (mode && !sideBarMode) {
  //     quick((s) => {
  //       s.navigationState.push("/");
  //     });
  //   }
  // }, [mode, sideBarMode]);
  const responsive = useResponsive();
  const vertical = responsive.bp < VERTICAL_BREAKPOINT;
  let chessboardHidden = false;
  const [chessboardHeight, setChessboardHeight] = createSignal(0);

  if (vertical) {
    if (mode === "overview") {
      chessboardHidden = true;
    }
  }
  return (
    <RepertoirePageLayout flushTop bottom={null} fullHeight naked>
      {
        <View
          nativeID="BrowsingView"
          style={s(
            !vertical ? c.containerStyles(responsive.bp) : c.fullWidth,
            c.alignCenter,
            c.grow,
            c.noUserSelect
          )}
        >
          <View
            style={s(
              vertical ? c.width(c.min(600, "100%")) : c.fullWidth,
              vertical ? c.column : c.row,
              c.grow,
              c.selfStretch,
              vertical ? c.justifyStart : c.justifyCenter
            )}
          >
            <View
              style={s(
                c.column,
                !vertical && s(c.grow, c.noBasis, c.flexShrink),
                vertical ? c.width("min(480px, 100%)") : c.maxWidth(440),
                vertical && c.grow,
                vertical ? c.selfCenter : c.selfStretch
              )}
            >
              {!vertical ? (
                <View style={s(c.height(140), c.column, c.justifyEnd)}>
                  <NavBreadcrumbs />
                  <Spacer height={32} />
                </View>
              ) : (
                <MobileTopBar />
              )}
              <>
                <Animated.View
                  style={s(
                    c.fullWidth,
                    vertical && s(c.selfCenter, c.maxWidth(480)),
                    chessboardFrozen() && c.noPointerEvents,
                    vertical &&
                      c.opacity(
                        chessboardShownAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.2, 1],
                        })
                      )
                  )}
                >
                  <BrowsingChessboardView
                    ref={(e) => {
                      if (e) {
                        // @ts-ignore
                        setChessboardHeight(e.clientHeight);
                      }
                    }}
                  />
                </Animated.View>
                <Spacer height={12} />
                <ExtraChessboardActions />
              </>
              {vertical ? (
                <>
                  <Animated.View
                    style={s(
                      c.grow

                      // chessboardHeight
                      //   ? c.mt(
                      //       chessboardShownAnim.interpolate({
                      //         inputRange: [0, 1],
                      //         outputRange: [-chessboardHeight + 100, 16],
                      //       })
                      //     )
                      //   : c.mt(16)
                    )}
                  >
                    <BrowserSidebar />
                  </Animated.View>
                </>
              ) : (
                <Spacer height={60} />
              )}
            </View>
            {!vertical && (
              <>
                <Spacer width={responsive.switch(24, [BP.lg, 48])} />
                <View
                  // @ts-ignore
                  nativeID="sidebar"
                  style={s(
                    c.flexGrow(2),
                    c.bg("red"),
                    c.flexShrink,
                    c.noBasis,
                    c.maxWidth(600)
                  )}
                >
                  <BrowserSidebar />
                </View>
              </>
            )}
          </View>
        </View>
      }
    </RepertoirePageLayout>
  );
};

export const ExtraChessboardActions = ({}: {}) => {
  // TODO solid
  return null;
  const responsive = useResponsive();
  let fgColor = c.colors.textTertiary;
  const textStyles = s(
    c.fontSize(responsive.switch(12, [BP.md, 14])),
    c.fg(c.colors.textTertiary),
    c.weightRegular
  );
  const iconStyles = s(
    c.fontSize(responsive.switch(12, [BP.md, 14])),
    c.fg(fgColor)
  );
  const padding = 8;
  const [activeSide] = useSidebarState(([s]) => [s.activeSide]);
  let [currentLine] = useRepertoireState((s) => [
    s.browsingState.chessboardState.moveLog,
  ]);
  const [sideBarMode] = useSidebarState(([s]) => [s.mode]);
  return (
    <FadeInOut
      style={s(c.row, c.fullWidth, c.justifyCenter)}
      open={
        !isEmpty(currentLine) &&
        (sideBarMode == "browse" ||
          sideBarMode == "review" ||
          sideBarMode == "build")
      }
    >
      <Pressable
        style={s(c.row, c.alignCenter)}
        onPress={() => {
          quick((s) => {
            trackEvent("chessboard.analyze_on_lichess", {
              side: activeSide,
              mode: sideBarMode,
            });
            s.repertoireState.analyzeLineOnLichess(currentLine, activeSide);
          });
        }}
      >
        <CMText style={s(textStyles)}>Analyze on Lichess</CMText>
        <Spacer width={padding} />
        <i className="fa fa-up-right-from-square" style={s(iconStyles)}></i>
      </Pressable>
    </FadeInOut>
  );
};

export const ReviewFromHereButton = () => {
  const responsive = useResponsive();
  const buttonStyles = s(
    c.buttons.darkFloater,
    c.selfStretch,
    // c.height(buttonHeight),
    { textStyles: s(c.fg(c.colors.textPrimary)) },
    c.px(8),
    c.py(12)
  );
  const [activeSide] = useSidebarState(([s]) => [s.activeSide]);
  return (
    <Button
      style={s(buttonStyles)}
      onPress={() => {
        quick((s) => {
          s.repertoireState.reviewState.startReview(activeSide, {
            side: activeSide,
            cram: true,
            startLine: s.repertoireState.browsingState.chessboardState.moveLog,
            startPosition:
              s.repertoireState.browsingState.chessboardState.getCurrentEpd(),
          });
        });
      }}
    >
      <CMText style={s(c.fg(c.grays[80]), c.fontSize(18))}>
        <i className={"fa-duotone fa-cards-blank"} />
      </CMText>
      <Spacer width={8} />
      <CMText
        style={s(
          c.fg(c.colors.textPrimary),
          c.fontSize(responsive.switch(16)),
          c.weightBold
        )}
      >
        Review all from here
      </CMText>
    </Button>
  );
};

// TODO: solid: ref stuff?
const BrowsingChessboardView = function BrowsingChessboardView({ ref }) {
  const sidebarState = useSidebarState();
  const appState = getAppState();
  const mode = () => sidebarState().mode;
  const chessboardState = () =>
    mode() == "review"
      ? appState.repertoireState.reviewState.chessboardState
      : appState.repertoireState.browsingState.chessboardState;

  return <ChessboardView state={chessboardState} ref={ref} />;
};

const MobileTopBar = ({}) => {
  const responsive = useResponsive();
  return (
    <View
      style={s(
        c.row,
        c.alignCenter,
        c.fullWidth,
        c.justifyBetween,
        c.px(c.getSidebarPadding(responsive)),
        c.py(8)
      )}
    >
      <NavBreadcrumbs />
      <SettingsButtons />
    </View>
  );
};

export const NavBreadcrumbs = () => {
  const repertoireState = useRepertoireState((s) => s);

  const breadcrumbs = () => repertoireState.getBreadCrumbs();
  createEffect(() => {
    console.log("breadcrumbs", breadcrumbs());
  });
  const responsive = useResponsive();
  let hidden = () => breadcrumbs().length == 1;
  const sidebarState = useSidebarState();
  const mode = () => sidebarState().mode;
  return (
    // todo: figure out why this is not working
    <FadeInOut open={!hidden} style={s(c.row, c.alignCenter, c.constrainWidth)}>
      {intersperse(
        breadcrumbs().map((breadcrumb, i) => {
          return (
            <Pressable
              key={`breadcrumb-${i}`}
              style={s(breadcrumb.onPress ? c.clickable : c.unclickable)}
              onPress={() => {
                if (!breadcrumb.onPress) {
                  return;
                }
                quick((s) => {
                  trackEvent("breadcrumbs.clicked", {
                    mode,
                    breadcrumb: breadcrumb.text,
                  });
                  s.repertoireState.browsingState.moveSidebarState("left");
                  breadcrumb.onPress?.();
                });
              }}
            >
              <View style={s()}>
                <CMText style={s(c.weightBold, c.fg(c.colors.textTertiary))}>
                  {breadcrumb.text}
                </CMText>
              </View>
            </Pressable>
          );
        }),
        (i) => {
          return (
            <View key={i} style={s(c.mx(responsive.switch(6, [BP.lg, 8])))}>
              <CMText style={s(c.fg(c.grays[40]))}>
                <i class="fa-light fa-angle-right" />
              </CMText>
            </View>
          );
        }
      )}
    </FadeInOut>
  );
};
