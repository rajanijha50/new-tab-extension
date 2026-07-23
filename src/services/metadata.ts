export interface UrlMetadata {
  url: string;
  title: string;
  domain: string;
  faviconUrl: string;
}

export async function fetchUrlMetadata(inputUrl: string): Promise<UrlMetadata> {
  let urlString = inputUrl.trim();
  if (!/^https?:\/\//i.test(urlString)) {
    urlString = `https://${urlString}`;
  }

  let domain: string;
  try {
    const parsed = new URL(urlString);
    domain = parsed.hostname.replace(/^www\./i, '');
  } catch {
    domain = urlString.replace(/^www\./i, '').split('/')[0];
  }

  // Derive a clean display title from domain (e.g., github.com -> Github)
  let cleanTitle = domain.split('.')[0] || 'Link';
  if (cleanTitle.length > 0) {
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  }

  // High-resolution Google Favicon service
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;

  // Optional background fetch attempt for page title (fallback if CORS blocks)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(urlString, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors',
    });
    clearTimeout(timeout);

    if (response.ok) {
      const html = await response.text();
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        cleanTitle = titleMatch[1].trim();
      }
    }
  } catch {
    // Ignore CORS / network timeout; use clean domain title
  }

  return {
    url: urlString,
    title: cleanTitle,
    domain,
    faviconUrl,
  };
}
