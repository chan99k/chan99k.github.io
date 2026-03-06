// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { ApiKeySettings } from './ApiKeySettings';

describe('ApiKeySettings', () => {
    beforeEach(() => sessionStorage.clear());
    afterEach(() => cleanup());

    it('renders provider select, input and save button', () => {
        render(<ApiKeySettings onSettingsChange={() => {}} />);
        expect(screen.getByPlaceholderText(/sk-ant-/i)).toBeDefined();
        expect(screen.getByRole('button', { name: /저장/i })).toBeDefined();
        expect(screen.getByRole('combobox')).toBeDefined();
    });

    it('saves key and provider to sessionStorage on submit', () => {
        const onSettingsChange = vi.fn();
        render(<ApiKeySettings onSettingsChange={onSettingsChange} />);

        const input = screen.getByPlaceholderText(/sk-ant-/i);
        fireEvent.change(input, { target: { value: 'sk-ant-test-key-123' } });
        fireEvent.click(screen.getByRole('button', { name: /저장/i }));

        expect(sessionStorage.getItem('interview-api-key')).toBe('sk-ant-test-key-123');
        expect(sessionStorage.getItem('interview-provider')).toBe('claude');
        expect(onSettingsChange).toHaveBeenCalledWith('sk-ant-test-key-123', 'claude');
    });

    it('loads existing key from sessionStorage', () => {
        sessionStorage.setItem('interview-api-key', 'sk-ant-existing');
        sessionStorage.setItem('interview-provider', 'claude');
        render(<ApiKeySettings onSettingsChange={() => {}} />);

        const input = screen.getByPlaceholderText(/sk-ant-/i) as HTMLInputElement;
        expect(input.value).toBe('sk-ant-existing');
    });

    it('changes placeholder when provider changes', () => {
        render(<ApiKeySettings onSettingsChange={() => {}} />);

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'openai' } });

        expect(screen.getByPlaceholderText(/^sk-\.\.\./)).toBeDefined();
    });
});
