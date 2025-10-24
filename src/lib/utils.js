import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const normalizeRuta = (ruta) =>
  ruta && (ruta.startsWith("archivos/") || ruta.startsWith("/archivos/"))
    ? `/media/${ruta.replace(/^\//, "")}`
    : ruta;
