<template>
  <div id="loader-container" class="flex items-center justify-center w-full h-full">
    <div id="floating-o" class="text-center">
      <p class="text-primary font-bold text-3xl">O-Platy</p>
      <p class="text-sm">Chargement</p>
    </div>
  </div>
</template>

<style scoped>

#floating-o {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  20% {
    transform: translate(8px, -20px) rotate(5deg);
  }
  40% {
    transform: translate(-6px, 18px) rotate(-3deg);
  }
  60% {
    transform: translate(12px, 8px) rotate(2deg);
  }
  80% {
    transform: translate(-8px, -8px) rotate(-4deg);
  }
}
</style>