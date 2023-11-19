import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

interface NavbarPropsInterface {
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar: React.FC<NavbarPropsInterface> = ({ setDrawerOpen }) => {
  return (
    <AppBar position="static" style={{ maxHeight: 60 }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={() => setDrawerOpen((open) => !open)}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, color: "secondary.light" }}
        >
          WhatsLog
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
