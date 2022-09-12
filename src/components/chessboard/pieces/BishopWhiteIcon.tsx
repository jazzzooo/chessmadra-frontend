import { chessboardColors } from "app/styles";
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
        d="M25 5.767c-2.106 0-3.812.879-3.812 1.963l1.517 2.65c-16.05 14.09-5.707 27.136-5.707 27.136h16.005s7.05-8.672.763-19.51l-2.99 4.827c-.67 1.084-1.962 1.49-2.897.911-.935-.578-1.147-1.917-.477-3l3.887-6.277a35.382 35.382 0 00-3.993-4.086l1.517-2.65c0-1.085-1.707-1.964-3.812-1.964z"
        fill={chessboardColors.whiteFill}
        strokeLinejoin="round"
        strokeWidth={chessboardColors.outlineWidth}
        stroke={chessboardColors.whiteOutline}
      />
      <Path
        d="M25 5.767c-.816 0-1.571.134-2.191.358 4.338.848 4.976 1.12 2.56 4.351l3.246 3.567c-3.657 8.24-1.604 7.991-1.604 7.991s.696-2.648 4.112-7.768a35.696 35.696 0 00-3.827-3.886l1.516-2.65c0-1.084-1.706-1.963-3.812-1.963zm8.765 12.238l-1.009 1.513c3.737 8.413-4.134 17.997-4.134 17.997h4.381c.158.034 6.958-8.844.762-19.51z"
        fill={chessboardColors.whiteDarkAccent}
      />
      <Path
        d="M15.145 31.721c-.22-.031-3.423-9.786 5.754-18.751-2.302 1.895-7.135 13.163-5.754 18.751zM23.292 10.196l-1.477-2.594s.242-.722 1.78-1.048c-1.726 1.35-.987 1.663-.303 3.642z"
        fill={chessboardColors.whiteLightAccent}
      />
      <Path
        d="M25 36.457s-9.13.048-11.691 1.62c-1.727 1.06-2.135 3.65-1.9 6.323h27.182c.235-2.672-.172-5.264-1.9-6.324-2.56-1.57-11.69-1.619-11.69-1.619z"
        fill={chessboardColors.whiteFill}
        strokeLinejoin="round"
        strokeWidth={chessboardColors.outlineWidth}
        stroke={chessboardColors.whiteOutline}
      />
      <Path
        d="M25 37.147s-8.712-.137-11.624 1.666c-.37.229-.7.84-.954 1.39.261-.331.502-.613.887-.85C15.869 37.784 25 37.736 25 37.736s9.132.048 11.692 1.619c.391.24.592.532.856.87.026-.076-.409-1.158-1.144-1.596C33.648 37.136 25 37.147 25 37.147z"
        fill={chessboardColors.whiteLightAccent}
      />
    </Svg>
  );
}

export default SvgComponent;
