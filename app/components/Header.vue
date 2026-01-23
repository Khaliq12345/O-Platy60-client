<template>
  <UHeader mode="drawer" orientation="left">
    <template #title>
      <h1>O-PLATY60</h1>
    </template>

    <template #right>
      <UColorModeButton />

      <UUser
        name="John Doe"
        description="Software Engineer"
        :avatar="{
          src: 'https://i.pravatar.cc/150?u=john-doe',
          icon: 'i-lucide-image',
        }"
      />
    </template>

    <template #body>
      <UNavigationMenu
        :items="Navitems"
        orientation="vertical"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>

<script setup lang="ts"></script>
