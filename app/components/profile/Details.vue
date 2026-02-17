<template>
    <UPageCard>
      <template #header>
        <h2 class="text-lg font-semibold">Informations</h2>
      </template>
  
      <div class="space-y-4">
        <div v-for="item in listItems" :key="item.label">
          <ListItem
            :label="item.label"
            :value="item.value"
            :icon="item.icon"
            :type="item.type"
          />
        </div>
        <ListItem
          label="Mot de passe"
          value=""
          icon="i-heroicons-key"
          type="button"
        >
          <template #button>
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              label="Changer"
              @click="$emit('change-password')"
            />
          </template>
        </ListItem>
      </div>
    </UPageCard>
  </template>
  
  <script setup lang="ts">
  import type { UserRole } from "~/types/user";
  
  interface Props {
    user: {
      full_name: string;
      email: string;
      role: UserRole;
    } | null;
  }
  
  const props = defineProps<Props>();
  defineEmits<{
    changePassword: [];
  }>();
  
  const listItems = computed(() => [
    {
      label: "Nom Complet",
      value: props.user?.full_name,
      icon: "i-heroicons-user",
      type: "text",
    },
    {
      label: "Email",
      value: props.user?.email,
      icon: "i-heroicons-envelope",
      type: "text",
    },
    {
      label: "Rôle",
      value: props.user?.role,
      icon: "i-heroicons-shield-check",
      type: "badge",
    },
  ]);
  </script>