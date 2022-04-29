import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, Text, Pressable, View, Platform } from "react-native";
// import { ExchangeRates } from "app/ExchangeRate";
import { c, s } from "app/styles";
import { Spacer } from "app/Space";
import {
  ChessboardView,
  PieceView,
} from "app/components/chessboard/Chessboard";
import { cloneDeep, isEmpty, isNil, takeRight, chunk } from "lodash";
import { TrainerLayout } from "app/components/TrainerLayout";
import { Button } from "app/components/Button";
import { useIsMobile } from "app/utils/isMobile";
import {
  BlindfoldTrainingStage,
  BlindfoldTrainingState,
  BlunderRecognitionDifficulty,
  BlunderRecognitionTab,
  DEFAULT_CHESS_STATE,
  FinishedBlunderPuzzle,
  getBlunderRange,
  useBlindfoldTrainingStore,
  useBlunderRecognitionStore,
} from "../utils/state";
import { intersperse } from "../utils/intersperse";
import { Chess, Piece, SQUARES } from "@lubert/chess.ts";
import { NewPuzzleButton } from "app/NewPuzzleButton";
import { useHelpModal } from "./useHelpModal";
import { Modal } from "./Modal";
import { SettingsTitle } from "./SettingsTitle";
import { SelectOneOf } from "./SelectOneOf";
import { SelectRange } from "./SelectRange";
import {
  getPuzzleDifficultyRating,
  getPuzzleDifficultyStepValue,
  PuzzleDifficulty,
  stepValueToPuzzleDifficulty,
} from "app/types/VisualizationState";

const pieceToKey = (piece: Piece) => {
  return `${piece.type}-${piece.color}`;
};

const DIVIDER_COLOR = c.grays[15];
const DIVIDER_SIZE = 2;
const PIECE_TYPES = ["k", "q", "r", "b", "n", "p"];
const COLORS = ["w", "b"];

