<template>
  <h2 class="mb-4">ติดตามสถานะและรายงานผล</h2>
  <v-select v-model="periodId" label="เลือกรอบการประเมิน" :items="periods" item-title="name" item-value="id"
    @update:model-value="load" />

  <template v-if="report">
    
    <h3 class="my-4">สรุปรายผู้รับการประเมิน (ตัวชี้วัดทั้งหมด {{ report.indicators }} ข้อ)</h3>
    <v-table>
      <thead>
        <tr><th>ผู้รับการประเมิน</th><th>ร้อยละการบันทึกข้อมูล</th><th>กรรมการ / สถานะ / คะแนน</th><th></th></tr>
      </thead>
      <tbody>
        <tr v-for="p in report.evaluatees" :key="p.id">
          <td>{{ p.full_name }}</td>
          <td style="min-width: 140px">
            {{ p.progress }}%
            <v-progress-linear :model-value="p.progress" color="teal" height="8" />
          </td>
          <td>
            <div v-for="c in p.committees" :key="c.id" class="my-1">
              {{ c.evaluator_name }} ({{ committeeNames[c.committee_role] }})
              <v-chip size="small" :color="statusColors[c.status]">{{ statusNames[c.status] }}</v-chip>
              {{ c.percent === null ? '' : c.percent + '%' }}
            </div>
          </td>
          <td><v-btn size="small" color="primary" :to="'/result/' + periodId + '/' + p.id">รายงานรายบุคคล</v-btn></td>
        </tr>
      </tbody>
    </v-table>

    
    <h3 class="my-4">สรุปรายกรรมการ</h3>
    <v-table>
      <thead>
        <tr><th>กรรมการ</th><th>ได้รับมอบหมาย</th><th>ยืนยันผลแล้ว</th></tr>
      </thead>
      <tbody>
        <tr v-for="v in report.evaluators" :key="v.id">
          <td>{{ v.full_name }}</td>
          <td>{{ v.total }} คน</td>
          <td>{{ v.confirmed }} คน</td>
        </tr>
      </tbody>
    </v-table>
  </template>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api, committeeNames, statusNames, statusColors } from '../api';

const periods = ref([]);
const periodId = ref(null);
const report = ref(null);

onMounted(async () => {
  periods.value = (await api.get('/periods')).data;
});

async function load() {
  report.value = (await api.get('/reports/periods/' + periodId.value)).data;
}
</script>
