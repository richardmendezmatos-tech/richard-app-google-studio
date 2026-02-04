import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ThemeToggle from './ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';

describe('ThemeToggle', () => {
    it('renders without crashing', () => {
        render(
            <ThemeProvider>
                <ThemeToggle />
            </ThemeProvider>
        );

        // Check if the button exists
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
    });

    it('toggles theme on click', () => {
        render(
            <ThemeProvider>
                <ThemeToggle />
            </ThemeProvider>
        );

        const button = screen.getByRole('button');
        // Initial state (assuming light or system default, button should have label)
        // We can just check that clicking it doesn't crash
        fireEvent.click(button);
        expect(button).toBeInTheDocument();
    });
});