export const BlindfoldTrainer = () => {
  const isMobile = useIsMobile();
  const state = useBlindfoldTrainingStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
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
  console.log(state.puzzlePosition);
  return (
    <TrainerLayout
      chessboard={
        state.puzzlePosition &&
        (state.stage === BlindfoldTrainingStage.Blindfold ? (
          <BlindfoldPieceOverview state={state} />
        ) : (
          <ChessboardView
            {...{
              state: state.chessState,
              onSquarePress: (square) => {
                state.onSquarePress(square);
              },
            }}
          />
        ))
      }
    >
      {!state.isDone && (
        <Text style={s(c.fg(c.grays[70]), c.weightBold, c.fontSize(14))}>
          <Text style={s(c.fg(c.grays[90]), c.weightBold)}>
            {state.chessState.position.turn() === "b" ? "Black" : "White"}
          </Text>{" "}
          to play.
        </Text>
      )}
      {state.stage === BlindfoldTrainingStage.Blindfold && (
        <>
          <Text style={s(c.fg(c.grays[70]), c.weightBold, c.fontSize(14))}>
            <Spacer block height={12} />
            Envision the board with the pieces as shown. When you know the
            continuation, press the button below to show the board and play out
            the tactic.
          </Text>
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
      {state.isDone && (
        <>
          <NewPuzzleButton
            onPress={() => {
              state.refreshPuzzle();
            }}
          />
        </>
      )}
      <Spacer height={12} />
      <View
        style={s(c.row, c.gap(12), c.fullWidth, c.height(48), c.justifyEnd)}
      >
        <Button
          style={s(c.buttons.squareBasicButtons)}
          onPress={() => {
            (async () => {
              if (Platform.OS == "web") {
                window.open(
                  `https://lichess.org/training/${state.puzzle.id}`,
                  "_blank"
                );
              }
            })();
          }}
        >
          <Text style={s(c.buttons.basic.textStyles)}>
            <i
              style={s(c.fg(c.colors.textInverse))}
              className="fas fa-search"
            ></i>
          </Text>
        </Button>
        {helpModal}
        <Button
          style={s(c.buttons.squareBasicButtons)}
          onPress={() => {
            setHelpOpen(true);
          }}
        >
          <Text style={s(c.buttons.basic.textStyles)}>
            <i
              style={s(c.fg(c.colors.textInverse))}
              className="fas fa-circle-question"
            ></i>
          </Text>
        </Button>
        <Button
          style={s(c.buttons.squareBasicButtons)}
          onPress={() => {
            setSettingsOpen(true);
          }}
        >
          <i style={s(c.fg(c.colors.textInverse))} className="fas fa-gear"></i>
        </Button>
        <Modal
          onClose={() => {
            setSettingsOpen(false);
          }}
          visible={settingsOpen}
        >
          <View style={s(c.px(12), c.py(12))}>
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
                  s.refreshPuzzle(s);
                });
              }}
              onChange={([lower, upper]) => {
                state.quick((s) => {
                  s.numPiecesLteUserSetting.value = Math.max(upper, lower + 1);
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
                  s.refreshPuzzle(s);
                });
              }}
              onChange={([lower, upper]) => {
                state.quick((s) => {
                  s.ratingLteUserSetting.value = Math.max(upper, lower + 300);
                  s.ratingGteUserSetting.value = lower;
                });
              }}
            />
          </View>
        </Modal>
      </View>
    </TrainerLayout>
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
    let piece = state.chessState.position.get(square);
    if (piece != undefined) {
      let existing = result[pieceToKey(piece)] || [];
      existing.push(square);
      result[pieceToKey(piece)] = existing;
    }
    return result;
  },
  {}); //watch out the empty {}, which is passed as "result"
  const isMobile = useIsMobile();
  return (
    <View
      style={s(
        c.column,
        c.fullWidth,
        c.pb("100%"),
        c.height(0),
        c.width("100%"),
        c.relative
      )}
    >
      <View style={s(c.absolute, c.fullWidth, c.fullHeight, c.top(0))}>
        {intersperse(
          COLORS.map((color) => {
            const pieces = PIECE_TYPES.map((t) => ({
              color,
              type: t,
            })) as Piece[];
            const squaresByPiece = pieces
              .map((p) => {
                let squares = pieceMap[pieceToKey(p)];
                if (!squares) {
                  return null;
                }
                return { piece: p, squares };
              })
              .filter((x) => x);
            return (
              <View style={s(c.row, c.grow, c.constrainWidth, c.center)}>
                <View style={s(c.row, c.constrainWidth)}>
                  {intersperse(
                    squaresByPiece.map(({ piece, squares }) => {
                      console.log({ piece, squares });
                      return (
                        <View style={s(c.column, c.alignCenter)}>
                          <View style={s(c.size(isMobile ? 38 : 48))}>
                            <PieceView piece={piece} />
                          </View>
                          <Spacer height={12} />
                          <View style={s(isMobile ? c.column : c.row)}>
                            {intersperse(
                              (squares.sort() || []).map((square) => {
                                return (
                                  <View style={s()}>
                                    <Text
                                      style={s(
                                        c.weightBold,
                                        c.fontSize(isMobile ? 16 : 24),
                                        // c.caps,
                                        c.fg(c.colors.textSecondary)
                                      )}
                                    >
                                      {square}
                                    </Text>
                                  </View>
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
                          </View>
                        </View>
                      );
                    }),
                    (i) => {
                      return (
                        <View
                          style={s(
                            c.flexible,
                            c.flexShrink(1),
                            c.center,
                            c.height(72),
                            c.selfCenter
                          )}
                        >
                          <View
                            style={s(
                              c.px(isMobile ? 12 : 24),
                              // c.width(DIVIDER_SIZE),
                              !isMobile && c.bg(DIVIDER_COLOR)
                            )}
                          />
                        </View>
                      );
                    }
                  )}
                </View>
              </View>
            );
          }),
          (i) => {
            return (
              <View
                style={s(
                  c.height(DIVIDER_SIZE),
                  c.fullWidth,
                  c.bg(DIVIDER_COLOR)
                )}
              ></View>
            );
          }
        )}
      </View>
    </View>
  );
};
