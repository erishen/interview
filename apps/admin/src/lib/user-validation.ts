/**
 * 用户验证逻辑示例
 * 使用 shared 目录中的通用工具
 */

import { isEmail, isValidPassword, isPhoneNumber } from '@shared/utils/validation'
import { USER_ROLES, VALIDATION_RULES, UserRole } from '@shared/constants'
import { User } from '@shared/types/api'

export interface CreateUserData {
  email: string
  password: string
  name: string
  phone?: string
  role?: UserRole
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateUserData(data: CreateUserData): ValidationResult {
  const errors: string[] = []

  // 验证邮箱
  if (!isEmail(data.email)) {
    errors.push('邮箱格式不正确')
  }

  // 验证密码
  if (!isValidPassword(data.password)) {
    errors.push('密码至少需要8位，包含字母和数字')
  }

  // 验证姓名
  if (!data.name || data.name.length > VALIDATION_RULES.NAME_MAX_LENGTH) {
    errors.push(`姓名不能为空且不能超过${VALIDATION_RULES.NAME_MAX_LENGTH}个字符`)
  }

  // 验证手机号（如果提供）
  if (data.phone && !isPhoneNumber(data.phone)) {
    errors.push('手机号格式不正确')
  }

  // 验证角色
  if (data.role && !Object.values(USER_ROLES).includes(data.role)) {
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
    role: data.role || USER_ROLES.USER
  }
}
