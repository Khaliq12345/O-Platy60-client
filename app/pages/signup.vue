<template>
  <div class="h-screen w-screen flex items-center justify-center">
    <UAuthForm
      title="O-Platy"
      description="Créez votre compte"
      :fields="fields"
      :schema="schema"
      :submit="{ label: 'Inscription' }"
      :loading="loading"
      :ui="{
        title: 'text-4xl font-bold',
        root: 'w-full max-w-sm mx-auto px-8'
      }"
      @submit="onSubmit"
    >
      <template #footer>
        <p class="text-center text-sm text-gray-600 mt-4">
          Déjà un compte ?
          <NuxtLink to="/login" class="text-primary-500 hover:text-primary-600">
            Connectez-vous
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
import type { SignupForm, AuthResponse } from '~/types/auth'
import { Role } from '~/types/enums'

const config = useRuntimeConfig()
const authStore = useAuthStore()
const toast = useToast()
const loading = ref(false)

const fields: AuthFormField[] = [
  {
    name: 'full_name',
    type: 'text',
    label: 'Nom complet',
    placeholder: 'Jean Dupont',
    required: true
  },
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'jean.dupont@exemple.com',
    required: true
  },
  {
    name: 'role',
    type: 'select',
    label: 'Rôle',
    placeholder: 'Sélectionnez un rôle',
    required: true,
    items: [
      { label: 'Admin', value: Role.ADMIN },
      { label: 'Manager', value: Role.MANAGER }
    ]
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
  nom: z.string({ message: "Nom requis" }).min(1, 'Nom requis'),
  prenom: z.string({ message: "Prénom requis" }).min(1, 'Prénom requis'),
  email: z.string({ message: "Email requis" }).email('Email invalide'),
  role: z.string({ message: "Rôle requis" }).refine(
    (val) => ['admin', 'manager'].includes(val),
    { message: 'Veuillez sélectionner un rôle valide' }
  ),
  password: z.string({ message: "Mot de passe requis" }).min(8, 'Le mot de passe doit contenir au moins 8 caractères')
})


type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true
  
  try {
    const userData: SignupForm = {
      full_name: payload.data.full_name,
      email: payload.data.email,
      password: payload.data.password,
      role: payload.data.role
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
