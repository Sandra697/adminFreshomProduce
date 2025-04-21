import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md shadow-md bg-background px-3 py-2 text-[0.75rem] ring-offset-gray-300  file:border-0 file:bg-transparent file:text-[0.75rem] file:font-medium file:text-foreground placeholder:text-[0.75rem] disabled:cursor-not-allowed disabled:opacity-50 md:text-[0.75rem]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
