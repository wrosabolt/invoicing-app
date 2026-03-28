import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.PG_URL });

export { pool };

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
    `SELECT
      i.id,
      i.invoice_number AS "invoiceNumber",
      i.client_id AS "clientId",
      c.name AS "clientName",
      c.company AS "clientCompany",
      c.address AS "clientAddress",
      c.email AS "clientEmail",
      c.phone AS "clientPhone",
      i.items,
      i.subtotal::float AS subtotal,
      i.gst_rate::float AS "gstRate",
      i.gst_amount::float AS "gstAmount",
      i.total::float AS total,
      i.status,
      i.paid,
      i.due_date AS "dueDate",
      i.start_date AS "startDate",
      i.end_date AS "endDate",
      i.created_at AS "createdAt"
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    WHERE i.user_id = $1
    ORDER BY i.created_at DESC`,
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
     subtotal, gst_rate, gst_amount, total, status, paid, due_date, start_date, end_date, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
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
      invoice.dueDate || null,
      invoice.startDate || null,
      invoice.endDate || null,
    ]
  );
  return result.rows[0];
}

export async function updateInvoice(id: string, userId: string, updates: any) {
  const result = await query(
    `UPDATE invoices SET
     client_id = $1, items = $2, subtotal = $3, gst_rate = $4,
     gst_amount = $5, total = $6, status = $7, paid = $8, due_date = $9,
     start_date = $10, end_date = $11
     WHERE id = $12 AND user_id = $13
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
      updates.startDate || null,
      updates.endDate || null,
      id,
      userId
    ]
  );
  return result.rows[0];
}

export async function deleteInvoice(id: string, userId: string) {
  await query('DELETE FROM invoices WHERE id = $1 AND user_id = $2', [id, userId]);
}

export async function getLastInvoiceForClient(userId: string, clientId: string) {
  const result = await query(
    `SELECT i.items, i.gst_rate::float AS "gstRate"
     FROM invoices i
     WHERE i.user_id = $1 AND i.client_id = $2
     ORDER BY i.created_at DESC LIMIT 1`,
    [userId, clientId]
  );
  return result.rows[0] || null;
}

export async function getNextInvoiceNumber(userId: string): Promise<string> {
  const result = await query(
    `SELECT u.invoice_start_number + COUNT(i.id) AS next_num
     FROM users u
     LEFT JOIN invoices i ON i.user_id = u.id
     WHERE u.id = $1
     GROUP BY u.invoice_start_number`,
    [userId]
  );
  return String(result.rows[0]?.next_num ?? 1);
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
