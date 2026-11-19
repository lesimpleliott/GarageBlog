import DeleteUserButton from "@/blocks/users/DeleteUserButton";
import InviteUserForm from "@/blocks/users/InviteUserForm";
import RoleSelect from "@/blocks/users/RoleSelect";
import SendAccessLinkButton from "@/blocks/users/SendAccessLinkButton";
import { Pill } from "@/components/Pill";
import Tooltip from "@/components/Tooltip";
import { requireAdmin } from "@/server/auth/queries";
import { disableUser, enableUser, setUserRole } from "@/server/users/actions";
import { getUserIdsWithPassword, getUsers } from "@/server/users/queries";
import { dateTimeFormatter } from "@/utils/date";
import { isRole, ROLE_LABELS } from "@/utils/userRoles";
import { getUserStatus, USER_STATUS } from "@/utils/userStatus";

export default async function UsersPage() {
  const session = await requireAdmin();
  const [allUsers, usersWithPassword] = await Promise.all([
    getUsers(),
    getUserIdsWithPassword(),
  ]); // Évite d'avoir 2 `await` à la suite pour `getUsers` et `getUserIdsWithPassword`

  return (
    <>
      <h1>Comptes</h1>

      {/* CREATION NOUVEAU */}
      <section className="mt-4">
        <h2 className="mb-2 text-foreground-secondary">
          Créer un nouvel utilisateur
        </h2>

        <InviteUserForm />
      </section>

      {/* TABLEAU */}
      <section className="mt-4">
        <h2 className="mb-2 text-foreground-secondary">
          Les comptes utilisateurs
        </h2>
        <table className="data-table">
          {/* En-tête des colonnes */}
          <thead>
            <tr>
              <th scope="col">Nom</th>
              <th scope="col">E-mail</th>
              <th scope="col" className="text-center">
                Rôle
              </th>
              <th scope="col" className="text-center">
                Statut
              </th>
              <th scope="col">Création</th>
              <th scope="col" className="text-center">
                Actions
              </th>
            </tr>
          </thead>

          {/* Corps du tableau */}
          <tbody>
            {allUsers.map((user) => {
              const isCurrentUser = session.user.id === user.id;

              const statusKey = getUserStatus(
                user.banned ?? false,
                usersWithPassword.has(user.id),
              );
              const status = USER_STATUS[statusKey];

              return (
                <tr key={user.id}>
                  {/* Nom */}
                  <td className="font-bold">
                    {user.name}{" "}
                    {isCurrentUser && (
                      <span className="text-xs font-light text-foreground-secondary italic">
                        (moi)
                      </span>
                    )}
                  </td>

                  {/* E-mail */}
                  <td className="text-foreground-secondary">{user.email}</td>

                  {/* Rôle */}
                  <td className="text-center">
                    {isCurrentUser ? (
                      <Tooltip
                        content="Impossible de modifier son propre rôle"
                        position="right"
                      >
                        <span className="cursor-not-allowed text-foreground-secondary italic">
                          {isRole(user.role)
                            ? ROLE_LABELS[user.role]
                            : user.role}
                        </span>
                      </Tooltip>
                    ) : (
                      <RoleSelect
                        key={user.role} // Recrée le composant quand le rôle enregistré change, pour qu'il reparte du nouveau rôle
                        userRole={user.role ?? "author"} // Sans rôle, Better Auth applique le rôle par défaut : `author`
                        userName={user.name}
                        action={setUserRole.bind(null, user.id)} // Définit le rôle avec l'id du compte fixé d'avance.
                      />
                    )}
                  </td>

                  {/* Statut */}
                  <td className="text-center">
                    {isCurrentUser ? (
                      <Tooltip
                        content="Impossible de modifier son propre statut"
                        position="right"
                      >
                        <Pill text={status.label} tone={status.tone} disabled />
                      </Tooltip>
                    ) : (
                      <form
                        action={
                          user.banned
                            ? enableUser.bind(null, user.id)
                            : disableUser.bind(null, user.id)
                        }
                      >
                        <button
                          type="submit"
                          aria-label={`${status.label} : ${user.banned ? "réactiver" : "désactiver"} le compte de ${user.name}`}
                          className="cursor-pointer transition-all hover:scale-108"
                        >
                          <Pill text={status.label} tone={status.tone} />
                        </button>
                      </form>
                    )}
                  </td>

                  {/* Date de création */}
                  <td className="text-foreground-secondary">
                    <time dateTime={user.createdAt.toISOString()}>
                      {dateTimeFormatter.format(user.createdAt)}
                    </time>
                  </td>

                  {/* Actions */}
                  <td className="text-center text-foreground-secondary">
                    {isCurrentUser ? (
                      <p className="cursor-not-allowed italic">N/A</p>
                    ) : (
                      <div className="flex justify-center gap-2">
                        <SendAccessLinkButton
                          userName={user.name}
                          userId={user.id}
                          status={statusKey}
                        />
                        <DeleteUserButton
                          userId={user.id}
                          userName={user.name}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}
