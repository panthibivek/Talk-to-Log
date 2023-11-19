import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import routeConfig from "./Routes";
import "./App.css";
import Navbar from "./Components/Shared/Navbar";
import { createTheme, ThemeProvider } from "@mui/material";
import LogDrawer from "./Components/Shared/LogDrawer";
import NotificationComponent from "./Components/Shared/NotificationComponent";

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#225071",
        light: "#999999",
        dark: "#000000",
        contrastText: "",
      },
      secondary: {
        main: "#b7aeae",
        light: "#FFFFFF",
        dark: "#000000",
        contrastText: "",
      },
    },
  });

  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);

  return (
    <ThemeProvider theme={theme}>
      <Navbar setDrawerOpen={setDrawerOpen} />
      <NotificationComponent />
      <div className="App">
        <HashRouter>
          <LogDrawer isOpen={drawerOpen} setOpen={setDrawerOpen} />
          <Routes>
            {routeConfig.map((routeInfo, index) => (
              <Route
                key={index}
                path={routeInfo.path}
                element={routeInfo.element}
              />
            ))}
          </Routes>
        </HashRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
