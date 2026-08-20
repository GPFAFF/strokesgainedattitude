/**
 * Types for the Supabase schema in supabase/migrations/0001_init.sql.
 *
 * Regenerate after a schema change with:
 *   supabase gen types typescript --project-id <ref> > app/lib/database.types.ts
 *
 * Note: every table and view needs a `Relationships` array — postgrest-js uses
 * it to resolve nested selects (and silently degrades rows to `never` without
 * it), so keep the foreign keys below in step with the migration.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TeeJson = {
  tee_name?: string;
  course_rating?: number | string;
  slope_rating?: number | string;
  par_total?: number | string;
  total_yards?: number | string;
  number_of_holes?: number;
};

export type CourseTeesJson = {
  male?: TeeJson[];
  female?: TeeJson[];
};

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  handicap: number | null;
  profile_complete: boolean;
  created_at: string;
  updated_at: string;
};

type CourseRow = {
  id: string;
  name: string;
  club: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  tees: CourseTeesJson;
  is_custom: boolean;
  created_by: string | null;
  search_index: string | null;
  created_at: string;
  updated_at: string;
};

type RoundRow = {
  id: string;
  user_id: string;
  played_at: string;
  course_id: string | null;
  course_name: string | null;
  course_city: string | null;
  course_state: string | null;
  tee: TeeJson | null;
  round_score: number | null;
  putts: number | null;
  fairways_hit: number | null;
  greens_in_regulation: number | null;
  /** Generated column — read-only. */
  handicap_differential: number | null;
  created_at: string;
};

type RoundScoreRow = {
  round_id: string;
  concept: string;
  category: string;
  score: number;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string };
        Update: Partial<ProfileRow>;
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      courses: {
        Row: CourseRow;
        Insert: Partial<CourseRow> & { name: string };
        Update: Partial<CourseRow>;
        Relationships: [];
      };
      rounds: {
        Row: RoundRow;
        // handicap_differential is generated, so it is never writable.
        Insert: Omit<
          Partial<RoundRow>,
          "id" | "created_at" | "handicap_differential"
        > & { user_id: string };
        Update: Omit<Partial<RoundRow>, "handicap_differential">;
        Relationships: [
          {
            foreignKeyName: "rounds_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      round_scores: {
        Row: RoundScoreRow;
        Insert: RoundScoreRow;
        Update: Partial<RoundScoreRow>;
        Relationships: [
          {
            foreignKeyName: "round_scores_round_id_fkey";
            columns: ["round_id"];
            isOneToOne: false;
            referencedRelation: "rounds";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      user_concept_stats: {
        Row: {
          user_id: string | null;
          category: string | null;
          concept: string | null;
          average: number | null;
          rounds_counted: number | null;
        };
        Relationships: [];
      };
      user_category_stats: {
        Row: {
          user_id: string | null;
          category: string | null;
          average: number | null;
          ratings_counted: number | null;
          rounds_counted: number | null;
        };
        Relationships: [];
      };
      user_category_performance: {
        Row: {
          user_id: string | null;
          category: string | null;
          band: string | null;
          rounds_counted: number | null;
          avg_score: number | null;
          avg_differential: number | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
