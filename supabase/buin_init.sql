-- Create Enums
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'verifier', 'citizen');
CREATE TYPE item_status AS ENUM ('pending', 'published', 'rejected', 'resolved');
CREATE TYPE traffic_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE item_kind AS ENUM ('problem', 'good');

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE (Extends auth.users)
CREATE TABLE buin_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role DEFAULT 'citizen'::user_role,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CATEGORIES TABLE
CREATE TABLE buin_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT, -- Lucide icon name or emoji
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ITEMS TABLE (Reports)
CREATE TABLE buin_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_by UUID REFERENCES buin_profiles(id) ON DELETE SET NULL, -- Renamed from user_id to match code usage if needed, but code seems to use created_by in insert
  category_id UUID REFERENCES buin_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status item_status DEFAULT 'pending'::item_status,
  traffic_level traffic_level DEFAULT 'low'::traffic_level,
  kind item_kind DEFAULT 'problem'::item_kind,
  is_general BOOLEAN DEFAULT false,
  evidence_path TEXT, -- Path in storage bucket
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_note TEXT
);

-- VOTES TABLE (Ranking)
CREATE TABLE buin_votes (
  item_id UUID REFERENCES buin_items(id) ON DELETE CASCADE,
  created_by UUID REFERENCES buin_profiles(id) ON DELETE CASCADE, -- Code uses created_by
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (item_id, created_by)
);

-- UPDATES TABLE (Official updates on items)
CREATE TABLE buin_updates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID REFERENCES buin_items(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  source_url TEXT,
  created_by UUID REFERENCES buin_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_buin_items_status ON buin_items(status);
CREATE INDEX idx_buin_items_traffic ON buin_items(traffic_level);
CREATE INDEX idx_buin_votes_item ON buin_votes(item_id);

-- RLS POLICIES

-- Profiles
ALTER TABLE buin_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON buin_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON buin_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON buin_profiles FOR UPDATE USING (auth.uid() = id);

-- Categories
ALTER TABLE buin_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON buin_categories FOR SELECT USING (true);
CREATE POLICY "Staff can manage categories" ON buin_categories FOR ALL USING (
  exists (select 1 from buin_profiles where id = auth.uid() and role in ('admin', 'editor'))
);

-- Items
ALTER TABLE buin_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published items are viewable by everyone" ON buin_items FOR SELECT USING (status = 'published');
CREATE POLICY "Users can see their own items" ON buin_items FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Authenticated users can insert items" ON buin_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Staff can view all items" ON buin_items FOR SELECT USING (
  exists (select 1 from buin_profiles where id = auth.uid() and role in ('admin', 'editor', 'verifier'))
);
CREATE POLICY "Staff can update items" ON buin_items FOR UPDATE USING (
  exists (select 1 from buin_profiles where id = auth.uid() and role in ('admin', 'editor', 'verifier'))
);

-- Votes
ALTER TABLE buin_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Votes are viewable by everyone" ON buin_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON buin_votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete own vote" ON buin_votes FOR DELETE USING (auth.uid() = created_by);

-- Updates
ALTER TABLE buin_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Updates are viewable by everyone" ON buin_updates FOR SELECT USING (true);
CREATE POLICY "Staff can manage updates" ON buin_updates FOR ALL USING (
  exists (select 1 from buin_profiles where id = auth.uid() and role in ('admin', 'editor'))
);

-- FUNCTIONS
-- Handle new user signup -> trigger to create profile
CREATE OR REPLACE FUNCTION public.handle_new_buin_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.buin_profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: You might need to drop the old trigger if it exists on auth.users, or ensure this one coexists
-- For a clean tenant, we assume this is the main logic.
-- If multi-tenant on same auth, we might need conditional logic.
-- For now, just creating the trigger.
DROP TRIGGER IF EXISTS on_auth_user_created_buin ON auth.users;
CREATE TRIGGER on_auth_user_created_buin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_buin_user();

-- Seed Categories
INSERT INTO buin_categories (name, slug, icon) VALUES
('Infraestructura', 'infraestructura', 'HardHat'),
('Seguridad', 'seguridad', 'Shield'),
('Limpieza', 'limpieza', 'Trash2'),
('Transito', 'transito', 'Car'),
('Alumbrado', 'alumbrado', 'Lightbulb');
