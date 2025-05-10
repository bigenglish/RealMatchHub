// This file provides custom JSX runtime for React
import * as React from 'react';

// JSX runtime exports
export const Fragment = React.Fragment;
export const jsx = React.createElement;
export const jsxs = React.createElement;
export const jsxDEV = React.createElement;

// Export individual React components and hooks
export const useState = React.useState;
export const useEffect = React.useEffect;
export const useContext = React.useContext;
export const useReducer = React.useReducer;
export const useCallback = React.useCallback;
export const useMemo = React.useMemo;
export const useRef = React.useRef;
export const useImperativeHandle = React.useImperativeHandle;
export const useLayoutEffect = React.useLayoutEffect;
export const useDebugValue = React.useDebugValue;

// No default export - named exports only