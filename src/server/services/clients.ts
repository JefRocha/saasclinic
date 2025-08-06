import { db } from '@/lib/drizzle'
import { clientsTable } from '@/models/schema'
import { eq } from 'drizzle-orm'

export async function createClient(data) {
  const [row] = await db.insert(clientsTable).values(data).returning()
  return row
}
export async function listClients() {
  return db.select().from(clientsTable)
}
export async function getClient(id: string) {
  return db.query.clients.findFirst({ where: eq(clientsTable.id, id) })
}
export async function updateClient(id: string, data) {
  const [row] = await db.update(clientsTable)
    .set(data)
    .where(eq(clientsTable.id, id))
    .returning()
  return row
}
export async function deleteClient(id: string) {
  await db.delete(clientsTable).where(eq(clientsTable.id, id))
}
