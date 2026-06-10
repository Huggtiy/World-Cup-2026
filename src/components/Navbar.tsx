import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-1 py-2 text-sm font-medium transition-colors border-b-2 ${
      isActive
        ? 'border-blue-400 text-white'
        : 'border-transparent text-blue-200 hover:text-white hover:border-blue-300'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors rounded-lg ${
      isActive
        ? 'bg-blue-700 text-white'
        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
    }`;

  return (
    <nav className="bg-blue-900 shadow-md">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 text-white font-bold text-lg">
            <span>⚽</span>
            <span className="hidden sm:block">WC26 Predictor</span>
            <span className="sm:hidden">WC26</span>
          </NavLink>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/" end className={linkClass}>
              <Trophy size={16} />
              Home
            </NavLink>
            <NavLink to="/matches" className={linkClass}>
              <Calendar size={16} />
              Matches
            </NavLink>
            {profile?.is_admin && (
              <NavLink to="/admin" className={linkClass}>
                <Settings size={16} />
                Admin
              </NavLink>
            )}
          </div>

          {/* Desktop user info + sign out */}
          <div className="hidden md:flex items-center gap-4">
            {profile && (
              <span className="text-blue-200 text-sm font-medium">
                {profile.display_name}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-blue-200 hover:text-white text-sm font-medium transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-1 rounded-md hover:bg-blue-800 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-900 border-t border-blue-800 px-4 pb-4 pt-2 space-y-1">
          <NavLink
            to="/"
            end
            className={mobileLinkClass}
            onClick={() => setMenuOpen(false)}
          >
            <Trophy size={16} />
            Home
          </NavLink>
          <NavLink
            to="/matches"
            className={mobileLinkClass}
            onClick={() => setMenuOpen(false)}
          >
            <Calendar size={16} />
            Matches
          </NavLink>
          {profile?.is_admin && (
            <NavLink
              to="/admin"
              className={mobileLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              <Settings size={16} />
              Admin
            </NavLink>
          )}
          <div className="border-t border-blue-800 pt-3 mt-2 flex items-center justify-between">
            {profile && (
              <span className="text-blue-200 text-sm font-medium px-4">
                {profile.display_name}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-blue-200 hover:text-white text-sm font-medium transition-colors px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
