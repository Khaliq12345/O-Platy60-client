<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Ingrédients" class=""> </CustomDashboardNav>
    </template>

    <template #body>
      <div class="mx-auto w-[55%]">
        <BackButton />
      </div>
      <IngredientList />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts"></script>
