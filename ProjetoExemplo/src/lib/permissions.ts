import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  // Adicione aqui quaisquer recursos e ações personalizados que você tenha
  // Exemplo:
  // clinic: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
  // Permissões para a role 'USER'
  // Exemplo:
  // clinic: ["read"],
});

export const master = ac.newRole({
  // Permissões para a role 'MASTER'
  // Exemplo:
  // clinic: ["create", "read", "update", "delete"],
  ...adminAc.statements, // Inclui as permissões padrão de admin
});

export const superAdmin = ac.newRole({
  // Permissões para a role 'SUPER_ADMIN'
  // Exemplo:
  // clinic: ["create", "read", "update", "delete"],
  ...adminAc.statements, // Inclui as permissões padrão de admin
});

export const roles = {
  user,
  master,
  superAdmin,
};