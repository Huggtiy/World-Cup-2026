import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import MatchCard from '../components/MatchCard';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Match, Prediction } from '../lib/types';
import { ROUND_LABELS } from '../constants/points';

type TabFilter = 'all' | 'group' | 'knockout' | 'mine';

const GROUP_CODES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const KNOCKOUT_ROUNDS = ['R32', 'R16', 'QF', 'SF', 'THIRD_PLACE', 'FINAL'];

export default function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabFilter>('all');
  const [groupFilter, setGroupFilter] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [matchesRes, predsRes] = await Promise.all([
        supabase
          .from('matches')
          .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
          .order('kickoff_at', { ascending: true }),
        user
          ? supabase
              .from('predictions')
              .select('*')
              .eq('user_id', user.id)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (matchesRes.error) throw matchesRes.error;
      if (predsRes.error) throw predsRes.error;

      setMatches((matchesRes.data as Match[]) ?? []);
      setPredictions((predsRes.data as Prediction[]) ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function getPrediction(matchId: number): Prediction | null {
    return predictions.find(p => p.match_id === matchId) ?? null;
  }

  // Filter matches based on tab
  const filteredMatches = matches.filter(m => {
    if (tab === 'group') return m.round === 'GROUP';
    if (tab === 'knockout') return m.round !== 'GROUP';
    if (tab === 'mine') return getPrediction(m.id) !== null;
    return true;
  }).filter(m => {
    if (tab === 'group' && groupFilter) return m.group_code === groupFilter;
    return true;
  });

  // Group matches by round, then by group_code within GROUP round
  type GroupedMatches = {
    round: string;
    groups: { label: string; matches: Match[] }[];
  }[];

  function groupMatches(matchList: Match[]): GroupedMatches {
    const roundOrder = ['GROUP', 'R32', 'R16', 'QF', 'SF', 'THIRD_PLACE', 'FINAL'];
    const byRound = new Map<string, Match[]>();

    for (const m of matchList) {
      const existing = byRound.get(m.round) ?? [];
      byRound.set(m.round, [...existing, m]);
    }

    const result: GroupedMatches = [];

    for (const round of roundOrder) {
      const roundMatches = byRound.get(round);
      if (!roundMatches || roundMatches.length === 0) continue;

      if (round === 'GROUP') {
        const byGroup = new Map<string, Match[]>();
        for (const m of roundMatches) {
          const gc = m.group_code ?? '?';
          const existing = byGroup.get(gc) ?? [];
          byGroup.set(gc, [...existing, m]);
        }
        const groups: { label: string; matches: Match[] }[] = [];
        for (const gc of GROUP_CODES) {
          const gMatches = byGroup.get(gc);
          if (gMatches && gMatches.length > 0) {
            groups.push({ label: `Group ${gc}`, matches: gMatches });
          }
        }
        result.push({ round, groups });
      } else {
        result.push({
          round,
          groups: [{ label: ROUND_LABELS[round] ?? round, matches: roundMatches }],
        });
      }
    }

    return result;
  }

  const grouped = groupMatches(filteredMatches);

  const tabClass = (t: TabFilter) =>
    `px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
      tab === t
        ? 'bg-blue-900 text-white'
        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
    }`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-4">Fixtures &amp; Predictions</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button className={tabClass('all')} onClick={() => { setTab('all'); setGroupFilter(null); }}>All</button>
          <button className={tabClass('group')} onClick={() => setTab('group')}>Group Stage</button>
          <button className={tabClass('knockout')} onClick={() => { setTab('knockout'); setGroupFilter(null); }}>Knockout</button>
          <button className={tabClass('mine')} onClick={() => { setTab('mine'); setGroupFilter(null); }}>My Predictions</button>
        </div>

        {/* Group filter chips (only when on group tab) */}
        {tab === 'group' && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            <button
              onClick={() => setGroupFilter(null)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                groupFilter === null
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Groups
            </button>
            {GROUP_CODES.map(gc => (
              <button
                key={gc}
                onClick={() => setGroupFilter(gc)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                  groupFilter === gc
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {gc}
              </button>
            ))}
          </div>
        )}

        {/* Kickoff lock banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-800 mb-4">
          Predictions lock at kickoff. Make sure to predict before each match starts!
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="card text-center py-8">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={fetchData} className="mt-3 btn-secondary text-sm">Retry</button>
        </div>
      ) : grouped.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No matches found</p>
          <p className="text-sm mt-1">Try a different filter</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ round, groups }) => (
            <div key={round}>
              {round !== 'GROUP' && (
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-600 rounded-full inline-block" />
                  {ROUND_LABELS[round] ?? round}
                </h2>
              )}
              {groups.map(({ label, matches: groupMatches }) => (
                <div key={label} className="mb-6">
                  {round === 'GROUP' && (
                    <h3 className="text-base font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="w-1 h-5 bg-blue-400 rounded-full inline-block" />
                      {label}
                    </h3>
                  )}
                  <div className="space-y-3">
                    {groupMatches.map(match => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        userPrediction={getPrediction(match.id)}
                        onPredict={() => {}}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Suppress unused variable warning
void KNOCKOUT_ROUNDS;
