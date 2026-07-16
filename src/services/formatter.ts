export default class LinkFormatter {

    static getIconFromUrl(url: string): string {
        try {
            const parsedUrl = new URL(url);
            return `${parsedUrl.origin}/favicon.ico`;
        } catch (e) {
            console.error('Invalid URL:', url);
            return '';
        }
    }

    static async getTitleFromUrl(url: string): Promise<string> {
        try {
            const options: RequestInit = {
              redirect: 'follow',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
              }
            };

            const response = await fetch(url, options);
            if (!response.ok) {
              console.warn(`Failed to fetch ${url}. HTTP status: ${response.status}`);
              return url;
            }

            const html = await response.text();
            const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
            if (titleMatch && titleMatch[1].trim()) {
              return titleMatch[1].trim();
            }

            const getMetaContent = (name: string): string | null => {
              const attrOrderRegex = new RegExp(`<meta[^>]*(?:property|name)\s*=\s*["']${name}["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*>`, 'i');
              const reverseOrderRegex = new RegExp(`<meta[^>]*content\s*=\s*["']([^"']+)["'][^>]*(?:property|name)\s*=\s*["']${name}["'][^>]*>`, 'i');
              const match = html.match(attrOrderRegex) || html.match(reverseOrderRegex);
              return match ? match[1].trim() : null;
            };

            const ogTitle = getMetaContent('og:title');
            if (ogTitle) {
              return ogTitle;
            }

            const twitterTitle = getMetaContent('twitter:title');
            if (twitterTitle) {
              return twitterTitle;
            }

            return url;
        } catch (e) {
            console.error('Failed to fetch title for URL:', url, e);
            return url;
        }
    }
}