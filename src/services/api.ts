import type { Quote } from '../types/quote';
import type { QuoteApiType } from '../types/settings';

const CACHE_KEY = 'cached_quote';
const CACHE_TIME_KEY = 'cached_quote_timestamp';
const CACHE_TTL = 3600000; // 1 hour in ms

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
  private apiType: QuoteApiType = 'quotable';

  setApiType(type: QuoteApiType): void {
    this.apiType = type;
  }

  clearCache(): void {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIME_KEY);
  }

  getAvailableApis(): Record<QuoteApiType, string> {
    return {
      quotable: 'https://api.quotable.io/random',
      zenquotes: 'https://zenquotes.io/api/random',
      adviceslip: 'https://api.adviceslip.com/advice',
    };
  }

  async getRandomQuote(forceRefresh: boolean = false): Promise<Quote> {
    if (!forceRefresh) {
      const cachedStr = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      
      if (cachedStr && cachedTime) {
        const parsedTime = parseInt(cachedTime, 10);
        if (Date.now() - parsedTime < CACHE_TTL) {
          try {
            return JSON.parse(cachedStr) as Quote;
          } catch {
            // ignore error, fetch fresh
          }
        }
      }
    }

    try {
      const quote = await this.fetchWithTimeout();
      localStorage.setItem(CACHE_KEY, JSON.stringify(quote));
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      return quote;
    } catch (e) {
      console.warn("Failed to fetch quote, returning fallback:", e);
      const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
      return FALLBACK_QUOTES[randomIndex];
    }
  }

  private async fetchWithTimeout(): Promise<Quote> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);

    const apiUrls = this.getAvailableApis();
    const url = apiUrls[this.apiType];

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      return this.parseResponse(data);
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  }

  private parseResponse(data: any): Quote {
    if (this.apiType === 'quotable') {
      if (data && data.content && data.author) {
        return { text: data.content, author: data.author };
      }
    } else if (this.apiType === 'zenquotes') {
      if (Array.isArray(data) && data[0] && data[0].q && data[0].a) {
        return { text: data[0].q, author: data[0].a };
      }
    } else if (this.apiType === 'adviceslip') {
      if (data && data.slip && data.slip.advice) {
        return { text: data.slip.advice, author: 'Advice Slip' };
      }
    }
    throw new Error('Unknown response format or API error');
  }
}

export const quoteService = new QuoteService();
export default quoteService;
