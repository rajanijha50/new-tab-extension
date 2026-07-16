export interface SiteMetadata {
  title: string;
  description: string;
  icon: string;
}

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
            const metadata = await this.fetchMetadata(url);
            return metadata.title;
        } catch (e) {
            return url;
        }
    }

    static decodeHTMLEntities(text: string): string {
        const entities: Record<string, string> = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'",
            '&apos;': "'",
            '&ndash;': '–',
            '&mdash;': '—'
        };
        return text.replace(/&(?:amp|lt|gt|quot|#39|apos|ndash|mdash);/g, (match) => entities[match] || match);
    }

    static async fetchMetadata(url: string): Promise<SiteMetadata> {
        let normalizedUrl = url.trim();
        if (!/^https?:\/\//i.test(normalizedUrl)) {
            normalizedUrl = 'https://' + normalizedUrl;
        }

        let origin = '';
        let hostname = '';
        try {
            const parsedUrl = new URL(normalizedUrl);
            origin = parsedUrl.origin;
            hostname = parsedUrl.hostname;
        } catch (e) {
            // fallback if URL construction fails
        }

        const defaultIcon = origin ? `${origin}/favicon.ico` : '';
        const defaultTitle = hostname || normalizedUrl;

        let title = '';
        let description = '';
        let icon = defaultIcon;

        try {
            const options: RequestInit = {
              redirect: 'follow',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
              }
            };

            const response = await fetch(normalizedUrl, options);
            if (response.ok) {
                const html = await response.text();

                // 1. Title Extraction
                const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
                if (titleMatch && titleMatch[1]) {
                    title = this.decodeHTMLEntities(titleMatch[1].trim());
                }

                // Helper to get meta contents robustly
                const getMetaContent = (name: string): string | null => {
                    const attrOrderRegex = new RegExp(`<meta[^>]*(?:property|name)\\s*=\\s*["']${name}["'][^>]*content\\s*=\\s*["']([^"']+)["'][^>]*>`, 'i');
                    const reverseOrderRegex = new RegExp(`<meta[^]*content\\s*=\\s*["']([^"']+)["'][^>]*(?:property|name)\\s*=\\s*["']${name}["'][^>]*>`, 'i');
                    const match = html.match(attrOrderRegex) || html.match(reverseOrderRegex);
                    return match ? this.decodeHTMLEntities(match[1].trim()) : null;
                };

                // 2. Description Extraction
                const standardDesc = getMetaContent('description');
                if (standardDesc) {
                    description = standardDesc;
                }

                // 3. Fallback Title/Description (Open Graph / Twitter)
                if (!title) {
                    title = getMetaContent('og:title') || getMetaContent('twitter:title') || '';
                }
                if (!description) {
                    description = getMetaContent('og:description') || getMetaContent('twitter:description') || '';
                }

                // 4. Icon Extraction
                const iconRegexes = [
                    /<link[^>]+rel=['"](?:shortcut )?icon['"][^>]+href=['"]([^'"]+)['"]/i,
                    /<link[^>]+href=['"]([^'"]+)['"][^>]+rel=['"](?:shortcut )?icon['"]/i,
                    /<link[^>]+rel=['"]apple-touch-icon['"][^>]+href=['"]([^'"]+)['"]/i,
                    /<link[^>]+href=['"]([^'"]+)['"][^>]+rel=['"]apple-touch-icon['"]/i
                ];

                for (const regex of iconRegexes) {
                    const match = html.match(regex);
                    if (match && match[1]) {
                        let href = match[1].trim();
                        if (href.startsWith('//')) {
                            icon = 'https:' + href;
                        } else if (href.startsWith('/')) {
                            icon = origin ? `${origin}${href}` : href;
                        } else if (!/^https?:\/\//i.test(href)) {
                            icon = origin ? `${origin}/${href}` : href;
                        } else {
                            icon = href;
                        }
                        break;
                    }
                }
            }
        } catch (e) {
            console.error('Failed to fetch metadata for URL:', normalizedUrl, e);
        }

        return {
            title: title || defaultTitle,
            description: description || '',
            icon: icon || defaultIcon
        };
    }
}