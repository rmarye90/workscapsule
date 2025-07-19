export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'EMPLOYEE'
  workSchedule: 'FOUR_DAYS' | 'FIVE_DAYS'
  dailyHours: number
  startDate: string
  rttDaysPerYear: number
  seniorityDays: number
  createdAt: string
  updatedAt: string
}

export interface TimeEntry {
  id: string
  userId: string
  date: string
  startTime?: string
  endTime?: string
  breakTime: number
  workTime?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ScheduleEntry {
  id: string
  userId: string
  date: string
  startTime: string
  endTime: string
  isPhoneShift: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface LeaveRequest {
  id: string
  userId: string
  startDate: string
  endDate: string
  type: 'RTT' | 'LEGAL_VACATION' | 'SENIORITY' | 'EXCEPTIONAL' | 'SICK_LEAVE'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  daysCount: number
  reason?: string
  reviewedBy?: string
  reviewedAt?: string
  comments?: string
  createdAt: string
  updatedAt: string
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  firstName: string
  lastName: string
  password: string
  workSchedule: 'FOUR_DAYS' | 'FIVE_DAYS'
  dailyHours: number
  startDate: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface WorkTimeCalculation {
  regularHours: number
  overtime: number
  total: number
  missingHours: number
}