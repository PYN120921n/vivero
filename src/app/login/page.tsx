import Image from "next/image";
import { LoginForm } from "./login-form";
import { COMPANY } from "@/lib/constants";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-forest-900 text-forest-50 p-12 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-forest-800/60" />
        <div className="absolute -left-16 bottom-0 w-72 h-72 rounded-full bg-forest-800/40" />
        <div className="relative flex items-center gap-3">
          <Image src="/logo.png" alt={COMPANY.name} width={44} height={32} className="object-contain" />
          <span className="font-display text-lg tracking-wide">Vivero Chaka</span>
        </div>
        <div className="relative max-w-sm">
          <p className="font-display text-3xl leading-snug">
            Semillas y plantas nativas para reforestar Yucatán.
          </p>
          <p className="mt-4 text-forest-200 text-sm leading-relaxed">
            {COMPANY.activities.charAt(0) + COMPANY.activities.slice(1).toLowerCase()} · {COMPANY.fullAddress}
          </p>
        </div>
        <p className="relative text-xs text-forest-300">{COMPANY.name}</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <Image src="/logo.png" alt={COMPANY.name} width={40} height={30} className="object-contain" />
            <span className="font-display text-lg text-forest-900">Vivero Chaka</span>
          </div>
          <h1 className="font-display text-2xl text-forest-900 mb-1">Bienvenido de nuevo</h1>
          <p className="text-sm text-stone-500 mb-6">Entra con tu cuenta para gestionar inventario y cotizaciones.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
