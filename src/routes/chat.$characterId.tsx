import { createFileRoute } from "@tanstack/react-router";
import RoleChat from "./-components/chat/index";
import React from "react";
import { useApp } from "../context/AppContext";

export const Route = createFileRoute("/chat/$characterId")({
  component: ChatDetail,
});

function ChatDetail() {
  const { isDark, toggleTheme, characters, charactersLoading, refreshCharacters } = useApp();
  
  return (
    <RoleChat 
      isDark={isDark}
      toggleTheme={toggleTheme}
      characters={characters}
      loading={charactersLoading}
      onRefreshCharacters={refreshCharacters}
    />
  );
}
