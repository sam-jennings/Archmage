// Side-effect module: must be imported BEFORE any prototype module that
// references window.React / window.ReactDOM. ESM hoists all imports, so
// running the assignment inside an imported file (rather than in main.jsx
// body) is the only way to guarantee it executes first.
import React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';

globalThis.React = React;
// UMD react-dom exposes both legacy + createRoot; npm splits them.
globalThis.ReactDOM = { ...ReactDOM, ...ReactDOMClient };
