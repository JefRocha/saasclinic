import { Ability, AbilityBuilder } from '@casl/ability';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read   = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects = 'Client' | 'Organization' | 'all';
export type AppAbility = Ability<[Action, Subjects]>;

/* recebe `orgId` para saber qual org pertence ao usuário */
export function buildAbility(role?: string, orgId?: string): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(Ability);

  switch (role) {
    case 'super_admin':
      can(Action.Manage, 'all');                 // tudo, inclusive Organization
      break;

    case 'admin':
      // tudo da própria org
      can(Action.Manage,   'Client',       { organizationId: orgId });
      can(Action.Read,     'Organization', { id: orgId });
      can(Action.Update,   'Organization', { id: orgId });
      // (se quiser permitir deletar a org própria, acrescente Delete)
      break;

    case 'editor':
      can(Action.Read,     'Client', { organizationId: orgId });
      can(Action.Create,   'Client', { organizationId: orgId });
      can(Action.Update,   'Client', { organizationId: orgId });
      break;

    default: // viewer
      can(Action.Read,     'Client', { organizationId: orgId });
  }

  return build();
}
