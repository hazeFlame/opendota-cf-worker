import { Hono } from "hono";
import { handleGoogleCallback, handleGoogleStart, handleLogout, handleMe } from "../auth";
import { type AppBindings } from "../types";

export const authRoutes = new Hono<AppBindings>();

authRoutes.get("/me", handleMe);
authRoutes.get("/google", handleGoogleStart);
authRoutes.get("/google/callback", handleGoogleCallback);
authRoutes.post("/logout", handleLogout);
