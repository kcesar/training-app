import * as React from "react";
import { Box, Button, Container, List, Paper, Stack, Tooltip, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { observer } from "mobx-react";
import { Link, useParams } from "react-router-dom";
import MainChrome from "../../components/MainChrome";
import AdminStore from "../../store/adminStore";
import CourseStore from "../../store/courseStore";
import CourseSettingsSection from "./CourseSettingsSection";
import OfferingListItem from "./OfferingListItem";
import OfferingEditor, { SETTINGS_DIRTY_REASON } from "./OfferingEditor";

// Database default for an offering's size, used when a course has no offerings to copy from.
const DEFAULT_CAPACITY = 35;

export const CourseContent = observer((props: {
  store: AdminStore,
  courseStore: CourseStore
}) => {
  const { store, courseStore } = props;
  const [adding, setAdding] = React.useState(false);
  const [settingsDirty, setSettingsDirty] = React.useState(false);
  // Use the course list entry for settings: it only changes when the settings are saved.
  const settings = store.courseList.find(c => c.id === courseStore.courseId);
  const course = courseStore.course;
  if (!settings || !course) return <Container><Box sx={{m:1}}><Link to="/admin">Admin</Link> &gt; Course not found</Box></Container>;

  const offerings = course.offerings ?? [];
  return (
    <Container>
      <Box sx={{m:1}}><Link to="/admin">Admin</Link> &gt; {course.title}</Box>
      <CourseSettingsSection key={settings.id} store={store} course={settings} onDirtyChange={setSettingsDirty} />
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{mt:3, mb:1, mx:1}}>
        <Typography variant="h6">Sessions</Typography>
        <Tooltip title={settingsDirty ? SETTINGS_DIRTY_REASON : ''}>
          <span><Button size="small" variant="outlined" startIcon={<AddIcon />} disabled={adding || settingsDirty} onClick={() => setAdding(true)}>Add Session</Button></span>
        </Tooltip>
      </Stack>
      <Paper sx={{mb:3}}>
        {offerings.length === 0 && !adding ? (
          <Typography variant="body2" color="text.secondary" sx={{p:2}}>No sessions scheduled.</Typography>
        ) : (
          <List disablePadding>
            {adding && (
              <OfferingEditor
                course={settings}
                settingsDirty={settingsDirty}
                registered={0}
                initialStart={null}
                initialCapacity={offerings[offerings.length - 1]?.capacity ?? DEFAULT_CAPACITY}
                saveLabel="Add"
                onSave={async offering => {
                  await store.createOffering(settings.id, offering);
                  courseStore.loadOfferingCompletions();
                  setAdding(false);
                }}
                onCancel={() => setAdding(false)}
              />
            )}
            {offerings.map(o => (
              <OfferingListItem
                key={o.id}
                store={store}
                course={settings}
                settingsDirty={settingsDirty}
                offering={o}
                registered={courseStore.getRoster(o.id + '').length}
                waitlist={courseStore.getWaitlist(o.id + '').map(s => s.traineeName)}
                onChanged={() => courseStore.loadSignups()}
                completions={courseStore.offeringCompletions[o.id + ''] ?? 0}
              />
            ))}
          </List>
        )}
      </Paper>
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
      <CourseContent store={props.store} courseStore={courseStore} />
    </MainChrome>
  );
};

export default observer(CoursePage);
