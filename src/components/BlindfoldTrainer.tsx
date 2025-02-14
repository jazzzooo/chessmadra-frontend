import React, { useEffect } from "react";
import { Platform } from "react-native";
// import { ExchangeRates } from "~/ExchangeRate";
import { c, s } from "~/utils/styles";
import { Spacer } from "~/components/Space";
import {
  ChessboardView,
  PieceView,
} from "~/components/chessboard/Chessboard";
import { TrainerLayout } from "~/components/TrainerLayout";
import { Button } from "~/components/Button";
import { useIsMobile } from "~/utils/isMobile";
import { intersperse } from "../utils/intersperse";
import { Piece, SQUARES } from "@lubert/chess.ts";
import { NewPuzzleButton } from "~/NewPuzzleButton";
import { useHelpModal } from "./useHelpModal";
import { Modal } from "./Modal";
import { SettingsTitle } from "./SettingsTitle";
import { SelectRange } from "./SelectRange";
import { HeadSiteMeta, PageContainer } from "./PageContainer";
import { CMText } from "./CMText";
import { useBlindfoldState } from "~/utils/app_state";
import {
  BlindfoldTrainingStage,
  BlindfoldTrainingState,
} from "~/utils/blindfold_state";
import { BLINDFOLD_DESCRIPTION } from "./NavBar";
import { trackEvent } from "~/utils/trackEvent";
import { trackModule } from "~/utils/user_state";

const pieceToKey = (piece: Piece) => {
  return `${piece.type}-${piece.color}`;
};

const DIVIDER_COLOR = c.grays[15];
const DIVIDER_SIZE = 2;
const PIECE_TYPES = ["k", "q", "r", "b", "n", "p"];
const COLORS = ["w", "b"];

export const BlindfoldTrainer = () => {
  const isMobile = useIsMobile();
  const state = useBlindfoldState((s) => s);
  useEffect(() => {
    trackModule("blindfold");
  }, []);
  const [settingsOpen, setSettingsOpen] = createSignal(false);
  const { helpOpen, setHelpOpen, helpModal } = useHelpModal({
    copy: (
      <>
        Visualize the pieces in the positions given, then figure out the best
        move. When you know the best move and the continuation, press the button
        to see the board and play it out.
      </>
    ),
  });
  // const pieces = state.chessState.position
  //   .board()
  //   .flat()
  //   .filter((sq) => sq !== null);
  useEffect(() => {
    state.refreshPuzzle();
  }, []);
  return (
    <PageContainer>
      <HeadSiteMeta
        siteMeta={{
          title: "Blindfold Puzzle Trainer",
          description: BLINDFOLD_DESCRIPTION,
        }}
      />
      <TrainerLayout
        chessboard={
          state.stage === BlindfoldTrainingStage.Blindfold ? (
            <BlindfoldPieceOverview state={state} />
          ) : (
            <ChessboardView
              {...{
                state: state.chessboardState,
              }}
            />
          )
        }
      >
      <Show when={!state.isDone }>
          <CMText style={s(c.fg(c.grays[70]), c.weightBold, c.fontSize(14))}>
            <CMText style={s(c.fg(c.grays[90]), c.weightBold)}>
              {state.chessboardState.position.turn() === "b"
                ? "Black"
                : "White"}
            </CMText>{" "}
            to play.
          </CMText>
          </Show>
        {state.stage === BlindfoldTrainingStage.Blindfold && (
          <>
            <CMText style={s(c.fg(c.grays[70]), c.weightBold, c.fontSize(14))}>
              <Spacer block height={12} />
              Envision the board with the pieces as shown. When you know the
              continuation, press the button below to show the board and play
              out the tactic.
            </CMText>
            <Spacer height={24} />
            <Button
              onPress={() => {
                state.quick((s) => {
                  s.stage = BlindfoldTrainingStage.Board;
                });
              }}
              style={s(c.buttons.primary)}
            >
              Show Board
            </Button>
          </>
        )}
        <Show when={state.isDone }>
          <>
            <NewPuzzleButton
              onPress={() => {
                state.refreshPuzzle();
                trackEvent("blindfold_trainer.new_puzzle");
              }}
            />
          </>
          </Show>
        <Spacer height={12} />
        <div
          style={s(c.row, c.gap(12), c.fullWidth, c.height(48), c.justifyEnd)}
        >
          <Button
            style={s(c.buttons.squareBasicButtons)}
            onPress={() => {
              (async () => {
                if (Platform.OS == "web") {
                  window.open(
                    `https://lichess.org/training/${state.puzzleState.puzzle.id}`,
                    "_blank"
                  );
                }
              })();
            }}
          >
            <CMText style={s(c.buttons.basic.textStyles)}>
              <i
                style={s(c.fg(c.colors.textInverse))}
                class="fa-sharp fa-search"
              ></i>
            </CMText>
          </Button>
          {helpModal}
          <Button
            style={s(c.buttons.squareBasicButtons)}
            onPress={() => {
              setHelpOpen(true);
              trackEvent("blindfold_trainer.open_help");
            }}
          >
            <CMText style={s(c.buttons.basic.textStyles)}>
              <i
                style={s(c.fg(c.colors.textInverse))}
                class="fa-sharp fa-circle-question"
              ></i>
            </CMText>
          </Button>
          <Button
            style={s(c.buttons.squareBasicButtons)}
            onPress={() => {
              setSettingsOpen(true);
              trackEvent("blindfold_trainer.open_settings");
            }}
          >
            <i
              style={s(c.fg(c.colors.textInverse))}
              class="fa-sharp fa-gear"
            ></i>
          </Button>
          <Modal
            onClose={() => {
              setSettingsOpen(false);
            }}
            visible={settingsOpen}
          >
            <div style={s(c.px(12), c.py(12))}>
              <SettingsTitle text={"Number of Pieces"} />
              <Spacer height={12} />
              <SelectRange
                min={3}
                max={15}
                range={[
                  state.numPiecesGteUserSetting.value,
                  state.numPiecesLteUserSetting.value,
                ]}
                step={1}
                onFinish={() => {
                  state.quick((s) => {
                    s.refreshPuzzle();
                  });
                }}
                onChange={([lower, upper]) => {
                  state.quick((s) => {
                    s.numPiecesLteUserSetting.value = Math.max(
                      upper,
                      lower + 1
                    );
                    s.numPiecesGteUserSetting.value = lower;
                  });
                }}
              />
              <SettingsTitle text={"Difficulty range"} />
              <Spacer height={12} />
              <SelectRange
                min={0}
                max={2500}
                range={[
                  state.ratingGteUserSetting.value,
                  state.ratingLteUserSetting.value,
                ]}
                formatter={(value) => {
                  return `${value}`;
                }}
                step={50}
                onFinish={() => {
                  state.quick((s) => {
                    s.refreshPuzzle();
                  });
                }}
                onChange={([lower, upper]) => {
                  state.quick((s) => {
                    s.ratingLteUserSetting.value = Math.max(upper, lower + 300);
                    s.ratingGteUserSetting.value = lower;
                  });
                }}
              />
            </div>
          </Modal>
        </div>
      </TrainerLayout>
    </PageContainer>
  );
};

