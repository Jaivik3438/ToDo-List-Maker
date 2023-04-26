/**
 * @author Jaivik Tailor
 **/

import * as React from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useLocation } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StartIcon from "@mui/icons-material/Start";
import { useNavigate } from "react-router-dom";

//TODO: Add respective links in sidebar

export default function CommonSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const drawerWidth = 240;

  let CustomListItem = ({ to, primary, tag }) => (
    <ListItem disablePadding>
      <ListItemButton
        onClick={() => {
          navigate(to);
        }}
        selected={location.pathname.includes(to)}
      >
        <ListItemIcon>{tag}</ListItemIcon>
        <ListItemText primary={primary} />
      </ListItemButton>
    </ListItem>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", sm: "none", md: "block" },
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto", mt: 2, color: "#1e69ba" }}>
        <Divider />
        <List>
          <CustomListItem
            to="/add-to-do-list"
            primary="Add TO DO List"
            tag={<AddIcon fontSize="large" />}
          />
          <br/>
          <CustomListItem
            to="/dashboard"
            primary="My TO DO List"
            tag={<VisibilityIcon fontSize="large" />}
          />
        </List>
        <List
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            left: 0,
            color: "red",
          }}
        >
          <Divider sx={{ borderBottomWidth: 4 }} />
          <ListItemButton
            onClick={() => {

              navigate("/login");
            }}
            selected={location.pathname.includes("/something")}
          >
            <ListItemText primary={"Logout"} sx={{ ml: 1 }} />
            <ListItemIcon sx={{ minWidth: 0, mr: 1 }}>
              <StartIcon />
            </ListItemIcon>
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
}
