export interface ParsedDeepLink {
  app: 'student' | 'client' | 'admin';
  screen: string;
  params?: Record<string, string>;
}

export function parseDeepLink(url: string): ParsedDeepLink | null {
  try {
    if (!url) return null;
    const cleanUrl = url.replace('tech2place://', '');
    const [pathPart, queryPart] = cleanUrl.split('?');
    const segments = pathPart.split('/').filter(Boolean);

    if (segments.length === 0) return null;

    const appSegment = segments[0] as 'student' | 'client' | 'admin';
    const screenSegment = segments[1] || 'home';

    const params: Record<string, string> = {};

    // Check if 3rd segment is an ID, e.g. tech2place://student/job/job123
    if (segments[2]) {
      params.id = segments[2];
    }

    // Parse query params
    if (queryPart) {
      const searchParams = new URLSearchParams(queryPart);
      searchParams.forEach((val, key) => {
        params[key] = val;
      });
    }

    return {
      app: appSegment,
      screen: screenSegment,
      params,
    };
  } catch {
    return null;
  }
}

export function generateDeepLink(
  app: 'student' | 'client' | 'admin',
  screen: string,
  params?: Record<string, string | number>
): string {
  let url = `tech2place://${app}/${screen}`;
  if (params && Object.keys(params).length > 0) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      query.set(k, String(v));
    });
    url += `?${query.toString()}`;
  }
  return url;
}
