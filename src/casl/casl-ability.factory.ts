// src/casl/casl-ability.factory.ts
import { AbilityBuilder, Ability } from '@casl/ability'
import { Role } from '@/auth/roles.enum'

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read   = 'read',
  Update = 'update',
  Delete = 'delete',
}

type Subjects = 'Client' | 'ExameCli' | 'all'          // 🔸 Strings, não classes
export type AppAbility = Ability<[Action, Subjects]>

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: Clerk.User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(Ability)

    switch (user.publicMetadata.role as Role) {
      case Role.Admin:
        can(Action.Manage, 'all')
        break

      case Role.Editor:
        can(Action.Read,   'Client')
        can(Action.Create, 'Client')
        can(Action.Update, 'Client')
        cannot(Action.Delete, 'Client')
        break

      default:                          // Viewer
        can(Action.Read, 'Client')
    }

    return build()
  }
}
