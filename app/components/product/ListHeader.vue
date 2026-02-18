<template>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
      Liste des Produits
    </h1>
    <UButton
      color="primary"
      label="Nouveau Produit"
      icon="i-heroicons-plus"
      @click="showAdd = true"
    />
  </div>
  <ProductAdd
    :open="showAdd"
    @update:open="showAdd = $event"
  />
</template>

<script setup>
const showAdd = ref(false);
</script>
