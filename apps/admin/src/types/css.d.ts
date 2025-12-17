// CSS type declarations for Next.js
declare module '*.css' {
  const content: any;
  export default content;
}

declare module '*.scss' {
  const content: any;
  export default content;
}

declare module '*.sass' {
  const content: any;
  export default content;
}

declare module '*.less' {
  const content: any;
  export default content;
}

// Specific global CSS file
declare module './globals.css';
declare module '../globals.css';
declare module '../../globals.css';