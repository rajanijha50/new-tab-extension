import type { Quote } from '../types/quote';

const CACHE_KEY = 'cached_quote';
const CACHE_TIME_KEY = 'cached_quote_timestamp';
const CACHE_DATE_KEY = 'cached_quote_date';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

const ZENQUOTES_URL = 'https://zenquotes.io/api/today';

const FALLBACK_QUOTES: Quote[] = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "An unexamined life is not worth living.", author: "Socrates" }
];

class QuoteService {

  clearCache(): void {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIME_KEY);
    localStorage.removeItem(CACHE_DATE_KEY);
  }

  async getDailyQuote(forceRefresh: boolean = false): Promise<Quote> {
    const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

    if (!forceRefresh) {
      const cachedStr = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      const cachedDate = localStorage.getItem(CACHE_DATE_KEY);

      // Valid cache: same calendar day AND within 24 hours
      if (cachedStr && cachedTime && cachedDate === today) {
        const parsedTime = parseInt(cachedTime, 10);
        if (Date.now() - parsedTime < CACHE_TTL) {
          try {
            return JSON.parse(cachedStr) as Quote;
          } catch {
            // corrupt cache — fall through to fetch
          }
        }
      }
    }

    try {
      const quote = await this.fetchQuote();
      console.log("fetched quote: ", quote)
      localStorage.setItem(CACHE_KEY, JSON.stringify(quote));
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      localStorage.setItem(CACHE_DATE_KEY, today);
      return quote;
    } catch (e) {
      console.warn('Failed to fetch daily quote, returning fallback:', e);
      const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
      return FALLBACK_QUOTES[randomIndex];
    }
  }

  private async fetchQuote(): Promise<Quote> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(ZENQUOTES_URL, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (Array.isArray(data) && data[0] && data[0].q && data[0].a) {
        return { text: data[0].q, author: data[0].a };
      }

      throw new Error('Unexpected response format from ZenQuotes');
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }
}

export const quoteService = new QuoteService();
export default quoteService;

