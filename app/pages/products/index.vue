<template>
  <UDashboardPanel>
    <template #header>
      <CustomDashboardNav title="Produits" />
    </template>
    <template #body>
      <div class="mx-auto w-[70%]">
        <BackButton />
      </div>
      <ProductList />
    </template>
  </UDashboardPanel>
</template>
