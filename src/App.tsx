import React from "react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { AppProvider } from "./context/AppContext";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create the router instance
const router = createRouter({ 
  routeTree,
  context: {
    isDark: true, // Default values, will be overridden by context hook in routes
    toggleTheme: () => {},
  }
});

// Register types for the router
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
