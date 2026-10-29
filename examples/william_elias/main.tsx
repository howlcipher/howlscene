import { createRoot } from "react-dom/client";
import { Example } from "./Example";
import "../../packages/core/src/site.css";
import "../../apps/showcase/styles.css";
const root = document.getElementById("root");
if (!root) throw new Error("Example root is missing");
createRoot(root).render(<Example />);
