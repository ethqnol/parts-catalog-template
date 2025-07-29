import type { APIRoute } from 'astro';
import { DatabaseService, type Env } from '../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env as Env;
  const db = new DatabaseService(env.DB);
  
  try {
    const parts = await db.getParts();
    return new Response(JSON.stringify(parts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch parts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};