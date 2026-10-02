import * as React from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, ListItemText, TextField } from '@mui/material';
import AdminStore from '../../store/adminStore';
import { NEW_SEASON_CONFIRMATION, SeasonSummaryModel } from '../../api-models/seasonModel';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

// Confirms and starts a new training season, which removes every session, registration and completion.
export const NewSeasonDialog = (props: {
  store: AdminStore,
  open: boolean,
  onClose: () => void,
}) => {
  const { store, open, onClose } = props;
  const [summary, setSummary] = React.useState<SeasonSummaryModel>();
  const [typed, setTyped] = React.useState('');
  const [working, setWorking] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setTyped('');
    setError(undefined);
    setDone(false);
    setSummary(undefined);
    store.getSeasonSummary().then(setSummary, err => setError(err.message));
  }, [open, store]);

  const confirmed = typed.trim() === NEW_SEASON_CONFIRMATION;

  const start = async () => {
    setWorking(true);
    setError(undefined);
    try {
      await store.startNewSeason(typed.trim());
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setWorking(false);
    }
  };

  return (
    <Dialog open={open} onClose={working ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Start a new training season</DialogTitle>
      {done ? (
        <>
          <DialogContent>
            <Alert severity="success">The new season has started. All sessions, registrations and completions have been removed.</Alert>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={onClose}>Close</Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogContent>
            <DialogContentText>This permanently removes all of the current season's data:</DialogContentText>
            <List dense>
              <ListItem><ListItemText primary={summary ? plural(summary.sessions, 'session', 'sessions') : 'All sessions'} /></ListItem>
              <ListItem><ListItemText primary={summary ? plural(summary.signups, 'registration and wait list place', 'registrations and wait list places') : 'All registrations and wait list places'} /></ListItem>
              <ListItem><ListItemText primary={summary ? plural(summary.completions, 'completion record', 'completion records') : 'All completion records'} /></ListItem>
            </List>
            <DialogContentText>Course settings and prerequisites are kept. Trainee accounts aren't affected.</DialogContentText>
            <Alert severity="warning" sx={{ my: 2 }}>
              Completions are what let trainees register for later courses, so afterwards nobody will have credit for any course
              on this site. Make sure every roster has been entered into D4H first. This can't be undone.
            </Alert>
            <TextField
              fullWidth
              autoComplete="off"
              label={`Type "${NEW_SEASON_CONFIRMATION}" to confirm`}
              value={typed}
              disabled={working}
              onChange={e => setTyped(e.target.value)}
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} disabled={working}>Cancel</Button>
            <Button color="error" variant="contained" onClick={start} disabled={!confirmed || working}>
              {working ? 'Starting...' : 'Start new season'}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default NewSeasonDialog;
