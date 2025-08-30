/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_NODE_ENV?: "development" | "production" | "test";
  // 🔑 add more VITE_ prefixed env vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
