import * as React from 'react';
import { observer } from 'mobx-react';

import { FormControl, FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup, RadioGroupProps } from '@mui/material';

export const FormRadio = (props: { value: string, label: string }) => (
  <FormControlLabel value={props.value} control={<Radio />} label={props.label} />
);

export const FormRadioGroupField = observer((props: {id: string, field: any} & RadioGroupProps) => {
  const { id, field, children } = props;
  const { onAdd, onClear, onDel, error, ...binding } = field.bind({ type: 'string' });

  return (
    <FormControl error={!!binding.error} variant="standard">
      <FormLabel id={id}>{binding.label}</FormLabel>
      <RadioGroup
        aria-labelledby={id}
        {...binding}
      >
        {children}
      </RadioGroup>
      <FormHelperText>{binding.error}</FormHelperText>
    </FormControl>
  )
});