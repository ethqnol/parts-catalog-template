import type { APIRoute } from 'astro';
import { DatabaseService, type Env } from '../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env as Env;
  const db = new DatabaseService(env.DB);
  
  try {
    const { partId, quantity, userName, description } = await request.json();
    
    if (!partId || !quantity || !userName) {
      return new Response(JSON.stringify({ error: 'Part ID, quantity, and user name are required' }), {
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
    
    await db.addParts(partId, quantity, userName, description);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to add parts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};