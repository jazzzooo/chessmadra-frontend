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
        d="M21.503 27.594h6.994M19 17.508c0 1.732.712 3.387 1.966 4.587l-3.65 2.1.43 3.399h4.306c-.794 3.559-2.755 7.33-5.062 8.617s-5.3 3.097-4.843 8.189h25.706c.457-5.092-2.535-6.902-4.842-8.189-2.307-1.286-4.268-5.058-5.062-8.617h4.306l.43-3.4-3.65-2.099a6.352 6.352 0 001.966-4.587c0-3.367-2.628-5.912-6-5.912-3.373 0-6.002 2.545-6.001 5.912z"
        fill={chessboardColors.blackFill}
        strokeLinejoin="round"
        strokeWidth={chessboardColors.outlineWidth}
        stroke={chessboardColors.blackOutline}
      />
      <Path
        d="M24.962 11.537c1.17-.459 9.527 5.906.647 10.773l4.512 2.1-.562 3.125h2.659l.428-3.399-3.65-2.1c1.253-1.2 1.962-2.58 1.964-4.312-.468-5.416-5.998-6.186-5.998-6.186zm-2.949 15.998c4.503 7.934 9.47 9.994 13.074 9.965l-2.115-1.347c-2.075-1.49-4.732-4.858-5.062-8.618z"
        fill={chessboardColors.blackDarkAccent}
      />
      <Path
        d="M21.983 22.213l-1.647 2.347-2.356-.014 4.013-2.324zM24.307 12.267c-2.542.138-5.73 3.173-4.385 6.918l.199.643c-.33-3.489 2.127-7.116 4.186-7.561zM17.863 37.625c-3.984 2.305-5.117 6.14-5.117 6.14-.01 0-.548-4.175 3.956-6.654s4.822-6.15 5.86-8.893c-.636 3.704-.715 7.102-4.699 9.407z"
        fill={chessboardColors.blackLightAccent}
        opacity={1.0}
      />
    </Svg>
  );
}

export default SvgComponent;
