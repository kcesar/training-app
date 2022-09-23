import { Box, Button, Container, List, ListItem, ListItemText } from "@mui/material";
import { observer } from "mobx-react";
import { Link, useParams } from "react-router-dom";
import { format as formatDate } from 'date-fns';
import MainChrome from "../../components/MainChrome";
import AdminStore from "../../store/adminStore";

export const RosterPage = (props: {
  store: AdminStore
}) => {
  const params = useParams<{course:string, offeringId:string}>();
  const courseId = params.course!;
  const courseStore = props.store.getCourseStore(courseId);
  const course = courseStore.course;
  if (!course) return (<MainChrome>Course not found</MainChrome>);

  const offering = course?.offerings?.find(o => (o.id + '') === params.offeringId)
  if (!offering) return (<MainChrome>Loading...</MainChrome>);
  const roster = course.signups.filter(s => s.offeringId === offering.id + '') ?? [];

  return (
    <MainChrome>
      <Container>
        <Box sx={{m:1}}><Link to="/admin">Admin</Link> &gt; <Link to={`/admin/courses/${course.id}`}>{course.title}</Link> &gt; {formatDate(offering.startAt, 'MMM do')}</Box>
        <List sx={{ bgcolor: 'background.paper' }}>
          {roster.map(s => (
            <ListItem key={s.id}>
              <ListItemText primary={s.traineeName} />
            </ListItem>
          ))}
        </List>

        <Button variant="outlined" onClick={() => courseStore.generateCSV(roster)}>Spreadsheet</Button>
      </Container>
    </MainChrome>
  );
};

export default observer(RosterPage);