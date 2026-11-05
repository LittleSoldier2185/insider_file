<template>
  <h2 class="mb-4">ผู้ใช้งาน (ผู้รับการประเมิน / กรรมการ)</h2>

  
  <v-card class="pa-4 mb-4">
    <v-card-title>{{ form.id ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้' }}</v-card-title>
    <v-form ref="formRef" @submit.prevent="save">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field v-model="form.username" label="ชื่อผู้ใช้" :disabled="!!form.id" :rules="[rules.required]" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-if="!form.id" v-model="form.password" label="รหัสผ่านเริ่มต้น" :rules="[rules.min8]" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="form.full_name" label="ชื่อ-นามสกุล" :rules="[rules.required]" />
        </v-col>
        <v-col cols="12" md="6">
          <v-select v-model="form.role" label="บทบาท" :items="roles" :rules="[rules.required]" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="form.email" label="อีเมล" :rules="[rules.email]" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="form.department" label="แผนก/หน่วยงาน" />
        </v-col>
      </v-row>
      <v-btn type="submit" color="primary" class="mr-2">บันทึก</v-btn>
      <v-btn @click="clear">ล้างฟอร์ม</v-btn>
    </v-form>
  </v-card>

  
  <v-table>
    <thead>
      <tr><th>ชื่อผู้ใช้</th><th>ชื่อ-นามสกุล</th><th>บทบาท</th><th>อีเมล</th><th>จัดการ</th></tr>
    </thead>
    <tbody>
      <tr v-for="u in users" :key="u.id">
        <td>{{ u.username }}</td>
        <td>{{ u.full_name }}</td>
        <td>{{ roleNames[u.role] }}</td>
        <td>{{ u.email }}</td>
        <td>
          <template v-if="u.role !== 'admin'">
            <v-btn size="small" @click="form = { ...u }">แก้ไข</v-btn>
            <v-btn size="small" color="orange" @click="resetPassword(u)">รีเซ็ตรหัส</v-btn>
            <v-btn size="small" color="red" @click="remove(u)">ลบ</v-btn>
          </template>
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api, state, rules, roleNames } from '../api';

const users = ref([]);
const formRef = ref();
const form = ref({});
const roles = [
  { title: 'ผู้รับการประเมิน', value: 'evaluatee' },
  { title: 'กรรมการ', value: 'evaluator' },
];

async function load() {
  users.value = (await api.get('/users')).data;
}
onMounted(load);

function clear() {
  form.value = {};
  formRef.value.resetValidation();
}

async function save() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  const res = form.value.id
    ? await api.put('/users/' + form.value.id, form.value)
    : await api.post('/users', form.value);
  state.message = res.message;
  clear();
  load();
}

async function resetPassword(u) {
  const password = prompt('รหัสผ่านใหม่ของ ' + u.full_name + ' (อย่างน้อย 8 ตัว)');
  if (!password) return;
  const res = await api.put('/users/' + u.id + '/reset-password', { password });
  state.message = res.message;
}

async function remove(u) {
  if (!confirm('ลบ ' + u.full_name + ' ?')) return;
  const res = await api.delete('/users/' + u.id);
  state.message = res.message;
  load();
}
</script>
