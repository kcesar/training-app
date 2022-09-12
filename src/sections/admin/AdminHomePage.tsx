import { Container, List, ListItemButton, ListItemText, useTheme } from "@mui/material";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import MainChrome from "../../components/MainChrome";

export const AdminHomePage = () => {
  const theme = useTheme();

  return (
    <MainChrome>
      <Container>
        <List sx={{ bgcolor: 'background.paper' }}>
          <ListItemButton component={Link} to={'trainees'} alignItems="center">
            <ListItemText primary="Trainee List" />
          </ListItemButton>
        </List>
      </Container>
    </MainChrome>
  );
};

export default observer(AdminHomePage);