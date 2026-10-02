import * as React from 'react';
import { Alert, Autocomplete, Button, Chip, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { observer } from "mobx-react";
import AdminStore from "../../store/adminStore";
import { SessionTask } from '../../store';
import { CourseSettings } from '../../api-models/courseModel';

// Form values are kept as strings so fields can be cleared while typing.
interface DraftSettings {
  prereqs: string[],
  overnight: boolean,
  hours: string,
  startTime: string,
  endTime: string,
}

function toDraft(course: SessionTask): DraftSettings {
  return {
    prereqs: course.prereqs ?? [],
    overnight: !!course.startTime && !!course.endTime,
    hours: course.hours + '',
    startTime: course.startTime ?? '',
    endTime: course.endTime ?? '',
  };
}

// Only the fields for the selected course type are checked; the others are hidden.
function draftErrors(d: DraftSettings) {
  return {
    hours: !d.overnight && !(d.hours.trim() !== '' && Number(d.hours) > 0) ? 'Must be more than 0' : undefined,
    startTime: d.overnight && !d.startTime ? 'Required' : undefined,
    endTime: d.overnight && !d.endTime ? 'Required' : undefined,
  };
}

// An overnight course keeps its stored hours if the hidden field was left invalid.
function toSettings(d: DraftSettings, savedHours: number): CourseSettings {
  return {
    prereqs: d.prereqs,
    hours: Number(d.hours) > 0 ? Number(d.hours) : savedHours,
    startTime: d.overnight ? d.startTime : undefined,
    endTime: d.overnight ? d.endTime : undefined,
  };
}

export const CourseSettingsSection = (props: {
  store: AdminStore,
  course: SessionTask,
  // Called when the form gains or loses unsaved changes.
  onDirtyChange?: (dirty: boolean) => void,
}) => {
  const { store, course, onDirtyChange } = props;
  const titles = Object.fromEntries(store.courseList.map(c => [c.id, c.title]));
  const saved = React.useMemo(() => toDraft(course), [course]);

  const [draft, setDraft] = React.useState(saved);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ severity: 'success'|'error', text: string }>();
  React.useEffect(() => setDraft(saved), [saved]);

  const update = (change: Partial<DraftSettings>) => setDraft({ ...draft, ...change });
  const errors = draftErrors(draft);
  const dirty = draft.overnight !== saved.overnight
    || JSON.stringify(toSettings(draft, course.hours)) !== JSON.stringify(toSettings(saved, course.hours));
  const valid = Object.values(errors).every(e => !e);

  React.useEffect(() => onDirtyChange?.(dirty), [dirty, onDirtyChange]);

  const save = async () => {
    setSaving(true);
    setMessage(undefined);
    try {
      await store.saveCourseSettings({ [course.id]: toSettings(draft, course.hours) });
      setMessage({ severity: 'success', text: 'Course settings saved' });
    } catch (err) {
      setMessage({ severity: 'error', text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{p:2}}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{mb:1}}>
        <Typography variant="h5">{course.title}</Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          color="primary"
          disabled={saving}
          value={draft.overnight ? 'overnight' : 'in-town'}
          onChange={(_e, value) => value && update({ overnight: value === 'overnight' })}
        >
          <ToggleButton value="overnight">Overnight</ToggleButton>
          <ToggleButton value="in-town">In-town</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{mb:2}}>
        {draft.overnight
          ? 'Offerings always start and end at these times, finishing the day after they start.'
          : 'Offerings can start at any time, and end this many hours later.'}
      </Typography>
      <Stack spacing={2}>
        {draft.overnight ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Start time"
              type="time"
              size="small"
              value={draft.startTime}
              disabled={saving}
              onChange={e => update({ startTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
              error={!!errors.startTime}
              helperText={errors.startTime}
            />
            <TextField
              label="End time (next day)"
              type="time"
              size="small"
              value={draft.endTime}
              disabled={saving}
              onChange={e => update({ endTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
              error={!!errors.endTime}
              helperText={errors.endTime}
            />
          </Stack>
        ) : (
          <TextField
            label="Hours"
            type="number"
            size="small"
            value={draft.hours}
            disabled={saving}
            onChange={e => update({ hours: e.target.value })}
            inputProps={{ min: 0, step: 0.5 }}
            error={!!errors.hours}
            helperText={errors.hours}
            sx={{ maxWidth: { sm: 200 } }}
          />
        )}
        <Autocomplete
          multiple
          size="small"
          disabled={saving}
          options={store.courseList.map(o => o.id).filter(id => id !== course.id)}
          getOptionLabel={id => titles[id] ?? id}
          value={draft.prereqs}
          onChange={(_e, value) => update({ prereqs: value })}
          renderTags={(value, getTagProps) => value.map((id, index) => (
            <Chip label={titles[id] ?? id} size="small" {...getTagProps({ index })} />
          ))}
          renderInput={params => <TextField {...params} label="Prerequisites" helperText="Trainees must complete these before registering" placeholder={draft.prereqs.length ? '' : 'None'} />}
        />
      </Stack>
      {message && <Alert severity={message.severity} sx={{mt:2}} onClose={() => setMessage(undefined)}>{message.text}</Alert>}
      <Stack direction="row" spacing={1} sx={{mt:2}} justifyContent="flex-end">
        <Button disabled={!dirty || saving} onClick={() => { setDraft(saved); setMessage(undefined); }}>Reset</Button>
        <Button variant="contained" disabled={!dirty || !valid || saving} onClick={save}>{saving ? 'Saving...' : 'Save'}</Button>
      </Stack>
    </Paper>
  );
};

export default observer(CourseSettingsSection);
