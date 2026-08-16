import Image from "next/image";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getCurrentProfile, getSystemActive } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { COMPANY } from "@/lib/constants";

export default async function SuspendedPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role === "superadmin") redirect("/dashboard");

  const active = await getSystemActive();
  if (active) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-forest-950">
      <div className="max-w-sm w-full text-center">
        <Image src="/logo.png" alt={COMPANY.name} width={64} height={48} className="object-contain mx-auto mb-6" />
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-clay-500/20 text-clay-400 mb-4">
          <ShieldAlert size={24} />
        </div>
        <h1 className="font-display text-xl text-white mb-2">Sistema suspendido temporalmente</h1>
        <p className="text-sm text-forest-200 mb-8">
          El acceso está pausado en este momento. Contacta a tu superadmin para más información.
        </p>
        <form action={logout}>
          <button type="submit" className="text-sm text-forest-300 hover:text-white underline">
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
