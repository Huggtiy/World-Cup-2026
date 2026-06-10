import type { LeaderboardRow } from '../lib/types';

interface LeaderboardProps {
  rows: LeaderboardRow[];
  currentUserId: string;
}

function getRankEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return String(rank);
}

export default function Leaderboard({ rows, currentUserId }: LeaderboardProps) {
  if (rows.length === 0) {
    return (
      <div className="card text-center py-12 text-gray-500">
        <p className="text-lg font-medium">No predictions yet</p>
        <p className="text-sm mt-1">Be the first to predict a match!</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="px-4 py-3 text-left font-semibold w-12">Rank</th>
              <th className="px-4 py-3 text-left font-semibold">Player</th>
              <th className="px-4 py-3 text-right font-semibold">
                <span className="flex items-center justify-end gap-1">
                  Total
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </th>
              <th className="px-4 py-3 text-right font-semibold">Group</th>
              <th className="px-4 py-3 text-right font-semibold">Knockout</th>
              <th className="px-4 py-3 text-right font-semibold text-blue-200">Preds</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const rank = index + 1;
              const isCurrentUser = row.id === currentUserId;
              return (
                <tr
                  key={row.id}
                  className={`border-t border-gray-100 ${
                    isCurrentUser
                      ? 'bg-blue-50 font-semibold'
                      : rank % 2 === 0
                      ? 'bg-gray-50'
                      : 'bg-white'
                  } hover:bg-blue-50 transition-colors`}
                >
                  <td className="px-4 py-3 text-center font-bold text-gray-700">
                    {rank <= 3 ? (
                      <span className="text-lg">{getRankEmoji(rank)}</span>
                    ) : (
                      <span className="text-gray-500">{rank}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`${isCurrentUser ? 'text-blue-800' : 'text-gray-900'}`}>
                      {row.display_name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs font-normal text-blue-500">(you)</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                    {row.total_points}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {row.group_points}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {row.knockout_points}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs">
                    {row.predictions_count}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked layout */}
      <div className="sm:hidden divide-y divide-gray-100">
        {rows.map((row, index) => {
          const rank = index + 1;
          const isCurrentUser = row.id === currentUserId;
          return (
            <div
              key={row.id}
              className={`px-4 py-3 flex items-center gap-3 ${
                isCurrentUser ? 'bg-blue-50' : ''
              }`}
            >
              <div className="w-8 text-center font-bold flex-shrink-0">
                {rank <= 3 ? (
                  <span className="text-xl">{getRankEmoji(rank)}</span>
                ) : (
                  <span className="text-gray-500 text-sm">{rank}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${isCurrentUser ? 'text-blue-800' : 'text-gray-900'}`}>
                  {row.display_name}
                  {isCurrentUser && (
                    <span className="ml-1 text-xs font-normal text-blue-500">(you)</span>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Group: {row.group_points} · Knockout: {row.knockout_points} · {row.predictions_count} preds
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-xl font-extrabold text-gray-900">{row.total_points}</p>
                <p className="text-xs text-gray-400">pts</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
