-- ============================================================
-- SplitSmart AI — Complete Supabase SQL Schema
-- Run this ENTIRE script in Supabase SQL Editor (one-shot)
-- ============================================================

-- ============================================================
-- STEP 1: CREATE ALL TABLES FIRST
-- ============================================================

CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  split_type TEXT DEFAULT 'equal' CHECK (split_type IN ('equal', 'unequal')),
  date DATE DEFAULT CURRENT_DATE,
  category TEXT DEFAULT 'General',
  paid_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_settled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS splits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  grand_total NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 2: ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_bills ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 3: CREATE ALL RLS POLICIES
-- ============================================================

-- GROUPS policies
CREATE POLICY "Users can view their groups" ON groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups" ON groups
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'admin'
    )
  );

CREATE POLICY "Group admins can delete groups" ON groups
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'admin'
    )
  );

-- GROUP MEMBERS policies
CREATE POLICY "Users can view members of their groups" ON group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members AS gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert group members" ON group_members
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete group members" ON group_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM group_members AS gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
    )
  );

-- EXPENSES policies
CREATE POLICY "Group members can view expenses" ON expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = expenses.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can add expenses" ON expenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = expenses.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (user_id = auth.uid());

-- SPLITS policies
CREATE POLICY "Group members can view splits" ON splits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM expenses
      JOIN group_members ON group_members.group_id = expenses.group_id
      WHERE expenses.id = splits.expense_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can add splits" ON splits
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- SAVED BILLS policies
CREATE POLICY "Users can view own bills" ON saved_bills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bills" ON saved_bills
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bills" ON saved_bills
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bills" ON saved_bills
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- STEP 4: PERFORMANCE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_is_settled ON expenses(is_settled);
CREATE INDEX IF NOT EXISTS idx_splits_expense_id ON splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_splits_user_id ON splits(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_bills_user_id ON saved_bills(user_id);

-- ============================================================
-- DONE! All tables, policies, and indexes created.
-- ============================================================
