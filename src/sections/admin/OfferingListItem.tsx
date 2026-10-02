import * as React from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, ListItem, ListItemButton, ListItemText, Stack, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import AdminStore from '../../store/adminStore';
import { SessionTask } from '../../store';
import OfferingViewModel, { formatOfferingDatesShort, formatRegistrationStatus } from '../../models/offeringViewModel';
import OfferingEditor, { SETTINGS_DIRTY_REASON } from './OfferingEditor';

function dropText(registered: number, waiting: number) {
  const parts = [];
  if (registered > 0) parts.push(`${registered} registered ${registered === 1 ? 'trainee' : 'trainees'}`);
  if (waiting > 0) parts.push(`${waiting} on the wait list`);
  return parts.join(' and ');
}

// Completions count towards later courses' prerequisites, so these sessions stay until the season is reset.
const LOCKED_REASON = "Can't change or remove a session after trainees have been marked complete";

export const OfferingListItem = (props: {
  store: AdminStore,
  course: SessionTask,
  offering: OfferingViewModel,
  registered: number,
  // Names on the wait list, in order
  waitlist: string[],
  completions: number,
  // Called after the session is changed or removed, so signups can be reloaded
  onChanged?: () => void,
  settingsDirty?: boolean,
}) => {
  const { store, course, offering, registered, waitlist, completions, onChanged } = props;
  const locked = completions > 0;
  const name = `${course.title} ${formatOfferingDatesShort(offering)}`;

  const [editing, setEditing] = React.useState(false);
  const [confirmRemove, setConfirmRemove] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const [removeError, setRemoveError] = React.useState<string>();

  if (editing) {
    return (
      <OfferingEditor
        course={course}
        registered={registered}
        waitlist={waitlist}
        initialStart={offering.startAt}
        initialCapacity={offering.capacity}
        saveLabel="Save"
        settingsDirty={props.settingsDirty}
        onSave={async update => { await store.updateOffering(offering.id, update); setEditing(false); onChanged?.(); }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  const remove = async () => {
    setRemoving(true);
    setRemoveError(undefined);
    try {
      await store.deleteOffering(offering.id);
      onChanged?.();
    } catch (err) {
      setRemoveError((err as Error).message);
      setRemoving(false);
    }
  };

  return (
    <ListItem
      disablePadding
      secondaryAction={
        <Stack direction="row" spacing={1}>
          <Tooltip title={locked ? LOCKED_REASON : props.settingsDirty ? SETTINGS_DIRTY_REASON : 'Edit start and size'}>
            <span><IconButton aria-label="Edit offering" disabled={locked || props.settingsDirty} onClick={() => setEditing(true)}><EditIcon /></IconButton></span>
          </Tooltip>
          <Tooltip title={locked ? LOCKED_REASON : 'Remove session'}>
            <span><IconButton edge="end" aria-label="Remove session" disabled={locked} onClick={() => { setRemoveError(undefined); setConfirmRemove(true); }}><DeleteIcon /></IconButton></span>
          </Tooltip>
        </Stack>
      }
    >
      <ListItemButton component={Link} to={offering.id + ''} sx={{ pr: 14 }}>
        <ListItemText
          primary={name}
          secondary={formatRegistrationStatus(registered, offering.capacity, waitlist.length) + (locked ? ` · ${completions} completed` : '')}
          secondaryTypographyProps={{ color: registered > offering.capacity ? 'warning.main' : 'text.secondary' }}
        />
      </ListItemButton>
      <Dialog open={confirmRemove} onClose={removing ? undefined : () => setConfirmRemove(false)}>
        <DialogTitle>Remove {name}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {registered + waitlist.length > 0
              ? `${dropText(registered, waitlist.length)} will be dropped from this session. They won't be notified.`
              : 'Nobody is registered for this session.'}
          </DialogContentText>
          {removeError && <Alert severity="error" sx={{ mt: 2 }}>{removeError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRemove(false)} disabled={removing}>Cancel</Button>
          <Button color="error" variant="contained" onClick={remove} disabled={removing}>{removing ? 'Removing...' : 'Remove'}</Button>
        </DialogActions>
      </Dialog>
    </ListItem>
  );
};

export default OfferingListItem;
