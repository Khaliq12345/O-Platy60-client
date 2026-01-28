<template>
  <UButton
    :label="label"
    icon="i-heroicons-arrow-left-20-solid"
    variant="ghost"
    color="neutral"
    class="gap-2"
    @click="router.back()"
  />
</template>

<script setup lang="ts">
interface Props {
  label?: string
}

withDefaults(defineProps<Props>(), {
  label: 'Retour'
})

const router = useRouter()
</script>