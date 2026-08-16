import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { KillswitchPanel } from "./killswitch-panel";
import { BackupPanel } from "./backup-panel";

export default async function DatabasePage() {
  await requireSuperadmin();
  const supabase = await createClient();
  const { data: settings } = await supabase.from("system_settings").select("*").eq("id", 1).single();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl text-forest-900">Base de datos</h1>
        <p className="text-sm text-stone-500">Control de acceso de emergencia y respaldo de la información. Solo superadmin.</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg text-forest-900">Killswitch</h2>
        </CardHeader>
        <CardBody>{settings && <KillswitchPanel settings={settings} />}</CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg text-forest-900">Respaldo</h2>
        </CardHeader>
        <CardBody>
          <BackupPanel />
        </CardBody>
      </Card>
    </div>
  );
}
