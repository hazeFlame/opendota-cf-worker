import { createFileRoute } from "@tanstack/react-router";
import RoleChat from "./-components/chat/index";
import React from "react";
import { useApp } from "../context/AppContext";
import { AuthGate, LoginPrompt } from "./-components/AuthGate";

export const Route = createFileRoute("/chat/$characterId")({
  component: ChatDetail,
});

function ChatDetail() {
  const {
    isDark,
    toggleTheme,
    user,
    authLoading,
    loginWithGoogle,
    characters,
    charactersLoading,
    refreshCharacters
  } = useApp();

  if (!authLoading && !user) {
    return <LoginPrompt isDark={isDark} onLogin={loginWithGoogle} />;
  }
  
  return (
    <AuthGate authLoading={authLoading}>
      <RoleChat
        isDark={isDark}
        toggleTheme={toggleTheme}
        characters={characters}
        loading={charactersLoading}
        onRefreshCharacters={refreshCharacters}
      />
    </AuthGate>
  );
}
