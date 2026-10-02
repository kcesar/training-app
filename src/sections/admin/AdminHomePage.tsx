import * as React from "react";
import { Box, Button, Container, List, ListItemButton, ListItemText, ListSubheader, Paper, Typography } from "@mui/material";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import MainChrome from "../../components/MainChrome";
import AdminStore from "../../store/adminStore";
import { formatOfferingDatesShort } from "../../models/offeringViewModel";
import NewSeasonDialog from "./NewSeasonDialog";

export const AdminHomePage = (props: {
  store: AdminStore
}) => {
  const [newSeasonOpen, setNewSeasonOpen] = React.useState(false);
  return (
  <MainChrome>
    <Container>
      <List sx={{ bgcolor: 'background.paper' }}>
        <ListItemButton component={Link} to={'trainees'} alignItems="center">
          <ListItemText primary="Trainee List" />
        </ListItemButton>
        <ListItemButton component={Link} to={'help'} alignItems="center">
          <ListItemText primary="Help" secondary="User manual for training admins and course leads" />
        </ListItemButton>
      </List>
      <List sx={{ bgcolor: 'background.paper' }} subheader={<ListSubheader component="div">Courses</ListSubheader>}>
        {props.store.courseList.map(c => (
          <ListItemButton key={c.id} component={Link} to={`courses/${c.id}`}>
            <ListItemText
              primary={c.title}
              secondary={(props.store.offerings[c.id] ?? []).map(formatOfferingDatesShort).join(', ')} />
          </ListItemButton>
        ))}
      </List>
      <Paper variant="outlined" sx={{ mt: 4, mb: 4, p: 2 }}>
        <Typography variant="subtitle1">Training season</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          After graduation, start a new season to clear out all sessions, registrations and completions. Course settings are kept.
        </Typography>
        <Box><Button color="error" variant="outlined" onClick={() => setNewSeasonOpen(true)}>Start New Training Season</Button></Box>
      </Paper>
      <NewSeasonDialog store={props.store} open={newSeasonOpen} onClose={() => setNewSeasonOpen(false)} />
    </Container>
  </MainChrome>
  );
};

export default observer(AdminHomePage);