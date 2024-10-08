/// <reference types="node" />
/// <reference types="chrome" />
/// <reference types="./js-frameworks.d.ts" />
/// <reference path="./css-content.d.ts" />
/// <reference path="./css-modules.d.ts" />
/// <reference path="./images.d.ts" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly EXTENSION_ENV: 'development' | 'production' | 'test' | 'debug'
  }
}
