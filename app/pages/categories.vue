<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Catégories" />
    </template>

    <template #body>
      <div class="mx-auto w-[60%]">
        <BackButton />
      </div>
      <CategoryList />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts"></script>
