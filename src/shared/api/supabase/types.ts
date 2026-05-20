export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  public: {
    Tables: {
      cars: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          make: string;
          model: string;
          price: number;
          specs: Json | null;
          year: number;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          make: string;
          model: string;
          price: number;
          specs?: Json | null;
          year: number;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          make?: string;
          model?: string;
          price?: number;
          specs?: Json | null;
          year?: number;
        };
        Relationships: [];
      };
      inventory: {
        Row: {
          body_style: string | null;
          condition: string | null;
          created_at: string | null;
          dealer_id: string | null;
          drive_train: string | null;
          engine: string | null;
          exterior_color: string | null;
          images: string[] | null;
          interior_color: string | null;
          last_scraped_at: string | null;
          make: string;
          mileage: number | null;
          model: string;
          price: number | null;
          status: string | null;
          transmission: string | null;
          trim: string | null;
          updated_at: string | null;
          vin: string;
          year: number;
        };
        Insert: {
          body_style?: string | null;
          condition?: string | null;
          created_at?: string | null;
          dealer_id?: string | null;
          drive_train?: string | null;
          engine?: string | null;
          exterior_color?: string | null;
          images?: string[] | null;
          interior_color?: string | null;
          last_scraped_at?: string | null;
          make?: string;
          mileage?: number | null;
          model: string;
          price?: number | null;
          status?: string | null;
          transmission?: string | null;
          trim?: string | null;
          updated_at?: string | null;
          vin: string;
          year: number;
        };
        Update: {
          body_style?: string | null;
          condition?: string | null;
          created_at?: string | null;
          dealer_id?: string | null;
          drive_train?: string | null;
          engine?: string | null;
          exterior_color?: string | null;
          images?: string[] | null;
          interior_color?: string | null;
          last_scraped_at?: string | null;
          make?: string;
          mileage?: number | null;
          model?: string;
          price?: number | null;
          status?: string | null;
          transmission?: string | null;
          trim?: string | null;
          updated_at?: string | null;
          vin?: string;
          year?: number;
        };
        Relationships: [];
      };
      inventory_vectors: {
        Row: {
          car_id: string;
          car_name: string;
          content: string;
          created_at: string;
          embedding: string | null;
          id: string;
          metadata: Json | null;
        };
        Insert: {
          car_id: string;
          car_name: string;
          content: string;
          created_at?: string;
          embedding?: string | null;
          id?: string;
          metadata?: Json | null;
        };
        Update: {
          car_id?: string;
          car_name?: string;
          content?: string;
          created_at?: string;
          embedding?: string | null;
          id?: string;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      search_gaps: {
        Row: {
          created_at: string | null;
          detected_intent: string | null;
          id: number;
          query: string;
        };
        Insert: {
          created_at?: string | null;
          detected_intent?: string | null;
          id?: number;
          query: string;
        };
        Update: {
          created_at?: string | null;
          detected_intent?: string | null;
          id?: number;
          query?: string;
        };
        Relationships: [];
      };
      vehicle_embeddings: {
        Row: {
          car_id: string;
          car_name: string;
          content: string;
          embedding: string | null;
          id: number;
          ideal_buyer: string | null;
          make: string | null;
          model: string | null;
          price: number | null;
          sales_pitch: string | null;
          status: string | null;
          updated_at: string | null;
          year: number | null;
        };
        Insert: {
          car_id: string;
          car_name: string;
          content: string;
          embedding?: string | null;
          id?: number;
          ideal_buyer?: string | null;
          make?: string | null;
          model?: string | null;
          price?: number | null;
          sales_pitch?: string | null;
          status?: string | null;
          updated_at?: string | null;
          year?: number | null;
        };
        Update: {
          car_id?: string;
          car_name?: string;
          content?: string;
          embedding?: string | null;
          id?: number;
          ideal_buyer?: string | null;
          make?: string | null;
          model?: string | null;
          price?: number | null;
          sales_pitch?: string | null;
          status?: string | null;
          updated_at?: string | null;
          year?: number | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      match_inventory: {
        Args: {
          match_count: number;
          match_threshold: number;
          query_embedding: string;
        };
        Returns: {
          car_id: string;
          car_name: string;
          content: string;
          id: string;
          similarity: number;
        }[];
      };
      search_cars: {
        Args: {
          match_count: number;
          match_threshold: number;
          query_embedding: string;
        };
        Returns: {
          car_id: string;
          content: string;
          id: string;
          similarity: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
