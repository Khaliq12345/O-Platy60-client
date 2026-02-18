 <template>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
      Liste des ingrédients
    </h1>
    <UButton
      color="primary"
      label="Nouvel ingrédient"
      icon="i-heroicons-plus"
      to="/ingredients/add"
    />
  </div>
</template>

<script setup lang="ts"></script>
