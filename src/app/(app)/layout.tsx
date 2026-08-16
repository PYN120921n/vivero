import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { ShieldAlert } from "lucide-react";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  let systemSuspended = false;
  if (profile.role === "superadmin") {
    const supabase = await createClient();
    const { data } = await supabase.from("system_settings").select("is_active").eq("id", 1).single();
    systemSuspended = data?.is_active === false;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar profile={profile} />
      <div className="flex-1 min-w-0 flex flex-col">
        {systemSuspended && (
          <div className="bg-clay-500 text-white px-4 py-2 text-sm flex items-center gap-2 justify-center">
            <ShieldAlert size={16} />
            El sistema está suspendido para el rol &quot;usuario&quot; ahora mismo. Solo tú puedes entrar.
            <a href="/base-de-datos" className="underline font-medium">
              Reactivar
            </a>
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
