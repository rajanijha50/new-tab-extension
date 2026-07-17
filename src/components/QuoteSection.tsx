import React, { useEffect, useState } from 'react';
import { MdRefresh } from 'react-icons/md';
import type { Quote } from '../types/quote';
import { quoteService } from '../services/api';
import { GlassCard } from './ui/GlassCard';
import clsx from 'clsx';

export const QuoteSection: React.FC = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [fade, setFade] = useState(true);

  const fetchQuote = async (force: boolean = false) => {
    setLoading(true);
    setFade(false);
    
    // Smooth delay for animation to prevent harsh jump
    setTimeout(async () => {
      try {
        const data = await quoteService.getDailyQuote(force);
        setQuote(data);
      } catch (e) {
        console.error('Failed to get quote:', e);
      } finally {
        setFade(true);
        setLoading(false);
      }
    }, 250);
  };

  useEffect(() => {
    fetchQuote(false);
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-4 animate-fade-in">
      <GlassCard className="relative flex flex-col items-center text-center p-8 overflow-hidden min-h-[140px] justify-center">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-accent-primary/5 via-transparent to-accent-rose/5 dark:from-accent-primary/3 dark:to-accent-rose/3 pointer-events-none rounded-2xl" />

        {/* Refresh button */}
        <button
          onClick={() => fetchQuote(true)}
          disabled={loading}
          className="absolute top-3 right-3 p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-accent-primary hover:bg-white/15 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer disabled:opacity-50"
          title="Refresh today's quote"
          aria-label="Refresh today's quote"
        >
          <MdRefresh
            className={clsx('text-xl transition-transform duration-700', loading && 'animate-spin')}
          />
        </button>

        {/* Quote body */}
        <div
          className={clsx(
            'relative z-10 transition-all duration-300 flex flex-col items-center gap-2 max-w-[90%]',
            fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
          )}
        >
          {quote ? (
            <>
              <p className="text-lg md:text-xl font-medium italic text-gray-800 dark:text-gray-100 leading-relaxed">
                &ldquo;{quote.text}&rdquo;
              </p>
              <p className="text-xs md:text-sm font-semibold tracking-wider text-accent-primary mt-1">
                &mdash; {quote.author || 'Unknown'}
              </p>
            </>
          ) : (
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default QuoteSection;
