import * as React from "react";
import { Box, Button, Checkbox, Container, List, ListItem, ListItemIcon, ListItemText, Stack } from "@mui/material";
import { observer } from "mobx-react";
import { Link, useParams } from "react-router-dom";
import { format as formatDate, isPast } from 'date-fns';
import CheckIcon from '@mui/icons-material/Check';
import MainChrome from "../../components/MainChrome";
import AdminStore from "../../store/adminStore";

const UpdateButton = (props: {
  visible: boolean,
  working: boolean,
  inProgress: boolean,
  action: () => void,
}) => (
  props.visible ? <Button disabled={props.inProgress} variant="outlined" size="small" onClick={() => props.action()}>{
    props.working ? 'Working ...' : 'Update Completed'
  }</Button> : null
)

export const RosterPage = (props: {
  store: AdminStore
}) => {
  const params = useParams<{course:string, offeringId:string}>();
  const courseId = params.course!;
  const courseStore = props.store.getCourseStore(courseId);
  const course = courseStore.course;
  const offering = course?.offerings?.find(o => (o.id + '') === params.offeringId)

  React.useEffect(() => {
    courseStore && offering && courseStore.loadCompleted(offering.id + '');
  }, [courseStore, offering]);


  if (!course) return (<MainChrome>Course not found</MainChrome>);

  if (!offering) return (<MainChrome>Loading...</MainChrome>);
  const roster = courseStore.getRoster(offering.id);
  return (
    <MainChrome>
      <Container>
        <Box sx={{m:1}}><Link to="/admin">Admin</Link> &gt; <Link to={`/admin/courses/${course.id}`}>{course.title}</Link> &gt; {formatDate(offering.startAt, 'MMM do')}</Box>
        <Stack spacing={2} direction="row">
          <Button variant="outlined" size="small" onClick={() => courseStore.generateCSV(roster)}>Spreadsheet</Button>
          <Button variant="outlined" size="small" onClick={() => courseStore.generatePDF(roster, course, offering)}>PDF Roster</Button>
          <UpdateButton visible={isPast(offering.startAt)} working={courseStore.loadingCompleted} inProgress={courseStore.editingCompleted} action={() => courseStore.editCompleted(offering.id)} />
        </Stack>
        { courseStore.editingCompleted && <Stack spacing={2} direction="row">
          <Button variant="outlined" size="small" disabled={courseStore.computedWorking} onClick={() => courseStore.finishCompleted(offering.id + '')}>Save</Button>
          <Button variant="outlined" size="small" disabled={courseStore.computedWorking} onClick={() => courseStore.finishCompleted()}>Cancel</Button>
          </Stack>}
        <List sx={{ bgcolor: 'background.paper' }}>
          {roster.map(s => (
            <ListItem key={s.id}>
              <ListItemIcon>
                {courseStore.editingCompleted ?
                <Checkbox
                  edge="start"
                  disabled={courseStore.computedWorking}
                  checked={courseStore.pendingCompleted.includes(s.traineeEmail)}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': `roster-name-${s.id}` }}
                  onChange={evt => courseStore.setCompleted(s.traineeEmail, evt.currentTarget.checked)}
                /> : (courseStore.completed.includes(s.traineeEmail) && <CheckIcon color="success" />)
                }
              </ListItemIcon>
              <ListItemText id={`roster-name-${s.id}`} primary={s.traineeName} />
            </ListItem>
          ))}
        </List>


      </Container>
    </MainChrome>
  );
};

export default observer(RosterPage);