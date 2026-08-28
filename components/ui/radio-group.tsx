"use client"

import * as React from "react"

interface RadioGroupContextValue {
  value?: string
  onValueChange?: (val: string) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({})

export function RadioGroup({
  value,
  onValueChange,
  children,
  className,
}: {
  value?: string
  onValueChange?: (val: string) => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={className} role="radiogroup">
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

export function RadioGroupItem({
  value,
  id,
  groupValue,
  onGroupChange,
  className,
}: {
  value: string
  id?: string
  groupValue?: string
  onGroupChange?: (val: string) => void
  className?: string
}) {
  const context = React.useContext(RadioGroupContext)
  const activeValue = groupValue !== undefined ? groupValue : context.value
  const activeOnChange = onGroupChange !== undefined ? onGroupChange : context.onValueChange
  const isChecked = activeValue === value

  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={isChecked}
      onChange={() => activeOnChange && activeOnChange(value)}
      className={`h-4 w-4 cursor-pointer text-emerald-600 accent-emerald-600 focus:ring-emerald-500 ${className || ""}`}
    />
  )
}
