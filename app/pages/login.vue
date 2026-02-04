<template>
  <div class="h-screen w-screen flex items-center justify-center">
    <UAuthForm
      title="O-Platy"
      description="Connectez-vous"
      :fields="fields"
      :schema="schema"
      :submit="{ label: 'Connexion' }"
      :loading="loading"
      :ui="{
        title: 'text-4xl font-bold',
        root: 'w-full max-w-sm mx-auto px-8'
      }"
      @submit="onSubmit"
    >
      <template #footer>
        <p class="text-center text-sm text-gray-600 mt-4">
          Pas de compte ?
          <NuxtLink to="/signup" class="text-primary-500 hover:text-primary-600">
            Inscrivez-vous
          </NuxtLink>
        </p>
      </template>
    </UAuthForm>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import type { AuthForm, AuthResponse } from '~/types/auth'

const config = useRuntimeConfig()
const authStore = useAuthStore()
const toast = useToast()
const loading = ref(false)

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'votre@email.com',
    required: true
  },
  {
    name: 'password',
    type: 'password',
    label: 'Mot de passe',
    placeholder: '••••••••',
    required: true
  }
]

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true
  
  try {
    const credentials: AuthForm = {
      email: payload.data.email,
      password: payload.data.password
    }
    
    const response = await $fetch<AuthResponse>('/auth/login', {
      baseURL: config.public.apiBaseUrl,
      method: 'POST',
      body: credentials
    })
    
    if (response.user) {
      authStore.set(response.user, response.access_token, response.refresh_token)
    }
    
    toast.add({
      title: 'Connexion réussie',
      description: 'Vous êtes maintenant connecté',
      color: 'green'
    })
    
    await navigateTo('/')
  } catch (error: any) {
    toast.add({
      title: 'Erreur de connexion',
      description: error.data?.message || 'Email ou mot de passe incorrect',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>
