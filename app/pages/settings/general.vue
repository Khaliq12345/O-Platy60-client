<template>
    <UDashboardPanel>
      <template #header>
        <CustomDashboardNav title="Mon profil" />
      </template>
  
      <template #body>
        <div class="mx-auto max-w-lg space-y-6">
          
          <!-- Carte profil principale -->
          <UPageCard variant="outline" class="relative overflow-hidden">
            <div class="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary-500 to-primary-600" />
            
            <div class="relative pt-12 flex flex-col items-center">
              <UAvatar
                :text="initials"
                size="3xl"
                class="ring-4 ring-white dark:ring-gray-900 bg-white dark:bg-gray-800"
              />
              
              <UBadge
                :color="roleColor"
                variant="subtle"
                class="mt-3 capitalize"
              >
                {{ auth.user?.role }}
              </UBadge>
  
              <h1 class="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                {{ auth.user?.full_name }}
              </h1>
              
              <p class="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
                {{ auth.user?.email }}
              </p>
  
              <UButton
                class="mt-6"
                color="primary"
                variant="soft"
                icon="i-heroicons-pencil-square"
                label="Modifier le profil"
                @click="isEditOpen = true"
              />
            </div>
          </UPageCard>
  
          <!-- Informations détaillées -->
          <UPageCard variant="ghost">
            <template #header>
              <h2 class="text-lg font-semibold">Informations</h2>
            </template>
  
            <div class="space-y-4">
              <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div class="flex items-center gap-3">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-heroicons-user"
                    size="xs"
                    class="rounded-full"
                  />
                  <span class="text-sm text-gray-500 dark:text-gray-400">Nom complet</span>
                </div>
                <span class="font-medium">{{ auth.user?.full_name }}</span>
              </div>
  
              <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div class="flex items-center gap-3">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-heroicons-envelope"
                    size="xs"
                    class="rounded-full"
                  />
                  <span class="text-sm text-gray-500 dark:text-gray-400">Email</span>
                </div>
                <span class="font-medium">{{ auth.user?.email }}</span>
              </div>
  
              <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div class="flex items-center gap-3">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-heroicons-shield-check"
                    size="xs"
                    class="rounded-full"
                  />
                  <span class="text-sm text-gray-500 dark:text-gray-400">Rôle</span>
                </div>
                <UBadge :color="roleColor" variant="subtle" class="capitalize">
                  {{ auth.user?.role }}
                </UBadge>
              </div>
  
              <div class="flex items-center justify-between py-3">
                <div class="flex items-center gap-3">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-heroicons-key"
                    size="xs"
                    class="rounded-full"
                  />
                  <span class="text-sm text-gray-500 dark:text-gray-400">Mot de passe</span>
                </div>
                <UButton
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  label="Changer"
                  @click="isPasswordOpen = true"
                />
              </div>
            </div>
          </UPageCard>
  
          <!-- Actions dangereuses -->
          <UPageCard variant="ghost" class="border-red-200 dark:border-red-900">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900 dark:text-white">Se déconnecter</p>
                <p class="text-sm text-gray-500">Terminer la session actuelle</p>
              </div>
              <UButton
                color="error"
                variant="ghost"
                icon="i-heroicons-arrow-right-on-rectangle"
                label="Déconnexion"
                @click="logout"
              />
            </div>
          </UPageCard>
        </div>
  
        <!-- Modal édition profil -->
        <UserEdit
          v-model:open="isEditOpen"
          @updated="locationReload"
        />
  
        <!-- Modal changement mot de passe -->
        <UserPasswordModal
          v-model:open="isPasswordOpen"
          @updated="locationReload"
        />
      </template>
    </UDashboardPanel>
  </template>
  
  <script setup lang="ts">
  import type { UserRole } from "~/types/user";
  
  interface User {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
  }
  
  const { get } = useApi();
  const auth = useAuthStore();
  
  const isEditOpen = ref(false);
  const isPasswordOpen = ref(false);
  
  const initials = computed(() => {
    if (!auth.user?.full_name) return "??";
    return auth.user.full_name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  });
  
  const roleColor = computed(() => {
    switch (auth.user?.role) {
      case "admin": return "error";
      case "manager": return "primary";
      case "cook": return "warning";
      default: return "neutral";
    }
  });
  
  async function loadUser() {
    if (!auth.user?.id) return;
    try {
      const user = await get<User>(`/users/${auth.user.id}`);
      // Mettre à jour le store avec les données fraîches
      auth.set(
        auth.accessToken!,
        auth.refreshToken!,
        user
      );
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    }
  }
  
  function locationReload() {
    window.location.reload();
  }
  
  async function logout() {
    auth.clear();
    navigateTo("/login");
  }
  
  onMounted(loadUser);
  </script>