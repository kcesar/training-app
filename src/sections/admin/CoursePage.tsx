import { Box, Container, List, ListItemButton, ListItemText } from "@mui/material";
import { observer } from "mobx-react";
import { Link, useParams } from "react-router-dom";
import { format as formatDate } from 'date-fns';
import MainChrome from "../../components/MainChrome";
import AdminStore from "../../store/adminStore";
import CourseStore from "../../store/courseStore";

export const CourseContent = observer((props: {
  courseStore: CourseStore
}) => {
  const { courseStore } = props;
  if (!courseStore.course) return <></>;

  const course = courseStore.course;
  return (
    <Container>
      <Box sx={{m:1}}><Link to="/admin">Admin</Link> &gt; {courseStore.course?.title ?? 'Course not found'}</Box>
      <List sx={{ bgcolor: 'background.paper' }}>
        {(courseStore.course?.offerings ?? []).map(o => (
          <ListItemButton key={o.id} component={Link} to={o.id + ''}>
            <ListItemText
              primary={`${course.title} - ${formatDate(o.startAt, 'MMM do')}`}
              secondary={`Registered: ${course.signups.filter(f => f.offeringId === (o.id + '')).length}`} />
          </ListItemButton>
        ))}
      </List>
    </Container>
  );
});

export const CoursePage = (props: {
  store: AdminStore
}) => {
  const params = useParams<{course:string}>();
  const courseId = params.course!;
  const courseStore = props.store.getCourseStore(courseId);

  return (
    <MainChrome>
      <CourseContent courseStore={courseStore} />
    </MainChrome>
  );
};

export default observer(CoursePage);