const BlindfoldPieceOverview = ({
  state,
}: {
  state: BlindfoldTrainingState;
}) => {
  const pieceMap = Object.keys(SQUARES).reduce(function (
    result,
    square,
    index,
    array
  ) {
    const piece = state.chessboardState.position.get(square);
    if (piece != undefined) {
      const existing = result[pieceToKey(piece)] || [];
      existing.push(square);
      result[pieceToKey(piece)] = existing;
    }
    return result;
  },
  {}); //watch out the empty {}, which is passed as "result"
  const isMobile = useIsMobile();
  return (
    <div
      style={s(
        c.column,
        c.fullWidth,
        c.pb("100%"),
        c.height(0),
        c.width("100%"),
        c.relative
      )}
    >
      {state.puzzleState.puzzlePosition && (
        <div style={s(c.absolute, c.fullWidth, c.fullHeight, c.top(0))}>
          {intersperse(
            COLORS.map((color) => {
              const pieces = PIECE_TYPES.map((t) => ({
                color,
                type: t,
              })) as Piece[];
              const squaresByPiece = pieces
                .map((p) => {
                  const squares = pieceMap[pieceToKey(p)];
                  if (!squares) {
                    return null;
                  }
                  return { piece: p, squares };
                })
                .filter((x) => x);
              return (
                <div style={s(c.row, c.grow, c.constrainWidth, c.center)}>
                  <div style={s(c.row, c.constrainWidth)}>
                    {intersperse(
                      squaresByPiece.map(({ piece, squares }) => {
                        console.log({ piece, squares });
                        return (
                          <div style={s(c.column, c.alignCenter)}>
                            <div style={s(c.size(isMobile ? 38 : 48))}>
                              <PieceView piece={piece} />
                            </div>
                            <Spacer height={12} />
                            <div style={s(isMobile ? c.column : c.row)}>
                              {intersperse(
                                (squares.sort() || []).map((square) => {
                                  return (
                                    <div style={s()}>
                                      <CMText
                                        style={s(
                                          c.weightBold,
                                          c.fontSize(isMobile ? 16 : 24),
                                          // c.caps,
                                          c.fg(c.colors.textSecondary)
                                        )}
                                      >
                                        {square}
                                      </CMText>
                                    </div>
                                  );
                                }),
                                (i) => {
                                  return (
                                    <Spacer
                                      key={i}
                                      width={12}
                                      height={4}
                                      isMobile={isMobile}
                                    />
                                  );
                                }
                              )}
                            </div>
                          </div>
                        );
                      }),
                      (i) => {
                        return (
                          <div
                            style={s(
                              c.flexible,
                              c.flexShrink(1),
                              c.center,
                              c.height(72),
                              c.selfCenter
                            )}
                          >
                            <div
                              style={s(
                                c.px(isMobile ? 12 : 24),
                                // c.width(DIVIDER_SIZE),
                                !isMobile && c.bg(DIVIDER_COLOR)
                              )}
                            />
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              );
            }),
            (i) => {
              return (
                <div
                  style={s(
                    c.height(DIVIDER_SIZE),
                    c.fullWidth,
                    c.bg(DIVIDER_COLOR)
                  )}
                ></div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
};
