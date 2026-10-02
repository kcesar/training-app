import * as React from 'react';
import { Alert, Box, Button, ListItem, Stack, TextField, Typography } from '@mui/material';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import { SessionTask } from '../../store';
import { OfferingUpdateModel } from '../../api-models/offeringModel';
import { formatOfferingDateTimes } from '../../models/offeringViewModel';
import { formatTimeOfDay, isOvernight, scheduleOffering } from '../../models/courseSchedule';

export const SETTINGS_DIRTY_REASON = 'Save or reset the course settings before changing sessions.';

// Inline editor for a new or existing offering. Only the start and size can be chosen;
// the end (and an overnight course's times) always come from the course settings.
export const OfferingEditor = (props: {
  course: SessionTask,
  registered: number,
  // Names on the wait list, in order. Any new spots are filled from it when saving.
  waitlist?: string[],
  initialStart: Date|null,
  initialCapacity: number,
  saveLabel: string,
  // Saving is blocked while the course settings have unsaved changes.
  settingsDirty?: boolean,
  onSave: (offering: OfferingUpdateModel) => Promise<void>,
  onCancel: () => void,
}) => {
  const { course, registered, onSave, onCancel } = props;
  const overnight = isOvernight(course);

  const [start, setStart] = React.useState<Date|null>(props.initialStart);
  const [capacity, setCapacity] = React.useState(props.initialCapacity + '');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string>();

  const schedule = start && !isNaN(start.getTime()) ? scheduleOffering(course, start) : undefined;
  const size = Number(capacity);
  const sizeValid = Number.isInteger(size) && size >= 1;
  const promoting = sizeValid ? (props.waitlist ?? []).slice(0, Math.max(0, size - registered)) : [];

  const save = async () => {
    setSaving(true);
    setError(undefined);
    try {
      await onSave({ startAt: schedule!.startAt.toISOString(), doneAt: schedule!.doneAt.toISOString(), capacity: size });
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  };

  return (
    <ListItem sx={{ display: 'block', bgcolor: 'action.hover', py: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
        {overnight ? (
          <DatePicker
            label="Start date"
            value={start}
            onChange={setStart}
            disabled={saving}
            renderInput={params => <TextField size="small" {...params} />}
          />
        ) : (
          <DateTimePicker
            label="Start"
            value={start}
            onChange={setStart}
            disabled={saving}
            renderInput={params => <TextField size="small" {...params} />}
          />
        )}
        <TextField
          label="Size"
          type="number"
          size="small"
          value={capacity}
          onChange={e => setCapacity(e.target.value)}
          disabled={saving}
          inputProps={{ min: 1, step: 1 }}
          error={!sizeValid}
          helperText={sizeValid ? `${registered} registered` : 'Whole number, at least 1'}
          sx={{ width: { sm: 140 } }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button size="small" variant="contained" onClick={save} disabled={saving || !sizeValid || !schedule || props.settingsDirty}>{saving ? 'Saving...' : props.saveLabel}</Button>
        </Stack>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {schedule ? formatOfferingDateTimes(schedule) : `Pick a start ${overnight ? 'date' : 'date and time'}`}
        {overnight
          ? ` (always ${formatTimeOfDay(course.startTime!)} to ${formatTimeOfDay(course.endTime!)} the next day)`
          : ` (${course.hours} hours)`}
      </Typography>
      {sizeValid && size < registered && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {registered} trainees are already registered, which is more than the new size of {size}.
          Nobody will be removed, but trainees won't be able to register until enough of them leave.
        </Alert>
      )}
      {promoting.length > 0 && (
        <Alert severity="info" sx={{ mt: 1 }}>
          Saving will move {promoting.length} {promoting.length === 1 ? 'trainee' : 'trainees'} from the wait list into the class: {promoting.join(', ')}.
        </Alert>
      )}
      {props.settingsDirty && <Alert severity="info" sx={{ mt: 1 }}>{SETTINGS_DIRTY_REASON}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
    </ListItem>
  );
};

export default OfferingEditor;
