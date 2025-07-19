<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Gestion des Vacances</h1>
        <div class="flex space-x-4">
          <button
            @click="showCreateModal = true"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Icon name="ph:plus" class="w-4 h-4 mr-2" />
            Nouvelle demande
          </button>
          <select
            v-model="selectedYear"
            @change="loadVacationData"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Statistiques {{ selectedYear }}</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Congés légaux utilisés</span>
              <span class="font-medium">{{ userStats.legalVacationUsed }}/25 jours</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">RTT utilisés</span>
              <span class="font-medium">{{ userStats.rttUsed }}/{{ userStats.rttTotal }} jours</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Jours d'ancienneté</span>
              <span class="font-medium">{{ userStats.seniorityUsed }}/{{ userStats.seniorityTotal }} jours</span>
            </div>
            <div class="flex justify-between text-blue-600 font-medium">
              <span>Total utilisé</span>
              <span>{{ userStats.totalUsed }} jours</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Demandes en attente</h3>
          <div class="space-y-2">
            <div
              v-for="request in pendingRequests"
              :key="request.id"
              class="flex justify-between items-center p-2 bg-yellow-50 rounded"
            >
              <div>
                <div class="font-medium text-sm">{{ formatLeaveType(request.type) }}</div>
                <div class="text-xs text-gray-500">
                  {{ formatDate(request.startDate) }} - {{ formatDate(request.endDate) }}
                </div>
              </div>
              <span class="text-yellow-600 text-sm">{{ request.daysCount }} j</span>
            </div>
            <div v-if="pendingRequests.length === 0" class="text-gray-500 text-sm text-center py-4">
              Aucune demande en attente
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Conflits détectés</h3>
          <div class="space-y-2">
            <div
              v-for="conflict in conflicts"
              :key="conflict.id"
              class="p-2 bg-red-50 border border-red-200 rounded text-sm"
            >
              <div class="text-red-800 font-medium">{{ conflict.title }}</div>
              <div class="text-red-600">{{ conflict.description }}</div>
            </div>
            <div v-if="conflicts.length === 0" class="text-gray-500 text-sm text-center py-4">
              Aucun conflit détecté
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div
          v-for="month in months"
          :key="month.number"
          class="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div class="p-4 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">{{ month.name }} {{ selectedYear }}</h3>
            <div class="text-sm text-gray-500">{{ month.vacationDays }} jours de congés</div>
          </div>
          
          <div class="p-4">
            <div class="grid grid-cols-7 gap-1 mb-2">
              <div
                v-for="day in ['L', 'M', 'M', 'J', 'V', 'S', 'D']"
                :key="day"
                class="text-xs text-gray-500 text-center font-medium"
              >
                {{ day }}
              </div>
            </div>
            
            <div class="grid grid-cols-7 gap-1">
              <div
                v-for="day in month.days"
                :key="day.date"
                class="aspect-square text-xs flex items-center justify-center rounded relative"
                :class="getDayClasses(day)"
              >
                <span class="relative z-10">{{ day.number }}</span>
                <div
                  v-if="day.vacations.length > 0"
                  class="absolute inset-0 opacity-75 rounded"
                  :class="getVacationClasses(day.vacations)"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Historique des demandes</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Période
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durée
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="request in allRequests" :key="request.id">
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(request.startDate) }} - {{ formatDate(request.endDate) }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatLeaveType(request.type) }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ request.daysCount }} jour{{ request.daysCount > 1 ? 's' : '' }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                    :class="getStatusClasses(request.status)"
                  >
                    {{ formatStatus(request.status) }}
                  </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    v-if="request.status === 'PENDING'"
                    @click="cancelRequest(request.id)"
                    class="text-red-600 hover:text-red-800"
                  >
                    Annuler
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Nouvelle demande de congé</h3>
        <form @submit.prevent="createRequest">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type de congé</label>
              <select
                v-model="newRequest.type"
                required
                class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un type</option>
                <option value="LEGAL_VACATION">Congés légaux (5 semaines)</option>
                <option value="RTT">RTT</option>
                <option value="SENIORITY">Jours d'ancienneté</option>
                <option value="EXCEPTIONAL">Congés exceptionnels</option>
                <option value="SICK_LEAVE">Arrêt maladie</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                <input
                  v-model="newRequest.startDate"
                  type="date"
                  required
                  class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                <input
                  v-model="newRequest.endDate"
                  type="date"
                  required
                  class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de jours</label>
              <input
                v-model.number="newRequest.daysCount"
                type="number"
                step="0.5"
                min="0.5"
                required
                class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Motif (optionnel)</label>
              <textarea
                v-model="newRequest.reason"
                rows="3"
                class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Créer la demande
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, getDaysInMonth } from 'date-fns'
import { fr } from 'date-fns/locale'

definePageMeta({
  middleware: 'auth'
})

const { $fetch } = useNuxtApp()
const { user } = useAuthStore()

const selectedYear = ref(new Date().getFullYear())
const showCreateModal = ref(false)
const allRequests = ref([])
const statistics = ref(null)
const conflicts = ref([])

const newRequest = ref({
  type: '',
  startDate: '',
  endDate: '',
  daysCount: 1,
  reason: ''
})

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  return [currentYear - 1, currentYear, currentYear + 1]
})

const pendingRequests = computed(() => {
  return allRequests.value.filter(request => request.status === 'PENDING')
})

