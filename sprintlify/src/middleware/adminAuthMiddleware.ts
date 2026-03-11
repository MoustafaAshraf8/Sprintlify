// middleware/adminMiddleware.ts
import { Context, Next } from "hono";
import { AppContext } from "../types/AppContext";

export const adminAuthMiddleware = async (
  c: Context<AppContext>,
  next: Next,
) => {
  const user = c.get("user");

  if (!user || user.securityLevel !== "admin") {
    return c.json({ message: "Forbidden" }, 403);
  }

  await next();
};
