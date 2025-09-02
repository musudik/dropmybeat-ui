import React from 'react'
import { cn } from '../../lib/utils'

// Simple wrapper for native HTML select
const Select = ({ children, value, onValueChange, className, ...props }) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={cn(
        "flex h-10 items-center justify-between rounded-md border border-gray-700 bg-gray-900/50 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

// Simple option component
const SelectItem = ({ children, value, ...props }) => {
  return (
    <option value={value} {...props}>
      {children}
    </option>
  )
}

// These components are kept for compatibility but simplified
const SelectTrigger = ({ children, className, ...props }) => {
  return (
    <div className={cn("w-full", className)} {...props}>
      {children}
    </div>
  )
}

const SelectContent = ({ children, ...props }) => {
  return <>{children}</>
}

const SelectValue = ({ placeholder, ...props }) => {
  return null // Not needed for native select
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }