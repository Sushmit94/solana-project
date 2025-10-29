/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAILCHAIN_SECRET?: string;
  // add other env vars as needed later
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
