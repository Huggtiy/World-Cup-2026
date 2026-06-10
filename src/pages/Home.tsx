import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Leaderboard from '../components/Leaderboard';
import LoadingSpinner from '../components/LoadingSpinner';
import type { LeaderboardRow } from '../lib/types';

export default function Home() {
  const { user } = useAuth();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from('leaderboard')
        .select('*');
      if (err) throw err;
      setRows((data as LeaderboardRow[]) ?? []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();

    // Real-time subscription: re-fetch when predictions change
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'predictions' },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeaderboard]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Leaderboard</h1>
        {lastUpdated && (
          <span className="text-xs text-gray-400">
            Updated {format(lastUpdated, 'HH:mm:ss')}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="card text-center py-8">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="mt-3 btn-secondary text-sm"
          >
            Retry
          </button>
        </div>
      ) : (
        <Leaderboard rows={rows} currentUserId={user?.id ?? ''} />
      )}

      {/* Scoring rules summary */}
      <div className="mt-8 card">
        <h2 className="text-sm font-bold text-gray-700 mb-3">Scoring Rules</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-600">
          <div className="flex justify-between gap-2">
            <span>Group correct result</span>
            <span className="font-bold text-gray-800">3 pts</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Round of 32 advance</span>
            <span className="font-bold text-gray-800">5 pts</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Round of 16 advance</span>
            <span className="font-bold text-gray-800">5 pts</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Quarter-final advance</span>
            <span className="font-bold text-gray-800">8 pts</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Semi-final advance</span>
            <span className="font-bold text-gray-800">12 pts</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Final winner</span>
            <span className="font-bold text-gray-800">20 pts</span>
          </div>
          <div className="flex justify-between gap-2 col-span-2 sm:col-span-3 border-t border-gray-100 pt-2 mt-1">
            <span className="text-blue-700 font-medium">+ Exact score bonus (any round)</span>
            <span className="font-bold text-blue-700">+5 pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
