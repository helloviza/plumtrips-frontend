// src/lib/emailTemplateRenderer.ts
//
// Minimal mustache-ish renderer — just enough to fill the two email
// templates (flight confirmation + tax invoice). Not a general-purpose
// templating engine on purpose: keeps zero deps, easy to audit.
//
// Supports:
//   {{key}}                simple substitution (dotted paths OK: {{a.b}})
//   {{#each items}} ... {{/each}}   with {{this.prop}} inside the block

type TemplateData = Record<string, unknown>;

function getValue(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((acc, part) => {
      if (acc == null || typeof acc !== "object") return undefined;
      return (acc as Record<string, unknown>)[part];
    }, obj);
}

function toDisplayString(value: unknown): string {
  if (value === undefined || value === null) return "";
  return String(value);
}

/**
 * Fills {{#each}} blocks first (so their {{this.x}} tokens aren't
 * accidentally swallowed by the plain {{x}} pass), then fills every
 * remaining {{token}}.
 */
export function renderTemplate(template: string, data: TemplateData): string {
  let output = template;

  // 1. {{#each arrayKey}} ... {{/each}}
  output = output.replace(
    /{{#each\s+([\w.]+)\s*}}([\s\S]*?){{\/each}}/g,
    (_match, key: string, block: string) => {
      const arr = getValue(data, key);
      if (!Array.isArray(arr)) return "";
      return arr
        .map((item) =>
          block.replace(/{{this\.([\w]+)}}/g, (_m, prop: string) =>
            toDisplayString((item as Record<string, unknown>)?.[prop])
          )
        )
        .join("");
    }
  );

  // 2. plain {{key}} / {{key.nested}}
  output = output.replace(/{{\s*([\w.]+)\s*}}/g, (_match, key: string) =>
    toDisplayString(getValue(data, key))
  );

  return output;
}

/**
 * Templates reference images as "./assets/foo.png" which only resolves
 * correctly on disk — email clients need an absolute, publicly reachable
 * URL. Call this on the raw template BEFORE renderTemplate (or after,
 * order doesn't matter since it's a distinct pattern).
 */
export function absolutizeAssetPaths(template: string, assetBaseUrl: string): string {
  const base = assetBaseUrl.replace(/\/$/, "");
  return template.replace(/\.\/assets\//g, `${base}/assets/`);
}