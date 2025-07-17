import * as React from "react"

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}) {
  return (
    <div className="theme-provider" {...props}>
      {children}
    </div>
  )
}
