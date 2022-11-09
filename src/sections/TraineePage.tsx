import * as React from 'react';
import { Alert, AppBar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemText, Slide, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { TransitionProps } from "@mui/material/transitions";
import { observer } from "mobx-react";
import { Link, useNavigate } from "react-router-dom";
import { format as formatDate, isFuture } from 'date-fns';
import MainChrome from "../components/MainChrome";
import TaskList from "../components/TaskList";
import TasksStore, { RegistrationAction, TaskProgress } from "../store/tasksStore";
import TraineeStore from "../store/tasksStore";

import { OnlineTask, PaperworkTask, SessionTask } from '../store';
import OfferingViewModel, { formatOfferingDates } from '../models/offeringViewModel';

type RegisterHandler = (offering: OfferingViewModel, action: RegistrationAction) => Promise<void>;

const OnlineTaskContent = ({ progress }: { progress: TaskProgress<OnlineTask> }) => {
  return (
    <>
      <Typography>{progress.task.details}</Typography>
      <Typography sx={{ mt: 2 }}><a target="_blank" rel="noreferrer" href={progress.task.url}>{progress.task.url}</a></Typography>
    </>
  )
}

const PaperworkTaskContent = ({ progress }: { progress: TaskProgress<PaperworkTask> }) => {
  return (
    <Typography>{progress.task.details}</Typography>
  )
}

function getSecondaryContent(progress: TaskProgress<SessionTask>, offering: OfferingViewModel, isAdmin: boolean, register: RegisterHandler) {
  if (!isFuture(offering.startAt)) return undefined;

  const slotsText = `${offering.signedUp}/${offering.capacity} filled`; //+ (s.waiting ? `, ${s.waiting} waiting` : '')

  let registerButton: JSX.Element|undefined = undefined;
  const futureRegistrationCount = Object.values(progress.registrations).filter(f => !f.isPast).length;

  if (progress.registrations[offering.id]?.status === 'registered') {
    registerButton = (<Button size="small" color="primary" variant="outlined" disabled={false} onClick={() => register(offering, 'leave')}>Leave</Button>);
  } else if (!progress.completed && ((offering.signedUp < offering.capacity) || isAdmin) && futureRegistrationCount === 0) {
    const registerText = true ? 'Register' : 'Join Wait List';
    const registerAction = 'register';
    const actionEnabled = isAdmin || (registerAction === 'register' && progress.blockedBy.length === 0);
    registerButton = (<Button size="small" color="primary" variant="outlined" disabled={!actionEnabled} onClick={() => register(offering, registerAction)}>{registerText}</Button>);
  }
  return (<Box sx={{ display: 'flex', justifyContent:'space-between', alignItems: 'center'}}>
    <Box><Typography style={{opacity:0.6}}>{slotsText}</Typography></Box>
    <Box>{registerButton}</Box>
  </Box>)
}

const SessionTaskContent = ({ progress, isAdmin, register }: { progress: TaskProgress<SessionTask>, isAdmin: boolean, register: RegisterHandler}) => {
  return (
    <>
      <List sx={{ maxWidth: '25em' }}>
        {progress.task.offerings.map(o => {
          const dates = formatOfferingDates(o);
          const primaryContent = (<Box sx={{ display: 'flex', justifyContent:'space-between'}}><Typography><strong>{dates}</strong></Typography><Typography>{o.location}</Typography></Box>);
          return (
            <ListItem key={o.id} divider>
              <ListItemText primary={<>{primaryContent}{getSecondaryContent(progress, o, isAdmin, register)}</>} />
            </ListItem>
          );
          })}
      </List>
    </>
  )
}

const BlockingList = ({ courses }: { courses: string[] }) => {
  return (
    <>
      <Typography sx={{ mt: 2, mb: 1 }}>You will not be able to sign up for this course until the following are completed:</Typography>
      <Box sx={{pl: 2}}>{courses.map(c => <Chip sx={{ mr: 1 }} key={c} variant="outlined" label={c} />)}</Box>
    </>
  )
}

const TaskDetailContent = observer(({ store }: { store: TasksStore }) => {
  const progress = store.selected;

  if (!progress) return (<></>);

  let details: JSX.Element | undefined = undefined;
  let taskType: string = "course";

  switch (progress.task.category) {
    case 'online':
      details = <OnlineTaskContent progress={progress as TaskProgress<OnlineTask>} />;
      break;
    case 'paperwork':
      details = <PaperworkTaskContent progress={progress as TaskProgress<PaperworkTask>} />;
      taskType = "task";
      break;
    case 'session':
      details = <SessionTaskContent progress={progress as TaskProgress<SessionTask>} register={store.startRegistration} isAdmin={store.userIsAdmin} />;
      break;
    default:
      details = <div>Unknown</div>
  }

  return (
    <>
      <Typography sx={{ mb: 2 }}>{progress.task.summary}</Typography>
      {progress.blockedBy.length > 0 && <BlockingList courses={progress.blockedBy.map(c => store.getCourseTitle(c) ?? '')} />}
      {progress.completed && <Alert sx={{ mt: 3, maxWidth: 'sm' }} variant="outlined" severity="success">You completed this {taskType} on {formatDate(progress.completed, 'PP')}</Alert>}
      {details}
      <Dialog open={store.registerPrompt.open}
        onClose={() => store.confirmRegistration(false)}>
          <DialogTitle>{store.registerPrompt.title}</DialogTitle>
          <DialogContent>
            {store.registerPrompt.error && <Alert severity="error">{store.registerPrompt.error}</Alert>}
            {store.registerPrompt.body}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => store.confirmRegistration(false)}>Cancel</Button>
            <Button onClick={() => store.confirmRegistration(true)} variant="contained" color="primary">{store.registerPrompt.actionText}</Button>
          </DialogActions>
      </Dialog>
    </>
  );
})

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DetailsPage = observer(({ store }: { store: TasksStore }) => {
  const navigate = useNavigate();
  return (
    <Dialog
      fullScreen
      open={!!store.selected}
      onClose={() => { navigate(store.closeDetailsLink, { replace: true }); }}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton
            component={Link}
            to={store.closeDetailsLink}
            edge="start"
            color="inherit"
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {store.selected?.task.title}
          </Typography>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <TaskDetailContent store={store} />
      </DialogContent>
    </Dialog>
  )
})

