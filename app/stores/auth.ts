import { defineStore } from "pinia";
import type { User } from "~/types/auth";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const user = ref<User | null | undefined>(null);
    const accessToken = ref<string | null>(null);
    const refreshToken = ref<string | null>(null);

    const isAuthenticated = computed(() => !!accessToken.value);

    function set(access: string, refresh: string, userData?: User) {
      if (userData) {
        user.value = userData;
      }
      accessToken.value = access;
      refreshToken.value = refresh;
    }

    function clear() {
      user.value = null;
      accessToken.value = null;
      refreshToken.value = null;
    }

    return {
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      set,
      clear,
    };
  },
  {
    persist: true,
  },
);
