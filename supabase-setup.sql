-- Vouch Database Schema for Multi-User & Workspaces
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#4F75FF',
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspace members
CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

-- Update expenses table (drop and recreate with new columns)
DROP TABLE IF EXISTS expense_splits CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;

CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  user_id UUID REFERENCES auth.users,
  workspace_id UUID REFERENCES workspaces,
  paid_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense splits (who owes what)
CREATE TABLE expense_splits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES expenses ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users,
  amount NUMERIC NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_workspace ON expenses(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_user ON expense_splits(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Workspaces: Users can see workspaces they're members of
CREATE POLICY "Users can view workspaces they're members of"
  ON workspaces FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM workspace_members WHERE workspace_id = id
    )
  );

CREATE POLICY "Users can create workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Workspace members: Users can see members of their workspaces
CREATE POLICY "Users can view workspace members"
  ON workspace_members FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM workspace_members WHERE workspace_id = workspace_members.workspace_id
    )
  );

CREATE POLICY "Workspace creators can add members"
  ON workspace_members FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT created_by FROM workspaces WHERE id = workspace_id
    )
  );

-- Expenses: Users can see expenses in their workspaces
CREATE POLICY "Users can view workspace expenses"
  ON expenses FOR SELECT
  USING (
    workspace_id IS NULL OR
    auth.uid() IN (
      SELECT user_id FROM workspace_members WHERE workspace_id = expenses.workspace_id
    )
  );

CREATE POLICY "Users can create expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Expense splits: Users can see their own splits
CREATE POLICY "Users can view expense splits"
  ON expense_splits FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM workspace_members 
      WHERE workspace_id = (SELECT workspace_id FROM expenses WHERE id = expense_id)
    )
  );

CREATE POLICY "Users can create expense splits"
  ON expense_splits FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM expenses WHERE id = expense_id
    )
  );

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
