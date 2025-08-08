'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/libs/utils';

interface FullScreenLoaderProps {
  isLoading: boolean;
  className?: string;
}

export function FullScreenLoader({
  isLoading,
  className,
}: FullScreenLoaderProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300',
        className,
      )}
    >
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}
