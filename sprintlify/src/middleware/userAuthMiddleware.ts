// middleware/authMiddleware.ts
import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { AppContext } from "../types/AppContext";

export const userAuthMiddleware = async (
  c: Context<AppContext>,
  next: Next,
) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verify(token, c.env.JWT_SECRET, "HS256");
    c.set("user", {
      id: payload.id as string,
      securityLevel: payload.securityLevel as string,
    });
    await next();
  } catch {
    return c.json({ message: "Invalid or expired token" }, 401);
  }
};
