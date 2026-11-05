<template>
  <h2 class="mb-4">รอบการประเมิน</h2>

  <v-card class="pa-4 mb-4">
    <v-card-title>{{ form.id ? 'แก้ไขรอบ' : 'สร้างรอบใหม่' }}</v-card-title>
    <v-form ref="formRef" @submit.prevent="save">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field v-model="form.name" label="ชื่อรอบ / หัวข้อการประเมิน" :rules="[rules.required]" />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field v-model="form.start_date" label="วันเริ่ม" type="date" :rules="[rules.required]" />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field v-model="form.end_date" label="วันสิ้นสุด" type="date" :rules="[rules.required]" />
        </v-col>
      </v-row>
      <v-btn type="submit" color="primary" class="mr-2">บันทึก</v-btn>
      <v-btn @click="form = {}">ล้างฟอร์ม</v-btn>
    </v-form>
  </v-card>

  <v-table>
    <thead>
      <tr><th>ชื่อรอบ</th><th>วันเริ่ม</th><th>วันสิ้นสุด</th><th>จัดการ</th></tr>
    </thead>
    <tbody>
      <tr v-for="p in periods" :key="p.id">
        <td>{{ p.name }}</td>
        <td>{{ p.start_date }}</td>
        <td>{{ p.end_date }}</td>
        <td>
          <v-btn size="small" color="primary" :to="'/periods/' + p.id">หัวข้อ/ตัวชี้วัด</v-btn>
          <v-btn size="small" @click="form = { ...p }">แก้ไข</v-btn>
          <v-btn size="small" color="red" @click="remove(p)">ลบ</v-btn>
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api, state, rules } from '../api';

const periods = ref([]);
const formRef = ref();
const form = ref({});

async function load() {
  periods.value = (await api.get('/periods')).data;
}
onMounted(load);

async function save() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  const res = form.value.id
    ? await api.put('/periods/' + form.value.id, form.value)
    : await api.post('/periods', form.value);
  state.message = res.message;
  form.value = {};
  formRef.value.resetValidation();
  load();
}

async function remove(p) {
  if (!confirm('ลบรอบ ' + p.name + ' ? (หัวข้อและตัวชี้วัดจะหายด้วย)')) return;
  const res = await api.delete('/periods/' + p.id);
  state.message = res.message;
  load();
}
</script>
