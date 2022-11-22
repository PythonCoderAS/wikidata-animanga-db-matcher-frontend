import AppBar from "@mui/material/AppBar";
import Link from "@mui/material/Link";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import { doAuthenticatedRequest, ensureToken, profileurl } from "./oauth";

interface Profile {
  username: string;
}

export default function Header() {
  const [username, setUsername] = useState<string | null>(
    sessionStorage.getItem("username")
  );
  if (!username) {
    navigator.locks.request("username", { ifAvailable: true }, async (lock) => {
      if (!lock) {
        return;
      } else {
        const loggedIn = await ensureToken();
        if (loggedIn) {
          try {
            const profileResp = await doAuthenticatedRequest(profileurl);
            if (profileResp.ok) {
              const profile: Profile = await profileResp.json();
              setUsername(profile.username);
              sessionStorage.setItem("username", profile.username);
            } else {
              throw new Error(
                `Got HTTP ${profileResp.status} ${profileResp.statusText} during profile request.`
              );
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    });
  }
  return (
    <AppBar position="static" sx={{ marginBottom: "15px" }}>
      <Toolbar>
        <Typography sx={{ flexGrow: 1, fontSize: "125%" }}>
          <Link href="/" underline="none" color="inherit">
            Animanga DB Matcher
          </Link>
        </Typography>
        <Typography>
          {username ? (
            `Welcome back ${username}`
          ) : (
            <Link href="/oauth/login" underline="none" color="inherit">
              Not Logged In, Please Login
            </Link>
          )}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
