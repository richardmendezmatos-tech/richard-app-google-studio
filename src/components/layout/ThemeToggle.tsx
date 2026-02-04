
import React, { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Activar modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
      className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
};

export default ThemeToggle;
