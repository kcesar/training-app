import { Container, List, ListItemButton, ListItemText, ListSubheader } from "@mui/material";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import MainChrome from "../../components/MainChrome";
import AdminStore from "../../store/adminStore";

export const AdminHomePage = (props: {
  store: AdminStore
}) => (
  <MainChrome>
    <Container>
      <List sx={{ bgcolor: 'background.paper' }}>
        <ListItemButton component={Link} to={'trainees'} alignItems="center">
          <ListItemText primary="Trainee List" />
        </ListItemButton>
      </List>
      <List sx={{ bgcolor: 'background.paper' }} subheader={<ListSubheader component="div">Courses</ListSubheader>}>
        {props.store.courseList.map(c => (
          <ListItemButton key={c.id} component={Link} to={`courses/${c.id}`}>
            <ListItemText primary={c.title} />
          </ListItemButton>
        ))}
      </List>
    </Container>
  </MainChrome>
);

export default observer(AdminHomePage);