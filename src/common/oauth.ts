import config from "../pages/login/config.json";

export type PartialNull<T> = {
  [P in keyof T]?: T[P] | null;
};

export type PartialNullExists<T> = {
  [P in keyof T]: T[P] | null;
};

export interface LoginResults {
  access_token: string | null;
  access_token_expired_ms: number;
  refresh_token: string | null;
}

export interface PKCE {
  state: string;
  codeVerifier: string;
  codeChallenge: string;
}

export interface Results {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export function getLoginResults(): LoginResults {
  return {
    access_token: localStorage.getItem("access_token"),
    refresh_token: localStorage.getItem("refresh_token"),
    access_token_expired_ms: parseFloat(
      localStorage.getItem("access_token_expired_ms") ?? "0"
    ),
  };
}

export async function base64ArrayBuffer(data: ArrayBuffer): Promise<string> {
  // Use a FileReader to generate a base64 data URI
  const base64url: string = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(new Blob([data]));
  });

  /*
  The result looks like
  "data:application/octet-stream;base64,<your base64 data>",
  so we split off the beginning:
  */
  return base64url.split(",", 2)[1];
}

export async function encode(input: ArrayBuffer): Promise<string> {
  return (await base64ArrayBuffer(input))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// A lot of code copied from https://github.com/wikimedia/apiclient-wiki/blob/master/js/apiclient.js

export const authroot = `https://meta.wikimedia.org/w/rest.php`;
export const authorize = `${authroot}/oauth2/authorize`;
export const token = `${authroot}/oauth2/access_token`;
export const profileurl = `${authroot}/oauth2/resource/profile`;

// Source: https://stackoverflow.com/a/27747377/12248328
// dec2hex :: Integer -> String
// i.e. 0-255 -> '00'-'ff'
export function dec2hex(dec: number) {
  return dec.toString(16).padStart(2, "0");
}

// GenerateId :: Integer -> String
export function generateRandomString(len?: number) {
  const arr = new Uint8Array((len || 40) / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, dec2hex).join("");
}

export async function hashSHA256(str: string): Promise<ArrayBuffer> {
  console.log({ op: "hash", method: "SHA-256", input: str });
  const utf8 = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  return hashBuffer;
}

export async function pkceChallengeFromVerifier(v: string) {
  const hash = await hashSHA256(v);
  const challenge = encode(hash);
  console.log({ op: "base64", input: hash, actual: challenge });
  return challenge;
}

export async function makePKCE(): Promise<PKCE> {
  const pkce: Partial<PKCE> = {
    state: generateRandomString(),
    codeVerifier: generateRandomString(90),
  };
  pkce.codeChallenge = await pkceChallengeFromVerifier(pkce.codeVerifier!);
  return pkce as Required<PKCE>;
}

export function savePKCE(pkce: PKCE) {
  localStorage.setItem("pkce_state", pkce.state);
  localStorage.setItem("pkce_code_verifier", pkce.codeVerifier);
}

export async function loadPKCE(): Promise<PKCE> {
  const pkce: PartialNull<PKCE> = {
    state: localStorage.getItem("pkce_state"),
    codeVerifier: localStorage.getItem("pkce_code_verifier"),
  };
  if (!pkce.state || !pkce.codeVerifier) {
    throw new Error(
      "Missing PKCE state or code verifier. Please restart the login process."
    );
  }

  pkce.codeChallenge = await pkceChallengeFromVerifier(pkce.codeVerifier);
  return pkce as Required<PKCE>;
}

export function saveLoginResults(results: Results) {
  localStorage.setItem("access_token", results.access_token);
  localStorage.setItem("refresh_token", results.refresh_token);
  localStorage.setItem(
    "access_token_expired_ms",
    (Date.now() + results.expires_in * 1000).toString()
  );
}

export function clearInfo() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("access_token_expired_ms");
  localStorage.removeItem("pkce_state");
  localStorage.removeItem("pkce_code_verifier");
  sessionStorage.removeItem("username");
}

// Returns true if there is a valid token, false if there is not. False also means all login information has been invalidated.
export async function ensureToken(): Promise<boolean> {
  const loginResults = getLoginResults();
  if (!loginResults.refresh_token) {
    return false;
  }

  // Are we past the expiry date?
  if (Date.now() > loginResults.access_token_expired_ms) {
    let pkce: PKCE;
    try {
      pkce = await loadPKCE();
    } catch {
      // If we get a pad PKCE, we pretend a logout happened.
      clearInfo();
      return false;
    }

    const data = {
      grant_type: "refresh_token",
      refresh_token: loginResults.refresh_token,
      redirect_uri: config.redirectUrl,
      client_id: config.clientId,
      code_verifier: pkce.codeVerifier,
    };
    // We don't want to use access_token for this
    try {
      const resp = await fetch(token, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
        body: new URLSearchParams(data).toString(),
      });
      if (resp.ok) {
        const results = await resp.json();
        saveLoginResults(results);
        return true;
      }

      clearInfo();
      return false;
    } catch {
      clearInfo();
      return false;
    }
  } else {
    return true;
  }
}

export function doAuthenticatedRequest(
  url: string,
  options?: RequestInit
): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      "User-Agent": "Animanga DB Matcher (User:RPI2026F1)",
      "Api-User-Agent": "Animanga DB Matcher (User:RPI2026F1)",
      ...options?.headers,
      Authorization: `Bearer ${getLoginResults().access_token}`,
    },
  });
}
