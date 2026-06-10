export type Round = 'GROUP' | 'R32' | 'R16' | 'QF' | 'SF' | 'THIRD_PLACE' | 'FINAL';
export type MatchStatus = 'SCHEDULED' | 'LOCKED' | 'FINISHED';

export interface Team {
  id: number;
  name: string;
  code: string;
  group_code: string;
  flag: string;
}

export interface Match {
  id: number;
  round: Round;
  group_code: string | null;
  match_number: number;
  home_team_id: number | null;
  away_team_id: number | null;
  home_placeholder: string | null;
  away_placeholder: string | null;
  kickoff_at: string; // ISO 8601
  venue: string;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  home_advanced: boolean | null; // true = home won/advanced, false = away advanced
  home_team?: Team;
  away_team?: Team;
}

export interface Profile {
  id: string;
  display_name: string;
  is_admin: boolean;
  created_at: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: number;
  home_score: number;
  away_score: number;
  advancing_team_id: number | null;
  points_earned: number | null;
  locked_at: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface LeaderboardRow {
  id: string;
  display_name: string;
  total_points: number;
  group_points: number;
  knockout_points: number;
  predictions_count: number;
}

export interface MatchWithPredictions extends Match {
  predictions: Prediction[];
}
