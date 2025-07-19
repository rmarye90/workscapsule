import { format, parseISO, differenceInMinutes, isWeekend, isHoliday } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { TimeEntry, User, WorkTimeCalculation } from '~/types'

export const calculateWorkTime = (startTime: string, endTime: string, breakTime: number = 0): number => {
  if (!startTime || !endTime) return 0
  
  const start = new Date(`1970-01-01T${startTime}:00`)
  const end = new Date(`1970-01-01T${endTime}:00`)
  
  if (end <= start) return 0
  
  const totalMinutes = differenceInMinutes(end, start)
  const workMinutes = totalMinutes - breakTime
  
  return Math.max(0, workMinutes / 60)
}

export const calculateDailyTarget = (user: User, date: string): number => {
  const dateObj = parseISO(date)
  
  // Ne pas compter les weekends pour le calcul de l'objectif
  if (isWeekend(dateObj)) return 0
  
  // TODO: Vérifier si c'est un jour férié
  // if (isHoliday(dateObj)) return 0
  
  return user.dailyHours
}

export const calculateWeeklyTarget = (user: User): number => {
  const daysPerWeek = user.workSchedule === 'FOUR_DAYS' ? 4 : 5
  return user.dailyHours * daysPerWeek
}

export const calculateMonthlyTarget = (user: User, month: number, year: number): number => {
  // Calculer le nombre de jours ouvrés dans le mois
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  let workingDays = 0
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    if (!isWeekend(date)) {
      workingDays++
    }
  }
  
  // Ajuster selon le régime de travail (4 ou 5 jours)
  if (user.workSchedule === 'FOUR_DAYS') {
    workingDays = Math.floor(workingDays * 0.8) // 4/5 des jours ouvrés
  }
  
  return workingDays * user.dailyHours
}

export const analyzeWorkTime = (entries: TimeEntry[], user: User): WorkTimeCalculation => {
  const totalWorked = entries.reduce((sum, entry) => {
    if (entry.workTime) return sum + entry.workTime
    if (entry.startTime && entry.endTime) {
      return sum + calculateWorkTime(entry.startTime, entry.endTime, entry.breakTime)
    }
    return sum
  }, 0)
  
  // Calculer l'objectif basé sur les jours travaillés
  const workingDaysInPeriod = entries.filter(entry => {
    const date = parseISO(entry.date)
    return !isWeekend(date) // TODO: et pas un jour férié
  }).length
  
  const expectedHours = workingDaysInPeriod * user.dailyHours
  
  return {
    regularHours: Math.min(totalWorked, expectedHours),
    overtime: Math.max(0, totalWorked - expectedHours),
    total: totalWorked,
    missingHours: Math.max(0, expectedHours - totalWorked)
  }
}

export const formatTime = (hours: number): string => {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h${m.toString().padStart(2, '0')}`
}

export const formatDate = (date: string): string => {
  return format(parseISO(date), 'dd/MM/yyyy', { locale: fr })
}

export const formatDateTime = (date: string): string => {
  return format(parseISO(date), 'dd/MM/yyyy HH:mm', { locale: fr })
}

export const getWeekDates = (date: Date = new Date()): string[] => {
  const monday = new Date(date)
  monday.setDate(date.getDate() - date.getDay() + 1)
  
  const dates = []
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(monday)
    currentDate.setDate(monday.getDate() + i)
    dates.push(format(currentDate, 'yyyy-MM-dd'))
  }
  
  return dates
}

export const getMonthDates = (month: number, year: number): string[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const dates = []
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    dates.push(format(date, 'yyyy-MM-dd'))
  }
  
  return dates
}

export const isWorkingDay = (date: string, workSchedule: 'FOUR_DAYS' | 'FIVE_DAYS'): boolean => {
  const dateObj = parseISO(date)
  const dayOfWeek = dateObj.getDay() // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  
  if (workSchedule === 'FOUR_DAYS') {
    // Lundi, mardi, jeudi, vendredi (pas de mercredi)
    return dayOfWeek >= 1 && dayOfWeek <= 5 && dayOfWeek !== 3
  } else {
    // Lundi à vendredi
    return dayOfWeek >= 1 && dayOfWeek <= 5
  }
}