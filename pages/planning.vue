<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Planning Téléphonique</h1>
        <div class="flex space-x-4">
          <button
            v-if="userRole === 'ADMIN'"
            @click="showCreateModal = true"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Icon name="ph:plus" class="w-4 h-4 mr-2" />
            Nouveau créneau
          </button>
          <button
            @click="previousWeek"
            class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <Icon name="ph:caret-left" class="w-4 h-4" />
          </button>
          <button
            @click="nextWeek"
            class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <Icon name="ph:caret-right" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">
            Semaine du {{ formatDate(weekStart) }} au {{ formatDate(weekEnd) }}
          </h2>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse border border-gray-400">
            <thead>
              <tr>
                <th class="border border-gray-400 p-3 bg-gray-50 font-medium text-gray-700 min-w-[150px]">
                  Personnel
                </th>
                <th
                  v-for="slot in phoneTimeSlots"
                  :key="slot"
                  class="border border-gray-400 p-3 bg-gray-50 font-medium text-gray-700 text-center min-w-[80px]"
                >
                  {{ slot }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in users"
                :key="user.id"
                class="hover:bg-gray-50"
              >
                <td class="border border-gray-400 p-3 font-medium text-gray-900">
                  {{ user.firstName }} {{ user.lastName }}
                </td>
                <td
                  v-for="slot in phoneTimeSlots"
                  :key="`${user.id}-${slot}`"
                  class="border border-gray-400 p-1 text-center relative h-16"
                  @click="toggleUserSlot(user.id, slot)"
                  :class="getCellClasses(user.id, slot)"
                >
                  <div
                    v-if="isUserAssignedToSlot(user.id, slot)"
                    class="w-full h-full flex items-center justify-center cursor-pointer"
                    :class="getAssignmentClasses(user.id, slot)"
                  >
                    <span class="text-xs font-medium">Assigné</span>
                    <div v-if="userRole === 'ADMIN'" class="absolute top-1 right-1 flex space-x-1">
                      <button
                        @click.stop="removeUserFromSlot(user.id, slot)"
                        class="text-gray-600 hover:text-red-600 bg-white rounded-full p-1"
                      >
                        <Icon name="ph:x" class="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div
                    v-else-if="userRole === 'ADMIN'"
                    class="w-full h-full flex items-center justify-center cursor-pointer hover:bg-blue-50"
                  >
                    <Icon name="ph:plus" class="w-4 h-4 text-gray-400" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="conflicts.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <h3 class="text-red-800 font-medium mb-2">
          <Icon name="ph:warning" class="w-4 h-4 mr-2" />
          Conflits détectés
        </h3>
        <ul class="text-red-700 text-sm space-y-1">
          <li v-for="conflict in conflicts" :key="conflict.id">
            {{ conflict.description }}
          </li>
        </ul>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Nouveau créneau téléphonique</h3>
        <form @submit.prevent="createSlot">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                v-model="newSlot.date"
                type="date"
                required
                class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Heure début</label>
                <input
                  v-model="newSlot.startTime"
                  type="time"
                  required
                  class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
                <input
                  v-model="newSlot.endTime"
                  type="time"
                  required
                  class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Assigné à</label>
              <select
                v-model="newSlot.assignedUserId"
                class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Non assigné</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.firstName }} {{ user.lastName }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="newSlot.description"
                rows="2"
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
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showEditModal && editingSlot" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Modifier le créneau téléphonique</h3>
        <form @submit.prevent="updateSlot">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Heure début</label>
                <input
                  v-model="editingSlot.startTime"
                  type="time"
                  required
                  class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
                <input
                  v-model="editingSlot.endTime"
                  type="time"
                  required
                  class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Assigné à</label>
              <select
                v-model="editingSlot.assignedUserId"
                class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Non assigné</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.firstName }} {{ user.lastName }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="editingSlot.description"
                rows="2"
                class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Modifier
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'

definePageMeta({
  middleware: 'auth'
})

const { $fetch } = useNuxtApp()
const { user } = useAuthStore()

const currentWeek = ref(new Date())
const phoneSlots = ref([])
const users = ref([])
const showCreateModal = ref(false)
const conflicts = ref([])

const newSlot = ref({
  date: '',
  startTime: '',
  endTime: '',
  assignedUserId: '',
  description: ''
})

const userRole = computed(() => user?.role)

const weekStart = computed(() => startOfWeek(currentWeek.value, { weekStartsOn: 1 }))
const weekEnd = computed(() => endOfWeek(currentWeek.value, { weekStartsOn: 1 }))

const weekDays = computed(() => {
  const days = []
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart.value, i)
    days.push({
      date,
      name: format(date, 'EEEE', { locale: fr })
    })
  }
  return days
})

const phoneTimeSlots = [
  '9-10', '10-11', '11-12', '13h30-14', '14-15', '15-16', '16-17'
]

const timeSlotMapping = {
  '9-10': { start: '09:00', end: '10:00' },
  '10-11': { start: '10:00', end: '11:00' },
  '11-12': { start: '11:00', end: '12:00' },
  '13h30-14': { start: '13:30', end: '14:00' },
  '14-15': { start: '14:00', end: '15:00' },
  '15-16': { start: '15:00', end: '16:00' },
  '16-17': { start: '16:00', end: '17:00' }
}

const formatDate = (date: Date) => {
  return format(date, 'dd/MM', { locale: fr })
}

const previousWeek = () => {
  currentWeek.value = subWeeks(currentWeek.value, 1)
  loadPhoneSlots()
}

const nextWeek = () => {
  currentWeek.value = addWeeks(currentWeek.value, 1)
  loadPhoneSlots()
}

