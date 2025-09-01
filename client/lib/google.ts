// Google One Tap integration helper
// This does not render any new UI elements; it loads Google's overlay.

import { apiFetch, setToken } from "./api";

declare global {
  interface Window {
    google?: any;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(s);
  });
}

export async function initGoogleOneTap(onLoggedIn: (user: any) => void) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (!clientId) return; // not configured

  await loadScript("https://accounts.google.com/gsi/client");

  window.google?.accounts.id.initialize({
    client_id: clientId,
    auto_select: false,
    callback: async (response: { credential: string }) => {
      try {
        const data = await apiFetch<{ ok: boolean; accessToken: string; user: any }>(
          "/auth/google",
          {
            method: "POST",
            body: JSON.stringify({ idToken: response.credential }),
          },
        );
        setToken(data.accessToken);
        onLoggedIn(data.user);
      } catch (e) {
        console.error(e);
      }
    },
  });

  // Shows the One Tap prompt overlay
  window.google?.accounts.id.prompt();
}
