import { Hono } from "hono";
import {
  getDrizzleClient,
  getSupabase,
  supabaseMiddleware,
} from "./middleware/auth.middleware";
import { Bindings } from "./bindings";

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", supabaseMiddleware());

app.get("/users", async (c) => {
  const supabase = getSupabase(c);
  const { data, error } = await supabase.from("users").select(`
   id,
   email
   `);

  return c.json(data);
});

app.get("/users/drizzle", async (c) => {
  const db = getDrizzleClient(c);
  const result = await db.query.users.findMany({
    with: {
      posts: true,
    },
  });

  return c.json(result);
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
  console.log(c.env.SUPABASE_URL);
  return c.json({
    message: "Hello world!",
  });
});

export default app;
