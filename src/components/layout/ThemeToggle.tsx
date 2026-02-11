
import React, { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Activar modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
      className="rounded-full border border-cyan-300/20 bg-white/5 p-2 text-cyan-200 transition-colors hover:bg-white/10 hover:text-white"
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
};

export default ThemeToggle;
