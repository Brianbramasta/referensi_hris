/// <reference path="../.astro/types.d.ts" />

export {};

declare global {
  interface Window {
    lucide?: {
      createIcons: () => void;
    };
  }
}