
import {
  Pressable,
} from "react-native";
import { s, c } from "~/utils/styles";
import { forEach, isEmpty } from "lodash-es";
import { Spacer } from "~/components/Space";
import { Move } from "@lubert/chess.ts";
import { CMText } from "./CMText";
import { Show } from "solid-js";

export const MoveList = ({
  moveList,
  focusedMoveIndex,
  onMoveClick,
}: {
  moveList: Move[];
  focusedMoveIndex?: number;
  onMoveClick: (move: Move, _: number) => void;
}) => {
  const pairs = [];
  let currentPair = [];
  forEach(moveList, (move, i) => {
    if (move.color == "b" && isEmpty(currentPair)) {
      pairs.push([{}, { move, i }]);
      return;
    }
    currentPair.push({ move, i });
    if (move.color == "b") {
      pairs.push(currentPair);
      currentPair = [];
    }
  });
  if (!isEmpty(currentPair)) {
    if (currentPair.length === 1) {
      currentPair.push({});
    }
    pairs.push(currentPair);
  }
  const moveStyles = s(
    c.width(80),
    c.fullHeight,
    c.clickable,
    c.selfStretch,
    c.alignStart,
    c.justifyCenter,
    c.column,
    c.fontSize(18),
    c.weightSemiBold,
    c.fg(c.colors.textPrimary)
  );
  return (
    <div style={s(c.column, c.bg(c.grays[20]), c.br(2))}>
      <div style={s(c.height(1), c.bg(c.grays[30]))} />
      {pairs.map((pair, i) => {
        const [{ move: whiteMove, i: whiteI }, { move: blackMove, i: blackI }] =
          pair;
        const activeMoveStyles = s(c.weightBlack, c.fontSize(20));
        return (
          <div key={i} style={s(c.column, c.overflowHidden)}>
            <div style={s(c.row, c.alignStretch, c.py(8))}>
              <div
                style={s(
                  c.width(48),
                  c.center,
                  c.borderRight(`1px solid ${c.grays[30]}`)
                )}
              >
                <CMText
                  style={s(
                    c.fg(c.colors.textPrimary),
                    c.fontSize(18),
                    c.weightSemiBold
                  )}
                >
                  {i + 1}
                </CMText>
              </div>
              <Spacer width={24} />
              <Pressable
                onPress={() => {
                  onMoveClick(whiteMove, whiteI);
                }}
              >
                <CMText
                  style={s(
                    moveStyles,
                    focusedMoveIndex === whiteI && activeMoveStyles
                  )}
                >
                  {whiteMove?.san ?? "..."}
                </CMText>
              </Pressable>
              <Pressable
                onPress={() => {
                  onMoveClick(blackMove, blackI);
                }}
              >
                <CMText
                  style={s(
                    moveStyles,
                    focusedMoveIndex === blackI && activeMoveStyles
                  )}
                >
                  {blackMove?.san ?? "..."}
                </CMText>
              </Pressable>
            </div>
            <Show when={i != pairs.length - 1 }>
              <div style={s(c.height(1), c.bg(c.grays[30]))} />
              </Show>
          </div>
        );
      })}
    </div>
  );
};
