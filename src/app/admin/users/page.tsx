import RoleSelect from "@/blocks/RoleSelect";
import { requireAdmin } from "@/server/auth/queries";
import { setUserRole } from "@/server/users/actions";
import { getUsers } from "@/server/users/queries";
import { dateTimeFormatter } from "@/utils/date";
import clsx from "clsx";

export default async function UsersPage() {
  await requireAdmin();
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
              <th scope="col">Rôle</th>
              <th scope="col">Statut</th>
              <th scope="col">Création</th>
            </tr>
          </thead>

          {/* Corps du tableau */}
          <tbody>
            {allUsers.map((user) => (
              <tr key={user.id}>
                {/* Nom */}
                <td className="font-bold">{user.name}</td>

                {/* E-mail */}
                <td className="text-foreground-secondary">{user.email}</td>

                {/* Rôle */}
                <td>
                  <RoleSelect
                    action={setUserRole.bind(null, user.id)} // Sans rôle, Better Auth applique le rôle par défaut : `author`
                    userRole={user.role ?? "author"} // Recrée le composant quand le rôle enregistré change, pour qu'il reparte du nouveau rôle
                    key={user.role}
                  />
                </td>

                {/* Statut */}
                <td>
                  <span
                    className={clsx(
                      "rounded-full px-2 py-0.5 text-xs",
                      user.banned
                        ? "bg-red-600/15 text-red-600"
                        : "bg-green-600/15 text-green-600",
                    )}
                  >
                    {user.banned ? "Désactivé" : "Actif"}
                  </span>
                </td>

                {/* Date de création */}
                <td className="text-foreground-secondary">
                  <time dateTime={user.createdAt.toISOString()}>
                    {dateTimeFormatter.format(user.createdAt)}
                  </time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
