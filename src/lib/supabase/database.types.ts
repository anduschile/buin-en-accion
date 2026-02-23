
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
            buin_items: {
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
                        referencedRelation: "buin_categories"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "items_user_id_fkey"
                        columns: ["created_by"]
                        referencedRelation: "buin_profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            buin_categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    icon: string | null
                    route_hint: string | null
                    display_order: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    icon?: string | null
                    route_hint?: string | null
                    display_order?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    icon?: string | null
                    route_hint?: string | null
                    display_order?: number | null
                    created_at?: string
                }
            }
            buin_reports: {
                Row: {
                    id: string
                    code: string
                    category_id: string | null
                    title: string | null
                    description: string
                    lat: number | null
                    lng: number | null
                    address_text: string | null
                    evidence_urls: Json
                    contact_name: string | null
                    contact_phone: string | null
                    contact_email: string | null
                    status: 'pending' | 'published' | 'routed' | 'in_progress' | 'resolved' | 'rejected'
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    code?: string
                    category_id?: string | null
                    title?: string | null
                    description: string
                    lat?: number | null
                    lng?: number | null
                    address_text?: string | null
                    evidence_urls?: Json
                    contact_name?: string | null
                    contact_phone?: string | null
                    contact_email?: string | null
                    status?: 'pending' | 'published' | 'routed' | 'in_progress' | 'resolved' | 'rejected'
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    code?: string
                    category_id?: string | null
                    title?: string | null
                    description?: string
                    lat?: number | null
                    lng?: number | null
                    address_text?: string | null
                    evidence_urls?: Json
                    contact_name?: string | null
                    contact_phone?: string | null
                    contact_email?: string | null
                    status?: 'pending' | 'published' | 'routed' | 'in_progress' | 'resolved' | 'rejected'
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            buin_report_updates: {
                Row: {
                    id: string
                    report_id: string
                    from_status: string | null
                    to_status: string
                    note: string | null
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    report_id: string
                    from_status?: string | null
                    to_status: string
                    note?: string | null
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    report_id?: string
                    from_status?: string | null
                    to_status?: string
                    note?: string | null
                    created_by?: string | null
                    created_at?: string
                }
            }
            buin_votes: {
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
            buin_updates: {
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
            buin_profiles: {
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
            generate_buin_code: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
        }
        Enums: {
            user_role: 'admin' | 'editor' | 'verifier' | 'citizen'
            item_status: 'pending' | 'published' | 'rejected' | 'resolved'
            traffic_level: 'low' | 'medium' | 'high' | 'critical'
        }
    }
}
