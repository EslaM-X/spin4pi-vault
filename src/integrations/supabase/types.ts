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
      achievements: {
        Row: {
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
          reward_pi: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
          reward_pi?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
          reward_pi?: number | null
        }
        Relationships: []
      }
      ad_spin_claims: {
        Row: {
          ads_watched: number
          claimed_at: string
          id: string
          profile_id: string
          s4p_reward: number | null
        }
        Insert: {
          ads_watched?: number
          claimed_at?: string
          id?: string
          profile_id: string
          s4p_reward?: number | null
        }
        Update: {
          ads_watched?: number
          claimed_at?: string
          id?: string
          profile_id?: string
          s4p_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_spin_claims_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_roles: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "admin_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
          s4p_balance: number | null
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
          s4p_balance?: number | null
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
          s4p_balance?: number | null
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
      s4p_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          profile_id: string
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          profile_id: string
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          profile_id?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "s4p_transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shares: {
        Row: {
          created_at: string | null
          id: string
          message: string
          profile_id: string
          reward_pi: number | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          profile_id: string
          reward_pi?: number | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          profile_id?: string
          reward_pi?: number | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "shares_profile_id_fkey"
            columns: ["profile_id"]
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
      staking: {
        Row: {
          amount: number
          apy: number
          boost_multiplier: number
          created_at: string
          end_date: string
          id: string
          profile_id: string
          rewards_earned: number | null
          start_date: string
          status: string
          tier: string
          withdrawn_at: string | null
        }
        Insert: {
          amount: number
          apy?: number
          boost_multiplier?: number
          created_at?: string
          end_date: string
          id?: string
          profile_id: string
          rewards_earned?: number | null
          start_date?: string
          status?: string
          tier: string
          withdrawn_at?: string | null
        }
        Update: {
          amount?: number
          apy?: number
          boost_multiplier?: number
          created_at?: string
          end_date?: string
          id?: string
          profile_id?: string
          rewards_earned?: number | null
          start_date?: string
          status?: string
          tier?: string
          withdrawn_at?: string | null
        }
        Relationships: []
      }
      tournament_entries: {
        Row: {
          id: string
          joined_at: string | null
          profile_id: string
          spin_count: number | null
          total_winnings: number | null
          tournament_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          profile_id: string
          spin_count?: number | null
          total_winnings?: number | null
          tournament_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          profile_id?: string
          spin_count?: number | null
          total_winnings?: number | null
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_entries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_entries_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string
          entry_fee: number | null
          id: string
          name: string
          prize_pool: number | null
          start_time: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time: string
          entry_fee?: number | null
          id?: string
          name: string
          prize_pool?: number | null
          start_time: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string
          entry_fee?: number | null
          id?: string
          name?: string
          prize_pool?: number | null
          start_time?: string
          status?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string | null
          id: string
          profile_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string | null
          id?: string
          profile_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string | null
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vip_tiers: {
        Row: {
          bonus_multiplier: number | null
          created_at: string | null
          exclusive_rewards: string[] | null
          id: string
          level: number
          min_total_spins: number
          name: string
          spin_discount: number | null
        }
        Insert: {
          bonus_multiplier?: number | null
          created_at?: string | null
          exclusive_rewards?: string[] | null
          id?: string
          level: number
          min_total_spins: number
          name: string
          spin_discount?: number | null
        }
        Update: {
          bonus_multiplier?: number | null
          created_at?: string | null
          exclusive_rewards?: string[] | null
          id?: string
          level?: number
          min_total_spins?: number
          name?: string
          spin_discount?: number | null
        }
        Relationships: []
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
      has_role: {
        Args: {
          _profile_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator"
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
      app_role: ["admin", "moderator"],
    },
  },
} as const
