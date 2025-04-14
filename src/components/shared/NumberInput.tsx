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
    // Handle empty, temporary, or invalid values on blur
    if (
      inputValue === undefined
      || inputValue === ''
      || inputValue === '0'
      || inputValue === '0.'
      || Number(inputValue) < min
      || Number.isNaN(Number(inputValue))
    ) {
      setInputValue(min.toString());
      onChangeAction(min);
      return;
    }

    // Ensure value is within bounds
    const numValue = Number(inputValue);
    if (numValue > max) {
      setInputValue(max.toString());
      onChangeAction(max);
    } else if (numValue < min) {
      setInputValue(min.toString());
      onChangeAction(min);
    } else {
      // Format to consistent decimal places if needed
      const formattedValue = decimalPlaces > 0
        ? Number(numValue.toFixed(decimalPlaces))
        : Math.round(numValue);

      setInputValue(formattedValue.toString());
      onChangeAction(formattedValue);
    }
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