const userStats = computed(() => {
  if (!statistics.value?.userStats) return {
    legalVacationUsed: 0,
    rttUsed: 0,
    rttTotal: 0,
    seniorityUsed: 0,
    seniorityTotal: 0,
    totalUsed: 0
  }

  const userStat = statistics.value.userStats.find(stat => stat.id === user?.id)
  if (!userStat) return {
    legalVacationUsed: 0,
    rttUsed: 0,
    rttTotal: 0,
    seniorityUsed: 0,
    seniorityTotal: 0,
    totalUsed: 0
  }

  const legalVacationUsed = userStat.leaveRequests
    .filter(req => req.type === 'LEGAL_VACATION')
    .reduce((sum, req) => sum + req.daysCount, 0)
  
  const rttUsed = userStat.leaveRequests
    .filter(req => req.type === 'RTT')
    .reduce((sum, req) => sum + req.daysCount, 0)
  
  const seniorityUsed = userStat.leaveRequests
    .filter(req => req.type === 'SENIORITY')
    .reduce((sum, req) => sum + req.daysCount, 0)

  return {
    legalVacationUsed,
    rttUsed,
    rttTotal: userStat.rttDaysPerYear,
    seniorityUsed,
    seniorityTotal: userStat.seniorityDays,
    totalUsed: legalVacationUsed + rttUsed + seniorityUsed
  }
})

const months = computed(() => {
  const monthsData = []
  
  for (let month = 0; month < 12; month++) {
    const monthStart = new Date(selectedYear.value, month, 1)
    const monthEnd = endOfMonth(monthStart)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    const monthDays = []
    const firstDayOfWeek = getDay(monthStart)
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    for (let i = 0; i < adjustedFirstDay; i++) {
      monthDays.push({ number: '', date: null, vacations: [] })
    }

    days.forEach(day => {
      const dayVacations = allRequests.value.filter(request => {
        const requestStart = new Date(request.startDate)
        const requestEnd = new Date(request.endDate)
        return day >= requestStart && day <= requestEnd && request.status === 'APPROVED'
      })

      monthDays.push({
        number: day.getDate(),
        date: day,
        vacations: dayVacations
      })
    })

    const vacationDays = allRequests.value
      .filter(request => {
        const requestStart = new Date(request.startDate)
        const requestEnd = new Date(request.endDate)
        return (requestStart.getMonth() === month || requestEnd.getMonth() === month) && 
               request.status === 'APPROVED'
      })
      .reduce((sum, request) => sum + request.daysCount, 0)

    monthsData.push({
      number: month,
      name: format(monthStart, 'MMMM', { locale: fr }),
      days: monthDays,
      vacationDays
    })
  }
  
  return monthsData
})

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr })
}

const formatLeaveType = (type: string) => {
  const types = {
    'RTT': 'RTT',
    'LEGAL_VACATION': 'Congés légaux',
    'SENIORITY': 'Ancienneté',
    'EXCEPTIONAL': 'Exceptionnel',
    'SICK_LEAVE': 'Maladie'
  }
  return types[type] || type
}

const formatStatus = (status: string) => {
  const statuses = {
    'PENDING': 'En attente',
    'APPROVED': 'Approuvé',
    'REJECTED': 'Refusé'
  }
  return statuses[status] || status
}

const getStatusClasses = (status: string) => {
  const classes = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'APPROVED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800'
  }
  return classes[status] || ''
}

const getDayClasses = (day: any) => {
  if (!day.date) return 'text-transparent'
  
  const today = new Date()
  const isToday = day.date.toDateString() === today.toDateString()
  const isWeekend = getDay(day.date) === 0 || getDay(day.date) === 6
  
  let classes = 'text-gray-900 hover:bg-gray-100'
  
  if (isToday) classes += ' bg-blue-100 text-blue-900 font-bold'
  if (isWeekend) classes += ' text-gray-400'
  if (day.vacations.length > 0) classes += ' text-white font-medium'
  
  return classes
}

const getVacationClasses = (vacations: any[]) => {
  if (vacations.length === 0) return ''
  
  const types = vacations.map(v => v.type)
  if (types.includes('SICK_LEAVE')) return 'bg-red-400'
  if (types.includes('LEGAL_VACATION')) return 'bg-blue-400'
  if (types.includes('RTT')) return 'bg-green-400'
  return 'bg-purple-400'
}

const loadVacationData = async () => {
  try {
    const [requestsResponse, statisticsResponse] = await Promise.all([
      $fetch('/api/vacations/requests', {
        query: { year: selectedYear.value },
        headers: { Authorization: `Bearer ${user?.token}` }
      }),
      $fetch('/api/vacations/statistics', {
        query: { year: selectedYear.value },
        headers: { Authorization: `Bearer ${user?.token}` }
      })
    ])
    
    allRequests.value = requestsResponse
    statistics.value = statisticsResponse
    detectConflicts()
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  }
}

const createRequest = async () => {
  try {
    await $fetch('/api/vacations/requests', {
      method: 'POST',
      body: newRequest.value,
      headers: { Authorization: `Bearer ${user?.token}` }
    })
    
    showCreateModal.value = false
    newRequest.value = {
      type: '',
      startDate: '',
      endDate: '',
      daysCount: 1,
      reason: ''
    }
    
    await loadVacationData()
  } catch (error) {
    console.error('Erreur lors de la création de la demande:', error)
  }
}

const cancelRequest = async (requestId: string) => {
  // TODO: Implement cancel request
  console.log('Cancel request:', requestId)
}

const detectConflicts = () => {
  conflicts.value = []
  // TODO: Implement conflict detection
}

onMounted(() => {
  loadVacationData()
})

watch(selectedYear, () => {
  loadVacationData()
})
</script>