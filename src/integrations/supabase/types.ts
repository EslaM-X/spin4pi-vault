export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      deposits: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          id: string
          payment_id: string
          profile_id: string
          status: string | null
          txid: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          id?: string
          payment_id: string
          profile_id: string
          status?: string | null
          txid?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          payment_id?: string
          profile_id?: string
          status?: string | null
          txid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposits_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jackpot: {
        Row: {
          id: string
          last_win_amount: number | null
          last_winner_id: string | null
          total_pi: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          last_win_amount?: number | null
          last_winner_id?: string | null
          total_pi?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          last_win_amount?: number | null
          last_winner_id?: string | null
          total_pi?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jackpot_last_winner_id_fkey"
            columns: ["last_winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_assets: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          owner_id: string | null
          price_pi: number
          utility: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          owner_id?: string | null
          price_pi: number
          utility: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          owner_id?: string | null
          price_pi?: number
          utility?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_assets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_ownership: {
        Row: {
          id: string
          is_equipped: boolean | null
          nft_asset_id: string
          profile_id: string
          purchased_at: string
        }
        Insert: {
          id?: string
          is_equipped?: boolean | null
          nft_asset_id: string
          profile_id: string
          purchased_at?: string
        }
        Update: {
          id?: string
          is_equipped?: boolean | null
          nft_asset_id?: string
          profile_id?: string
          purchased_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_ownership_nft_asset_id_fkey"
            columns: ["nft_asset_id"]
            isOneToOne: false
            referencedRelation: "nft_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nft_ownership_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          memo: string | null
          payment_id: string
          profile_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          memo?: string | null
          payment_id: string
          profile_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          memo?: string | null
          payment_id?: string
          profile_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          last_free_spin: string | null
          last_login_date: string | null
          login_streak: number | null
          pi_username: string
          referral_code: string | null
          referral_count: number | null
          referral_earnings: number | null
          referred_by: string | null
          total_login_rewards: number | null
          total_spins: number | null
          total_winnings: number | null
          updated_at: string | null
          wallet_balance: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_free_spin?: string | null
          last_login_date?: string | null
          login_streak?: number | null
          pi_username: string
          referral_code?: string | null
          referral_count?: number | null
          referral_earnings?: number | null
          referred_by?: string | null
          total_login_rewards?: number | null
          total_spins?: number | null
          total_winnings?: number | null
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_free_spin?: string | null
          last_login_date?: string | null
          login_streak?: number | null
          pi_username?: string
          referral_code?: string | null
          referral_count?: number | null
          referral_earnings?: number | null
          referred_by?: string | null
          total_login_rewards?: number | null
          total_spins?: number | null
          total_winnings?: number | null
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_rewards: {
        Row: {
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
          reward_amount: number
          reward_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
          reward_amount: number
          reward_type: string
        }
        Update: {
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
          reward_amount?: number
          reward_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_rewards_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      spins: {
        Row: {
          cost: number | null
          created_at: string | null
          id: string
          profile_id: string | null
          result: string
          reward_amount: number | null
          spin_type: string
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          id?: string
          profile_id?: string | null
          result: string
          reward_amount?: number | null
          spin_type: string
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          id?: string
          profile_id?: string | null
          result?: string
          reward_amount?: number | null
          spin_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "spins_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          id: string
          payment_id: string | null
          profile_id: string
          status: string | null
          txid: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          payment_id?: string | null
          profile_id: string
          status?: string | null
          txid?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          payment_id?: string | null
          profile_id?: string
          status?: string | null
          txid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
