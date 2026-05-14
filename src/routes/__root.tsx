import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { AppLayout } from "../components/layout/AppLayout";
import React from "react";

import { useApp } from "../context/AppContext";

interface AppContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export const Route = createRootRouteWithContext<AppContextType>()({
  component: () => {
    const { isDark, toggleTheme, user, authLoading, loginWithGoogle, logout } = useApp();

    return (
      <AppLayout
        isDark={isDark}
        toggleTheme={toggleTheme}
        user={user}
        authLoading={authLoading}
        onLogin={loginWithGoogle}
        onLogout={() => void logout()}
      >
        <div className="flex-1 flex flex-col">
          <Outlet />
        </div>
      </AppLayout>
    );
  },
});
