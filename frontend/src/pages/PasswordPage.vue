<template>
  <v-card max-width="420" class="mx-auto mt-6 pa-4">
    <v-card-title>เปลี่ยนรหัสผ่าน</v-card-title>
    <v-alert v-if="state.user.must_change_password" type="warning" class="mb-4">
      เข้าใช้งานครั้งแรก กรุณาเปลี่ยนรหัสผ่านก่อน
    </v-alert>
    <v-form ref="form" @submit.prevent="save">
      <v-text-field v-model="oldPassword" label="รหัสผ่านเดิม" type="password" :rules="[rules.required]" />
      <v-text-field v-model="newPassword" label="รหัสผ่านใหม่" type="password" :rules="[rules.min8]" />
      <v-text-field
        v-model="confirm"
        label="ยืนยันรหัสผ่านใหม่"
        type="password"
        :rules="[(v) => v === newPassword || 'รหัสผ่านไม่ตรงกัน']"
      />
      <v-btn type="submit" color="primary" block>บันทึก</v-btn>
    </v-form>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { homeOf } from '../router';
import { api, state, saveLogin, rules } from '../api';

const router = useRouter();
const form = ref();
const oldPassword = ref('');
const newPassword = ref('');
const confirm = ref('');

async function save() {
  const { valid } = await form.value.validate();
  if (!valid) return;
  const res = await api.put('/auth/password', {
    old_password: oldPassword.value,
    new_password: newPassword.value,
  });
  saveLogin(res.data.token, { ...state.user, must_change_password: 0 });
  state.message = res.message;
  router.push(homeOf(state.user));
}
</script>
