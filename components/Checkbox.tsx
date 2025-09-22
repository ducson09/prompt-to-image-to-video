import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, id, disabled, ...props }) => {
  return (
    <div className="flex items-center justify-center">
      <input
        id={id}
        type="checkbox"
        className={`w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-600 ring-offset-gray-800 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed`}
        disabled={disabled}
        {...props}
      />
      <label htmlFor={id} className={`ml-2 text-sm font-medium ${disabled ? 'text-gray-500' : 'text-gray-300'}`}>
        {label}
      </label>
    </div>
  );
};
