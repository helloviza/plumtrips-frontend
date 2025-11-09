// vite-fix.d.ts
// Temporary shims for Vite type errors (WebAssembly, SharedWorker, WebSocket)

declare namespace WebAssembly {
  interface Imports { [key: string]: any }
  interface Instance { exports: any }
}

interface SharedWorker {} // minimal stub
interface WebSocket {}    // minimal stub
