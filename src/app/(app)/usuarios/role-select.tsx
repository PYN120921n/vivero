"use client";

import { Select } from "@/components/ui/form";
import type { UserRole } from "@/lib/types";

export function RoleSelect({ defaultValue }: { defaultValue: UserRole }) {
  return (
    <Select
      name="role"
      defaultValue={defaultValue}
      wrapperClassName="w-auto"
      className="h-8 text-xs"
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
    >
      <option value="usuario">Usuario</option>
      <option value="superadmin">Superadmin</option>
    </Select>
  );
}
