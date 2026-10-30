import { createRoot } from "react-dom/client";
import { StoryExample } from "./StoryExample";
import "../../packages/core/src/site.css";
import "./story.css";

const root = document.getElementById("root");
if (!root) throw new Error("Story sample root is missing");
createRoot(root).render(<StoryExample />);
