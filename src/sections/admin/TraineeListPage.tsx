import { Box, Container, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import MainChrome from "../../components/MainChrome";
import AdminStore from "../../store/adminStore";

export const TraineeListPage = (props: {
  store: AdminStore
}) => {
  const { store } = props;

  return (
    <MainChrome>
      <Container>
      <Box sx={{m:1}}><Link to="/admin">Admin</Link> &gt; Basic Trainees</Box>
        <List sx={{ bgcolor: 'background.paper' }}>
          {store.trainees.map(t => (
            <ListItemButton key={t.primaryEmail} component={Link} to={t.primaryEmail} alignItems="center">
              <ListItemText primary={t.name.fullName} />
            </ListItemButton>
          ))}
        </List>
      </Container>
    </MainChrome>
  );
};

export default observer(TraineeListPage);