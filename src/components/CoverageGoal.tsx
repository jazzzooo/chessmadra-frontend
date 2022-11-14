import React, { useRef, useState } from "react";
import { Animated, Pressable, View } from "react-native";
// import { ExchangeRates } from "app/ExchangeRate";
import { c, s } from "app/styles";
import { Spacer } from "app/Space";
import { CMText } from "./CMText";
import {
  quick,
  useUserState,
} from "app/utils/app_state";
import { THRESHOLD_OPTIONS } from "./ProfileModal";
import { useResponsive } from "app/utils/useResponsive";
import { getRecommendedMissThreshold } from "app/utils/user_state";
import { useOutsideClick } from "app/components/useOutsideClick";
import { SelectOneOf } from "./SelectOneOf";

export const CoverageGoal = ({
  textColor,
  fromTop,
}: {
  textColor: any;
  fromTop?: boolean;
}) => {
  const [threshold] = useUserState((s) => [s.getCurrentThreshold()]);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);
  useOutsideClick(ref, (e) => {
    if (isOpen) {
      setIsOpen(false);
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });
  const [user] = useUserState((s) => [s.user, s.getCurrentThreshold()]);
  const selected = threshold;
  const onSelect = (t: number) => {
    quick((s) => {
      s.userState.setTargetDepth(t);
    });
  };
  const responsive = useResponsive();
  const recommendedDepth = getRecommendedMissThreshold(user?.eloRange);
  return (
    <Pressable
      style={s(c.column, c.alignEnd, c.relative)}
      ref={ref}
      onPress={() => {
        setIsOpen(!isOpen);
      }}
    >
      <CMText style={s(c.fg(textColor), c.fontSize(12), c.weightSemiBold)}>
        Goal
      </CMText>
      <Spacer height={0} />
      <View style={s(c.row, c.alignCenter)}>
        <CMText
          style={s(c.weightBold, c.fg(textColor), c.weightBold, c.fontSize(12))}
        >
          1 in {Math.round(1 / threshold)} games
        </CMText>
        <Spacer width={4} />
        <i
          className="fa fa-caret-down"
          style={s(c.fontSize(14), c.fg(textColor), c.opacity(60))}
        />
      </View>
      <Animated.View
        style={s(
          c.absolute,
          c.opacity(fadeAnim),
          !isOpen && c.noPointerEvents,
          c.zIndex(4),
          c.right(0),
          c.top("calc(100% + 8px)"),
          c.bg(c.grays[100]),
          c.br(4),
          c.cardShadow,
          c.px(12),
          c.py(12),
          c.minWidth(300)
        )}
      >
        <SelectOneOf
          containerStyles={s(c.fullWidth)}
          choices={THRESHOLD_OPTIONS}
          // cellStyles={s(c.bg(c.grays[15]))}
          // horizontal={true}
          activeChoice={selected}
          onSelect={onSelect}
          separator={() => {
            return <Spacer height={0} />;
          }}
          renderChoice={(r: number, active: boolean, i: number) => {
            return (
              <Pressable
                key={i}
                style={s(c.selfStretch)}
                onPress={() => {
                  onSelect(r);
                }}
              >
                <View
                  style={s(
                    c.height(34),
                    c.px(8),
                    c.row,
                    c.alignCenter,
                    active && c.bg(c.grays[20]),
                    c.br(2)
                  )}
                >
                  <CMText
                    style={s(
                      c.fg(
                        active ? c.colors.textPrimary : c.colors.textInverse
                      ),
                      !active ? c.weightSemiBold : c.weightHeavy
                    )}
                  >
                    1 in {Math.round(1 / r)} games
                  </CMText>
                  <Spacer width={12} grow />
                  {recommendedDepth == r && (
                    <CMText
                      style={s(
                        !active && c.border(`1px solid ${c.grays[80]}`),
                        c.br(2),
                        c.p(4),
                        c.fontSize(12),
                        c.fg(active ? c.grays[80] : c.grays[40])
                      )}
                    >
                      Recommended
                    </CMText>
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      </Animated.View>
    </Pressable>
  );
};
