export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      conversations: {
        Row: {
          created_at: string
          id: string
          project_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          system_prompt: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          system_prompt?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          system_prompt?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      "Valores en Cartera": {
        Row: {
          ba_id: number | null
          bn_id: number | null
          bn_name: string | null
          bra_id: number | null
          bra_id_PortFolio: number | null
          chp_AccountNumber: string | null
          chp_BankBranch: number | null
          chp_BankBranchDescription: string | null
          chp_BranchCurrencyExchange: number | null
          chp_DocumentDescription: string | null
          chp_documentNumber: string | null
          chp_EmissionDate: string | null
          chp_guid: string | null
          chp_id: number
          chp_image: string | null
          chp_isAvailable: boolean | null
          chp_isCancelled: boolean | null
          chp_isDocument: boolean | null
          chp_isEditing: string | null
          chp_isEditingCD: string | null
          chp_isElectronic: boolean | null
          chp_isInProcess: boolean | null
          chp_isInProcess_Order: string | null
          chp_isNegociated: boolean | null
          chp_isOwn: boolean | null
          chp_IsPayed: boolean | null
          chp_isRejected: boolean | null
          chp_isToOrder: boolean | null
          chp_Note: string | null
          chp_number: string | null
          chp_originalTotal: string | null
          chp_PayDate: string | null
          chp_QtyEndosos: string | null
          chp_taxNumber1: number | null
          chp_taxNumber2: string | null
          chp_taxNumber3: string | null
          chp_Titular: string | null
          chp_total: number | null
          comp_id: number | null
          country_id: number | null
          ct_date: string | null
          ct_docNumber: number | null
          ct_pointOfSale: number | null
          ct_total: number | null
          ct_transaction: number | null
          curr_id: number | null
          cust_id: number | null
          cust_name: string | null
          sd_desc: string | null
          ult_Fecha_actualizacion: string | null
        }
        Insert: {
          ba_id?: number | null
          bn_id?: number | null
          bn_name?: string | null
          bra_id?: number | null
          bra_id_PortFolio?: number | null
          chp_AccountNumber?: string | null
          chp_BankBranch?: number | null
          chp_BankBranchDescription?: string | null
          chp_BranchCurrencyExchange?: number | null
          chp_DocumentDescription?: string | null
          chp_documentNumber?: string | null
          chp_EmissionDate?: string | null
          chp_guid?: string | null
          chp_id: number
          chp_image?: string | null
          chp_isAvailable?: boolean | null
          chp_isCancelled?: boolean | null
          chp_isDocument?: boolean | null
          chp_isEditing?: string | null
          chp_isEditingCD?: string | null
          chp_isElectronic?: boolean | null
          chp_isInProcess?: boolean | null
          chp_isInProcess_Order?: string | null
          chp_isNegociated?: boolean | null
          chp_isOwn?: boolean | null
          chp_IsPayed?: boolean | null
          chp_isRejected?: boolean | null
          chp_isToOrder?: boolean | null
          chp_Note?: string | null
          chp_number?: string | null
          chp_originalTotal?: string | null
          chp_PayDate?: string | null
          chp_QtyEndosos?: string | null
          chp_taxNumber1?: number | null
          chp_taxNumber2?: string | null
          chp_taxNumber3?: string | null
          chp_Titular?: string | null
          chp_total?: number | null
          comp_id?: number | null
          country_id?: number | null
          ct_date?: string | null
          ct_docNumber?: number | null
          ct_pointOfSale?: number | null
          ct_total?: number | null
          ct_transaction?: number | null
          curr_id?: number | null
          cust_id?: number | null
          cust_name?: string | null
          sd_desc?: string | null
          ult_Fecha_actualizacion?: string | null
        }
        Update: {
          ba_id?: number | null
          bn_id?: number | null
          bn_name?: string | null
          bra_id?: number | null
          bra_id_PortFolio?: number | null
          chp_AccountNumber?: string | null
          chp_BankBranch?: number | null
          chp_BankBranchDescription?: string | null
          chp_BranchCurrencyExchange?: number | null
          chp_DocumentDescription?: string | null
          chp_documentNumber?: string | null
          chp_EmissionDate?: string | null
          chp_guid?: string | null
          chp_id?: number
          chp_image?: string | null
          chp_isAvailable?: boolean | null
          chp_isCancelled?: boolean | null
          chp_isDocument?: boolean | null
          chp_isEditing?: string | null
          chp_isEditingCD?: string | null
          chp_isElectronic?: boolean | null
          chp_isInProcess?: boolean | null
          chp_isInProcess_Order?: string | null
          chp_isNegociated?: boolean | null
          chp_isOwn?: boolean | null
          chp_IsPayed?: boolean | null
          chp_isRejected?: boolean | null
          chp_isToOrder?: boolean | null
          chp_Note?: string | null
          chp_number?: string | null
          chp_originalTotal?: string | null
          chp_PayDate?: string | null
          chp_QtyEndosos?: string | null
          chp_taxNumber1?: number | null
          chp_taxNumber2?: string | null
          chp_taxNumber3?: string | null
          chp_Titular?: string | null
          chp_total?: number | null
          comp_id?: number | null
          country_id?: number | null
          ct_date?: string | null
          ct_docNumber?: number | null
          ct_pointOfSale?: number | null
          ct_total?: number | null
          ct_transaction?: number | null
          curr_id?: number | null
          cust_id?: number | null
          cust_name?: string | null
          sd_desc?: string | null
          ult_Fecha_actualizacion?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_project_assignment: {
        Args: { p_lovable_project_id: string; p_user_id: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "viewer"],
    },
  },
} as const
