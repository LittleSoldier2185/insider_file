<template>
  <div class="no-print mb-4">
    <v-btn prepend-icon="mdi-arrow-left" variant="text" @click="$router.back()">กลับ</v-btn>
    <v-btn color="primary" prepend-icon="mdi-file-pdf-box" @click="exportPdf">Export PDF</v-btn>
  </div>

  
  <div v-if="data" ref="paper" class="pa-2">
    <h2>รายงานผลการประเมินรายบุคคล</h2>
    <p>ชื่อ: {{ data.evaluatee.full_name }} {{ data.evaluatee.department }}</p>
    <p>รอบ: {{ data.period.name }} ({{ data.period.start_date }} ถึง {{ data.period.end_date }})</p>
    <p class="text-h6 my-2">คะแนนรวม: {{ data.total === null ? 'ยังไม่มีผลที่ยืนยัน' : data.total + '%' }}</p>

    <v-table density="compact" class="my-4">
      <thead>
        <tr>
          <th>หัวข้อ / ตัวชี้วัด</th>
          <th>น้ำหนัก</th>
          <th>ประเมินตนเอง</th>
          <th v-for="c in data.committees" :key="c.id">{{ c.full_name }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="i in data.indicators" :key="i.id">
          <td>{{ i.topic_name }} / {{ i.name }}</td>
          <td>{{ i.weight }}</td>
          <td>{{ i.self_score ?? '-' }}</td>
          <td v-for="c in data.committees" :key="c.id">{{ scoreOf(c, i) }}</td>
        </tr>
      </tbody>
    </v-table>

    <h3>ผลของกรรมการ</h3>
    <div v-for="c in data.committees" :key="c.id" class="my-3">
      <strong>{{ c.full_name }} ({{ committeeNames[c.committee_role] }})</strong>
      : {{ statusNames[c.status] }} {{ c.percent === null ? '' : '· ' + c.percent + '%' }}
      <p>ความคิดเห็น: {{ c.comment || '-' }}</p>
      <img v-if="c.signature && c.status === 'confirmed'" :src="fileUrl(c.signature)" height="60" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import html2pdf from 'html2pdf.js';
import { api, fileUrl, committeeNames, statusNames } from '../api';

const route = useRoute();
const data = ref(null);
const paper = ref();

onMounted(async () => {
  data.value = (await api.get('/reports/result/' + route.params.periodId + '/' + route.params.userId)).data;
});

function scoreOf(committee, indicator) {
  const s = committee.scores.find((x) => x.indicator_id === indicator.id);
  return s ? s.score : '-';
}

function exportPdf() {
  html2pdf().from(paper.value).save('result-' + data.value.evaluatee.full_name + '.pdf');
}
</script>
