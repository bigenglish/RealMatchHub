/**
 * Simple JSX Runtime declaration
 * 
 * This file provides the JSX runtime functions for the React compiler.
 * It's intentionally simple to avoid transformation errors.
 */
import * as React from 'react';

export const Fragment = React.Fragment;
export const jsx = React.createElement;
export const jsxs = React.createElement;
export const jsxDEV = React.createElement;