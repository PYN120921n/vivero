import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, Table, Th, Td, Badge } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { RoleSelect } from "./role-select";
import { setUserRole, deleteUser } from "./actions";
import { Plus, Trash2 } from "lucide-react";

export default async function UsersPage() {
  const me = await requireSuperadmin();
  const supabase = await createClient();
  const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-forest-900">Usuarios</h1>
          <p className="text-sm text-stone-500">Cuentas con acceso al sistema. Solo superadmin puede administrarlas.</p>
        </div>
        <LinkButton href="/usuarios/nuevo">
          <Plus size={16} /> Nuevo usuario
        </LinkButton>
      </div>

      <Card>
        <CardBody>
          <Table>
            <thead>
              <tr>
                <Th>Nombre</Th>
                <Th>Correo</Th>
                <Th>Rol</Th>
                <Th className="text-right">Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {profiles?.map((profile) => {
                const isSelf = profile.id === me.id;
                return (
                  <tr key={profile.id}>
                    <Td className="font-medium text-forest-900">
                      {profile.full_name || "—"}
                      {isSelf && (
                        <Badge tone="info" className="ml-2">
                          Tú
                        </Badge>
                      )}
                    </Td>
                    <Td className="text-stone-600">{profile.email}</Td>
                    <Td>
                      {isSelf ? (
                        <Badge tone="neutral" className="capitalize">
                          {profile.role}
                        </Badge>
                      ) : (
                        <form action={setUserRole}>
                          <input type="hidden" name="id" value={profile.id} />
                          <RoleSelect defaultValue={profile.role} />
                        </form>
                      )}
                    </Td>
                    <Td>
                      {!isSelf && (
                        <div className="flex justify-end">
                          <form action={deleteUser}>
                            <input type="hidden" name="id" value={profile.id} />
                            <ConfirmSubmitButton
                              confirmMessage={`¿Eliminar la cuenta de ${profile.full_name || profile.email}? Perderá acceso de inmediato.`}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={15} />
                            </ConfirmSubmitButton>
                          </form>
                        </div>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
