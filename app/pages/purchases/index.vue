<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Achats" class=""> </CustomDashboardNav>
    </template>

    <template #body>
      <div class="mx-auto w-[55%]">
        <BackButton />
      </div>
      <PurchaseList />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts"></script>
