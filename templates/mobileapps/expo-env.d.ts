/// <reference types="expo" />
/// <reference types="expo-router" />

declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.jpeg' {
  const value: any;
  export default value;
}

declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.ttf' {
  const value: any;
  export default value;
}

declare module '*.woff' {
  const value: any;
  export default value;
}

declare module '*.woff2' {
  const value: any;
  export default value;
}