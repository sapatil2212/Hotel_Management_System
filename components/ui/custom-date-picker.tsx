"use client"

import { useState, useEffect } from "react"
import { Calendar, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface CustomDatePickerProps {
  value: string
  onChange: (date: string) => void
  placeholder?: string
  label?: string
  className?: string
  required?: boolean
  minDate?: string
  maxDate?: string
}

export function CustomDatePicker({
  value,
  onChange,
  placeholder = "Select date",
  label,
  className,
  required = false,
  minDate,
  maxDate
}: CustomDatePickerProps) {
  const [displayValue, setDisplayValue] = useState("")

  // Update display value when value prop changes
  useEffect(() => {
    if (value) {
      const date = new Date(value)
      setDisplayValue(date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }))
    } else {
      setDisplayValue("")
    }
  }, [value])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value
    onChange(dateValue)
  }

  const handleClear = () => {
    onChange("")
    setDisplayValue("")
  }

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="relative">
      {label && (
        <Label className="text-xs font-medium text-gray-700 mb-2 block">
          {label}
        </Label>
      )}
      
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
        <Input
          type="date"
          value={formatDateForInput(value)}
          onChange={handleDateChange}
          placeholder={placeholder}
          min={minDate}
          max={maxDate}
          className={cn(
            "pl-10 h-11 text-sm border-gray-200 focus:border-amber-500 focus:ring-amber-200 rounded-xl bg-white/95 backdrop-blur-sm transition-all duration-200 hover:border-gray-300",
            className
          )}
          required={required}
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  )
}
