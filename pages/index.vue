<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <!-- Page header -->
    <div class="px-4 py-6 sm:px-0">
      <div class="border-4 border-dashed border-gray-200 rounded-lg p-8 text-center">
        <Icon name="ph:house-bold" class="mx-auto h-12 w-12 text-gray-400" />
        <h1 class="mt-4 text-3xl font-bold text-gray-900">
          Bienvenue sur TeamManager
        </h1>
        <p class="mt-2 text-lg text-gray-600">
          Votre outil de gestion d'équipe centralisé
        </p>
        
        <div v-if="!authStore.isAuthenticated" class="mt-6 space-x-4">
          <NuxtLink
            to="/login"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Se connecter
          </NuxtLink>
          <NuxtLink
            to="/register"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Créer un compte
          </NuxtLink>
        </div>

        <div v-else class="mt-6">
          <p class="text-gray-600">
            Bonjour {{ authStore.user?.firstName }}, que souhaitez-vous faire aujourd'hui ?
          </p>
          
          <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NuxtLink
              to="/timetracking"
              class="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div>
                <span class="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600">
                  <Icon name="ph:clock-bold" class="h-6 w-6" />
                </span>
              </div>
              <div class="mt-4">
                <h3 class="text-lg font-medium text-gray-900">
                  Pointage
                </h3>
                <p class="mt-2 text-sm text-gray-500">
                  Enregistrer vos heures de travail quotidiennes
                </p>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/planning"
              class="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div>
                <span class="rounded-lg inline-flex p-3 bg-green-50 text-green-600">
                  <Icon name="ph:calendar-bold" class="h-6 w-6" />
                </span>
              </div>
              <div class="mt-4">
                <h3 class="text-lg font-medium text-gray-900">
                  Planning
                </h3>
                <p class="mt-2 text-sm text-gray-500">
                  Consulter le planning de l'équipe
                </p>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/holidays"
              class="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div>
                <span class="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-600">
                  <Icon name="ph:sun-bold" class="h-6 w-6" />
                </span>
              </div>
              <div class="mt-4">
                <h3 class="text-lg font-medium text-gray-900">
                  Congés
                </h3>
                <p class="mt-2 text-sm text-gray-500">
                  Gérer vos demandes de congés
                </p>
              </div>
            </NuxtLink>

            <NuxtLink
              v-if="authStore.isAdmin"
              to="/admin"
              class="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div>
                <span class="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600">
                  <Icon name="ph:gear-bold" class="h-6 w-6" />
                </span>
              </div>
              <div class="mt-4">
                <h3 class="text-lg font-medium text-gray-900">
                  Administration
                </h3>
                <p class="mt-2 text-sm text-gray-500">
                  Gérer l'équipe et les paramètres
                </p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
</script>