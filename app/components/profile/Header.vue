<template>
  <UPageCard variant="outline" class="relative overflow-hidden">
    <div
      class="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary-500 to-primary-600"
    />

    <div class="relative pt-12 flex flex-col items-center">
      <UAvatar
        :text="initials"
        size="3xl"
        class="ring-4 ring-white dark:ring-gray-900 bg-white dark:bg-gray-800"
      />

      <UBadge color="error" variant="subtle" class="mt-3 capitalize">
        {{ user?.role }}
      </UBadge>

      <h1 class="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
        {{ user?.full_name }}
      </h1>

      <p class="text-gray-500 dark:text-gray-400 flex items-center gap-2">
        <UIcon name="i-heroicons-envelope" />
        <span>{{ user?.email }}</span>
      </p>

      <UButton
        class="mt-6"
        color="primary"
        variant="soft"
        icon="i-heroicons-pencil-square"
        label="Modifier le profil"
        @click="$emit('edit')"
      />
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import type { UserRole } from "~/types/user";

interface Props {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
  } | null;
}

const props = defineProps<Props>();
defineEmits<{
  edit: [];
}>();

const initials = computed(() => {
  if (!props.user?.full_name) return "??";
  return props.user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});
</script>