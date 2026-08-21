"use client"

import * as React from "react"

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
    <div className={className} role="radiogroup">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            groupValue: value,
            onGroupChange: onValueChange,
          })
        }
        return child
      })}
    </div>
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
  const isChecked = groupValue === value
  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={isChecked}
      onChange={() => onGroupChange && onGroupChange(value)}
      className={`h-4 w-4 cursor-pointer text-emerald-600 accent-emerald-600 focus:ring-emerald-500 ${className || ""}`}
    />
  )
}
