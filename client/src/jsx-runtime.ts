/**
 * Simple JSX Runtime declaration
 * 
 * This file provides the JSX runtime functions for the React compiler.
 * It's intentionally simple to avoid transformation errors.
 */
import * as React from 'react';

export { Fragment } from 'react';
export { jsx, jsxs } from 'react/jsx-runtime';
export { jsxDEV } from 'react/jsx-dev-runtime';