import React from 'react';

export interface TextInputProps {
  value: string;
  onChange: () => void;
}

export const TextInput = ({ value, onChange }: TextInputProps) => {
  return (
    <div>
      <input type="text" value={value} onChange={onChange} />
    </div>
  );
};
