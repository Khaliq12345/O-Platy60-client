<template>
  <UDashboardSidebar
    collapsible
    resizable
    :ui="{ footer: 'border-t border-default' }"
  >
    <!-- Title of the Platform -->
    <template #header="{ collapsed }">
      <div
        class="flex items-center gap-3 px-2 w-full transition-all duration-200"
        :class="[collapsed ? 'justify-center' : 'justify-start']"
      >
        <div class="shrink-0">
          <UIcon
            name="i-lucide-layers"
            class="size-8 text-red-600 dark:text-red-500"
          />
        </div>

        <h1
          class="text-2xl md:text-3xl font-black tracking-tighter text-red-600 dark:text-red-500 truncate"
        >
          O-PLATY60
        </h1>
      </div>
    </template>

    <!-- The menu for the navigation -->
    <template #default="{ collapsed }">
      <UNavigationMenu
        :collapsed="collapsed"
        :items="Navitems[0]"
        orientation="vertical"
      />

      <UNavigationMenu
        :collapsed="collapsed"
        :items="Navitems[1]"
        orientation="vertical"
        class="mt-auto"
      />
    </template>

    <!-- The footer -->
    <template #footer="{ collapsed }">
      <UAvatar
        :text="collapsed ? undefined : auth.user?.full_name || '??'"
        :alt="auth.user?.full_name"
        variant="ghost"
        class="w-full"
        :block="collapsed"
      />
    </template>
  </UDashboardSidebar>
</template>

<script setup lang="ts">
const auth = useAuthStore();
</script>
