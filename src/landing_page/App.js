import React from "react";
import Index from "./pages/index";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
const GlobalStyles = createGlobalStyle`
    .landing-page {
        margin: 0;
        padding: 0;
        font-family: sans-serif;
      color: black !important;
    }
`;
export default (props => /*#__PURE__*/React.createElement(Router, null, /*#__PURE__*/React.createElement(GlobalStyles, null), /*#__PURE__*/React.createElement(Switch, null, /*#__PURE__*/React.createElement(Route, {
  component: () => /*#__PURE__*/React.createElement(Index, props)
}))));