import * as React from 'react';
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, IconButton, ListItem, ListItemButton, ListItemText, Stack, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import AdminStore from '../../store/adminStore';
import { SessionTask } from '../../store';
import OfferingViewModel, { formatOfferingDatesShort, formatRegistrationStatus } from '../../models/offeringViewModel';
import OfferingEditor, { SETTINGS_DIRTY_REASON } from './OfferingEditor';

const LOCKED_REASON = "Can't change an offering after trainees have been marked complete";

export const OfferingListItem = (props: {
  store: AdminStore,
  course: SessionTask,
  offering: OfferingViewModel,
  registered: number,
  completions: number,
  settingsDirty?: boolean,
}) => {
  const { store, course, offering, registered, completions } = props;
  const locked = completions > 0;
  const name = `${course.title} ${formatOfferingDatesShort(offering)}`;

  const [editing, setEditing] = React.useState(false);
  const [confirmRemove, setConfirmRemove] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const [removeError, setRemoveError] = React.useState<string>();
  const [d4hConfirmed, setD4hConfirmed] = React.useState(false);
  const needsD4h = completions > 0;

  if (editing) {
    return (
      <OfferingEditor
        course={course}
        registered={registered}
        initialStart={offering.startAt}
        initialCapacity={offering.capacity}
        saveLabel="Save"
        settingsDirty={props.settingsDirty}
        onSave={async update => { await store.updateOffering(offering.id, update); setEditing(false); }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  const remove = async () => {
    setRemoving(true);
    setRemoveError(undefined);
    try {
      await store.deleteOffering(offering.id, d4hConfirmed);
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
          <Tooltip title="Remove session">
            <span><IconButton edge="end" aria-label="Remove session" onClick={() => { setRemoveError(undefined); setD4hConfirmed(false); setConfirmRemove(true); }}><DeleteIcon /></IconButton></span>
          </Tooltip>
        </Stack>
      }
    >
      <ListItemButton component={Link} to={offering.id + ''} sx={{ pr: 14 }}>
        <ListItemText
          primary={name}
          secondary={formatRegistrationStatus(registered, offering.capacity) + (locked ? ` · ${completions} completed` : '')}
          secondaryTypographyProps={{ color: registered > offering.capacity ? 'warning.main' : 'text.secondary' }}
        />
      </ListItemButton>
      <Dialog open={confirmRemove} onClose={removing ? undefined : () => setConfirmRemove(false)}>
        <DialogTitle>Remove {name}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {registered > 0
              ? `${registered} registered ${registered === 1 ? 'trainee' : 'trainees'} will be dropped from this session. They won't be notified.`
              : 'Nobody is registered for this session.'}
          </DialogContentText>
          {needsD4h && (
            <>
              <Alert severity="warning" sx={{ mt: 2 }}>
                {completions} {completions === 1 ? 'trainee was' : 'trainees were'} marked complete. Their completions will be deleted,
                so this app will no longer count them as having taken {course.title}.
              </Alert>
              <FormControlLabel
                sx={{ mt: 1 }}
                control={<Checkbox checked={d4hConfirmed} disabled={removing} onChange={e => setD4hConfirmed(e.target.checked)} />}
                label="I've entered this roster into D4H"
              />
            </>
          )}
          {removeError && <Alert severity="error" sx={{ mt: 2 }}>{removeError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRemove(false)} disabled={removing}>Cancel</Button>
          <Button color="error" variant="contained" onClick={remove} disabled={removing || (needsD4h && !d4hConfirmed)}>{removing ? 'Removing...' : 'Remove'}</Button>
        </DialogActions>
      </Dialog>
    </ListItem>
  );
};

export default OfferingListItem;
