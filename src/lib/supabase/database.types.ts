
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            natales_items: {
                Row: {
                    id: string
                    created_by: string | null
                    category_id: string | null
                    title: string
                    description: string | null
                    latitude: number
                    longitude: number

                    status: 'pending' | 'published' | 'rejected' | 'resolved'
                    traffic_level: 'low' | 'medium' | 'high' | 'critical'
                    kind: 'problem' | 'good'
                    evidence_path: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    created_by?: string | null
                    category_id?: string | null
                    title: string
                    description?: string | null
                    latitude: number
                    longitude: number
                    status?: 'pending' | 'published' | 'rejected' | 'resolved'
                    traffic_level?: 'low' | 'medium' | 'high' | 'critical'
                    evidence_path?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    created_by?: string | null
                    category_id?: string | null
                    title?: string
                    description?: string | null
                    latitude?: number
                    longitude?: number
                    status?: 'pending' | 'published' | 'rejected' | 'resolved'
                    traffic_level?: 'low' | 'medium' | 'high' | 'critical'
                    evidence_path?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "items_category_id_fkey"
                        columns: ["category_id"]
                        referencedRelation: "natales_categories"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "items_user_id_fkey"
                        columns: ["created_by"]
                        referencedRelation: "natales_profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            natales_categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    icon: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    icon?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    icon?: string | null
                    created_at?: string
                }
            }
            natales_votes: {
                Row: {
                    item_id: string
                    user_id: string
                    created_at: string
                }
                Insert: {
                    item_id: string
                    user_id: string
                    created_at?: string
                }
                Update: {
                    item_id?: string
                    user_id?: string
                    created_at?: string
                }
            }
            natales_updates: {
                Row: {
                    id: string
                    item_id: string | null
                    content: string
                    source_url: string | null
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    item_id?: string | null
                    content: string
                    source_url?: string | null
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    item_id?: string | null
                    content?: string
                    source_url?: string | null
                    created_by?: string | null
                    created_at?: string
                }
            }
            natales_profiles: {
                Row: {
                    id: string
                    role: 'admin' | 'editor' | 'verifier' | 'citizen'
                    full_name: string | null
                    avatar_url: string | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    role?: 'admin' | 'editor' | 'verifier' | 'citizen'
                    full_name?: string | null
                    avatar_url?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    role?: 'admin' | 'editor' | 'verifier' | 'citizen'
                    full_name?: string | null
                    avatar_url?: string | null
                    updated_at?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: 'admin' | 'editor' | 'verifier' | 'citizen'
            item_status: 'pending' | 'published' | 'rejected' | 'resolved'
            traffic_level: 'low' | 'medium' | 'high' | 'critical'
        }
    }
}
