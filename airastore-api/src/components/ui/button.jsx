import * as React from "react";

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default: "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950",
      outline: "border border-gray-200 bg-white hover:bg-gray-100 active:bg-gray-200",
      ghost: "hover:bg-gray-100 active:bg-gray-200",
      link: "text-gray-900 underline-offset-4 hover:underline",
      destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };

    const variantStyles = variants[variant];
    const sizeStyles = sizes[size];

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
