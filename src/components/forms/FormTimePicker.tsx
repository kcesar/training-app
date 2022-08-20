import * as React from 'react';
import { observer } from 'mobx-react';

import { TextField } from '@mui/material';
import { MobileTimePicker, TimePickerProps } from '@mui/x-date-pickers';


export const FormTimePicker = observer((props: {field: any} & Omit<TimePickerProps<any, any>, 'value'|'onChange'|'renderInput'>) => {
  const { field, ...extra } = props;
  const { value, onChange } = field.bind();

  return (
    <MobileTimePicker
      label="Time"
      value={value}
      onChange={onChange}
      renderInput={(params: any) => {
        return <TextField sx={{ ml:'4px' }} {...params} />}}
      {...extra}
    />
  )
})
