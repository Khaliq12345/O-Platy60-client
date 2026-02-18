<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Nouvel Ingrédient" class=""> </CustomDashboardNav>
    </template>

    <template #body>
      <div class="w-full p-4 overflow-scroll">
        <IngredientAdd />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script lang="ts" setup></script>

<style></style>
