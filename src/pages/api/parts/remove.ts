import type { APIRoute } from 'astro';
import { DatabaseService, type Env } from '../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env as Env;
  const db = new DatabaseService(env.DB);
  
  try {
    const { partId, quantity, userName, reason, description } = await request.json();
    
    if (!partId || !quantity || !userName || !reason) {
      return new Response(JSON.stringify({ error: 'Part ID, quantity, user name, and reason are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (quantity <= 0) {
      return new Response(JSON.stringify({ error: 'Quantity must be positive' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await db.removeParts(partId, quantity, userName, reason, description);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to remove parts';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};