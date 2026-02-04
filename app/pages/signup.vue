<template>
  <div class="h-screen w-screen flex items-center justify-center">
    <div class="w-full max-w-sm mx-auto px-8 py-6">
      <div>
        <div class="text-center space-y-2">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white">O-Platy</h1>
          <p class="text-gray-600 dark:text-gray-400">Créez votre compte</p>
        </div>
      </div>

      <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-4">
        <!-- Nom complet -->
        <UFormField label="Nom complet" name="full_name">
          <UInput
            v-model="state.full_name"
            placeholder="Jean Dupont"
            icon="i-heroicons-user"
            class="w-full"
          />
        </UFormField>

        <!-- Email -->
        <UFormField label="Email" name="email">
          <UInput
            v-model="state.email"
            type="email"
            placeholder="jean.dupont@exemple.com"
            icon="i-heroicons-envelope"
            class="w-full"
          />
        </UFormField>

        <!-- Rôle avec v-model explicite -->
        <UFormField label="Rôle" name="role">
          <USelect
            v-model="state.role"
            :items="roleItems"
            placeholder="Sélectionnez un rôle"
            icon="i-heroicons-shield-check"
            class="w-full"
          />
        </UFormField>

        <!-- Mot de passe -->
        <UFormField label="Mot de passe" name="password">
          <UInput
            v-model="state.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            icon="i-heroicons-lock-closed"
            class="w-full"
          >
            <template #trailing>
              <UButton
                color="gray"
                variant="link"
                :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                :padded="false"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <!-- Bouton de soumission -->
        <UButton
          type="submit"
          block
          :loading="loading"
          color="primary"
          size="lg"
        >
          Inscription
        </UButton>
      </UForm>

      <div>
        <p class="text-center text-sm text-gray-600 mt-4">
          Déjà un compte ?
          <NuxtLink to="/login" class="text-primary-500 hover:text-primary-600 font-medium">
            Connectez-vous
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { SignupForm, AuthResponse } from '~/types/auth'
import { Role } from '~/types/enums'

const config = useRuntimeConfig()
const authStore = useAuthStore()
const toast = useToast()
const loading = ref(false)
const showPassword = ref(false)

// Items pour le select de rôle (format attendu par USelect)
const roleItems = [
  { label: 'Admin', value: Role.ADMIN },
  { label: 'Manager', value: Role.MANAGER }
]

// État du formulaire avec v-model
const state = reactive({
  full_name: '',
  email: '',
  role: undefined as string | undefined,
  password: ''
})

// Schéma Zod corrigé pour matcher les noms des champs
const schema = z.object({
  full_name: z.string("Nom complet requis").min(1, 'Nom complet requis'),
  email: z.email('Email invalide'),
  role: z.enum([Role.ADMIN, Role.MANAGER], {
    required_error: 'Veuillez sélectionner un rôle',
    invalid_type_error: 'Rôle invalide'
  }),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères')
})

type Schema = z.output<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  
  try {
    const userData: SignupForm = {
      full_name: event.data.full_name,
      email: event.data.email,
      password: event.data.password,
      role: event.data.role
    }
    
    const response = await $fetch<AuthResponse>('/auth/signup', {
      baseURL: config.public.apiBaseUrl,
      method: 'POST',
      body: userData
    })
    
    if (response.user) {
      authStore.set(response.user, response.access_token, response.refresh_token)
    }
    
    toast.add({
      title: 'Inscription réussie',
      description: 'Votre compte a été créé avec succès',
      color: 'green'
    })
    
    await navigateTo('/login')
  } catch (error: any) {
    toast.add({
      title: 'Erreur d\'inscription',
      description: error.data?.message || 'Une erreur est survenue lors de l\'inscription',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>