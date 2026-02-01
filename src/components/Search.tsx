import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search as SearchIcon, FileText, Folder, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SearchItem {
    title: string;
    description: string;
    slug: string;
    type: 'Blog' | 'Project';
}

export default function Search() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<SearchItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        const openEvent = () => setOpen(true);

        document.addEventListener('keydown', down);
        document.addEventListener('open-search', openEvent);

        // Pre-fetch items
        setLoading(true);
        fetch('/search.json')
            .then(res => res.json())
            .then(data => {
                setItems(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));

        return () => {
            document.removeEventListener('keydown', down);
            document.removeEventListener('open-search', openEvent);
        };
    }, []);

    if (!open) return null;

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="전체 검색"
            className="fixed inset-0 z-[100] flex items-start justify-center pt-24 md:pt-40 px-4 bg-black/50 backdrop-blur-sm transition-all"
            onClick={(e) => {
                if (e.target === e.currentTarget) setOpen(false);
            }}
        >
            <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center px-4 border-b border-gray-100 dark:border-gray-800">
                    <SearchIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <Command.Input
                        placeholder="글 또는 프로젝트 검색..."
                        className="flex-1 py-4 bg-transparent outline-none text-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                    />
                    <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <Command.List className="max-h-[60vh] overflow-y-auto p-2 scroll-py-2 custom-scrollbar">
                    <Command.Empty className="py-6 text-center text-gray-500">검색 결과가 없습니다.</Command.Empty>

                    {loading && (
                        <div className="py-6 text-center text-gray-500">검색 중...</div>
                    )}

                    {!loading && items.length > 0 && (
                        <Command.Group heading="콘텐츠">
                            {items.map((item) => (
                                <Command.Item
                                    key={item.slug}
                                    value={`${item.title} ${item.description}`}
                                    onSelect={() => {
                                        setOpen(false);
                                        window.location.href = item.slug;
                                    }}
                                    className="flex items-start gap-3 p-3 rounded-lg cursor-pointer aria-selected:bg-accent/10 aria-selected:text-accent transition-colors"
                                >
                                    <div className="mt-1">
                                        {item.type === 'Blog' ? <FileText className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <div className="font-medium">{item.title}</div>
                                        <div className="text-sm text-gray-500 line-clamp-1">{item.description}</div>
                                    </div>
                                </Command.Item>
                            ))}
                        </Command.Group>
                    )}
                </Command.List>

                <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 flex items-center justify-between">
                    <span>
                        <kbd className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">Enter</kbd> 선택
                    </span>
                    <span>
                        <kbd className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">ESC</kbd> 닫기
                    </span>
                </div>
            </div>
        </Command.Dialog>
    );
}
