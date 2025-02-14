// import { ExchangeRates } from "~/ExchangeRate";
import { c, s } from "~/utils/styles";
import { Spacer } from "~/components/Space";
import { ChessboardView } from "~/components/chessboard/Chessboard";
import { isEmpty, isNil, take } from "lodash-es";
import { Button } from "~/components/Button";
import { useIsMobile } from "~/utils/isMobile";
import { CMText } from "./CMText";
import { quick, useAdminState, useUserState } from "~/utils/app_state";
// import { createStaticChessState } from "~/utils/chessboard_state";
import { Chess } from "@lubert/chess.ts";
import { AdminPageLayout } from "./AdminPageLayout";
import { AnnotationEditor } from "./AnnotationEditor";
import { AdminMoveAnnotation } from "~/utils/admin_state";
import { SelectOneOf } from "./SelectOneOf";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  Index,
  Show,
} from "solid-js";
import { A } from "solid-start";
import { createStaticChessState } from "~/utils/chessboard_interface";
import { LazyLoad } from "./LazyLoad";

export const MoveAnnotationsDashboard = ({}) => {
  const [dashboard] = useAdminState((s) => [s.moveAnnotationsDashboard]);
  createEffect(() => {
    console.log("dashboard", dashboard());
  });
  const [activeTab, setActiveTab] = createSignal("Needed");
  createEffect(() => {
    quick((s) => s.adminState.fetchMoveAnnotationDashboard());
  }, []);
  return (
    <AdminPageLayout>
      {(() => {
        if (isNil(dashboard())) {
          return <CMText style={s()}>Loading...</CMText>;
        }
        if (isEmpty(dashboard())) {
          return (
            <CMText style={s()}>
              Looks like there's nothing left to review
            </CMText>
          );
        }
        return (
          <div style={s(c.column)}>
            <CMText style={s(c.weightSemiBold, c.selfEnd)}>
              <A
                href="/admin/move-annotations/community"
                class="row place-items-center"
              >
                Go to community review queue
                <Spacer width={8} />
                <i class="fa fa-arrow-right" style={s()} />
              </A>
            </CMText>
            <Spacer height={32} />
            <SelectOneOf
              tabStyle
              containerStyles={s(c.fullWidth, c.justifyBetween)}
              choices={["Needed", "Completed"]}
              activeChoice={activeTab()}
              horizontal
              onSelect={(tab) => {}}
              renderChoice={(tab, active) => {
                return (
                  <div
                    onClick={() => {
                      quick((s) => {
                        setActiveTab(tab);
                      });
                    }}
                    style={s(
                      c.column,
                      c.grow,
                      c.alignCenter,
                      c.borderBottom(
                        `2px solid ${active ? c.grays[90] : c.grays[20]}`
                      ),
                      c.zIndex(5),
                      c.pb(8)
                    )}
                  >
                    <CMText
                      style={s(
                        c.fg(
                          active ? c.colors.textPrimary : c.colors.textSecondary
                        ),
                        c.fontSize(16),
                        c.weightBold
                      )}
                    >
                      {tab === "Needed" ? "Most needed" : "Completed"}
                    </CMText>
                  </div>
                );
              }}
            />
            <div style={s(c.gridColumn({ gap: 24 }))}>
              <Spacer height={24} />
              <Index
                each={
                  activeTab() === "Needed"
                    ? take(dashboard().needed, 100)
                    : take(dashboard().completed, 100)
                }
              >
                {(ann) => (
                  <MoveAnnotationRow
                    completed={activeTab() === "Completed"}
                    annotation={ann()}
                  />
                )}
              </Index>
            </div>
          </div>
        );
      })()}
    </AdminPageLayout>
  );
};

export const MoveAnnotationRow = (props: {
  annotation: AdminMoveAnnotation;
  completed: boolean;
}) => {
  console.log("re-rendering the row");
  const ann = () => props.annotation;
  const fen = `${ann().previousEpd} 0 1`;
  const position = new Chess(fen);
  const [annotation, setAnnotation] = createSignal(
    ann().annotation?.text ?? ""
  );
  const [saved, setSaved] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const chessState = createStaticChessState({
    epd: props.annotation.previousEpd,
    side: position.turn() === "b" ? "black" : "white",
    nextMove: props.annotation.sanPlus,
  });
  return (
    <div style={s(c.bg(c.grays[30]), c.br(2), c.px(12), c.py(12), c.column)}>
      <div style={s(c.row)}>
        <div style={s(c.size(180))}>
          <LazyLoad>
            <ChessboardView chessboardInterface={chessState} />
          </LazyLoad>
        </div>

        <Spacer width={24} />
        <div style={s(c.width(400))}>
          <AnnotationEditor annotation={annotation} onUpdate={setAnnotation} />
        </div>
      </div>
      <Show when={props.completed}>
        <>
          <Spacer height={8} />
          <CMText style={s()}>
            Reviewer: {ann().reviewerEmail ?? "me@mbuffett.com"}
          </CMText>
        </>
      </Show>
      <Spacer height={8} />
      <div style={s(c.row, c.justifyEnd)}>
        <CMText style={s()}>{ann().games.toLocaleString()} games</CMText>
        <Spacer grow />
        <Button
          style={s(c.buttons.basic, c.selfEnd)}
          onPress={() => {
            quick((s) =>
              s.repertoireState.analyzeMoveOnLichess(
                fen,
                ann().sanPlus,
                position.turn() === "b" ? "black" : "white"
              )
            );
          }}
        >
          Analyze on lichess
        </Button>
        <Spacer width={12} />
        <Button
          style={s(c.buttons.primary, c.selfEnd)}
          onPress={() => {
            setLoading(true);
            quick((s) =>
              s.adminState
                .acceptMoveAnnotation(
                  ann().previousEpd,
                  ann().sanPlus,
                  annotation()
                )
                .then(() => {
                  setSaved(true);
                  setLoading(false);
                })
            );
          }}
        >
          <CMText style={s(c.buttons.primary.textStyles)}>
            <Show when={saved}>
              <i class="fa fa-check" style={s(c.fg(c.grays[90]), c.mr(4))} />
            </Show>
            {loading() ? "Loading.." : saved() ? "Saved" : "Save"}
          </CMText>
        </Button>
      </div>
    </div>
  );
};
