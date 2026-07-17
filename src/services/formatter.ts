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
        } catch {
            console.error('Invalid URL:', url);
            return '';
        }
    }

    static async getTitleFromUrl(url: string): Promise<string> {
        try {
            const metadata = await this.fetchMetadata(url);
            return metadata.title;
        } catch {
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
            '&ndash;': '\u2013',
            '&mdash;': '\u2014',
            '&nbsp;': ' ',
            '&rsquo;': '\u2019',
            '&lsquo;': '\u2018',
            '&rdquo;': '\u201d',
            '&ldquo;': '\u201c',
            '&hellip;': '\u2026',
            '&trade;': '\u2122',
            '&reg;': '\u00ae',
            '&copy;': '\u00a9'
        };
        return text.replace(/&(?:amp|lt|gt|quot|#39|apos|ndash|mdash|nbsp|rsquo|lsquo|rdquo|ldquo|hellip|trade|reg|copy);/g, (match) => entities[match] || match);
    }

    static cleanTitle(raw: string): string {
        if (!raw) return raw;

        let title = raw;

        // 1. Decode HTML entities first
        title = this.decodeHTMLEntities(title);

        // 2. Strip content in brackets: [PDF], (Official), {Blog}
        title = title.replace(/\[.*?\]/g, '').trim();
        title = title.replace(/\(.*?\)/g, '').trim();
        title = title.replace(/\{.*?\}/g, '').trim();

        // 3. Remove emojis using Unicode property escapes
        title = title.replace(/\p{Emoji_Presentation}/gu, '');
        title = title.replace(/\p{Emoji}\uFE0F/gu, '');
        title = title.replace(/[\u200D]/g, '');
        title = title.trim();

        // 4. Strip site name suffixes: " | SiteName", " - SiteName", " :: SiteName"
        title = title.replace(/\s*[|–—:]+\s*\S+\s*$/i, '').trim();

        // 5. Remove trailing/leading separators
        title = title.replace(/^[\s|–—:.,\-\u2022]+|[\s|–—:.,\-\u2022]+$/g, '').trim();

        // 6. Collapse multiple whitespace
        title = title.replace(/\s{2,}/g, ' ').trim();

        // 7. Remove zero-width characters and invisible unicode
        title = title.replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, '').trim();

        // 8. Truncate to 60 chars
        if (title.length > 60) {
            title = title.slice(0, 57).trimEnd() + '...';
        }

        return title;
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
        } catch {
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
                    title = this.cleanTitle(titleMatch[1].trim());
                }

                // Helper to get meta contents robustly
                const getMetaContent = (name: string): string | null => {
                    const attrOrderRegex = new RegExp(`<meta[^>]*(?:property|name)\\s*=\\s*["']${name}["'][^>]*content\\s*=\\s*["']([^"']+)["'][^>]*>`, 'i');
                    const reverseOrderRegex = new RegExp(`<meta[^>]*content\\s*=\\s*["']([^"']+)["'][^>]*(?:property|name)\\s*=\\s*["']${name}["'][^>]*>`, 'i');
                    const match = html.match(attrOrderRegex) || html.match(reverseOrderRegex);
                    return match ? this.cleanTitle(match[1].trim()) : null;
                };

                // 2. Description Extraction
                const standardDesc = html.match(/<meta[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*>/i)
                    || html.match(/<meta[^>]*content\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']description["'][^>]*>/i);
                if (standardDesc && standardDesc[1]) {
                    description = this.decodeHTMLEntities(standardDesc[1].trim());
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
                        const href = match[1].trim();
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
        } catch {
            console.error('Failed to fetch metadata for URL:', normalizedUrl);
        }

        return {
            title: title || defaultTitle,
            description: description || '',
            icon: icon || defaultIcon
        };
    }
}
