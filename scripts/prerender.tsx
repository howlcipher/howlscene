import { renderToStaticMarkup } from "react-dom/server";
import { Landing } from "../apps/showcase/Landing";
import { Example } from "../examples/william_elias/Example";
/** Shared page components supply both browser and static production semantics. */
export function renderLanding(): string {
  return renderToStaticMarkup(<Landing />);
}
export function renderExample(): string {
  return renderToStaticMarkup(<Example />);
}
export function injectRoot(shell: string, content: string): string {
  const marker = '<div id="root"></div>';
  if (shell.split(marker).length !== 2)
    throw new Error(
      "Expected exactly one empty application root in the production HTML.",
    );
  return shell.replace(marker, () => `<div id="root">${content}</div>`);
}
