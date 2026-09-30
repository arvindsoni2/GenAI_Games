/**
 * Minimal client-side router.
 *
 * The spec asks for two routes and nothing more, so this is a popstate
 * listener rather than a routing dependency. It stays this small until a third
 * route or real nested routing actually arrives.
 */

export type Route =
  | { name: "home" }
  | { name: "game"; slug: string }
  | { name: "notFound"; path: string };

export const GAME_SLUG = "theme-park-backpack";

export function matchRoute(pathname: string): Route {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (path === "/") return { name: "home" };
  if (path === `/games/${GAME_SLUG}`) return { name: "game", slug: GAME_SLUG };

  return { name: "notFound", path };
}

export function navigate(path: string): void {
  if (window.location.pathname === path) return;
  window.history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
