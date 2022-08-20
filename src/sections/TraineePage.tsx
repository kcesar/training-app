import * as React from 'react';
import { AppBar, Box, Dialog, DialogContent, IconButton, Slide, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import { observer } from "mobx-react";
import { Link, useNavigate } from "react-router-dom";
import MainChrome from "../components/MainChrome";
import TaskList from "../components/TaskList";
import TasksStore from "../store/tasksStore";
import TraineeStore from "../store/tasksStore";
import CloseIcon from "@mui/icons-material/Close";
import { TransitionProps } from "@mui/material/transitions";

const TaskDetailContent = observer(({ store }: { store: TasksStore }) => {
  return (
    <Typography>{store.selected?.task.summary}</Typography>
  )
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
    <Box style={{ display: 'flex', flex: '1 1 auto', position: 'relative' }}>
      <TaskList tasks={store.allTasks} selectedId={store.selected?.task.id} />
      <Box style={{ flex: '1 1 auto', borderLeft: 'solid 1px black', padding: '1rem' }}>
        <Typography variant="h5" component="div">{store.selected?.task.title ?? 'Review your training status'}</Typography>
        <TaskDetailContent store={store} />
      </Box>
    </Box>
  )
})

export const SmallScreen = observer(({ store }: { store: TasksStore }) => {
  return (
    <Box>
      <TaskList tasks={store.allTasks} />
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