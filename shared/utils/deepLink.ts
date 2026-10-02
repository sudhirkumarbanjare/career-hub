export interface ParsedDeepLink {
  app: 'student' | 'client' | 'admin';
  screen: string;
  params?: Record<string, string>;
}

export function parseDeepLink(url: string): ParsedDeepLink | null {
  try {
    if (!url) return null;
    let cleanUrl = url
      .replace(/^https?:\/\/(www\.)?gotechplace\.com\//i, '')
      .replace(/^https?:\/\/(www\.)?tech2place\.com\//i, '')
      .replace(/^gotechplace:\/\//i, '')
      .replace(/^tech2place:\/\//i, '');

    const [pathPart, queryPart] = cleanUrl.split('?');
    const segments = pathPart.split('/').filter(Boolean);

    if (segments.length === 0) return null;

    let appSegment = segments[0].toLowerCase() as 'student' | 'client' | 'admin';
    let screenSegment = (segments[1] || 'home').toLowerCase();

    // If first segment is a known screen rather than app name (e.g. gotechplace://job/101)
    if (!['student', 'client', 'admin'].includes(appSegment)) {
      screenSegment = appSegment;
      appSegment = 'student';
    }

    const params: Record<string, string> = {};

    // Check if 3rd segment is an ID, e.g. gotechplace://student/job/job123
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
  let url = `gotechplace://${app}/${screen}`;
  if (params && Object.keys(params).length > 0) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      query.set(k, String(v));
    });
    url += `?${query.toString()}`;
  }
  return url;
}
