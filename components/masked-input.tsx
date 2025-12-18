"use client"

import { Input } from "@/components/ui/input"
import { maskPhone } from "@/lib/validators"
import type React from "react"

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask?: "phone" | "cpf" | "cep"
}

export function MaskedInput({ mask, value, onChange, ...props }: MaskedInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mask || !onChange) {
      onChange?.(e)
      return
    }

    let maskedValue = e.target.value

    if (mask === "phone") {
      maskedValue = maskPhone(e.target.value)
    }

    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: maskedValue,
      },
    }

    onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>)
  }

  return <Input {...props} value={value} onChange={handleChange} />
}
