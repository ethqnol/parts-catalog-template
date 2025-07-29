export interface Env {
  DB: D1Database;
}

export interface PartType {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Part {
  id: number;
  part_type_id: number;
  current_count: number;
  created_at: string;
  part_type?: PartType;
}

export interface Transaction {
  id: number;
  part_id: number;
  transaction_type: 'add' | 'remove';
  quantity: number;
  user_name: string;
  reason?: string;
  description?: string;
  created_at: string;
}

export class DatabaseService {
  constructor(private db: D1Database) {}

  async getPartTypes(): Promise<PartType[]> {
    const result = await this.db.prepare('SELECT * FROM part_types ORDER BY name').all();
    return result.results as PartType[];
  }

  async createPartType(name: string, description?: string): Promise<PartType> {
    const result = await this.db.prepare(
      'INSERT INTO part_types (name, description) VALUES (?, ?) RETURNING *'
    ).bind(name, description || null).first();
    
    // Create a corresponding part with 0 count
    await this.db.prepare(
      'INSERT INTO parts (part_type_id) VALUES (?)'
    ).bind(result.id).run();
    
    return result as PartType;
  }

  async getParts(): Promise<(Part & { part_type: PartType })[]> {
    const result = await this.db.prepare(`
      SELECT 
        p.*,
        pt.name as part_type_name,
        pt.description as part_type_description
      FROM parts p 
      JOIN part_types pt ON p.part_type_id = pt.id 
      ORDER BY pt.name
    `).all();
    
    return result.results.map((row: any) => ({
      id: row.id,
      part_type_id: row.part_type_id,
      current_count: row.current_count,
      created_at: row.created_at,
      part_type: {
        id: row.part_type_id,
        name: row.part_type_name,
        description: row.part_type_description,
        created_at: row.created_at
      }
    }));
  }

  async addParts(partId: number, quantity: number, userName: string, description?: string): Promise<void> {
    await this.db.batch([
      this.db.prepare('UPDATE parts SET current_count = current_count + ? WHERE id = ?').bind(quantity, partId),
      this.db.prepare(
        'INSERT INTO transactions (part_id, transaction_type, quantity, user_name, description) VALUES (?, ?, ?, ?, ?)'
      ).bind(partId, 'add', quantity, userName, description || null)
    ]);
  }

  async removeParts(partId: number, quantity: number, userName: string, reason: string, description?: string): Promise<void> {
    // Check if we have enough parts
    const part = await this.db.prepare('SELECT current_count FROM parts WHERE id = ?').bind(partId).first() as { current_count: number };
    
    if (!part || part.current_count < quantity) {
      throw new Error('Insufficient parts in inventory');
    }

    await this.db.batch([
      this.db.prepare('UPDATE parts SET current_count = current_count - ? WHERE id = ?').bind(quantity, partId),
      this.db.prepare(
        'INSERT INTO transactions (part_id, transaction_type, quantity, user_name, reason, description) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(partId, 'remove', quantity, userName, reason, description || null)
    ]);
  }

  async getTransactions(limit = 50): Promise<(Transaction & { part_type_name: string })[]> {
    const result = await this.db.prepare(`
      SELECT 
        t.*,
        pt.name as part_type_name
      FROM transactions t
      JOIN parts p ON t.part_id = p.id
      JOIN part_types pt ON p.part_type_id = pt.id
      ORDER BY t.created_at DESC
      LIMIT ?
    `).bind(limit).all();
    
    return result.results as (Transaction & { part_type_name: string })[];
  }

  async deletePartType(partTypeId: number): Promise<void> {
    // First, check if there are any transactions for parts of this type
    const transactionCheck = await this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM transactions t
      JOIN parts p ON t.part_id = p.id
      WHERE p.part_type_id = ?
    `).bind(partTypeId).first() as { count: number };

    if (transactionCheck.count > 0) {
      throw new Error('Cannot delete part type with existing transactions');
    }

    // Check if there are any parts with current count > 0
    const inventoryCheck = await this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM parts
      WHERE part_type_id = ? AND current_count > 0
    `).bind(partTypeId).first() as { count: number };

    if (inventoryCheck.count > 0) {
      throw new Error('Cannot delete part type with current inventory');
    }

    // Delete the parts and part type
    await this.db.batch([
      this.db.prepare('DELETE FROM parts WHERE part_type_id = ?').bind(partTypeId),
      this.db.prepare('DELETE FROM part_types WHERE id = ?').bind(partTypeId)
    ]);
  }
}