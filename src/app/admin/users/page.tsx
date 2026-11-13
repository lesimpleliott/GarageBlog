import RoleSelect from "@/blocks/RoleSelect";
import Tooltip from "@/components/Tooltip";
import { requireAdmin } from "@/server/auth/queries";
import { disableUser, enableUser, setUserRole } from "@/server/users/actions";
import { getUsers } from "@/server/users/queries";
import { dateTimeFormatter } from "@/utils/date";
import { isRole, ROLE_LABELS } from "@/utils/roles";
import clsx from "clsx";

export default async function UsersPage() {
  const session = await requireAdmin();
  const allUsers = await getUsers();

  return (
    <>
      <h1>Comptes</h1>

      {/* TABLEAU */}
      <div className="mt-4">
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
            </tr>
          </thead>

          {/* Corps du tableau */}
          <tbody>
            {allUsers.map((user) => {
              const isCurrentUser = session.user.id === user.id;

              const pillsClasses = clsx(
                "rounded-full px-2 py-0.5 text-xs",
                user.banned
                  ? "border border-red-600/50 bg-red-600/15 text-red-600 hover:bg-red-600/25"
                  : "border border-green-600/50 bg-green-600/15 text-green-600 hover:bg-green-600/25",
              );

              // Texte visible de la pastille, repris au début de l'`aria-label` du bouton
              const statusLabel = user.banned ? "Désactivé" : "Actif";

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
                        <span
                          className={clsx(
                            "cursor-not-allowed opacity-50",
                            pillsClasses,
                          )}
                        >
                          {statusLabel}
                        </span>
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
                          // Annonce l'état puis l'action du clic, qui est l'inverse de l'état
                          aria-label={`${statusLabel} : ${user.banned ? "réactiver" : "désactiver"} le compte de ${user.name}`}
                          className={clsx(
                            "cursor-pointer transition-all hover:scale-107",
                            pillsClasses,
                          )}
                        >
                          {statusLabel}
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
