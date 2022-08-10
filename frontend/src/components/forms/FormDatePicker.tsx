import * as React from 'react';
import { observer } from 'mobx-react';

import { TextField } from '@mui/material';
import { DatePickerProps, MobileDatePicker } from '@mui/lab';


export const FormDatePicker = observer((props: {field: any} & Omit<DatePickerProps, 'value'|'onChange'|'renderInput'>) => {
  const { field, ...extra } = props;
  const { value, onChange } = field.bind();

  return (
    <MobileDatePicker
    label="Date"
    value={value}
    onChange={onChange}
    inputFormat="ccc M/d/yyyy"
    disableMaskedInput={false}
    renderInput={(params) => {
      return (<TextField sx={{ mr:'4px' }} {...params} />)
    }}
    disableCloseOnSelect={false}
    {...extra}
  />
  )
})