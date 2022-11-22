import { Alert, Button, CircularProgress, Link, Stack } from "@mui/material";
import { useState } from "react";

import Header from "../../common/header";
import {
  clearInfo,
  loadPKCE as loadPKCEBase,
  saveLoginResults,
  token,
} from "../../common/oauth";
import config from "./config.json";

async function loadPKCE(setError: (error: string) => unknown) {
  try {
    return loadPKCEBase();
  } catch (e) {
    setError(`Error getting PKCE: ${e}`);
    return null;
  }
}

async function endLogin(setError: (error: string) => unknown) {
  const query = new URL(location.href).searchParams;
  const state = query.get("state");
  const savedState = localStorage.getItem("state");
  if (state !== savedState) {
    setError("State mismatch. Please restart the login process.");
    return;
  } else {
    localStorage.removeItem("state");
  }
  const error = query.get("error");
  if (error) {
    const errorDescription = query.get("error_description");
    const message = query.get("message");
    setError(message ? message : errorDescription ? errorDescription : error);
    return;
  }
  const code = query.get("code");
  if (!code) {
    setError("No code provided. Please restart the login process.");
    return;
  }
  const pkce = await loadPKCE(setError);
  if (!pkce) {
    return;
  }
  console.log(pkce);
  let data = {
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUrl,
    client_id: config.clientId,
    code_verifier: pkce.codeVerifier,
  };
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
      location.href = "/";
    } else {
      throw new Error(
        `Got HTTP ${resp.status} ${resp.statusText} during post-token authorization.`
      );
    }
  } catch (e) {
    setError(`Error finishing authorization: ${e}`);
  }
}

export default function loginCallback() {
  const [error, setError] = useState<string | null>(null);
  if (error === null) {
    navigator.locks.request(
      "finishOauth",
      { mode: "exclusive", ifAvailable: true },
      async (lock) => {
        if (lock) {
          await endLogin(setError);
        }
      }
    );
  } else {
    clearInfo();
  }
  return (
    <div>
      <Header />
      <Stack spacing={1}>
        {error ? (
          <>
            <Alert severity="error">{error}</Alert>
            <Stack spacing={1} direction="row">
              <Button variant="contained">
                <Link underline="none" color="inherit" href="/">
                  Go to Home
                </Link>
              </Button>
              <Button variant="contained">
                <Link underline="none" color="inherit" href="/oauth/login">
                  Restart Login
                </Link>
              </Button>
            </Stack>
          </>
        ) : (
          <>
            <Alert severity="info">Finishing login request...</Alert>
            <CircularProgress />
          </>
        )}
      </Stack>
    </div>
  );
}
