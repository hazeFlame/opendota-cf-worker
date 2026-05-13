import { createRootRouteWithContext, Outlet, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { AppLayout } from "../components/layout/AppLayout";
import React from "react";

import { useApp } from "../context/AppContext";

interface AppContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export const Route = createRootRouteWithContext<AppContextType>()({
  component: () => {
    const { isDark, toggleTheme } = useApp();
    const location = useLocation();

    return (
      <AppLayout isDark={isDark} toggleTheme={toggleTheme}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname?.split('/')[1] || 'root'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </AppLayout>
    );
  },
});
