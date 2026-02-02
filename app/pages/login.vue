<template>
  <div class="h-screen w-screen flex items-center justify-center">
    <UAuthForm
      title="O-Platy"
      description="Connectez-vous"
      :fields="fields"
      :schema="schema"
      :submit="{ label: 'Connexion' }"
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
  email: z.email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
})

type Schema = z.output<typeof schema>

function onSubmit(payload: FormSubmitEvent<Schema>) {
  // payload.errors est déjà géré par le composant si validation échoue
  // payload.data contient les données validées si succès
  console.log('Connexion:', payload.data)
}
</script>
