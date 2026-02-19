<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Ingrédients" class=""> </CustomDashboardNav>
    </template>

    <template #body>
      <IngredientList />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts"></script>
