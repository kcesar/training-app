import * as React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, Skeleton, TextField, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { MobileDateTimePicker as DateTimePicker } from '@mui/lab';
import { JoinPageStore } from './joinPageStore';
import { isObservable, runInAction } from 'mobx';
import { FormRadio, FormRadioGroupField } from '../../components/forms/FormRadioGroupField';
import MainChrome from '../../components/MainChrome';
import PageHeader from '../../components/PageHeader';
import { FormDatePicker, FormTimePicker } from '../../components/forms';

export interface JoinDialogProps extends Omit<DialogProps, 'open'> {
  store: JoinPageStore
}

const JoinPageBody = observer(({store }: JoinDialogProps) => {
  if (!store.event) return (
    <>
      <PageHeader text="Loading..." backUrl="/events" backAriaText="back to events" />
      <Skeleton />
    </>
  );

  const form = store.form;

  return (
    <Box sx={{display:'flex', flexDirection:'column', flex:'1 1 auto'}}>
      <PageHeader text={store.event?.isMission ? 'Respond to Mission' : 'Join Event'} backUrl="/response" backAriaText="back to response" />
      <form onSubmit={form.onSubmit} style={{ display:'flex', flexDirection:'column', flex:'1 1 auto'}}>
        <div>{store.event?.name}</div>
        <FormRadioGroupField id="now-or-later" field={store.form.$('nowOrLater')}>
          <FormRadio value="now" label="Now" />
          <FormRadio value="later" label="Later" />
        </FormRadioGroupField>
        <Box sx={{display:'flex', justifyContent:{xs:'space-between', lg:'start'}, mt:'12px'}} >
            <FormDatePicker field={form.$('date')} />
            <FormTimePicker field={form.$('time')} />
          </Box>
        <Button variant="contained" sx={{mt:4, alignSelf:'center'}} type="submit" onClick={form.onSubmit}>{store.actionText}</Button>
      </form>
    </Box>
  )
});

export const JoinPage = ({ store }: JoinDialogProps) => {
  return (
    <MainChrome>
      <JoinPageBody store={store} />
    </MainChrome>
  )
}

// export const JoinDialog = ({ store }: JoinDialogProps) => {
//   return (
//     <Dialog open={store.open} onClose={store.cancel}>
//       <DialogTitle>
//         {store.event.isMission ? 'Respond to Mission' : 'Join Event'}
//       </DialogTitle>
//       <DialogContent>
//         <FormRadioGroupField id="now-or-later" field={store.form.$('nowOrLater')}>
//           <FormRadio value="now" label="Now" />
//           <FormRadio value="later" label="Later" />
//         </FormRadioGroupField>
//         <DateTimePicker
//           value={store.when}
//           onChange={date => runInAction(() => store.when = date ?? new Date())}
//           renderInput={(params) => <TextField {...params} />}
//         />
//         <div>When: {store.when + ''}</div>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={store.cancel}>Cancel</Button>
//         <Button onClick={store.submit} color="primary" variant="contained">{store.actionText}</Button>
//       </DialogActions>
//     </Dialog>
//   )
// }

//export default observer(JoinDialog)
export default observer(JoinPage);