import { requireSuperadmin } from "@/lib/auth";
import { NewUserForm } from "../new-user-form";

export default async function NewUserPage() {
  await requireSuperadmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-forest-900">Nuevo usuario</h1>
        <p className="text-sm text-stone-500">Crea una cuenta para tu equipo. La contraseña la defines tú y se la compartes.</p>
      </div>
      <NewUserForm />
    </div>
  );
}
