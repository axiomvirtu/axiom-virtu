/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare module 'next' {
  export interface Metadata {
    title?: string | { default?: string; template?: string };
    description?: string;
    viewport?: any;
    [key: string]: any;
  }
  export interface Viewport {
    width?: string | number;
    initialScale?: number;
    maximumScale?: number;
    userScalable?: boolean;
    themeColor?: string;
    [key: string]: any;
  }
  export interface NextConfig {
    [key: string]: any;
  }
}

declare module 'next/server' {
  export { NextRequest, NextResponse } from 'next/dist/server/web/exports/index';
}

declare module 'next/script' {
  import React from 'react';
  export interface ScriptProps extends React.ScriptHTMLAttributes<HTMLScriptElement> {
    strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload' | 'worker';
    src?: string;
  }
  export default function Script(props: ScriptProps): React.JSX.Element;
}
