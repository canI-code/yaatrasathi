import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import App from "./App";

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#f0fdfa" },
          100: { value: "#ccfbf1" },
          200: { value: "#99f6e4" },
          300: { value: "#5eead4" },
          400: { value: "#2dd4bf" },
          500: { value: "#2A9D8F" },
          600: { value: "#238a7d" },
          700: { value: "#1c766b" },
          800: { value: "#155e56" },
          900: { value: "#0f4741" },
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
        card: { value: "20px" },
        button: { value: "12px" },
      },
    },
    semanticTokens: {
      colors: {
        "chakra-body-bg": { value: "#f9f1ec" },
        "chakra-body-text": { value: "#1B2A3B" },
      },
    },
  },
  globalCss: {
    body: {
      bg: "#f9f1ec",
      color: "#1B2A3B",
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
