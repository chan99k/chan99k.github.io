// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { ApiKeySettings } from './ApiKeySettings';

describe('ApiKeySettings', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => cleanup());

    it('renders input and save button', () => {
        render(<ApiKeySettings onKeyChange={() => {}} />);
        expect(screen.getByPlaceholderText(/sk-ant-/i)).toBeDefined();
        expect(screen.getByRole('button', { name: /저장/i })).toBeDefined();
    });

    it('saves key to localStorage on submit', () => {
        const onKeyChange = vi.fn();
        render(<ApiKeySettings onKeyChange={onKeyChange} />);

        const input = screen.getByPlaceholderText(/sk-ant-/i);
        fireEvent.change(input, { target: { value: 'sk-ant-test-key-123' } });
        fireEvent.click(screen.getByRole('button', { name: /저장/i }));

        expect(localStorage.getItem('claude-api-key')).toBe('sk-ant-test-key-123');
        expect(onKeyChange).toHaveBeenCalledWith('sk-ant-test-key-123');
    });

    it('loads existing key from localStorage', () => {
        localStorage.setItem('claude-api-key', 'sk-ant-existing');
        render(<ApiKeySettings onKeyChange={() => {}} />);

        const input = screen.getByPlaceholderText(/sk-ant-/i) as HTMLInputElement;
        expect(input.value).toBe('sk-ant-existing');
    });
});
