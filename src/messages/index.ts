/**
 * Punt d'entrada dels textos.
 *
 * Ara només hi ha català. Quan s'afegeixi el castellà:
 *   1. crear `es.ts` tipat com `Messages`
 *   2. afegir-lo a `dictionaries`
 *   3. decidir com es tria l'idioma (ruta /es, cookie...) i passar-lo a `getMessages`
 */
import { ca, type Messages } from "./ca";

export type Locale = "ca";

const dictionaries: Record<Locale, Messages> = { ca };

export const DEFAULT_LOCALE: Locale = "ca";

export function getMessages(locale: Locale = DEFAULT_LOCALE): Messages {
  return dictionaries[locale];
}

/** Accés ràpid per al prototip (un sol idioma). */
export const t = getMessages();
