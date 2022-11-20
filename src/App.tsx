import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";
import { Page_404 } from "./pages/404";
import Main from "./pages/main";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Main />} />
          <Route path="*" element={<Page_404 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
