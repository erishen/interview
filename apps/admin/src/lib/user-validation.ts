/**
 * 用户验证逻辑示例
 * 使用 shared 目录中的通用工具
 */

import { validateEmail, validatePassword } from '@interview/utils'
import { User } from '@interview/types'

export interface CreateUserData {
  email: string
  password: string
  name: string
  phone?: string
  role?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateUserData(data: CreateUserData): ValidationResult {
  const errors: string[] = []

  // 验证邮箱
  if (!validateEmail(data.email)) {
    errors.push('邮箱格式不正确')
  }

  // 验证密码
  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors)
  }

  // 验证姓名
  if (!data.name || data.name.trim().length === 0) {
    errors.push('姓名不能为空')
  } else if (data.name.length > 50) {
    errors.push('姓名不能超过50个字符')
  }

  // 验证手机号（如果提供）
  if (data.phone && !/^1[3-9]\d{9}$/.test(data.phone)) {
    errors.push('手机号格式不正确')
  }

  // 验证角色
  const validRoles = ['admin', 'user']
  if (data.role && !validRoles.includes(data.role)) {
    errors.push('用户角色不正确')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function sanitizeUserData(data: CreateUserData): CreateUserData {
  return {
    ...data,
    email: data.email.toLowerCase().trim(),
    name: data.name.trim(),
    phone: data.phone?.trim(),
    role: data.role || 'user'
  }
}
