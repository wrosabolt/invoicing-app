import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.PG_URL });

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function getInvoices(userId: string) {
  const result = await query(
    'SELECT * FROM invoices WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

export async function getInvoice(id: string, userId: string) {
  const result = await query(
    'SELECT * FROM invoices WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0];
}

export async function createInvoice(invoice: any) {
  const result = await query(
    `INSERT INTO invoices (id, user_id, client_id, invoice_number, items, 
     subtotal, gst_rate, gst_amount, total, status, paid, due_date, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
     RETURNING *`,
    [
      invoice.id,
      invoice.userId,
      invoice.clientId,
      invoice.invoiceNumber,
      JSON.stringify(invoice.items),
      invoice.subtotal,
      invoice.gstRate,
      invoice.gstAmount,
      invoice.total,
      invoice.status || 'draft',
      invoice.paid || false,
      invoice.dueDate || null
    ]
  );
  return result.rows[0];
}

export async function updateInvoice(id: string, userId: string, updates: any) {
  const result = await query(
    `UPDATE invoices SET 
     client_id = $1, items = $2, subtotal = $3, gst_rate = $4, 
     gst_amount = $5, total = $6, status = $7, paid = $8, due_date = $9
     WHERE id = $10 AND user_id = $11
     RETURNING *`,
    [
      updates.clientId,
      JSON.stringify(updates.items),
      updates.subtotal,
      updates.gstRate,
      updates.gstAmount,
      updates.total,
      updates.status,
      updates.paid,
      updates.dueDate,
      id,
      userId
    ]
  );
  return result.rows[0];
}

export async function deleteInvoice(id: string, userId: string) {
  await query('DELETE FROM invoices WHERE id = $1 AND user_id = $2', [id, userId]);
}

export async function getClients(userId: string) {
  const result = await query(
    'SELECT * FROM clients WHERE user_id = $1 ORDER BY name',
    [userId]
  );
  return result.rows;
}

export async function createClient(client: any) {
  const result = await query(
    `INSERT INTO clients (id, user_id, name, company, email, phone, address, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING *`,
    [client.id, client.userId, client.name, client.company, client.email, client.phone, client.address]
  );
  return result.rows[0];
}
