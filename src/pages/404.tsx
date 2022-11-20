import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

import Header from "../common/header";

export function Page_404() {
  return (
    <div>
      <Header />
      <Alert severity="error">
        <AlertTitle>404 Page Not Found</AlertTitle>
        Page not found. If you clicked on a link that brought you here, please
        let the webmaster know.
      </Alert>
    </div>
  );
}
