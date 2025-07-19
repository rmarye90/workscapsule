<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
          <Icon name="ph:user-plus-bold" class="w-8 h-8 text-blue-600" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Créer votre compte
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Ou
          <NuxtLink to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            connectez-vous à votre compte existant
          </NuxtLink>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700">Prénom</label>
              <input
                id="firstName"
                v-model="form.firstName"
                name="firstName"
                type="text"
                required
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700">Nom</label>
              <input
                id="lastName"
                v-model="form.lastName"
                name="lastName"
                type="text"
                required
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
          </div>

          <div>
            <label for="workSchedule" class="block text-sm font-medium text-gray-700">Régime de travail</label>
            <select
              id="workSchedule"
              v-model="form.workSchedule"
              name="workSchedule"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="FIVE_DAYS">5 jours par semaine</option>
              <option value="FOUR_DAYS">4 jours par semaine</option>
            </select>
          </div>

          <div>
            <label for="dailyHours" class="block text-sm font-medium text-gray-700">Heures par jour</label>
            <input
              id="dailyHours"
              v-model.number="form.dailyHours"
              name="dailyHours"
              type="number"
              min="1"
              max="12"
              step="0.5"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
          </div>

          <div>
            <label for="startDate" class="block text-sm font-medium text-gray-700">Date d'embauche</label>
            <input
              id="startDate"
              v-model="form.startDate"
              name="startDate"
              type="date"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
          </div>
        </div>

        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <Icon name="ph:warning-circle" class="h-5 w-5 text-red-400" />
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {{ error }}
              </h3>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="authStore.isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <Icon name="ph:spinner" class="h-5 w-5 text-blue-500 animate-spin" />
            </span>
            {{ authStore.isLoading ? 'Création...' : 'Créer le compte' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  workSchedule: 'FIVE_DAYS' as 'FOUR_DAYS' | 'FIVE_DAYS',
  dailyHours: 8,
  startDate: ''
})

const error = ref('')

const handleRegister = async () => {
  error.value = ''
  
  try {
    await authStore.register(form)
    await router.push('/')
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la création du compte'
  }
}

// Rediriger si déjà connecté
watchEffect(() => {
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>