import AppBar from "@mui/material/AppBar";
import Link from "@mui/material/Link";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

export default function Header() {
  return (
    <AppBar position="static" sx={{ marginBottom: "15px" }}>
      <Toolbar>
        <Typography sx={{ flexGrow: 1, fontSize: "125%" }}>
          <Link href="/" underline="none" color="inherit">
            Animanga DB Import
          </Link>
        </Typography>
        <Typography>
          <Link href="/login" underline="none" color="inherit">
            Not Logged In, Please Login
          </Link>
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
