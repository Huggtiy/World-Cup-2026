import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import type { Match, Prediction } from '../lib/types';
import { ROUND_LABELS } from '../constants/points';

interface MatchCardProps {
  match: Match;
  userPrediction: Prediction | null;
  onPredict?: (matchId: number) => void;
}

function getRoundBadgeColor(round: string): string {
  switch (round) {
    case 'GROUP': return 'bg-blue-100 text-blue-800';
    case 'R32': return 'bg-purple-100 text-purple-800';
    case 'R16': return 'bg-indigo-100 text-indigo-800';
    case 'QF': return 'bg-orange-100 text-orange-800';
    case 'SF': return 'bg-red-100 text-red-800';
    case 'THIRD_PLACE': return 'bg-yellow-100 text-yellow-800';
    case 'FINAL': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getPredictionBadge(match: Match, prediction: Prediction | null) {
  if (!prediction) return null;
  if (match.status === 'FINISHED' && prediction.points_earned !== null) {
    if (prediction.points_earned > 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          +{prediction.points_earned} pts
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
          0 pts
        </span>
      );
    }
  }
  if (match.status === 'LOCKED') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
        Locked
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
      Saved
    </span>
  );
}

export default function MatchCard({ match, userPrediction, onPredict }: MatchCardProps) {
  const navigate = useNavigate();
  const homeTeam = match.home_team;
  const awayTeam = match.away_team;

  const homeName = homeTeam?.name ?? match.home_placeholder ?? 'TBD';
  const awayName = awayTeam?.name ?? match.away_placeholder ?? 'TBD';
  const homeFlag = homeTeam?.flag ?? '';
  const awayFlag = awayTeam?.flag ?? '';

  const kickoff = new Date(match.kickoff_at);
  const kickoffFormatted = format(kickoff, "EEE d MMM · HH:mm") + ' UTC';

  const roundLabel = match.round === 'GROUP' && match.group_code
    ? `Group ${match.group_code}`
    : ROUND_LABELS[match.round] ?? match.round;

  const isFinished = match.status === 'FINISHED';
  const isLocked = match.status === 'LOCKED';
  const isScheduled = match.status === 'SCHEDULED';

  function handleCardClick() {
    navigate(`/matches/${match.id}`);
  }

  function handlePredictClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (onPredict) onPredict(match.id);
    else navigate(`/matches/${match.id}`);
  }

  return (
    <div
      className="card cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      {/* Header: round badge + kickoff time */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getRoundBadgeColor(match.round)}`}>
          {roundLabel}
        </span>
        <span className="text-xs text-gray-500">{kickoffFormatted}</span>
      </div>

      {/* Teams + Score row */}
      <div className="flex items-center justify-between gap-2">
        {/* Home team */}
        <div className="flex-1 flex flex-col items-center sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
          <span className="text-2xl">{homeFlag}</span>
          <span className="text-sm font-semibold text-gray-800 text-center sm:text-left truncate">{homeName}</span>
        </div>

        {/* Score section */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0 mx-2">
          {isFinished && match.home_score !== null && match.away_score !== null ? (
            <div className="flex items-center gap-1">
              <span className="text-2xl font-extrabold text-gray-900">{match.home_score}</span>
              <span className="text-lg font-bold text-gray-400">–</span>
              <span className="text-2xl font-extrabold text-gray-900">{match.away_score}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-2xl font-extrabold text-gray-300">–</span>
            </div>
          )}

          {/* Prediction below score */}
          {userPrediction && (
            <div className="text-xs text-gray-500">
              {isFinished ? (
                <span>You: {userPrediction.home_score}–{userPrediction.away_score}</span>
              ) : isLocked ? (
                <span className="text-yellow-700 font-medium">{userPrediction.home_score}–{userPrediction.away_score}</span>
              ) : (
                <span>{userPrediction.home_score}–{userPrediction.away_score}</span>
              )}
            </div>
          )}

          {!userPrediction && isScheduled && (
            <div className="text-xs text-gray-400 italic">Not predicted</div>
          )}

          {/* Points badge */}
          {getPredictionBadge(match, userPrediction)}
        </div>

        {/* Away team */}
        <div className="flex-1 flex flex-col items-center sm:flex-row-reverse sm:items-center gap-1 sm:gap-2 min-w-0">
          <span className="text-2xl">{awayFlag}</span>
          <span className="text-sm font-semibold text-gray-800 text-center sm:text-right truncate">{awayName}</span>
        </div>
      </div>

      {/* Knockout advancing pick */}
      {match.round !== 'GROUP' && !isFinished && userPrediction?.advancing_team_id && (
        <div className="mt-2 text-xs text-center text-gray-500">
          Advances:{' '}
          <span className="font-medium text-gray-700">
            {userPrediction.advancing_team_id === match.home_team_id
              ? `${homeFlag} ${homeName}`
              : `${awayFlag} ${awayName}`}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-400 truncate">{match.venue}</span>
        <div className="flex items-center gap-2">
          {isScheduled && (
            <span className="text-xs text-gray-400">Locks at kickoff</span>
          )}
          {isScheduled && !userPrediction && (
            <button
              onClick={handlePredictClick}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Predict
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
