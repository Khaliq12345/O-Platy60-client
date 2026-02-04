<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Nouvel Achats" class=""> </CustomDashboardNav>
    </template>

    <template #body>
      <div class="w-full p-4 overflow-scroll">
        <PurchaseAdd />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script lang="ts" setup></script>

<style></style>
