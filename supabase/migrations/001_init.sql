-- Create Enums
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'verifier', 'citizen');
CREATE TYPE item_status AS ENUM ('pending', 'published', 'rejected', 'resolved');
CREATE TYPE traffic_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE (Extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role DEFAULT 'citizen'::user_role,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CATEGORIES TABLE
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT, -- Lucide icon name or emoji
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ITEMS TABLE (Reports)
CREATE TABLE items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status item_status DEFAULT 'pending'::item_status,
  traffic_level traffic_level DEFAULT 'low'::traffic_level,
  evidence_path TEXT, -- Path in storage bucket
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VOTES TABLE (Ranking)
CREATE TABLE votes (
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (item_id, user_id)
);

-- UPDATES TABLE (Official updates on items)
CREATE TABLE updates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  source_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_traffic ON items(traffic_level);
CREATE INDEX idx_votes_item ON votes(item_id);

-- RLS POLICIES

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Staff can manage categories" ON categories FOR ALL USING (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'editor'))
);

-- Items
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published items are viewable by everyone" ON items FOR SELECT USING (status = 'published');
CREATE POLICY "Users can see their own items" ON items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can insert items" ON items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Staff can view all items" ON items FOR SELECT USING (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'editor', 'verifier'))
);
CREATE POLICY "Staff can update items" ON items FOR UPDATE USING (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'editor', 'verifier'))
);

-- Votes
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Votes are viewable by everyone" ON votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete own vote" ON votes FOR DELETE USING (auth.uid() = user_id);

-- Updates
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Updates are viewable by everyone" ON updates FOR SELECT USING (true);
CREATE POLICY "Staff can manage updates" ON updates FOR ALL USING (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'editor'))
);

-- FUNCTIONS
-- Handle new user signup -> trigger to create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed Categories
INSERT INTO categories (name, slug, icon) VALUES
('Infraestructura', 'infraestructura', 'HardHat'),
('Seguridad', 'seguridad', 'Shield'),
('Limpieza', 'limpieza', 'Trash2'),
('Transito', 'transito', 'Car'),
('Alumbrado', 'alumbrado', 'Lightbulb');
