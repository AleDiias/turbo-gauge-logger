export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      connection_logs: {
        Row: {
          connected_at: string
          device_name: string | null
          disconnected_at: string | null
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          connected_at?: string
          device_name?: string | null
          disconnected_at?: string | null
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          connected_at?: string
          device_name?: string | null
          disconnected_at?: string | null
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      error_codes: {
        Row: {
          cleared_at: string | null
          code: string
          description: string | null
          id: string
          recorded_at: string
          user_id: string
        }
        Insert: {
          cleared_at?: string | null
          code: string
          description?: string | null
          id?: string
          recorded_at?: string
          user_id: string
        }
        Update: {
          cleared_at?: string | null
          code?: string
          description?: string | null
          id?: string
          recorded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      obd_readings: {
        Row: {
          battery_voltage: number | null
          boost_pressure: number | null
          connection_id: string | null
          engine_load: number | null
          engine_temp: number | null
          fuel_consumption: number | null
          id: string
          intake_temp: number | null
          map_pressure: number | null
          recorded_at: string
          rpm: number | null
          speed: number | null
          user_id: string
        }
        Insert: {
          battery_voltage?: number | null
          boost_pressure?: number | null
          connection_id?: string | null
          engine_load?: number | null
          engine_temp?: number | null
          fuel_consumption?: number | null
          id?: string
          intake_temp?: number | null
          map_pressure?: number | null
          recorded_at?: string
          rpm?: number | null
          speed?: number | null
          user_id: string
        }
        Update: {
          battery_voltage?: number | null
          boost_pressure?: number | null
          connection_id?: string | null
          engine_load?: number | null
          engine_temp?: number | null
          fuel_consumption?: number | null
          id?: string
          intake_temp?: number | null
          map_pressure?: number | null
          recorded_at?: string
          rpm?: number | null
          speed?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "obd_readings_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connection_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
