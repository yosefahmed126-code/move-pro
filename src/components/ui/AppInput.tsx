import React, { forwardRef } from "react";

interface AppInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block font-medium text-slate-700">
          {label}
        </label>

        <input
          ref={ref}
          {...props}
          className={`w-full rounded-lg border border-slate-300 p-3 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 ${
            error ? "border-red-500" : ""
          } ${className}`}
        />

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AppInput.displayName = "AppInput";

export default AppInput;