/**
 * Tipos generados a mano a partir de supabase/migrations/0001_init.sql.
 *
 * Cuando el proyecto ya esté enlazado con Supabase, se pueden regenerar
 * automáticamente (y así detectar cualquier diferencia con este archivo) con:
 *
 *   npx supabase gen types typescript --project-id TU_PROJECT_ID > src/lib/types.ts
 */

export type UserRole = "usuario" | "superadmin";
export type SeedClassification = "recalcitrante" | "intermedia" | "ortodoxa" | "vareta";
export type BagSize = "13x20" | "25x25" | "30x30" | "30x40" | "40x40";
export type PlantHeight = "20-30" | "40-50" | "50-60" | "60-70" | "80-90" | "100" | "150" | "180" | "200" | "300";
export type QuotationProductType = "semillas" | "plantas";
export type QuotationStatus = "pendiente" | "aprobada" | "rechazada" | "facturada";
export type DiscountType = "none" | "fixed" | "percentage";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      system_settings: {
        Row: {
          id: number;
          is_active: boolean;
          suspended_reason: string | null;
          suspended_by: string | null;
          suspended_at: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["system_settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["system_settings"]["Row"]>;
        Relationships: [];
      };
      seeds: {
        Row: {
          id: string;
          code: string;
          common_name: string;
          scientific_name: string;
          classification: SeedClassification;
          available_months: string | null;
          seeds_per_kilo: number | null;
          unit_price: number;
          stock_kg: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code?: string;
          common_name: string;
          scientific_name: string;
          classification?: SeedClassification;
          available_months?: string | null;
          seeds_per_kilo?: number | null;
          unit_price?: number;
          stock_kg?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["seeds"]["Insert"]>;
        Relationships: [];
      };
      plants: {
        Row: {
          id: string;
          code: string;
          common_name: string;
          scientific_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code?: string;
          common_name: string;
          scientific_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["plants"]["Insert"]>;
        Relationships: [];
      };
      quotations: {
        Row: {
          id: string;
          folio: string;
          product_type: QuotationProductType;
          client_name: string;
          client_address: string | null;
          quote_date: string;
          validity_days: number;
          valid_until: string;
          quote_city: string;
          notes: string;
          conditions: string[];
          tax_rate: number;
          discount_type: DiscountType;
          discount_value: number;
          shipping_cost: number;
          subtotal: number;
          discount_amount: number;
          tax_amount: number;
          total: number;
          status: QuotationStatus;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          folio?: string;
          product_type: QuotationProductType;
          client_name: string;
          client_address?: string | null;
          quote_date?: string;
          validity_days?: number;
          quote_city?: string;
          notes?: string;
          conditions?: string[];
          tax_rate?: number;
          discount_type?: DiscountType;
          discount_value?: number;
          shipping_cost?: number;
          subtotal?: number;
          discount_amount?: number;
          tax_amount?: number;
          total?: number;
          status?: QuotationStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quotations"]["Insert"]>;
        Relationships: [];
      };
      quotation_items: {
        Row: {
          id: string;
          quotation_id: string;
          seed_id: string | null;
          plant_id: string | null;
          common_name: string;
          scientific_name: string | null;
          classification: SeedClassification | null;
          available_months: string | null;
          seeds_per_kilo: number | null;
          bag_size: BagSize | null;
          height: PlantHeight | null;
          unit_price: number;
          quantity: number;
          subtotal: number;
          sort_order: number;
        };
        Insert: {
          id?: string;
          quotation_id: string;
          seed_id?: string | null;
          plant_id?: string | null;
          common_name: string;
          scientific_name?: string | null;
          classification?: SeedClassification | null;
          available_months?: string | null;
          seeds_per_kilo?: number | null;
          bag_size?: BagSize | null;
          height?: PlantHeight | null;
          unit_price?: number;
          quantity?: number;
          subtotal: number;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["quotation_items"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      approve_quotation: {
        Args: { p_quotation_id: string; p_force?: boolean };
        Returns: {
          success: boolean;
          already_approved?: boolean;
          issues?: Array<{
            item: string;
            issue: "producto_no_encontrado" | "stock_insuficiente";
            disponible?: number;
            solicitado?: number;
          }>;
        };
      };
      duplicate_quotation: {
        Args: { p_quotation_id: string };
        Returns: string;
      };
      create_quotation_with_items: {
        Args: { p_quotation: Record<string, unknown>; p_items: Record<string, unknown>[] };
        Returns: string;
      };
      restore_backup: {
        Args: { p_payload: Record<string, unknown> };
        Returns: { success: boolean };
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type SystemSettings = Database["public"]["Tables"]["system_settings"]["Row"];
export type Seed = Database["public"]["Tables"]["seeds"]["Row"];
export type Plant = Database["public"]["Tables"]["plants"]["Row"];
export type Quotation = Database["public"]["Tables"]["quotations"]["Row"];
export type QuotationItem = Database["public"]["Tables"]["quotation_items"]["Row"];
export type QuotationWithItems = Quotation & { quotation_items: QuotationItem[] };
