<template>
  <v-card max-width="420" class="mx-auto mt-10 pa-4">
    <v-card-title>เข้าสู่ระบบ</v-card-title>
    <v-form ref="form" @submit.prevent="login">
      <v-text-field v-model="username" label="ชื่อผู้ใช้" :rules="[rules.required]" />
      <v-text-field v-model="password" label="รหัสผ่าน" type="password" :rules="[rules.required]" />
      <v-btn type="submit" color="primary" block>เข้าสู่ระบบ</v-btn>
    </v-form>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { homeOf } from '../router';
import { api, saveLogin, rules } from '../api';

const router = useRouter();
const form = ref();
const username = ref('');
const password = ref('');

async function login() {
  const { valid } = await form.value.validate();
  if (!valid) return;
  const res = await api.post('/auth/login', { username: username.value, password: password.value });
  saveLogin(res.data.token, res.data.user);
  router.push(homeOf(res.data.user));
}
</script>
