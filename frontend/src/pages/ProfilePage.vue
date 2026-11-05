<template>
  <h2 class="mb-4">ข้อมูลส่วนตัว</h2>
  <v-card class="pa-4" max-width="600">
    <p class="mb-4">ชื่อผู้ใช้: {{ user.username }}</p>
    <v-form ref="form" @submit.prevent="save">
      <v-text-field v-model="user.full_name" label="ชื่อ-นามสกุล" :rules="[rules.required]" />
      <v-text-field v-model="user.email" label="อีเมล" :rules="[rules.email]" />
      <v-text-field v-model="user.department" label="แผนก/หน่วยงาน" />
      <v-btn type="submit" color="primary">บันทึก</v-btn>
    </v-form>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api, state, rules } from '../api';

const form = ref();
const user = ref({});

onMounted(async () => {
  user.value = (await api.get('/auth/me')).data;
});

async function save() {
  const { valid } = await form.value.validate();
  if (!valid) return;
  const res = await api.put('/auth/me', user.value);
  state.user.full_name = user.value.full_name;
  localStorage.setItem('user', JSON.stringify(state.user));
  state.message = res.message;
}
</script>
