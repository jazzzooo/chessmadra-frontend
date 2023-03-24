import { chessboardColors } from "~/utils/styles";
import * as React from "react";
import Svg, { Path } from "react-native-svg";

function SvgComponent(props) {
  return (
    <Svg
      width="100%"
      height="100%"
      clipRule="evenodd"
      fillRule="evenodd"
      imageRendering="optimizeQuality"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M25.192 23.015c-.165 6.967-11.758 5.219-11.516 18.104l22.86.118c-2.094-6.442 9.69-25.16-11.931-32.258v0s-2.438-2.6-5.965-2.823l.222 3.534-4.558 4.582c-2.63 3.145-8.735 8.378-7.751 9.611 3.115 5.304 6.33 4.432 6.33 4.432 4.242-4.544 5.82-2.09 12.31-5.3z"
        fill={chessboardColors.whiteFill}
        stroke={chessboardColors.whiteOutline}
        strokeLinejoin="round"
        strokeWidth={chessboardColors.outlineWidth}
      />
      <Path
        d="M19.32 14.694c-.776.86-.69 1.116-.814 2.15.806.123 1.507.24 2.249.066 2.38-1.262.075-3.403-1.435-2.216z"
        fill={chessboardColors.whiteKnightAccent}
      />
      <Path
        d="M9.192 22.166c-.85.408-.999.96-1.057 1.475.729.419 1.877-.125 2.041-1.431l-.984-.044z"
        fill={chessboardColors.whiteKnightAccent}
      />
      <Path
        d="M8.19 25.15s.653 1.137-1.101-1.641c.659-1.977 8.263-9.08 12.438-13.534l-.184-3.086s1.069 1.69 1.248 3.468C16.2 14.747 8.37 21.19 7.767 23.57c.023.674.24 1.028.423 1.58z"
        fill={chessboardColors.whiteLightAccent}
      />
      <Path
        d="M13.26 28.257c2.03-3.337 8.391-3.224 11.932-5.242.323.102.13 1.37.24 1.23.847-1.09 2.926-3.28.868-6.875.522 5.958-13.718 5.591-15.89 10.305-.2.436 2.182.793 2.85.582z"
        fill={chessboardColors.whiteDarkAccent}
      />
      <Path
        d="M25.8 23.781c-1.013 5.813-9.545 6.117-10.988 12.641 2.833-6.406 10.762-5.714 10.988-12.641z"
        fill={chessboardColors.whiteLightAccent}
      />
      <Path
        d="M18.64 6.156s3.051.738 4.904 3.982c20.5 7.154 7.642 27.937 5.789 31.073l7.203.026C34.55 37.994 46.084 15.64 24.606 8.98 22.83 7.91 21.837 6.37 18.64 6.155z"
        fill={chessboardColors.whiteDarkAccent}
      />
      <Path
        d="M25 36.457s-9.13.048-11.691 1.62c-1.727 1.06-2.135 3.65-1.9 6.323h27.182c.235-2.672-.172-5.264-1.9-6.324-2.56-1.57-11.69-1.619-11.69-1.619z"
        fill={chessboardColors.whiteFill}
        stroke={chessboardColors.whiteOutline}
        strokeLinejoin="round"
        strokeWidth={chessboardColors.outlineWidth}
      />
      <Path
        d="M25 37.147s-8.712-.137-11.624 1.666c-.37.229-.7.84-.954 1.39.261-.331.503-.613.887-.849C15.87 37.783 25 37.734 25 37.734s9.132.049 11.692 1.62c.391.24.592.532.856.87.026-.076-.409-1.158-1.144-1.596C33.648 37.136 25 37.148 25 37.148z"
        fill={chessboardColors.whiteLightAccent}
      />
    </Svg>
  );
}

export default SvgComponent;
