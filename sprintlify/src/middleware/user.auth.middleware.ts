// middlewares/auth.middleware.ts
import { Context, Next } from "hono";
import { verify } from "hono/jwt";

const JWT_SECRET = process.env.JWT_SECRET!;

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verify(token, JWT_SECRET);
    c.set("user", payload); // attach user to context for use in controllers
    await next();
  } catch (err) {
    return c.json({ message: "Invalid or expired token" }, 401);
  }
};

// optional — restrict to admins only
export const adminMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");
  if (user.role !== "admin") {
    return c.json({ message: "Forbidden" }, 403);
  }
  await next();
};
