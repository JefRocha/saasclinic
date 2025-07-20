import { db } from "@/db";
import { permissionsTable } from "@/db/schema";

// Lista de permissões iniciais
const defaultPermissions = [
  { id: "create_user", name: "Criar usuário" },
  { id: "edit_user", name: "Editar usuário" },
  { id: "delete_user", name: "Excluir usuário" },
  { id: "view_dashboard", name: "Visualizar dashboard" },
  { id: "manage_appointments", name: "Gerenciar agendamentos" },
  { id: "create_patient", name: "Criar paciente" },
  { id: "edit_patient", name: "Editar paciente" },
  { id: "delete_patient", name: "Excluir paciente" },
  { id: "view_finances", name: "Visualizar financeiro" },
];

async function run() {
  try {
    const inserted = await db.insert(permissionsTable).values(defaultPermissions).onConflictDoNothing();
    console.log("✅ Permissões inseridas com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao inserir permissões:", error);
    process.exit(1);
  }
}

run();
