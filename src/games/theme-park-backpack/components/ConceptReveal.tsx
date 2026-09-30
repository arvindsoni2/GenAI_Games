import type { AIReveal } from "../game.types";

/**
 * Metaphor -> AI concept mapping (spec sections 16, 17, 20).
 *
 * Intentionally reusable outside this game: the next game in the series will
 * need the same reveal surface. It takes data and renders it, nothing more.
 */
export function ConceptReveal({ reveal }: { reveal: AIReveal }) {
  return (
    <div className="reveal">
      <h3 className="reveal__title">{reveal.title}</h3>
      <p className="reveal__description">{reveal.description}</p>

      {reveal.mappings && reveal.mappings.length > 0 && (
        <table className="reveal__table">
          <caption className="visually-hidden">
            Theme park metaphor mapped to the equivalent AI concept
          </caption>
          <thead>
            <tr>
              <th scope="col">Theme park</th>
              <th scope="col">AI</th>
            </tr>
          </thead>
          <tbody>
            {reveal.mappings.map((mapping) => (
              <tr key={`${mapping.metaphor}-${mapping.aiConcept}`}>
                <th scope="row">{mapping.metaphor}</th>
                <td>{mapping.aiConcept}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
