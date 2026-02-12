'use client';

import React, { useState, useEffect } from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

type EnhancedNumberInputProps = Omit<TextFieldProps, 'onChange'> & {
  value: number | string;
  onChangeAction: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  allowTemporaryZero?: boolean;
  decimalPlaces?: number;
};

export default function EnhancedNumberInput({
  value,
  onChangeAction,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  allowTemporaryZero = true,
  decimalPlaces = step < 1 ? 2 : 0,
  ...textFieldProps
}: EnhancedNumberInputProps) {
  // Track internal input state for typing
  const [inputValue, setInputValue] = useState<string>(value?.toString() || '');

  // Update internal value when external value changes
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value.toString());
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Allow empty input temporarily while typing
    if (rawValue === '') {
      setInputValue('');
      return;
    }

    // Check for temporary zero values if decimal places are allowed
    if (allowTemporaryZero && decimalPlaces > 0 && (rawValue === '0' || rawValue === '0.')) {
      setInputValue(rawValue);
      return;
    }

    const numValue = Number(rawValue);

    // Skip NaN values
    if (Number.isNaN(numValue)) return;

    // For normal valid inputs, update both internal and external state
    setInputValue(rawValue);

    // Validate and constrain number values (but not temporary values like "0.")
    const isTemporaryValue = allowTemporaryZero && (rawValue === '0' || rawValue === '0.');

    if (!isTemporaryValue) {
      const validValue = Math.min(Math.max(numValue, min), max);
      // Only update parent if the value is actually different
      if (validValue !== numValue) {
        setInputValue(validValue.toString());
      }
      onChangeAction(validValue);
    }
  };

  const handleBlur = () => {
    // Normalize the value on blur: coerce, clamp, then format.
    const numValue = Number(inputValue);
    const isInvalid = inputValue === undefined
      || inputValue === ''
      || inputValue === '0'
      || inputValue === '0.'
      || Number.isNaN(numValue);

    const clampedValue = isInvalid ? min : Math.min(Math.max(numValue, min), max);
    const formattedValue = decimalPlaces > 0
      ? Number(clampedValue.toFixed(decimalPlaces))
      : Math.round(clampedValue);

    setInputValue(formattedValue.toString());
    onChangeAction(formattedValue);
  };

  return (
    <TextField
      fullWidth
      type="number"
      size="small"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      inputProps={{
        min,
        max,
        step,
      }}
      {...textFieldProps}
    />
  );
}
