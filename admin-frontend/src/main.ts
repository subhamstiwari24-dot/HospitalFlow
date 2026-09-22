import { createElement } from "react";
import { createRoot } from "react-dom/client";
import App from "./app";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(createElement(App));
} else {
  console.error("Root element #root not found");
}