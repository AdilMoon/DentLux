import React from 'react';
import { useFormContext } from 'react-hook-form';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  error?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  name,
  label,
  error,
  className = '',
  ...props
}) => {
  const { register, formState: { errors } } = useFormContext();
  const fieldError = error || errors[name]?.message as string;

  return (
    <div>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-bold uppercase tracking-widest text-primary-900 mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={name}
        {...register(name)}
        {...props}
        className={`w-full px-4 py-3 border-2 border-primary-900 dark:border-primary-800 rounded-none bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-100 focus:bg-primary-50 dark:focus:bg-primary-950 focus:ring-4 focus:ring-accent-600/10 outline-none transition-all placeholder:text-primary-300 dark:placeholder:text-primary-700 font-medium ${
          fieldError
            ? 'border-red-600 focus:ring-red-600/10'
            : 'border-primary-900 dark:border-primary-800'
        } ${className}`}
        aria-invalid={!!fieldError}
        aria-describedby={fieldError ? `${name}-error` : undefined}
      />
      {fieldError && (
        <p
          id={`${name}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {fieldError}
        </p>
      )}
    </div>
  );
};

export default FormInput;
