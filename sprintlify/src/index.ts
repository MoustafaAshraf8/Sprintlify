import { Hono } from "hono";
import { getSupabase, supabaseMiddleware } from "./middleware/auth.middleware";

const app = new Hono();

app.use("*", supabaseMiddleware());

app.get("/users", async (c) => {
  const supabase = getSupabase(c);
  const { data, error } = await supabase.from("users").select(`
   id,
   email
   `);

  return c.json(data);
});

app.post("/users", async (c) => {
  const supabase = getSupabase(c);
  const body = await c.req.json();

  const { data, error } = await supabase
    .from("users")
    .insert(body.users)
    .select();

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json({ data }, 201);
});

app.get("/posts", (c) => {
  return c.json({
    message: "Hello world!",
  });
});

export default app;
