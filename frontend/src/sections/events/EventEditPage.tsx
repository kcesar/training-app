import * as React from 'react';
import { observer } from 'mobx-react';

import MainChrome from '../../components/MainChrome';
import PageHeader from '../../components/PageHeader';
import EventEditStore from '../../store/eventEditStore';
import { Box, Button, Chip, Typography } from '@mui/material';
import { FormCheckbox, FormDatePicker, FormTextField, FormTimePicker } from '../../components/forms';

export const EventEditPage = (props: {
  store: EventEditStore,
}) => {
  const form = props.store.getForm();
  return (
    <MainChrome>
      <Box sx={{display:'flex', flexDirection:'column', flex:'1 1 auto'}}>
        <PageHeader text="Create Event" backUrl="/events" backAriaText="back to events" />
        <form onSubmit={form.onSubmit} style={{ display:'flex', flexDirection:'column', flex:'1 1 auto'}}>
          <FormTextField field={form.$('name')} autoFocus fullWidth required />
          <Box sx={{display:'flex'}}>
            <FormCheckbox field={form.$('isMission')} />
          </Box>
          <FormTextField field={form.$('number')} fullWidth />
          <Box sx={{display:'flex', justifyContent:{xs:'space-between', lg:'start'}, mt:'12px'}} >
            <FormDatePicker field={form.$('date')} />
            <FormTimePicker field={form.$('time')} />
          </Box>
          <Box sx={{display:'flex', mt: '12px', alignItems:'center'}}>
            <Typography sx={{mr:1}}>Units:</Typography>
            <Chip label={props.store.mainStore.teamName} />
          </Box>
          <Button variant="contained" sx={{mt:4, alignSelf:'center'}} type="submit" disabled={props.store.working} onClick={form.onSubmit}>Create Event</Button>
        </form>
      </Box>
    </MainChrome>
  )
};

export default observer(EventEditPage);