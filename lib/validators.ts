// Funções de validação
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, "")
  // Aceita 10 ou 11 dígitos (com ou sem DDD)
  return cleanPhone.length >= 10 && cleanPhone.length <= 11
}

// Máscaras de input
export function maskPhone(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "")

  // Aplica a máscara (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
  }
  return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
}

export const applyPhoneMask = maskPhone

export function maskCPF(value: string): string {
  const numbers = value.replace(/\D/g, "")
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4")
}

export function maskCEP(value: string): string {
  const numbers = value.replace(/\D/g, "")
  return numbers.replace(/(\d{5})(\d{0,3})/, "$1-$2")
}
