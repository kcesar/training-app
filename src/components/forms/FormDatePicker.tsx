import * as React from 'react';
import { observer } from 'mobx-react';

import { TextField } from '@mui/material';
import { DatePickerProps, MobileDatePicker } from '@mui/x-date-pickers';


export const FormDatePicker = observer((props: {field: any} & Omit<DatePickerProps<any, any>, 'value'|'onChange'|'renderInput'>) => {
  const { field, ...extra } = props;
  const { value, onChange } = field.bind();

  return (
    <MobileDatePicker
    label="Date"
    value={value}
    onChange={onChange}
    inputFormat="ccc M/d/yyyy"
    disableMaskedInput={false}
    renderInput={(params: any) => {
      return (<TextField sx={{ mr:'4px' }} {...params} />)
    }}
    closeOnSelect={true}
    {...extra}
  />
  )
})