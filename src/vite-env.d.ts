/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin of the Finora API including the version prefix. Public value — see .env.example. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
