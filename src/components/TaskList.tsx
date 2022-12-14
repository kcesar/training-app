import * as React from 'react';
import { Divider, List, ListItemAvatar, ListItemButton, ListItemText } from "@mui/material";
import { observer } from "mobx-react";
import { TaskProgress } from '../store/tasksStore';
import BlockedIcon from '@mui/icons-material/Block';
import CheckIcon from '@mui/icons-material/Check';
import { Link } from 'react-router-dom';
import { TrainingTask } from '../store';

const TaskList = ({tasks, coursesRoot, selectedId} :{tasks: TaskProgress<TrainingTask>[], coursesRoot: string, selectedId?: string}) => (
  <List sx={{ bgcolor: 'background.paper' }}>
    {tasks.map((progress, i) => (
      <React.Fragment key={progress.task.id}>
        {i > 0 && <Divider  component="li" />}
        <ListItemButton component={Link} to={`${coursesRoot}${progress.task.id}`} alignItems="center" selected={!!selectedId && progress.task.id === selectedId}>
          <ListItemAvatar>
            {progress.blockedBy.length > 0 ? <BlockedIcon color="disabled" /> :
            progress.completed ? <CheckIcon color="success" /> :
            undefined}
          </ListItemAvatar>
          <ListItemText
            style={{ whiteSpace: 'nowrap' }}
            primary={progress.task.title}
          />
        </ListItemButton>
      </React.Fragment>
    ))}
  </List>
)

export default observer(TaskList);
