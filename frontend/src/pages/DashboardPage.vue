<template>
  <h2 class="mb-4">Dashboard</h2>
  <v-row>
    <v-col v-for="c in cards" :key="c.title" cols="12" sm="6" md="3">
      <v-card :color="c.color" variant="tonal" class="pa-4">
        <div class="text-h4">{{ c.value }}</div>
        <div>{{ c.title }}</div>
      </v-card>
    </v-col>
  </v-row>

  <v-card class="pa-4 mt-4">
    <v-card-title>สถานะการประเมินของกรรมการ</v-card-title>
    <div v-for="s in statusList" :key="s.key" class="mb-3">
      {{ statusNames[s.key] }}: {{ s.total }} งาน
      <v-progress-linear :model-value="(s.total / allJobs) * 100" :color="statusColors[s.key]" height="12" />
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { api, statusNames, statusColors } from '../api';

const data = ref({ users: [], status: [], periods: 0 });

onMounted(async () => {
  data.value = (await api.get('/reports/dashboard')).data;
});

function count(list, key, value) {
  const row = list.find((r) => r[key] === value);
  return row ? row.total : 0;
}

const cards = computed(() => [
  { title: 'รอบการประเมิน', value: data.value.periods, color: 'primary' },
  { title: 'ผู้รับการประเมิน', value: count(data.value.users, 'role', 'evaluatee'), color: 'teal' },
  { title: 'กรรมการ', value: count(data.value.users, 'role', 'evaluator'), color: 'indigo' },
  { title: 'ยืนยันผลแล้ว', value: count(data.value.status, 'status', 'confirmed'), color: 'green' },
]);

const statusList = computed(() =>
  ['pending', 'draft', 'confirmed'].map((key) => ({ key, total: count(data.value.status, 'status', key) })),
);
const allJobs = computed(() => statusList.value.reduce((sum, s) => sum + s.total, 0) || 1);
</script>
