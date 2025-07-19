<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Pointage des temps</h1>
        <p class="mt-2 text-gray-600">Enregistrez vos heures de travail quotidiennes</p>
      </div>

      <!-- Saisie rapide -->
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Pointage du jour</h2>
        
        <form @submit.prevent="saveTimeEntry" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label for="date" class="block text-sm font-medium text-gray-700">Date</label>
              <input
                id="date"
                v-model="currentEntry.date"
                type="date"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
            </div>
            
            <div>
              <label for="startTime" class="block text-sm font-medium text-gray-700">Heure d'arrivée</label>
              <input
                id="startTime"
                v-model="currentEntry.startTime"
                type="time"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
            </div>
            
            <div>
              <label for="endTime" class="block text-sm font-medium text-gray-700">Heure de départ</label>
              <input
                id="endTime"
                v-model="currentEntry.endTime"
                type="time"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
            </div>
            
            <div>
              <label for="breakTime" class="block text-sm font-medium text-gray-700">Pause (min)</label>
              <input
                id="breakTime"
                v-model.number="currentEntry.breakTime"
                type="number"
                min="0"
                max="240"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
            </div>
          </div>
          
          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700">Notes (optionnel)</label>
            <textarea
              id="notes"
              v-model="currentEntry.notes"
              rows="2"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Remarques sur la journée..."
            />
          </div>
          
          <!-- Temps calculé -->
          <div v-if="calculatedTime > 0" class="bg-blue-50 p-4 rounded-md">
            <p class="text-sm text-blue-700">
              <Icon name="ph:clock-bold" class="inline w-4 h-4 mr-1" />
              Temps de travail calculé: <strong>{{ formatTime(calculatedTime) }}</strong>
            </p>
          </div>
          
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Icon v-if="isLoading" name="ph:spinner" class="animate-spin -ml-1 mr-2 h-4 w-4" />
              {{ isLoading ? 'Sauvegarde...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Résumé -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Icon name="ph:clock-bold" class="h-6 w-6 text-blue-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total ce mois</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ formatTime(summary.total) }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Icon name="ph:plus-circle-bold" class="h-6 w-6 text-green-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Heures sup</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ formatTime(summary.overtime) }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Icon name="ph:minus-circle-bold" class="h-6 w-6 text-red-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Heures manquantes</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ formatTime(summary.missingHours) }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Icon name="ph:calendar-bold" class="h-6 w-6 text-purple-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Jours saisis</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ summary.totalEntries }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Historique -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Historique des pointages</h3>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrivée</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Départ</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pause</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="entry in timeEntries" :key="entry.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(entry.date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ entry.startTime ? formatTimeOnly(entry.startTime) : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ entry.endTime ? formatTimeOnly(entry.endTime) : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ entry.breakTime }}min
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span v-if="entry.workTime" class="font-medium">{{ formatTime(entry.workTime) }}</span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  <span v-if="entry.notes" class="truncate max-w-xs block">{{ entry.notes }}</span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="editEntry(entry)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Modifier
                  </button>
                  <button
                    @click="deleteEntry(entry.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
              
              <tr v-if="timeEntries.length === 0">
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                  Aucun pointage enregistré ce mois
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { calculateWorkTime, formatTime, formatDate } from '~/utils/timeCalculations'
import type { TimeEntry, WorkTimeCalculation } from '~/types'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()

// État réactif
const currentEntry = reactive({
  date: format(new Date(), 'yyyy-MM-dd'),
  startTime: '',
  endTime: '',
  breakTime: 60,
  notes: ''
})

const timeEntries = ref<TimeEntry[]>([])
const summary = ref<WorkTimeCalculation>({
  regularHours: 0,
  overtime: 0,
  total: 0,
  missingHours: 0
})

const isLoading = ref(false)

// Computed
const calculatedTime = computed(() => {
  if (currentEntry.startTime && currentEntry.endTime) {
    return calculateWorkTime(currentEntry.startTime, currentEntry.endTime, currentEntry.breakTime)
  }
  return 0
})

// Méthodes
const saveTimeEntry = async () => {
  isLoading.value = true
  try {
    await $fetch('/api/timetracking/entries', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: currentEntry
    })
    
    // Rafraîchir les données
    await Promise.all([
      fetchTimeEntries(),
      fetchSummary()
    ])
    
    // Réinitialiser le formulaire
    currentEntry.startTime = ''
    currentEntry.endTime = ''
    currentEntry.breakTime = 60
    currentEntry.notes = ''
    
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde:', error)
  } finally {
    isLoading.value = false
  }
}

const editEntry = (entry: TimeEntry) => {
  currentEntry.date = entry.date
  currentEntry.startTime = entry.startTime ? formatTimeOnly(entry.startTime) : ''
  currentEntry.endTime = entry.endTime ? formatTimeOnly(entry.endTime) : ''
  currentEntry.breakTime = entry.breakTime
  currentEntry.notes = entry.notes || ''
}

const deleteEntry = async (entryId: string) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) return
  
  try {
    await $fetch(`/api/timetracking/${entryId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    await Promise.all([
      fetchTimeEntries(),
      fetchSummary()
    ])
  } catch (error: any) {
    console.error('Erreur lors de la suppression:', error)
  }
}

const fetchTimeEntries = async () => {
  try {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    
    timeEntries.value = await $fetch('/api/timetracking/entries', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      query: { month, year }
    })
  } catch (error: any) {
    console.error('Erreur lors du chargement des entrées:', error)
  }
}

const fetchSummary = async () => {
  try {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    
    summary.value = await $fetch('/api/timetracking/summary', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      query: { month, year }
    })
  } catch (error: any) {
    console.error('Erreur lors du chargement du résumé:', error)
  }
}

const formatTimeOnly = (dateTime: string): string => {
  return format(new Date(dateTime), 'HH:mm')
}

// Charger les données au montage
onMounted(() => {
  Promise.all([
    fetchTimeEntries(),
    fetchSummary()
  ])
})
</script>