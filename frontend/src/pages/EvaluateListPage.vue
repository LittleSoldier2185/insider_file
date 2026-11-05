<template>
  <h2 class="mb-4">รายชื่อผู้ที่ต้องประเมิน</h2>
  <v-table>
    <thead>
      <tr><th>ผู้รับการประเมิน</th><th>แผนก</th><th>รอบ</th><th>บทบาทของฉัน</th><th>สถานะ</th><th></th></tr>
    </thead>
    <tbody>
      <tr v-for="a in list" :key="a.id">
        <td>{{ a.full_name }}</td>
        <td>{{ a.department }}</td>
        <td>{{ a.period_name }}</td>
        <td>{{ committeeNames[a.committee_role] }}</td>
        <td><v-chip :color="statusColors[a.status]">{{ statusNames[a.status] }}</v-chip></td>
        <td><v-btn size="small" color="primary" :to="'/evaluate/' + a.id">ประเมิน</v-btn></td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api, committeeNames, statusNames, statusColors } from '../api';

const list = ref([]);
onMounted(async () => {
  list.value = (await api.get('/evaluate')).data;
});
</script>
