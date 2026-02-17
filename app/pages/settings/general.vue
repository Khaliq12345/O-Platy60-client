<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Mon profil" />
    </template>

    <template #body>
      <div class="mx-auto md:min-w-lg space-y-6">
        <!-- Part 1: Header/Hero -->
        <ProfileHeader 
          :user="auth.user" 
          @edit="isEditOpen = true" 
        />

        <!-- Part 2: Details -->
        <ProfileDetails 
          :user="auth.user" 
          @change-password="isPasswordOpen = true" 
        />

        <!-- Part 3: Actions -->
        <ProfileActions @logout="logout" />
      </div>

      <!-- Modals remain in parent for state management -->
      <UserEdit v-model:open="isEditOpen" @updated="locationReload" />
      <UserPasswordModal
        v-model:open="isPasswordOpen"
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

async function loadUser() {
  if (!auth.user?.id) return;
  try {
    const user = await get<User>(`/users/${auth.user.id}`);
    auth.set(auth.accessToken!, auth.refreshToken!, user);
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