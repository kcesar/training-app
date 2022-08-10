import * as React from 'react';
import { observer } from 'mobx-react';

import { TextField, TextFieldProps } from '@mui/material';

export const FormTextField = observer((props: {field: any, type?: string} & TextFieldProps) => {
  const { field, type, ...extra } = props;
  const { onAdd, onClear, onDel, error, ...rawBinding } = field.bind({ type: type ?? 'string' });
  const binding = {
    ...rawBinding,
    error: error ? true : undefined,
    helperText: error
  };
  
  return (
    <TextField variant="outlined" margin="dense"
      {...binding}
      {...extra}
    />
  );
});