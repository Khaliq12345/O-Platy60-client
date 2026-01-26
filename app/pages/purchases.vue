<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Achats">
        <PurchaseAdd />
      </CustomDashboardNav>
    </template>

    <template #body>
      <PurchaseList />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts"></script>
