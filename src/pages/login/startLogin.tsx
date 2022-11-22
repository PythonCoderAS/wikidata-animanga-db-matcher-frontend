import { Alert, Button } from "@mui/material";
import { Stack } from "@mui/system";

import Header from "../../common/header";
import {
  authorize,
  generateRandomString,
  makePKCE,
  savePKCE,
} from "../../common/oauth";
import config from "./config.json";

async function start() {
  const pkce = await makePKCE();
  savePKCE(pkce);
  const state = generateRandomString();
  localStorage.setItem("state", state);
  let params = {
    client_id: config.clientId,
    response_type: "code",
    redirect_uri: config.redirectUrl,
    state,
    code_challenge: pkce.codeChallenge,
    code_challenge_method: "S256",
  };
  const newUrl = new URL(authorize);
  newUrl.search = new URLSearchParams(params).toString();
  window.location.href = newUrl.toString();
}

export default function startLogin() {
  return (
    <div>
      <Header />
      <Stack spacing={1}>
        <Alert severity="info">
          Click the button below to sign in via OAuth2.
        </Alert>
        <Button variant="contained" onClick={start}>
          Sign in With OAuth2
        </Button>
      </Stack>
    </div>
  );
}