export const LargeScreen = observer(({ store }: { store: TasksStore }) => {
  return (
    <>
      {store.showHeader && <Box sx={{m:1}}><Link to="/admin">Admin</Link> &gt; <Link to="/admin/trainees">Trainees</Link> &gt; {store.traineeName}</Box>}
      <Box style={{ display: 'flex', flex: '1 1 auto', position: 'relative' }}>
        <TaskList tasks={store.allTasks} coursesRoot={store.coursesRoot} selectedId={store.selected?.task.id} />
        <Box style={{ flex: '1 1 auto', borderLeft: 'solid 1px black', padding: '1rem' }}>
          <Typography variant="h5" component="div">{store.selected?.task.title ?? 'Review your training status'}</Typography>
          <TaskDetailContent store={store} />
        </Box>
      </Box>
    </>
  )
})

export const SmallScreen = observer(({ store }: { store: TasksStore }) => {
  return (
    <Box>
      {store.showHeader && <Typography>{store.traineeName}</Typography>}
      <TaskList tasks={store.allTasks} coursesRoot={store.coursesRoot} />
      <DetailsPage store={store} />
    </Box>
  )
})


export const TraineePage = (props: {
  store: TraineeStore
}) => {
  const { store } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <MainChrome>
      {fullScreen ? <SmallScreen store={store} /> : <LargeScreen store={store} />}
    </MainChrome>
  );
};

export default observer(TraineePage);
