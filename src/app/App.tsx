import { useEffect, useState } from "react";
import { GameShell } from "../components/GameShell";
import { Button } from "../components/Button";
import { ThemeParkGame } from "../games/theme-park-backpack/ThemeParkGame";
import { gameConfig } from "../games/theme-park-backpack/game.config";
import { GAME_SLUG, matchRoute, navigate, type Route } from "./routes";

function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => matchRoute(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setRoute(matchRoute(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return route;
}

function Home() {
  return (
    <GameShell title="AI learning games" subtitle="Learn by playing, not by reading.">
      <ul className="game-list">
        <li className="game-list__item">
          <h2 className="game-list__title">{gameConfig.title}</h2>
          <p className="game-list__blurb">
            One backpack, limited space, five short levels. You will meet the idea behind AI
            context windows without being told what a context window is.
          </p>
          <Button variant="primary" onClick={() => navigate(`/games/${GAME_SLUG}`)}>
            Play
          </Button>
        </li>
      </ul>
    </GameShell>
  );
}

export function App() {
  const route = useRoute();

  if (route.name === "home") return <Home />;

  if (route.name === "game") {
    return (
      <GameShell
        title={gameConfig.title}
        subtitle={
          <button type="button" className="link" onClick={() => navigate("/")}>
            ← All games
          </button>
        }
      >
        <ThemeParkGame />
      </GameShell>
    );
  }

  return (
    <GameShell title="Not found">
      <p>
        No page at <code>{route.path}</code>.
      </p>
      <Button onClick={() => navigate("/")}>Back to games</Button>
    </GameShell>
  );
}
