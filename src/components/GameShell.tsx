import type { ReactNode } from "react";

/**
 * Page frame for a game. Owns layout only.
 *
 * Explicitly holds no scoring logic (spec section 30) - it receives finished
 * numbers from callers and never derives them.
 */
export function GameShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="shell">
      <header className="shell__header">
        <h1 className="shell__title">{title}</h1>
        {subtitle ? <p className="shell__subtitle">{subtitle}</p> : null}
      </header>
      <main className="shell__main">{children}</main>
    </div>
  );
}
