import type { APIRoute } from 'astro';
import { DatabaseService, type Env } from '../../lib/db';

export const GET: APIRoute = async ({ locals, url }) => {
  const env = locals.runtime.env as Env;
  const db = new DatabaseService(env.DB);
  
  try {
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const transactions = await db.getTransactions(limit);
    return new Response(JSON.stringify(transactions), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch transactions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};