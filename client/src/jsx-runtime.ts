// This file provides custom JSX runtime for React
import * as React from 'react';

export const Fragment = React.Fragment;
export const jsx = React.createElement;
export const jsxs = React.createElement;
export const jsxDEV = React.createElement;

// Export all React utilities for direct use
export default React;