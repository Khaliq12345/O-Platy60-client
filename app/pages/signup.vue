<template>
  <div class="h-screen w-screen flex items-center justify-center">
    <UAuthForm
      title="O-Platy"
      description="Créez votre compte"
      :fields="fields"
      :schema="schema"
      :submit="{ label: 'Inscription' }"
      :ui="{
        title: 'text-4xl font-bold',
        root: 'w-full max-w-sm mx-auto px-8'
      }"
      @submit="onSubmit"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'

const fields: AuthFormField[] = [
  {
    name: 'nom',
    type: 'text',
    label: 'Nom',
    placeholder: 'Dupont',
    required: true
  },
  {
    name: 'prenom',
    type: 'text',
    label: 'Prénom',
    placeholder: 'Jean',
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
      { label: 'Admin', value: 'admin' },
      { label: 'Manager', value: 'manager' }
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

function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log('Inscription:', payload.data)
}
</script>
