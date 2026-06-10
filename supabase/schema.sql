-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE match_round AS ENUM ('GROUP', 'R32', 'R16', 'QF', 'SF', 'THIRD_PLACE', 'FINAL');
CREATE TYPE match_status AS ENUM ('SCHEDULED', 'LOCKED', 'FINISHED');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Teams table
CREATE TABLE teams (
  id serial PRIMARY KEY,
  name text NOT NULL,
  code char(3) NOT NULL UNIQUE,
  group_code char(1) NOT NULL,
  flag text NOT NULL DEFAULT ''
);

-- Matches table
CREATE TABLE matches (
  id serial PRIMARY KEY,
  round match_round NOT NULL,
  group_code char(1) NULL,
  match_number int NOT NULL UNIQUE,
  home_team_id int NULL REFERENCES teams(id),
  away_team_id int NULL REFERENCES teams(id),
  home_placeholder text NULL,
  away_placeholder text NULL,
  kickoff_at timestamptz NOT NULL,
  venue text NOT NULL DEFAULT '',
  status match_status NOT NULL DEFAULT 'SCHEDULED',
  home_score int NULL,
  away_score int NULL,
  home_advanced boolean NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Predictions table
CREATE TABLE predictions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id int NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  home_score int NOT NULL DEFAULT 0,
  away_score int NOT NULL DEFAULT 0,
  advancing_team_id int NULL REFERENCES teams(id),
  points_earned int NULL,
  locked_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, match_id)
);

-- Leaderboard view
CREATE VIEW leaderboard AS
SELECT
  p.id,
  p.display_name,
  COALESCE(SUM(pr.points_earned), 0)::int AS total_points,
  COALESCE(SUM(CASE WHEN m.round = 'GROUP' THEN pr.points_earned ELSE 0 END), 0)::int AS group_points,
  COALESCE(SUM(CASE WHEN m.round != 'GROUP' THEN pr.points_earned ELSE 0 END), 0)::int AS knockout_points,
  COUNT(pr.id)::int AS predictions_count
FROM profiles p
LEFT JOIN predictions pr ON pr.user_id = p.id
LEFT JOIN matches m ON m.id = pr.match_id
GROUP BY p.id, p.display_name
ORDER BY total_points DESC;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
-- Anyone authenticated can read all profiles
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin can update any profile
CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Teams RLS policies
-- Public read access for teams
CREATE POLICY "teams_select_all" ON teams
  FOR SELECT USING (true);

-- Matches RLS policies
-- Public read access for matches
CREATE POLICY "matches_select_all" ON matches
  FOR SELECT USING (true);

-- Admin can update matches (to set results)
CREATE POLICY "matches_update_admin" ON matches
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admin can insert matches
CREATE POLICY "matches_insert_admin" ON matches
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Predictions RLS policies
-- Users can insert their own predictions
CREATE POLICY "predictions_insert_own" ON predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own predictions (only if match is SCHEDULED)
CREATE POLICY "predictions_update_own" ON predictions
  FOR UPDATE USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM matches WHERE id = match_id AND status = 'SCHEDULED'
    )
  );

-- Users can delete their own predictions (only if match is SCHEDULED)
CREATE POLICY "predictions_delete_own" ON predictions
  FOR DELETE USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM matches WHERE id = match_id AND status = 'SCHEDULED'
    )
  );

-- Users can read their own predictions always
CREATE POLICY "predictions_select_own" ON predictions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can read all predictions for LOCKED or FINISHED matches (after kickoff)
CREATE POLICY "predictions_select_after_kickoff" ON predictions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE id = match_id
      AND status IN ('LOCKED', 'FINISHED')
    )
  );

-- Admin can read all predictions
CREATE POLICY "predictions_select_admin" ON predictions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admin can update predictions (to set points_earned)
CREATE POLICY "predictions_update_admin" ON predictions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Function to create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to recalculate points for all predictions on a match
-- Mirrors the TypeScript scoring.ts logic
CREATE OR REPLACE FUNCTION recalculate_match_points(p_match_id int)
RETURNS void AS $$
DECLARE
  v_match matches%ROWTYPE;
  v_pred predictions%ROWTYPE;
  v_points int;
  v_exact_bonus int := 5;
  v_real_result int;
  v_pred_result int;
  v_advanced_team_id int;
BEGIN
  -- Load the match
  SELECT * INTO v_match FROM matches WHERE id = p_match_id;

  -- Only process FINISHED matches with scores
  IF v_match.status != 'FINISHED' OR v_match.home_score IS NULL OR v_match.away_score IS NULL THEN
    RETURN;
  END IF;

  -- Iterate over all predictions for this match
  FOR v_pred IN
    SELECT * FROM predictions WHERE match_id = p_match_id
  LOOP
    v_points := 0;

    IF v_match.round = 'GROUP' THEN
      -- Group stage: award points for correct result direction
      v_real_result := SIGN(v_match.home_score - v_match.away_score);
      v_pred_result := SIGN(v_pred.home_score - v_pred.away_score);

      IF v_pred_result = v_real_result THEN
        v_points := 3; -- GROUP_CORRECT_RESULT
        -- Exact score bonus
        IF v_pred.home_score = v_match.home_score AND v_pred.away_score = v_match.away_score THEN
          v_points := v_points + v_exact_bonus;
        END IF;
      END IF;

    ELSE
      -- Knockout stage: award points for correct advancing team
      IF v_match.home_advanced IS NULL THEN
        v_points := 0;
      ELSE
        IF v_match.home_advanced THEN
          v_advanced_team_id := v_match.home_team_id;
        ELSE
          v_advanced_team_id := v_match.away_team_id;
        END IF;

        IF v_pred.advancing_team_id = v_advanced_team_id THEN
          -- Award round-specific points
          CASE v_match.round
            WHEN 'R32'         THEN v_points := 5;
            WHEN 'R16'         THEN v_points := 5;
            WHEN 'QF'          THEN v_points := 8;
            WHEN 'SF'          THEN v_points := 12;
            WHEN 'THIRD_PLACE' THEN v_points := 12;
            WHEN 'FINAL'       THEN v_points := 20;
            ELSE v_points := 0;
          END CASE;
        END IF;

        -- Exact score bonus (stacks with advance points)
        IF v_pred.home_score = v_match.home_score AND v_pred.away_score = v_match.away_score THEN
          v_points := v_points + v_exact_bonus;
        END IF;
      END IF;
    END IF;

    -- Update the prediction with calculated points
    UPDATE predictions
    SET points_earned = v_points,
        updated_at = now()
    WHERE id = v_pred.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
