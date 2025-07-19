<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-2">
              <Icon name="ph:clock-bold" class="w-8 h-8 text-blue-600" />
              <span class="text-xl font-bold text-gray-900">TeamManager</span>
            </NuxtLink>
          </div>

          <div v-if="authStore.isAuthenticated" class="flex items-center space-x-4">
            <!-- Navigation Links -->
            <div class="hidden md:flex space-x-4">
              <NuxtLink
                to="/timetracking"
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Pointage
              </NuxtLink>
              <NuxtLink
                to="/planning"
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Planning
              </NuxtLink>
              <NuxtLink
                to="/holidays"
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Congés
              </NuxtLink>
              <NuxtLink
                v-if="authStore.isAdmin"
                to="/admin"
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Admin
              </NuxtLink>
            </div>

            <!-- User Menu -->
            <div class="flex items-center space-x-3">
              <span class="text-sm text-gray-600">
                {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
              </span>
              <button
                @click="authStore.logout"
                class="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()

// Initialiser l'authentification au montage
onMounted(() => {
  authStore.initAuth()
})
</script>