<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Membres" />
    </template>

    <template #body>
      <div class="p-1 flex flex-col h-full lg:mx-auto lg:min-w-2xl">
        <div class="w-full mb-4 px-4 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Membres
            </h2>
            <p class="text-sm text-gray-500">{{ users.length }} membre(s)</p>
          </div>

          <UButton
            color="primary"
            icon="i-heroicons-plus"
            label="Ajouter"
            @click="isAddOpen = true"
          />
        </div>

        <Loading v-if="loading" />

        <UPageList v-else class="grow px-4">
          <UPageCard v-for="user in users" :key="user.id" class="mb-3">
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center gap-3">
                <UAvatar :text="getInitials(user.full_name)" size="md" />
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ user.full_name }}
                  </p>
                  <p class="text-sm text-gray-500 flex items-center gap-1">
                    <UIcon name="i-heroicons-envelope" class="w-3 h-3" />
                    {{ user.email }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <UBadge
                  :color="getRoleColor(user.role)"
                  variant="subtle"
                  class="capitalize"
                >
                  {{ user.role }}
                </UBadge>

                <DeleteConfirm
                  :item-name="user.full_name"
                  :item-id="user.id"
                  api-endpoint="/users"
                  title="Supprimer le membre"
                  message="Cette action est irréversible. Le compte sera définitivement supprimé."
                  @deleted="loadUsers"
                >
                  <template #trigger>
                    <UButton
                      color="error"
                      variant="ghost"
                      icon="i-heroicons-trash"
                      size="xs"
                    />
                  </template>
                </DeleteConfirm>
              </div>
            </div>
          </UPageCard>

          <div v-if="users.length === 0" class="text-center py-8 text-gray-500">
            Aucun membre trouvé
          </div>
        </UPageList>
      </div>

      <UserAdd v-model:open="isAddOpen" @created="loadUsers" />
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

const users = ref<User[]>([]);
const loading = ref(true);
const isAddOpen = ref(false);

async function loadUsers() {
  loading.value = true;
  try {
    users.value = await get<User[]>("/users");
  } catch (error) {
    console.error("Erreur chargement membres:", error);
  } finally {
    loading.value = false;
  }
}

function getInitials(name: string): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getRoleColor(role: UserRole): string {
  switch (role) {
    case "admin":
      return "error";
    case "manager":
      return "primary";
    case "cook":
      return "warning";
    default:
      return "neutral";
  }
}

onMounted(loadUsers);
</script>
