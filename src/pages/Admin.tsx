import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Match, Profile, Team } from '../lib/types';
import { ROUND_LABELS } from '../constants/points';

interface ResultFormState {
  homeScore: string;
  awayScore: string;
  homeAdvanced: boolean | null;
  saving: boolean;
  error: string | null;
  success: boolean;
}

interface KnockoutFormState {
  homeTeamId: string;
  awayTeamId: string;
  saving: boolean;
  error: string | null;
  success: boolean;
}

export default function Admin() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [lockedMatches, setLockedMatches] = useState<Match[]>([]);
  const [knockoutMatches, setKnockoutMatches] = useState<Match[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [resultForms, setResultForms] = useState<Record<number, ResultFormState>>({});
  const [knockoutForms, setKnockoutForms] = useState<Record<number, KnockoutFormState>>({});
  const [adminToggles, setAdminToggles] = useState<Record<string, boolean>>({});

  // Redirect non-admins
  useEffect(() => {
    if (profile && !profile.is_admin) {
      navigate('/', { replace: true });
    }
  }, [profile, navigate]);

  const fetchData = useCallback(async () => {
    try {
      const [lockedRes, knockoutRes, profilesRes, teamsRes] = await Promise.all([
        supabase
          .from('matches')
          .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
          .eq('status', 'LOCKED')
          .order('kickoff_at', { ascending: true }),
        supabase
          .from('matches')
          .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
          .neq('round', 'GROUP')
          .is('home_team_id', null)
          .order('match_number', { ascending: true }),
        supabase.from('profiles').select('*').order('display_name'),
        supabase.from('teams').select('*').order('group_code').order('name'),
      ]);

      if (lockedRes.error) throw lockedRes.error;
      if (knockoutRes.error) throw knockoutRes.error;
      if (profilesRes.error) throw profilesRes.error;
      if (teamsRes.error) throw teamsRes.error;

      const locked = (lockedRes.data as Match[]) ?? [];
      const knockout = (knockoutRes.data as Match[]) ?? [];
      const allProfiles = (profilesRes.data as Profile[]) ?? [];
      const allTeams = (teamsRes.data as Team[]) ?? [];

      setLockedMatches(locked);
      setKnockoutMatches(knockout);
      setProfiles(allProfiles);
      setTeams(allTeams);

      // Initialize result forms
      const rForms: Record<number, ResultFormState> = {};
      for (const m of locked) {
        rForms[m.id] = {
          homeScore: m.home_score !== null ? String(m.home_score) : '',
          awayScore: m.away_score !== null ? String(m.away_score) : '',
          homeAdvanced: m.home_advanced ?? null,
          saving: false,
          error: null,
          success: false,
        };
      }
      setResultForms(rForms);

      // Initialize knockout forms
      const kForms: Record<number, KnockoutFormState> = {};
      for (const m of knockout) {
        kForms[m.id] = {
          homeTeamId: m.home_team_id ? String(m.home_team_id) : '',
          awayTeamId: m.away_team_id ? String(m.away_team_id) : '',
          saving: false,
          error: null,
          success: false,
        };
      }
      setKnockoutForms(kForms);

      // Initialize admin toggles
      const toggles: Record<string, boolean> = {};
      for (const p of allProfiles) {
        toggles[p.id] = p.is_admin;
      }
      setAdminToggles(toggles);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function updateResultForm(matchId: number, updates: Partial<ResultFormState>) {
    setResultForms(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], ...updates },
    }));
  }

  function updateKnockoutForm(matchId: number, updates: Partial<KnockoutFormState>) {
    setKnockoutForms(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], ...updates },
    }));
  }

  async function handleSaveResult(match: Match) {
    const form = resultForms[match.id];
    if (!form) return;

    const hs = parseInt(form.homeScore, 10);
    const as_ = parseInt(form.awayScore, 10);

    if (isNaN(hs) || isNaN(as_)) {
      updateResultForm(match.id, { error: 'Please enter valid scores.' });
      return;
    }
    if (match.round !== 'GROUP' && form.homeAdvanced === null) {
      updateResultForm(match.id, { error: 'Please select which team advanced.' });
      return;
    }

    updateResultForm(match.id, { saving: true, error: null, success: false });

    try {
      const updatePayload: Record<string, unknown> = {
        home_score: hs,
        away_score: as_,
        status: 'FINISHED',
      };
      if (match.round !== 'GROUP') {
        updatePayload.home_advanced = form.homeAdvanced;
      }

      const { error: matchErr } = await supabase
        .from('matches')
        .update(updatePayload)
        .eq('id', match.id);
      if (matchErr) throw matchErr;

      // Recalculate points via RPC
      const { error: rpcErr } = await supabase.rpc('recalculate_match_points', {
        p_match_id: match.id,
      });
      if (rpcErr) throw rpcErr;

      updateResultForm(match.id, { saving: false, success: true });
      // Re-fetch after a moment
      setTimeout(fetchData, 1000);
    } catch (err) {
      updateResultForm(match.id, {
        saving: false,
        error: err instanceof Error ? err.message : 'Failed to save result',
      });
    }
  }

  async function handleSaveKnockout(match: Match) {
    const form = knockoutForms[match.id];
    if (!form) return;

    const homeId = parseInt(form.homeTeamId, 10);
    const awayId = parseInt(form.awayTeamId, 10);

    if (isNaN(homeId) || isNaN(awayId)) {
      updateKnockoutForm(match.id, { error: 'Please select both teams.' });
      return;
    }
    if (homeId === awayId) {
      updateKnockoutForm(match.id, { error: 'Home and away teams must be different.' });
      return;
    }

    updateKnockoutForm(match.id, { saving: true, error: null, success: false });

    try {
      const { error: err } = await supabase
        .from('matches')
        .update({ home_team_id: homeId, away_team_id: awayId })
        .eq('id', match.id);
      if (err) throw err;
      updateKnockoutForm(match.id, { saving: false, success: true });
      setTimeout(fetchData, 1000);
    } catch (err) {
      updateKnockoutForm(match.id, {
        saving: false,
        error: err instanceof Error ? err.message : 'Failed to update teams',
      });
    }
  }

  async function handleToggleAdmin(profileId: string, currentValue: boolean) {
    const newValue = !currentValue;
    setAdminToggles(prev => ({ ...prev, [profileId]: newValue }));

    const { error: err } = await supabase
      .from('profiles')
      .update({ is_admin: newValue })
      .eq('id', profileId);

    if (err) {
      // Revert on error
      setAdminToggles(prev => ({ ...prev, [profileId]: currentValue }));
    }
  }

  if (!profile?.is_admin) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-8">
        <p className="text-red-600 text-sm">{error}</p>
        <button onClick={fetchData} className="mt-3 btn-secondary text-sm">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold text-gray-900">Admin Panel</h1>

      {/* Section 1: Match Results */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-blue-600 rounded-full inline-block" />
          Match Results
        </h2>

        {lockedMatches.length === 0 ? (
          <div className="card text-gray-500 text-sm text-center py-6">
            No locked matches awaiting results.
          </div>
        ) : (
          <div className="space-y-4">
            {lockedMatches.map(match => {
              const form = resultForms[match.id];
              if (!form) return null;
              const homeTeam = match.home_team;
              const awayTeam = match.away_team;
              const homeName = homeTeam?.name ?? match.home_placeholder ?? 'TBD';
              const awayName = awayTeam?.name ?? match.away_placeholder ?? 'TBD';
              const homeFlag = homeTeam?.flag ?? '';
              const awayFlag = awayTeam?.flag ?? '';
              const roundLabel = match.round === 'GROUP' && match.group_code
                ? `Group ${match.group_code}`
                : ROUND_LABELS[match.round] ?? match.round;

              return (
                <div key={match.id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {roundLabel}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(match.kickoff_at), 'd MMM · HH:mm')} UTC
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-xl">{homeFlag}</span>
                    <span className="font-semibold text-gray-800">{homeName}</span>
                    <span className="text-gray-400 font-bold">vs</span>
                    <span className="font-semibold text-gray-800">{awayName}</span>
                    <span className="text-xl">{awayFlag}</span>
                  </div>

                  <div className="space-y-3">
                    {/* Score inputs */}
                    <div className="flex items-center gap-3 justify-center">
                      <div className="text-center">
                        <label className="text-xs text-gray-500 block mb-1">{homeName}</label>
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={form.homeScore}
                          onChange={e => updateResultForm(match.id, { homeScore: e.target.value })}
                          className="input-score"
                          placeholder="0"
                        />
                      </div>
                      <span className="text-xl font-bold text-gray-400 mt-4">–</span>
                      <div className="text-center">
                        <label className="text-xs text-gray-500 block mb-1">{awayName}</label>
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={form.awayScore}
                          onChange={e => updateResultForm(match.id, { awayScore: e.target.value })}
                          className="input-score"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Home advanced (knockout only) */}
                    {match.round !== 'GROUP' && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2 text-center">Which team advanced?</p>
                        <div className="flex justify-center gap-4">
                          <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-colors ${
                            form.homeAdvanced === true
                              ? 'border-blue-500 bg-blue-50 text-blue-800'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}>
                            <input
                              type="radio"
                              name={`advanced-${match.id}`}
                              checked={form.homeAdvanced === true}
                              onChange={() => updateResultForm(match.id, { homeAdvanced: true })}
                              className="sr-only"
                            />
                            <span>{homeFlag}</span>
                            <span className="text-sm font-medium">{homeName}</span>
                          </label>
                          <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-colors ${
                            form.homeAdvanced === false
                              ? 'border-blue-500 bg-blue-50 text-blue-800'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}>
                            <input
                              type="radio"
                              name={`advanced-${match.id}`}
                              checked={form.homeAdvanced === false}
                              onChange={() => updateResultForm(match.id, { homeAdvanced: false })}
                              className="sr-only"
                            />
                            <span>{awayFlag}</span>
                            <span className="text-sm font-medium">{awayName}</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {form.error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                        {form.error}
                      </div>
                    )}
                    {form.success && (
                      <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700">
                        Result saved and points recalculated!
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSaveResult(match)}
                        disabled={form.saving}
                        className="btn-primary"
                      >
                        {form.saving ? 'Saving…' : 'Save Result'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 2: Knockout Bracket */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-purple-600 rounded-full inline-block" />
          Knockout Bracket
        </h2>

        {knockoutMatches.length === 0 ? (
          <div className="card text-gray-500 text-sm text-center py-6">
            No knockout matches awaiting team assignment.
          </div>
        ) : (
          <div className="space-y-4">
            {knockoutMatches.map(match => {
              const form = knockoutForms[match.id];
              if (!form) return null;
              const roundLabel = ROUND_LABELS[match.round] ?? match.round;

              return (
                <div key={match.id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {roundLabel} · Match #{match.match_number}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(match.kickoff_at), 'd MMM · HH:mm')} UTC
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 text-center">
                    {match.home_placeholder} vs {match.away_placeholder}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Home Team</label>
                      <select
                        value={form.homeTeamId}
                        onChange={e => updateKnockoutForm(match.id, { homeTeamId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select team…</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.flag} {t.name} ({t.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Away Team</label>
                      <select
                        value={form.awayTeamId}
                        onChange={e => updateKnockoutForm(match.id, { awayTeamId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select team…</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.flag} {t.name} ({t.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {form.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700 mb-2">
                      {form.error}
                    </div>
                  )}
                  {form.success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700 mb-2">
                      Teams updated!
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSaveKnockout(match)}
                      disabled={form.saving}
                      className="btn-primary"
                    >
                      {form.saving ? 'Saving…' : 'Set Teams'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 3: Manage Users */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-green-600 rounded-full inline-block" />
          Manage Users
        </h2>

        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Display Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">User ID</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {profiles.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.display_name}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{p.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleAdmin(p.id, adminToggles[p.id] ?? false)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          adminToggles[p.id] ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={adminToggles[p.id] ?? false}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            adminToggles[p.id] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
