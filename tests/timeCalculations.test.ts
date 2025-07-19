import { describe, it, expect } from 'vitest'
import {
  calculateWorkTime,
  calculateDailyTarget,
  calculateWeeklyTarget,
  calculateMonthlyTarget,
  analyzeWorkTime,
  formatTime,
  isWorkingDay,
  getWeekDates,
  getMonthDates
} from '~/utils/timeCalculations'
import type { User, TimeEntry } from '~/types'

const mockUser: User = {
  id: '1',
  email: 'test@test.com',
  role: 'EMPLOYEE',
  dailyHours: 8,
  workSchedule: 'FIVE_DAYS',
  createdAt: new Date(),
  updatedAt: new Date()
}

const mockUserFourDays: User = {
  ...mockUser,
  workSchedule: 'FOUR_DAYS'
}

describe('Time Calculations Utils', () => {
  describe('calculateWorkTime', () => {
    it('should calculate work time correctly', () => {
      expect(calculateWorkTime('09:00', '17:00')).toBe(8)
      expect(calculateWorkTime('09:00', '17:00', 60)).toBe(7) // 1h break
      expect(calculateWorkTime('14:30', '18:45')).toBe(4.25)
    })

    it('should handle edge cases', () => {
      expect(calculateWorkTime('', '')).toBe(0)
      expect(calculateWorkTime('17:00', '09:00')).toBe(0) // end before start
      expect(calculateWorkTime('09:00', '09:00')).toBe(0) // same time
    })

    it('should not return negative time with large break', () => {
      expect(calculateWorkTime('09:00', '17:00', 600)).toBe(0) // 10h break on 8h work
    })
  })

  describe('calculateDailyTarget', () => {
    it('should return user daily hours for working days', () => {
      expect(calculateDailyTarget(mockUser, '2024-01-02')).toBe(8) // Tuesday
      expect(calculateDailyTarget(mockUser, '2024-01-03')).toBe(8) // Wednesday
    })

    it('should return 0 for weekends', () => {
      expect(calculateDailyTarget(mockUser, '2024-01-06')).toBe(0) // Saturday
      expect(calculateDailyTarget(mockUser, '2024-01-07')).toBe(0) // Sunday
    })
  })

  describe('calculateWeeklyTarget', () => {
    it('should calculate weekly target for 5-day schedule', () => {
      expect(calculateWeeklyTarget(mockUser)).toBe(40) // 8h * 5 days
    })

    it('should calculate weekly target for 4-day schedule', () => {
      expect(calculateWeeklyTarget(mockUserFourDays)).toBe(32) // 8h * 4 days
    })
  })

  describe('calculateMonthlyTarget', () => {
    it('should calculate monthly target correctly', () => {
      // January 2024 has 23 working days (31 - 8 weekend days)
      const result = calculateMonthlyTarget(mockUser, 0, 2024)
      expect(result).toBe(184) // 23 working days * 8h
    })

    it('should adjust for 4-day schedule', () => {
      const result = calculateMonthlyTarget(mockUserFourDays, 0, 2024)
      expect(result).toBe(144) // floor(23 * 0.8) * 8 = 18 * 8
    })
  })

  describe('analyzeWorkTime', () => {
    it('should analyze work time correctly', () => {
      const entries: TimeEntry[] = [
        {
          id: '1',
          userId: '1',
          date: '2024-01-02',
          startTime: '09:00',
          endTime: '17:00',
          breakTime: 60,
          workTime: 7,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          userId: '1',
          date: '2024-01-03',
          startTime: '09:00',
          endTime: '18:00',
          breakTime: 60,
          workTime: 8,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      const result = analyzeWorkTime(entries, mockUser)
      
      expect(result.total).toBe(15)
      expect(result.regularHours).toBe(15)
      expect(result.overtime).toBe(0)
      expect(result.missingHours).toBe(1) // Expected 16h (2 days * 8h), got 15h
    })

    it('should calculate overtime correctly', () => {
      const entries: TimeEntry[] = [
        {
          id: '1',
          userId: '1',
          date: '2024-01-02',
          workTime: 10,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      const result = analyzeWorkTime(entries, mockUser)
      
      expect(result.total).toBe(10)
      expect(result.regularHours).toBe(8)
      expect(result.overtime).toBe(2)
      expect(result.missingHours).toBe(0)
    })
  })

  describe('formatTime', () => {
    it('should format time correctly', () => {
      expect(formatTime(8)).toBe('8h00')
      expect(formatTime(7.5)).toBe('7h30')
      expect(formatTime(0.25)).toBe('0h15')
      expect(formatTime(8.75)).toBe('8h45')
    })
  })

  describe('isWorkingDay', () => {
    it('should identify working days for 5-day schedule', () => {
      expect(isWorkingDay('2024-01-01', 'FIVE_DAYS')).toBe(true) // Monday
      expect(isWorkingDay('2024-01-02', 'FIVE_DAYS')).toBe(true) // Tuesday
      expect(isWorkingDay('2024-01-03', 'FIVE_DAYS')).toBe(true) // Wednesday
      expect(isWorkingDay('2024-01-04', 'FIVE_DAYS')).toBe(true) // Thursday
      expect(isWorkingDay('2024-01-05', 'FIVE_DAYS')).toBe(true) // Friday
      expect(isWorkingDay('2024-01-06', 'FIVE_DAYS')).toBe(false) // Saturday
      expect(isWorkingDay('2024-01-07', 'FIVE_DAYS')).toBe(false) // Sunday
    })

    it('should identify working days for 4-day schedule', () => {
      expect(isWorkingDay('2024-01-01', 'FOUR_DAYS')).toBe(true) // Monday
      expect(isWorkingDay('2024-01-02', 'FOUR_DAYS')).toBe(true) // Tuesday
      expect(isWorkingDay('2024-01-03', 'FOUR_DAYS')).toBe(false) // Wednesday (off)
      expect(isWorkingDay('2024-01-04', 'FOUR_DAYS')).toBe(true) // Thursday
      expect(isWorkingDay('2024-01-05', 'FOUR_DAYS')).toBe(true) // Friday
    })
  })

  describe('getWeekDates', () => {
    it('should return correct week dates', () => {
      const testDate = new Date('2024-01-03') // Wednesday
      const weekDates = getWeekDates(testDate)
      
      expect(weekDates).toHaveLength(7)
      expect(weekDates[0]).toBe('2024-01-01') // Monday
      expect(weekDates[6]).toBe('2024-01-07') // Sunday
    })
  })

  describe('getMonthDates', () => {
    it('should return correct month dates', () => {
      const monthDates = getMonthDates(0, 2024) // January 2024
      
      expect(monthDates).toHaveLength(31)
      expect(monthDates[0]).toBe('2024-01-01')
      expect(monthDates[30]).toBe('2024-01-31')
    })

    it('should handle February correctly', () => {
      const monthDates = getMonthDates(1, 2024) // February 2024 (leap year)
      expect(monthDates).toHaveLength(29)
      
      const monthDates2023 = getMonthDates(1, 2023) // February 2023 (not leap year)
      expect(monthDates2023).toHaveLength(28)
    })
  })
})