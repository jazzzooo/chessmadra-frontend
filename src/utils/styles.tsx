import { assign } from "lodash-es";
import { BP, Responsive } from "./useResponsive";

export const s = (...args) => assign({}, ...args);

const keyedProp = (key: string) => (x: any) => {
  return {
    [key]: x,
  };
};

const keyedPixelProp = (key: string) => (x: any) => {
  if (typeof x === "number") {
    return {
      [key]: `${x}px`,
    };
  }
  return {
    [key]: x,
  };
};

const pixelifyIfNeeded = (x: number) => {
  if (typeof x === "number") {
    return `${x}px`;
  }
  return x;
};

const keyedPercentProp = (key: string) => (x: number | string | any) => {
  if (typeof x === "number") {
    return {
      [key]: `${x}%`,
    };
  }
  return {
    [key]: x,
  };
};

const hsl = (h: number, s: number, l: number, a?: number) => {
  if (a) {
    return `hsla(${h}, ${s}%, ${l}%, ${a / 100})`;
  } else {
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
};

const caps = {
  textTransform: "uppercase",
  letterSpacing: "0.03rem",
};
const p = keyedPixelProp("padding");
const pt = keyedPixelProp("padding-top");
const pb = keyedPixelProp("padding-bottom");
const pl = keyedPixelProp("padding-left");
const pr = keyedPixelProp("padding-right");
const px = (x) => s(pl(x), pr(x));
const py = (x) => s(pt(x), pb(x));

const m = keyedPixelProp("margin");
const mt = keyedPixelProp("margin-top");
const mb = keyedPixelProp("margin-bottom");
const ml = keyedPixelProp("margin-left");
const mr = keyedPixelProp("margin-right");
const mx = (x) => s(ml(x), mr(x));
const my = (x) => s(mt(x), mb(x));

const weightThin = keyedProp("font-weight")(300);
const weightRegular = keyedProp("font-weight")(400);
const weightSemiBold = keyedProp("font-weight")(500);
const weightBold = keyedProp("font-weight")(600);
const weightHeavy = keyedProp("font-weight")(700);
const weightBlack = keyedProp("font-weight")(800);

const flexGrow = keyedProp("flex-grow");
const flexShrink = keyedProp("flex-shrink");
const flexStatic = s(keyedProp("flex-grow")(0), keyedProp("flex-shrink")(0));
const unshrinkable = keyedProp("flex-shrink")(0);
const grow = keyedProp("flex-grow")(1);
const flex = keyedProp("flex");
const textAlign = keyedProp("text-align");

const pageHeight = keyedProp("min-height")("100vh");
const constrainWidth = keyedProp("max-width")("100%");
const constrainHeight = keyedProp("max-height")("100%");
const fullHeight = keyedProp("height")("100%");
const fullWidth = keyedProp("width")("100%");

const height = keyedPixelProp("height");
const width = keyedPixelProp("width");
const minWidth = keyedPixelProp("min-width");
const minHeight = keyedPixelProp("min-height");
const size = (x: string | number) => {
  return s(height(x), width(x));
};

const selfStart = keyedProp("align-self")("flex-start");
const selfCenter = keyedProp("align-self")("center");
const selfStretch = keyedProp("align-self")("stretch");
const selfEnd = keyedProp("align-self")("flex-end");
const alignStart = keyedProp("align-items")("flex-start");
const alignEnd = keyedProp("align-items")("flex-end");
const justifyStart = keyedProp("justify-content")("flex-start");
const justifyEnd = keyedProp("justify-content")("flex-end");
const justifyBetween = keyedProp("justify-content")("space-between");
const alignCenter = keyedProp("align-items")("center");
const alignStretch = keyedProp("align-items")("stretch");
const justifyCenter = keyedProp("justify-content")("center");
const fg = keyedProp("color");
const bg = keyedProp("background-color");

const flexWrap = keyedProp("flex-wrap")("wrap");

const display = keyedProp("display");
const displayFlex = keyedProp("display")("flex");
const displayNone = keyedProp("display")("none");
const displayGrid = keyedProp("display")("grid");

const row = s(displayFlex, keyedProp("flex-direction")("row"));
const gap = keyedProp("gap");
const column = s(displayFlex, keyedProp("flex-direction")("column"));
const absolute = keyedProp("position")("absolute");
const fixed = keyedProp("position")("fixed");
const relative = keyedProp("position")("relative");
const posStatic = keyedProp("position")("static");

const border = keyedProp("border");
const borderBottom = keyedProp("border-bottom");
const borderTop = keyedProp("border-top");
const borderRight = keyedProp("border-right");
const borderLeft = keyedProp("border-left");

const center = s(alignCenter, justifyCenter, displayFlex);

const br = keyedPixelProp("border-radius");
const rounded = br(2);
const brtl = keyedPixelProp("border-top-left-radius");
const brtr = keyedPixelProp("border-top-right-radius");
const brbl = keyedPixelProp("border-bottom-left-radius");
const brbr = keyedPixelProp("border-bottom-right-radius");
const brt = (x) => {
  return s(brtl(x), brtr(x));
};
const brb = (x) => {
  return s(brbr(x), brbl(x));
};
const brl = (x) => {
  return s(brtl(x), brbl(x));
};
const brr = (x) => s(brtr(x), brbr(x));
const maxWidth = keyedPixelProp("max-width");
const maxHeight = keyedPixelProp("max-height");
const clickable = keyedProp("cursor")("pointer");
const unclickable = keyedProp("cursor")("default");
const noBasis = keyedProp("flex-basis")(0);
const round = keyedPixelProp("border-radius")(999);
const flexible = s(
  keyedProp("flex-basis")(0),
  keyedProp("min-width")(0),
  keyedProp("min-height")(0),
  grow
);
const fontSize = keyedPixelProp("font-size");

const noResize = keyedProp("resize")("none");

const opacity = keyedPercentProp("opacity");

const left = keyedPixelProp("left");
const right = keyedPixelProp("right");
const bottom = keyedPixelProp("bottom");
const top = keyedPixelProp("top");

const absoluteFull = s(absolute, top(0), left(0), fullWidth, fullHeight);

// Compount style objects
const dashboardTitle = s(fontSize(40), weightBold, fg("#2e2e3c"));
const zIndex = keyedProp("z-index");
const overflowHidden = keyedProp("overflow")("hidden");
const overflowY = keyedProp("overflow");
const scrollY = keyedProp("overflow-y")("scroll");
const scrollX = keyedProp("overflow-x")("scroll");
const aircamBlue = "#1160d6";
const lineHeight = keyedProp("line-height");
const fontFamily = keyedProp("font-family");

const shadow = (x, y, blur, spread, color) => {
  return {
    "box-shadow": `${x}px ${y}px ${blur}px ${spread}px ${color}`,
  };
};
const cardShadow = shadow(0, 0, 4, 0, "rgba(0, 0, 0, 0.5)");
const lightCardShadow = shadow(0, 2, 4, 0, "rgba(0, 0, 0, 0.06)");

const white = (opacity: number) => {
  return `hsla(0, 0%, 100%, ${opacity}%)`;
};
const black = (opacity: number) => {
  return `hsla(0, 0%, 0%, ${opacity}%)`;
};

export const grayHue = 200;
// const grays = {
//   10: `hsl(${grayHue}, 39%, 4%)`,
//   20: `hsl(${grayHue}, 20%, 8%)`,
//   30: `hsl(${grayHue}, 15%, 15%)`,
//   40: `hsl(${grayHue}, 13%, 25%)`,
//   50: `hsl(${grayHue}, 7%, 35%)`,
//   60: `hsl(${grayHue}, 7%, 70%)`,
//   70: `hsl(${grayHue}, 9%, 80%)`,
//   80: `hsl(${grayHue}, 5%, 90%)`,
//   90: `hsl(${grayHue}, 3%, 95%)`
// }
function easeInOutSine(x: number): number {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}
const genGrays = (
  hue: number,
  minSat: number,
  maxSat: number
): Record<number, string> => {
  const grays: Record<number, string> = {};
  for (let i = 0; i <= 100; i = i + 1) {
    const saturation = minSat + ((maxSat - minSat) * i) / 100;
    grays[i] = `hsl(${hue}, ${saturation}%, ${i}%)`;
  }
  return grays;
};
export const grays = genGrays(grayHue, 8, 5);
const trueGrays = genGrays(0, 0, 0);
const chessboardGrays = genGrays(grayHue, 10, 3);

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
const genShades = (
  hue: number,
  _minSaturation?: number,
  _maxSaturation?: number
): Record<number, string> => {
  const shades: Record<number, string> = {};
  const minSaturation = _minSaturation ?? 20;
  const maxSaturation = _maxSaturation ?? 80;
  const minLightness = 4;
  const maxLightness = 80;
  for (let i = 0; i <= 100; i = i + 1) {
    const lightness_y = easeInOutSine(i / 100);
    const saturation =
      minSaturation + ((maxSaturation - minSaturation) * (100 - i)) / 100;
    const lightness =
      minLightness + (maxLightness - minLightness) * lightness_y;
    shades[i] = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
  return shades;
  // return {
  //   10: `hsl(${hue}, 45%, 8%)`,
  //   20: `hsl(${hue}, 45%, 13%)`,
  //   30: `hsl(${hue}, 40%, 18%)`,
  //   40: `hsl(${hue}, 35%, 25%)`,
  //   50: `hsl(${hue}, 35%, 40%)`,
  //   60: `hsl(${hue}, 40%, 50%)`,
  //   70: `hsl(${hue}, 50%, 60%)`,
  //   80: `hsl(${hue}, 50%, 90%)`,
  //   90: `hsl(${hue}, 65%, 95%)`,
  // };
};
const blues = genShades(grayHue, 50, 80);
const teals = genShades(150);
const primaries = blues;
const yellows = genShades(41, 70, 70);
const oranges = genShades(40, 70, 70);
const arrowColors = genShades(40, 100, 100);
const pinks = genShades(308);
const purples = genShades(271);
const reds = genShades(340, 40, 60);
const greens = genShades(109);
const forestGreens = genShades(83);
const failureShades = reds;
const successShades = genShades(164);
export const colors = {
  blues,
  teals,
  primaries,
  yellows,
  oranges,
  pinks,
  reds,
  grays,
  purples,
  greens,
  forestGreens,
  successShades,
  textPrimary: grays[95],
  textSecondary: grays[80],
  textTertiary: grays[50],
  sidebarBorder: grays[25],
  border: grays[25],
  textInverse: grays[5],
  textInverseSecondary: grays[20],
  successColor: "hsl(164, 98%, 55%)",
  failureColor: "hsl(340, 70%, 52%)",
  failureLight: "hsl(348, 100%, 72%)",
  buttonSecondary: grays[80],
  backgroundColor: grays[10],
  header: "hsl(229, 19%, 14%)",
  modalColor: "hsl(229, 10%, 90%)",
  cardBackground: grays[18],
  // lightTile: grays[48],
  // darkTile: grays[38],

  lightTile: hsl(grayHue, 14, 60),
  darkTile: hsl(grayHue, 14, 40),
  debugColor: hsl(71, 100, 42),
  debugColorDark: hsl(71, 100, 28),
};
const extraDarkBorder = border(`1px solid ${grays[7]}`);

const basicButtonStyles = s(
  br(2),
  py(16),
  px(16),
  bg(colors.buttonSecondary),
  clickable,
  center,
  {
    textStyles: s(weightBold, fontSize(16), fg(colors.textInverse)),
  }
);
const outlineDarkButtonStyles = s(
  br(2),
  py(16),
  px(16),
  bg("none"),
  border(`1px solid ${grays[20]}`),
  clickable,
  center,
  {
    textStyles: s(weightBold, fontSize(16), fg(grays[10])),
  }
);
const outlineLightButtonStyles = s(
  br(2),
  py(16),
  px(16),
  bg("none"),
  border(`1px solid ${grays[60]}`),
  clickable,
  center,
  {
    textStyles: s(weightBold, fontSize(16), fg(grays[80])),
  }
);
const basicInverseButtonStyles = s(
  br(2),
  py(16),
  px(16),
  bg(grays[20]),
  clickable,
  center,
  {
    textStyles: s(weightBold, fontSize(16), fg(colors.textPrimary)),
  }
);
const disabledButtonStyles = s(
  br(2),
  py(16),
  px(16),
  bg(hsl(215, 38, 45)),
  opacity(20),
  clickable,
  center,
  {
    textStyles: s(weightBold, fontSize(16), fg("white")),
  }
);
const extraDarkButtonStyles = s(
  br(2),
  py(16),
  px(16),
  bg(grays[10]),
  border(`1px solid ${grays[7]}`),
  clickable,
  center,
  {
    textStyles: s(weightBold, fontSize(16), fg(grays[70])),
  }
);
const basicSecondaryButtonStyles = s(
  br(2),
  py(16),
  px(16),
  bg(grays[12]),
  border(`1px solid ${grays[20]}`),
  clickable,
  center,
  {
    textStyles: s(weightBold, fontSize(16), fg(grays[70])),
  }
);
const primaryButtonStyles = s(basicButtonStyles, bg(primaries[40]), {
  textStyles: s(weightBold, fg(colors.textPrimary), fontSize(16)),
});
const primaryDisabledButtonStyles = s(basicButtonStyles, bg(grays[40]), {
  textStyles: s(weightBold, fg(grays[75]), fontSize(16)),
});
const squareBottomRowButtonStyles = s(basicButtonStyles, size(48));
const buttons = {
  basic: basicButtonStyles,
  basicSecondary: basicSecondaryButtonStyles,
  extraDark: extraDarkButtonStyles,
  darkFloater: s(
    br(2),
    py(16),
    px(16),
    bg(colors.cardBackground),
    cardShadow,
    clickable,
    center,
    {
      textStyles: s(weightBold, fontSize(16), fg(grays[70])),
    }
  ),

  basicInverse: basicInverseButtonStyles,
  disabled: disabledButtonStyles,
  primary: primaryButtonStyles,
  primaryDisabled: primaryDisabledButtonStyles,
  squareBasicButtons: squareBottomRowButtonStyles,
  outlineLight: outlineLightButtonStyles,
  outlineDark: outlineDarkButtonStyles,
};

const duotone = (primary, secondary) => {
  return {
    "--fa-primary-color": primary,
    "--fa-secondary-color": secondary,
    "--fa-secondary-opacity": 1.0,
  };
};

export const chessboardColors = {
  outlineWidth: 0.8,
  blackFill: chessboardGrays[26],
  blackOutline: chessboardGrays[5],
  blackLightAccent: chessboardGrays[26],
  blackDarkAccent: "hsla(0, 0%, 100%, 10%)",
  blackKnightAccent: chessboardGrays[20],
  whiteFill: chessboardGrays[95],
  whiteOutline: chessboardGrays[0],
  whiteLightAccent: chessboardGrays[100],
  whiteKnightAccent: chessboardGrays[40],
  whiteDarkAccent: "hsla(0, 0%, 60%, 40%)",
};

const fillNoExpand = s(minWidth("100%"), width(0));

const noPointerEvents = keyedProp("pointer-events")("none");
const transform = keyedProp("transform");
const oldContainerStyles = (isMobile, customMaxWidth?: number) =>
  s(
    width(
      `min(calc(100vw - ${isMobile ? 24 : 24}px), ${customMaxWidth ?? 1280}px)`
    ),
    column,
    selfCenter
  );

const containerStyles = (breakpoint: BP) =>
  s(
    width(
      `min(calc(100vw - ${breakpoint <= BP.lg ? 24 : 96}px), ${
        breakpoint >= BP.xxl ? 1440 : 1280
      }px)`
    ),
    column,
    selfCenter
  );

export const noUserSelect = {
  WebkitTouchCallout: "none",
  WebkitUserSelect: "none",
  KhtmlUserSelect: "none",
  MozUserSelect: "none",
  MsUserSelect: "none",
  UserSelect: "none",
};
export const rotate = (x) => transform(`rotate(${x}deg)`);

const grid = ({
  templateColumns,
  templateRows,
  rowGap,
  columnGap,
}: {
  templateColumns: any[];
  templateRows: any[];
  rowGap: number;
  columnGap: number;
}) => {
  return s(
    c.displayGrid,
    c.keyedProp("grid-template-columns")(
      templateColumns ? templateColumns.join(" ") : "1fr"
    ),
    c.keyedProp("grid-template-rows")(
      templateRows ? templateRows.join(" ") : "1fr"
    ),
    c.keyedProp("row-gap")(rowGap ?? 12),
    c.keyedProp("column-gap")(columnGap ?? 12)
  );
};

const gridColumn = ({ gap }: { gap: number }) => {
  return s(
    c.displayGrid,
    c.keyedProp("grid-template-columns")("1fr"),
    // c.keyedProp("grid-template-rows")("1fr"),
    c.keyedProp("row-gap")(pixelifyIfNeeded(gap))
    // c.keyedProp("column-gap")(columnGap ?? 12)
  );
};

const minmax = (min, max) => {
  return `minmax(${pixelifyIfNeeded(min)}, ${pixelifyIfNeeded(max)})`;
};
const min = (min, max) => {
  return `min(${pixelifyIfNeeded(min)}, ${pixelifyIfNeeded(max)})`;
};
const max = (min, max) => {
  return `max(${pixelifyIfNeeded(min)}, ${pixelifyIfNeeded(max)})`;
};
const calc = (c) => {
  return `calc(${c})`;
};
const sidebarDescriptionStyles = (responsive: Responsive) => {
  return s(c.fg(c.grays[70]));
};

const getSidebarPadding = (responsive: Responsive) => {
  return responsive.switch(12, [BP.md, 12], [BP.lg, 18]);
};

export const c = {
  getSidebarPadding,
  keyedProp,
  overflowY,
  oldContainerStyles,
  containerStyles,
  displayNone,
  rounded,
  noPointerEvents,
  caps,
  p,
  pt,
  pb,
  pl,
  pr,
  px,
  py,
  m,
  mt,
  mb,
  ml,
  mr,
  mx,
  colors,
  my,
  fillNoExpand,
  weightThin,
  weightRegular,
  weightSemiBold,
  weightBold,
  primaries,
  blues,
  purples,
  pinks,
  teals,
  yellows,
  oranges,
  failureShades,
  reds,
  greens,
  forestGreens,
  successShades,
  weightHeavy,
  weightBlack,
  flexGrow,
  flexShrink,
  flexStatic,
  unshrinkable,
  grow,
  flex,
  textAlign,
  lineHeight,
  pageHeight,
  fullHeight,
  fullWidth,
  constrainWidth,
  constrainHeight,
  height,
  width,
  minWidth,
  minHeight,
  size,
  selfCenter,
  selfStretch,
  selfStart,
  selfEnd,
  alignStart,
  alignEnd,
  justifyStart,
  justifyEnd,
  justifyBetween,
  alignCenter,
  grays,
  trueGrays,
  alignStretch,
  justifyCenter,
  fg,
  bg,
  flexWrap,
  displayFlex,
  displayGrid,
  row,
  gap,
  column,
  absolute,
  absoluteFull,
  fixed,
  relative,
  posStatic,
  border,
  borderBottom,
  borderTop,
  borderRight,
  borderLeft,
  center,
  br,
  brtl,
  brtr,
  brbl,
  brbr,
  brl,
  brb,
  brt,
  brr,
  maxWidth,
  maxHeight,
  clickable,
  unclickable,
  noBasis,
  round,
  flexible,
  fontSize,
  noResize,
  opacity,
  left,
  right,
  bottom,
  top,
  dashboardTitle,
  zIndex,
  overflowHidden,
  scrollY,
  scrollX,
  aircamBlue,
  hsl,
  fontFamily,
  block: display("-block"),
  inlineBlock: display("inline-block"),
  whitespace: keyedProp("white-space"),
  shadow,
  cardShadow,
  lightCardShadow,
  stif: (x, styles) => {
    return x ? styles : {};
  },
  transition: (key) => {
    return {
      transition: `200ms ${key} ease-in-out`,
    };
  },
  gradient: (c1, c2, c3) => {
    return {
      background: `linear-gradient(180deg, ${c1} 0%, ${c2} 66%, ${c3} 100%)`,
    };
  },
  white,
  black,
  buttons,
  transform,
  extraDarkBorder,
  duotone,
  rotate,
  grid,
  gridColumn,
  minmax,
  min,
  max,
  calc,
  noUserSelect,
  sidebarDescriptionStyles,
  arrowColors,
};
