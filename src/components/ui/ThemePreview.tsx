'use client';

import { motion } from 'framer-motion';
import { ThemeVariant } from '@/lib/theme-config';

interface ThemePreviewProps {
  theme: ThemeVariant;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ThemePreview({ 
  theme, 
  isSelected = false, 
  onClick, 
  className = '' 
}: ThemePreviewProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        relative p-3 rounded-lg border-2 transition-all duration-200
        ${isSelected 
          ? 'border-primary shadow-md' 
          : 'border-border hover:border-primary/50 hover:shadow-sm'
        }
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Theme preview colors */}
      <div className="flex items-center gap-2 mb-2">
        <div 
          className="w-4 h-4 rounded-full border border-border"
          style={{ backgroundColor: theme.preview.background }}
        />
        <div 
          className="w-4 h-4 rounded-full border border-border"
          style={{ backgroundColor: theme.preview.foreground }}
        />
        <div 
          className="w-4 h-4 rounded-full border border-border"
          style={{ backgroundColor: theme.preview.accent }}
        />
      </div>

      {/* Theme info */}
      <div className="text-left">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-sm">{theme.icon}</span>
          <span className="text-sm font-medium">{theme.name}</span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {theme.description}
        </p>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
        />
      )}
    </motion.button>
  );
}