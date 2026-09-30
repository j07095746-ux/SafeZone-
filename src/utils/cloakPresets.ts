import { CloakPreset } from '../types';

export interface CloakInfo {
  name: string;
  title: string;
  iconUrl: string;
  badge: string;
}

export const CLOAK_PRESETS: Record<CloakPreset, CloakInfo> = {
  none: {
    name: 'Default (SafeZone)',
    title: 'SafeZone',
    iconUrl: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233b82f6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/></svg>",
    badge: 'Original'
  },
  classroom: {
    name: 'Google Classroom',
    title: 'Classes - Google Classroom',
    iconUrl: 'https://ssl.gstatic.com/classroom/favicon.png',
    badge: 'Popular'
  },
  drive: {
    name: 'Google Drive',
    title: 'My Drive - Google Drive',
    iconUrl: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png',
    badge: 'School'
  },
  docs: {
    name: 'Google Docs',
    title: 'Untitled document - Google Docs',
    iconUrl: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico',
    badge: 'Stealth'
  },
  canvas: {
    name: 'Canvas LMS',
    title: 'Dashboard - Canvas',
    iconUrl: 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico',
    badge: 'LMS'
  },
  desmos: {
    name: 'Desmos Calculator',
    title: 'Desmos | Graphing Calculator',
    iconUrl: 'https://www.desmos.com/favicon.ico',
    badge: 'Math'
  },
  edpuzzle: {
    name: 'Edpuzzle',
    title: 'Edpuzzle',
    iconUrl: 'https://edpuzzle.imgix.net/favicons/favicon-32.png',
    badge: 'School'
  },
  khan: {
    name: 'Khan Academy',
    title: 'Khan Academy | Free Online Courses, Lessons & Practice',
    iconUrl: 'https://cdn.kastatic.org/images/favicon.ico',
    badge: 'Study'
  }
};

export function applyCloak(preset: CloakPreset, customTitle?: string, customFavicon?: string) {
  if (typeof document === 'undefined') return;

  const info = CLOAK_PRESETS[preset] || CLOAK_PRESETS.none;
  const targetTitle = customTitle && customTitle.trim() ? customTitle.trim() : info.title;
  const targetIcon = customFavicon && customFavicon.trim() ? customFavicon.trim() : info.iconUrl;

  document.title = targetTitle;

  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  link.href = targetIcon;
}

export function openAboutBlank(targetUrl?: string, customTitle?: string, customFavicon?: string) {
  try {
    const win = window.open('about:blank', '_blank');
    if (!win) {
      if (targetUrl) window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return false;
    }
    const doc = win.document;
    const url = targetUrl || window.location.href;
    const title = customTitle || 'Classes - Google Classroom';
    const icon = customFavicon || 'https://ssl.gstatic.com/classroom/favicon.png';

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html style="height:100%;margin:0;padding:0;overflow:hidden;background:#000;">
        <head>
          <title>${title}</title>
          <link rel="icon" href="${icon}" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>body,html{height:100%;margin:0;padding:0;overflow:hidden;background:#000;}iframe{width:100%;height:100%;border:none;outline:none;display:block;}</style>
        </head>
        <body>
          <iframe src="${url}" allowfullscreen="true" allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope; gamepad; microphone; camera; clipboard-write" referrerpolicy="no-referrer"></iframe>
        </body>
      </html>
    `);
    doc.close();
    return true;
  } catch {
    if (targetUrl) window.open(targetUrl, '_blank', 'noopener,noreferrer');
    return false;
  }
}

export function openStealthBlobWindow(targetUrl?: string, customTitle?: string, customFavicon?: string) {
  try {
    const url = targetUrl || window.location.href;
    const title = customTitle || 'Classes - Google Classroom';
    const icon = customFavicon || 'https://ssl.gstatic.com/classroom/favicon.png';
    const htmlContent = `
      <!DOCTYPE html>
      <html style="height:100%;margin:0;padding:0;overflow:hidden;background:#000;">
        <head>
          <title>${title}</title>
          <link rel="icon" href="${icon}" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>body,html{height:100%;margin:0;padding:0;overflow:hidden;background:#000;}iframe{width:100%;height:100%;border:none;outline:none;display:block;}</style>
        </head>
        <body>
          <iframe src="${url}" allowfullscreen="true" allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope; gamepad; microphone; camera; clipboard-write" referrerpolicy="no-referrer"></iframe>
        </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    const win = window.open(blobUrl, '_blank');
    if (!win) {
      return openAboutBlank(targetUrl, customTitle, customFavicon);
    }
    return true;
  } catch {
    return openAboutBlank(targetUrl, customTitle, customFavicon);
  }
}
