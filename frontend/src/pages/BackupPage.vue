<template>
  <h2 class="mb-4">สำรองและกู้คืนข้อมูล</h2>
  <v-row>
    <v-col cols="12" md="6">
      <v-card class="pa-4">
        <v-card-title>สำรองข้อมูล (Backup)</v-card-title>
        <p class="mb-4">ดาวน์โหลดข้อมูลทุกตารางเป็นไฟล์ backup.json</p>
        <v-btn color="primary" prepend-icon="mdi-download" :href="backupUrl">ดาวน์โหลด</v-btn>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card class="pa-4">
        <v-card-title>กู้คืนข้อมูล (Restore)</v-card-title>
        <v-file-input v-model="file" label="เลือกไฟล์ backup.json" accept=".json" />
        <v-btn color="red" prepend-icon="mdi-upload" @click="restore">กู้คืน</v-btn>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref } from 'vue';
import { api, state } from '../api';

const file = ref(null);
const backupUrl = '/api/backup?token=' + localStorage.getItem('token');

async function restore() {
  if (!file.value) return (state.message = 'เลือกไฟล์ก่อน');
  if (!confirm('ข้อมูลปัจจุบันจะถูกแทนที่ทั้งหมด ยืนยัน?')) return;
  const json = JSON.parse(await file.value.text()); 
  const res = await api.post('/backup/restore', json);
  state.message = res.message;
}
</script>
