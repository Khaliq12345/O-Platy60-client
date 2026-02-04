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
definePageMeta({ layout: false, middleware: 'guest' })
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import type { SignupForm } from '~/types/auth'
import { Role } from '~/types/enums'

const { signup } = useAuth()
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
    options: [
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
  full_name: z.string().min(1, 'Nom complet requis'),
  email: z.string().email('Email invalide'),
  role: z.nativeEnum(Role, { message: 'Veuillez sélectionner un rôle valide' }),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères')
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
    
    await signup(userData)
    
    toast.add({
      title: 'Inscription réussie',
      description: 'Votre compte a été créé avec succès',
      color: 'green'
    })
    
    await navigateTo('/')
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