const loadPhoneSlots = async () => {
  try {
    const response = await $fetch('/api/planning/phone-slots', {
      query: {
        startDate: weekStart.value.toISOString().split('T')[0],
        endDate: weekEnd.value.toISOString().split('T')[0]
      },
      headers: {
        Authorization: `Bearer ${user?.token}`
      }
    })
    phoneSlots.value = response
    detectConflicts()
  } catch (error) {
    console.error('Erreur lors du chargement des créneaux:', error)
  }
}

const loadUsers = async () => {
  try {
    const response = await $fetch('/api/auth/users', {
      headers: {
        Authorization: `Bearer ${user?.token}`
      }
    })
    users.value = response
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error)
  }
}

const isUserAssignedToSlot = (userId: string, timeSlot: string) => {
  const timeMapping = timeSlotMapping[timeSlot]
  if (!timeMapping) return false

  return phoneSlots.value.some(slot => {
    return slot.assignedUserId === userId &&
           slot.startTime === timeMapping.start &&
           slot.endTime === timeMapping.end &&
           isDateInCurrentWeek(new Date(slot.date))
  })
}

const isDateInCurrentWeek = (date: Date) => {
  return date >= weekStart.value && date <= weekEnd.value
}

const getCellClasses = (userId: string, timeSlot: string) => {
  if (isUserAssignedToSlot(userId, timeSlot)) {
    return 'cursor-pointer'
  }
  return userRole.value === 'ADMIN' ? 'cursor-pointer' : ''
}

const getAssignmentClasses = (userId: string, timeSlot: string) => {
  // Check for conflicts
  const hasConflict = conflicts.value.some(conflict => 
    conflict.data?.phoneSlot?.assignedUserId === userId ||
    conflict.data?.slots?.some((s: any) => s.assignedUserId === userId)
  )
  
  if (hasConflict) {
    return 'bg-red-200 text-red-800'
  }
  
  return 'bg-blue-200 text-blue-800'
}

const createSlot = async () => {
  try {
    await $fetch('/api/planning/phone-slots', {
      method: 'POST',
      body: newSlot.value,
      headers: {
        Authorization: `Bearer ${user?.token}`
      }
    })
    
    showCreateModal.value = false
    newSlot.value = {
      date: '',
      startTime: '',
      endTime: '',
      assignedUserId: '',
      description: ''
    }
    
    await loadPhoneSlots()
  } catch (error) {
    console.error('Erreur lors de la création du créneau:', error)
  }
}

const showEditModal = ref(false)
const editingSlot = ref(null)

const editSlot = (slot: any) => {
  editingSlot.value = { ...slot }
  showEditModal.value = true
}

const updateSlot = async () => {
  try {
    await $fetch(`/api/planning/phone-slots/${editingSlot.value.id}`, {
      method: 'PUT',
      body: {
        assignedUserId: editingSlot.value.assignedUserId,
        startTime: editingSlot.value.startTime,
        endTime: editingSlot.value.endTime,
        description: editingSlot.value.description
      },
      headers: {
        Authorization: `Bearer ${user?.token}`
      }
    })
    
    showEditModal.value = false
    editingSlot.value = null
    await loadPhoneSlots()
  } catch (error) {
    console.error('Erreur lors de la modification du créneau:', error)
  }
}

const toggleUserSlot = async (userId: string, timeSlot: string) => {
  if (userRole.value !== 'ADMIN') return
  
  if (isUserAssignedToSlot(userId, timeSlot)) {
    await removeUserFromSlot(userId, timeSlot)
  } else {
    await assignUserToSlot(userId, timeSlot)
  }
}

const assignUserToSlot = async (userId: string, timeSlot: string) => {
  const timeMapping = timeSlotMapping[timeSlot]
  if (!timeMapping) return

  try {
    // Create slot for each day of the current week
    const promises = weekDays.value.map(day => {
      // Skip weekends
      const dayOfWeek = day.date.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) return Promise.resolve()

      return $fetch('/api/planning/phone-slots', {
        method: 'POST',
        body: {
          date: day.date.toISOString().split('T')[0],
          startTime: timeMapping.start,
          endTime: timeMapping.end,
          assignedUserId: userId
        },
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      })
    })

    await Promise.all(promises)
    await loadPhoneSlots()
  } catch (error) {
    console.error('Erreur lors de l\'assignation:', error)
  }
}

const removeUserFromSlot = async (userId: string, timeSlot: string) => {
  const timeMapping = timeSlotMapping[timeSlot]
  if (!timeMapping) return

  try {
    // Find and delete all matching slots for the current week
    const slotsToDelete = phoneSlots.value.filter(slot => {
      return slot.assignedUserId === userId &&
             slot.startTime === timeMapping.start &&
             slot.endTime === timeMapping.end &&
             isDateInCurrentWeek(new Date(slot.date))
    })

    const promises = slotsToDelete.map(slot => 
      $fetch(`/api/planning/phone-slots/${slot.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      })
    )

    await Promise.all(promises)
    await loadPhoneSlots()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

const detectConflicts = async () => {
  try {
    const response = await $fetch('/api/planning/conflicts', {
      query: {
        startDate: weekStart.value.toISOString().split('T')[0],
        endDate: weekEnd.value.toISOString().split('T')[0]
      },
      headers: {
        Authorization: `Bearer ${user?.token}`
      }
    })
    conflicts.value = response
  } catch (error) {
    console.error('Erreur lors de la détection des conflits:', error)
    conflicts.value = []
  }
}

onMounted(() => {
  loadPhoneSlots()
  if (userRole.value === 'ADMIN') {
    loadUsers()
  }
})

watch(currentWeek, () => {
  loadPhoneSlots()
})
</script>