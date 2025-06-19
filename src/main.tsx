import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import React, { useEffect } from "react";
import VisualEffects from "@/components/VisualEffects";

function Main() {
  return (
    <>
      <VisualEffects />
      <App />
    </>
  );
}

createRoot(document.getElementById("root")!).render(<Main />);
