import * as React from 'react';
import { observer } from 'mobx-react';

import { Checkbox, CheckboxProps, FormControlLabel } from '@mui/material';

export const FormCheckbox = observer((props: {field: any} & CheckboxProps) => {
  const { field, ...extra } = props;
  const checkbox = <Checkbox {...field.bind()} {...extra} />;
  return (
    <FormControlLabel control={checkbox} label="Event is a mission" />
  )
});
