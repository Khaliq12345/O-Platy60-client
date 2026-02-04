<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Achats" class=""> </CustomDashboardNav>
    </template>

    <template #body>
      <PurchaseList />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>
