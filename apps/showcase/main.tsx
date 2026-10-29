import { createRoot } from "react-dom/client";
import { Landing } from "./Landing";
import "./styles.css";
const root = document.getElementById("root");
if (!root) throw new Error("Landing root is missing");
createRoot(root).render(<Landing />);
