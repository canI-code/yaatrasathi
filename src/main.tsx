import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import App from "./App";

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#fff0f0" },
          100: { value: "#ffd6d6" },
          200: { value: "#ffadad" },
          300: { value: "#ff8080" },
          400: { value: "#ff5252" },
          500: { value: "#2A9D8F" },
          600: { value: "#e63636" },
          700: { value: "#cc2424" },
          800: { value: "#991b1b" },
          900: { value: "#7f1d1d" },
        },
        accent: {
          500: { value: "#A4D8E1" },
        },
      },
      fonts: {
        heading: { value: "Inter, sans-serif" },
        body: { value: "Inter, sans-serif" },
      },
      radii: {
        card: { value: "16px" },
        button: { value: "12px" },
      },
    },
    semanticTokens: {
      colors: {
        "chakra-body-bg": { value: "#0d0d0f" },
        "chakra-body-text": { value: "#f0f0f0" },
      },
    },
  },
  globalCss: {
    body: {
      bg: "#0d0d0f",
      color: "#3D3C3A",
      fontFamily: "Inter, sans-serif",
    },
  },
});

const rootEl = document.getElementById("root");

if (!rootEl) {
  throw new Error("Root element not found");
}

createRoot(rootEl).render(
  <StrictMode>
    <ChakraProvider value={system}>
      <App />
    </ChakraProvider>
  </StrictMode>
);
