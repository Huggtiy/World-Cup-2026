import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ScoreInput from '../components/ScoreInput';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Match, Prediction, Profile } from '../lib/types';
import { ROUND_LABELS } from '../constants/points';

interface PredictionWithProfile extends Prediction {
  profile?: Profile;
}

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [match, setMatch] = useState<Match | null>(null);
  const [myPrediction, setMyPrediction] = useState<Prediction | null>(null);
  const [allPredictions, setAllPredictions] = useState<PredictionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prediction form state
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [advancingTeamId, setAdvancingTeamId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const matchId = parseInt(id ?? '0', 10);

  const fetchData = useCallback(async () => {
    if (!matchId) return;
    try {
      const [matchRes, predsRes] = await Promise.all([
        supabase
          .from('matches')
          .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
          .eq('id', matchId)
          .single(),
        supabase
          .from('predictions')
          .select('*, profile:profiles(*)')
          .eq('match_id', matchId),
      ]);

      if (matchRes.error) throw matchRes.error;

      const matchData = matchRes.data as Match;
      setMatch(matchData);

      const predsData = (predsRes.data as PredictionWithProfile[]) ?? [];
      setAllPredictions(predsData);

      const myPred = predsData.find(p => p.user_id === user?.id) ?? null;
      setMyPrediction(myPred);

      // Pre-populate form from existing prediction
      if (myPred) {
        setHomeScore(String(myPred.home_score));
        setAwayScore(String(myPred.away_score));
        setAdvancingTeamId(myPred.advancing_team_id);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load match');
    } finally {
      setLoading(false);
    }
  }, [matchId, user?.id]);

  useEffect(() => {
    fetchData();

    // Real-time subscription
    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'predictions', filter: `match_id=eq.${matchId}` },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, matchId]);

  async function handleSavePrediction(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !match) return;
    if (match.status !== 'SCHEDULED') return;

    const hs = parseInt(homeScore, 10);
    const as_ = parseInt(awayScore, 10);
    if (isNaN(hs) || isNaN(as_)) {
      setSaveError('Please enter valid scores.');
      return;
    }

    // For knockout matches, advancing_team_id is required
    if (match.round !== 'GROUP' && match.home_team_id && match.away_team_id && !advancingTeamId) {
      setSaveError('Please select which team advances.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const payload = {
        user_id: user.id,
        match_id: match.id,
        home_score: hs,
        away_score: as_,
        advancing_team_id: match.round !== 'GROUP' ? advancingTeamId : null,
        updated_at: new Date().toISOString(),
      };

      if (myPrediction) {
        const { error: err } = await supabase
          .from('predictions')
          .update(payload)
          .eq('id', myPrediction.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from('predictions')
          .insert(payload);
        if (err) throw err;
      }

      setSaveSuccess(true);
      await fetchData();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save prediction');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="card text-center py-8">
        <p className="text-red-600 text-sm">{error ?? 'Match not found'}</p>
        <button onClick={() => navigate('/matches')} className="mt-3 btn-secondary text-sm">
          Back to Matches
        </button>
      </div>
    );
  }

  const homeTeam = match.home_team;
  const awayTeam = match.away_team;
  const homeName = homeTeam?.name ?? match.home_placeholder ?? 'TBD';
  const awayName = awayTeam?.name ?? match.away_placeholder ?? 'TBD';
  const homeFlag = homeTeam?.flag ?? '';
  const awayFlag = awayTeam?.flag ?? '';

  const kickoff = new Date(match.kickoff_at);
  const kickoffFormatted = format(kickoff, "EEEE, d MMMM yyyy · HH:mm 'UTC'");

  const roundLabel = match.round === 'GROUP' && match.group_code
    ? `Group ${match.group_code}`
    : ROUND_LABELS[match.round] ?? match.round;

  const isFinished = match.status === 'FINISHED';
  const isLocked = match.status === 'LOCKED';
  const isScheduled = match.status === 'SCHEDULED';
  const canPredict = isScheduled && !!user;

  // Sort predictions: finished → by points desc; otherwise alphabetical
  const sortedPredictions = [...allPredictions].sort((a, b) => {
    if (isFinished) {
      return (b.points_earned ?? 0) - (a.points_earned ?? 0);
    }
    return (a.profile?.display_name ?? '').localeCompare(b.profile?.display_name ?? '');
  });

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
      >
        ← Back
      </button>

      {/* Match header card */}
      <div className="card">
        {/* Round + status */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            {roundLabel}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isFinished ? 'bg-green-100 text-green-800'
            : isLocked ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-600'
          }`}>
            {isFinished ? 'Finished' : isLocked ? 'In Progress / Locked' : 'Scheduled'}
          </span>
        </div>

        {/* Teams + score */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-4xl">{homeFlag}</span>
            <span className="text-base font-bold text-gray-900 text-center">{homeName}</span>
          </div>

          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            {isFinished && match.home_score !== null && match.away_score !== null ? (
              <div className="flex items-center gap-2">
                <span className="text-4xl font-extrabold text-gray-900">{match.home_score}</span>
                <span className="text-2xl font-bold text-gray-400">–</span>
                <span className="text-4xl font-extrabold text-gray-900">{match.away_score}</span>
              </div>
            ) : (
              <div className="text-gray-400 text-2xl font-bold">vs</div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-4xl">{awayFlag}</span>
            <span className="text-base font-bold text-gray-900 text-center">{awayName}</span>
          </div>
        </div>

        {/* Kickoff + venue */}
        <div className="mt-4 text-center text-sm text-gray-500 space-y-1">
          <p>{kickoffFormatted}</p>
          <p>{match.venue}</p>
        </div>

        {/* Winner annotation for finished knockout */}
        {isFinished && match.round !== 'GROUP' && match.home_advanced !== null && (
          <div className="mt-3 text-center text-sm text-green-700 font-medium">
            Advances: {match.home_advanced
              ? `${homeFlag} ${homeName}`
              : `${awayFlag} ${awayName}`}
          </div>
        )}
      </div>

      {/* Prediction form */}
      {canPredict && (
        <div className="card">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            {myPrediction ? 'Update Your Prediction' : 'Make Your Prediction'}
          </h2>
          <form onSubmit={handleSavePrediction} className="space-y-4">
            {/* Score input */}
            <div>
              <p className="text-sm text-gray-600 mb-2 text-center">
                Predicted Score
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">{homeName}</p>
                  <ScoreInput
                    homeScore={homeScore}
                    awayScore={awayScore}
                    onHomeChange={setHomeScore}
                    onAwayChange={setAwayScore}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Advancing team (knockout only) */}
            {match.round !== 'GROUP' && homeTeam && awayTeam && (
              <div>
                <p className="text-sm text-gray-600 mb-2 text-center">Who advances?</p>
                <div className="flex justify-center gap-4">
                  <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-colors ${
                    advancingTeamId === homeTeam.id
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="advancing"
                      value={homeTeam.id}
                      checked={advancingTeamId === homeTeam.id}
                      onChange={() => setAdvancingTeamId(homeTeam.id)}
                      className="sr-only"
                    />
                    <span>{homeFlag}</span>
                    <span className="text-sm font-medium">{homeName}</span>
                  </label>
                  <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-colors ${
                    advancingTeamId === awayTeam.id
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="advancing"
                      value={awayTeam.id}
                      checked={advancingTeamId === awayTeam.id}
                      onChange={() => setAdvancingTeamId(awayTeam.id)}
                      className="sr-only"
                    />
                    <span>{awayFlag}</span>
                    <span className="text-sm font-medium">{awayName}</span>
                  </label>
                </div>
              </div>
            )}

            {saveError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">
                Prediction saved!
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">Locks at kickoff</p>
              <button
                type="submit"
                disabled={saving || !homeScore || !awayScore}
                className="btn-primary"
              >
                {saving ? 'Saving…' : myPrediction ? 'Update Prediction' : 'Save Prediction'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Locked — show own prediction */}
      {isLocked && myPrediction && (
        <div className="card bg-yellow-50 border-yellow-200">
          <h2 className="text-sm font-bold text-yellow-800 mb-2">Your Prediction (Locked)</h2>
          <div className="flex items-center gap-2 text-lg font-bold text-yellow-900">
            <span>{homeFlag}</span>
            <span>{myPrediction.home_score} – {myPrediction.away_score}</span>
            <span>{awayFlag}</span>
          </div>
          {myPrediction.advancing_team_id && (
            <p className="text-sm text-yellow-700 mt-1">
              Advances: {myPrediction.advancing_team_id === match.home_team_id
                ? `${homeFlag} ${homeName}`
                : `${awayFlag} ${awayName}`}
            </p>
          )}
        </div>
      )}

      {/* All predictions (visible after kickoff or for finished) */}
      {(isLocked || isFinished) && (
        <div className="card">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            All Predictions ({sortedPredictions.length})
          </h2>
          {sortedPredictions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No predictions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs text-gray-500 font-semibold">
                    <th className="pb-2 pr-4">Player</th>
                    <th className="pb-2 pr-4 text-center">Score</th>
                    {match.round !== 'GROUP' && (
                      <th className="pb-2 pr-4 text-center">Advances</th>
                    )}
                    {isFinished && (
                      <th className="pb-2 text-right">Points</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedPredictions.map(pred => {
                    const isMe = pred.user_id === user?.id;
                    const advancingTeam = pred.advancing_team_id === match.home_team_id
                      ? homeTeam : awayTeam;
                    return (
                      <tr
                        key={pred.id}
                        className={`${isMe ? 'bg-blue-50 font-semibold' : ''}`}
                      >
                        <td className="py-2 pr-4">
                          <span className={isMe ? 'text-blue-800' : 'text-gray-700'}>
                            {pred.profile?.display_name ?? 'Unknown'}
                            {isMe && <span className="ml-1 text-xs font-normal text-blue-500">(you)</span>}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-center font-mono">
                          {pred.home_score} – {pred.away_score}
                        </td>
                        {match.round !== 'GROUP' && (
                          <td className="py-2 pr-4 text-center text-xs">
                            {advancingTeam
                              ? `${advancingTeam.flag} ${advancingTeam.name}`
                              : pred.advancing_team_id === match.home_team_id
                              ? homeName
                              : pred.advancing_team_id === match.away_team_id
                              ? awayName
                              : '—'
                            }
                          </td>
                        )}
                        {isFinished && (
                          <td className="py-2 text-right">
                            {pred.points_earned !== null ? (
                              <span className={`font-bold ${pred.points_earned > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                                {pred.points_earned > 0 ? `+${pred.points_earned}` : '0'}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Scheduled: masked predictions */}
      {isScheduled && (
        <div className="card">
          <h2 className="text-base font-bold text-gray-900 mb-2">
            Predictions
          </h2>
          <p className="text-sm text-gray-500">
            Predictions are hidden until kickoff. {allPredictions.length} player{allPredictions.length !== 1 ? 's' : ''} have predicted this match.
          </p>
        </div>
      )}
    </div>
  );
}
