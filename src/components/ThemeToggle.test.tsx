// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ThemeToggle from './ThemeToggle';

describe('ThemeToggle', () => {
    afterEach(() => {
        cleanup();
    });

    beforeEach(() => {
        // Reset storage and document class
        localStorage.clear();
        document.documentElement.classList.remove('dark');

        // Mock matchMedia
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(), // deprecated
                removeListener: vi.fn(), // deprecated
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
    });

    it('renders the toggle button', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button', { name: /toggle dark mode/i });
        expect(button).toBeDefined();
    });

    it('toggles theme on click', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button', { name: /toggle dark mode/i });

        // Initial state (light)
        expect(document.documentElement.classList.contains('dark')).toBe(false);

        // Click to toggle to dark
        fireEvent.click(button);
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorage.getItem('theme')).toBe('dark');

        // Click to toggle back to light
        fireEvent.click(button);
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(localStorage.getItem('theme')).toBe('light');
    });

    it('initializes with dark mode if localStorage says so', () => {
        localStorage.setItem('theme', 'dark');

        // We need to render it again
        render(<ThemeToggle />);

        // Should read from localstorage and apply class
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
});
