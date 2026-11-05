<template>
  <v-btn to="/evaluate" prepend-icon="mdi-arrow-left" variant="text">กลับ</v-btn>
  <template v-if="data">
    
    <v-card class="pa-4 mb-4">
      <h2>{{ data.evaluatee.full_name }}</h2>
      <p>แผนก: {{ data.evaluatee.department || '-' }} · อีเมล: {{ data.evaluatee.email || '-' }}</p>
      <p>รอบ: {{ data.period.name }}</p>
      <v-chip class="mt-2" :color="statusColors[data.assignment.status]">{{ statusNames[data.assignment.status] }}</v-chip>
    </v-card>

    
    <v-card v-for="item in data.indicators" :key="item.id" class="pa-4 mb-4">
      <v-card-title class="text-wrap">{{ item.topic_name }} / {{ item.name }}</v-card-title>
      <v-card-subtitle class="text-wrap">{{ item.detail }} · น้ำหนัก {{ item.weight }}</v-card-subtitle>
      <p class="mt-2">คะแนนที่ประเมินตนเอง: <strong>{{ item.self_score ?? 'ยังไม่กรอก' }}</strong></p>
      <ul class="ml-6 my-2">
        <li v-for="d in item.details" :key="d.id">
          {{ d.detail }}
          <a v-if="d.url" :href="d.url" target="_blank">[ลิงก์]</a>
          <a v-if="d.file_name" :href="fileUrl(d.file_name)">[ไฟล์]</a>
        </li>
      </ul>
      <ScoreSelect v-model="item.score" :type="item.score_type" label="คะแนนจากกรรมการ" :disabled="locked" />
    </v-card>

    
    <v-card class="pa-4 mb-4">
      <v-card-title>สรุปผลการประเมิน</v-card-title>
      <v-table density="compact">
        <thead>
          <tr><th>ตัวชี้วัด</th><th>น้ำหนัก</th><th>ตนเอง</th><th>กรรมการ</th></tr>
        </thead>
        <tbody>
          <tr v-for="item in data.indicators" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.weight }}</td>
            <td>{{ item.self_score ?? '-' }}</td>
            <td>{{ item.score ?? '-' }}</td>
          </tr>
        </tbody>
      </v-table>
      <p class="text-h6 mt-2">คะแนนรวม: {{ data.percent === null ? 'ยังให้คะแนนไม่ครบ' : data.percent + '%' }}</p>
    </v-card>

    
    <v-card class="pa-4">
      <v-textarea v-model="data.assignment.comment" label="ความคิดเห็นสรุปภาพรวม" :disabled="locked" />
      <v-btn color="orange" class="mb-4" :disabled="locked" @click="saveDraft">บันทึกร่าง</v-btn>

      <div class="d-flex ga-2">
        <v-file-input v-model="signature" label="ไฟล์ลายเซ็น (PNG/JPG)" accept=".png,.jpg,.jpeg" :disabled="locked" />
        <v-btn class="mt-2" :disabled="locked" @click="uploadSignature">แนบลายเซ็น</v-btn>
      </div>
      <img v-if="data.assignment.signature" :src="fileUrl(data.assignment.signature)" height="70" />

      <div class="mt-4">
        <v-btn color="green" :disabled="locked" @click="confirmResult">ยืนยันและส่งผล</v-btn>
      </div>
    </v-card>
  </template>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api, state, fileUrl, statusNames, statusColors } from '../api';
import ScoreSelect from '../components/ScoreSelect.vue';

const route = useRoute();
const data = ref(null);
const signature = ref(null);
const locked = computed(() => data.value.assignment.status === 'confirmed'); 

async function load() {
  data.value = (await api.get('/evaluate/' + route.params.id)).data;
}
onMounted(load);

async function saveDraft() {
  const scores = data.value.indicators.map((i) => ({ indicator_id: i.id, score: i.score }));
  const res = await api.put('/evaluate/' + route.params.id, { scores, comment: data.value.assignment.comment });
  state.message = res.message;
  load();
}

async function uploadSignature() {
  if (!signature.value) return (state.message = 'เลือกไฟล์ลายเซ็นก่อน');
  const body = new FormData();
  body.append('file', signature.value);
  const res = await api.post('/evaluate/' + route.params.id + '/signature', body);
  state.message = res.message;
  load();
}

async function confirmResult() {
  if (!confirm('ยืนยันผลแล้วจะแก้ไขไม่ได้ ต้องการยืนยันหรือไม่?')) return;
  await saveDraft();
  const res = await api.put('/evaluate/' + route.params.id + '/confirm');
  state.message = res.message;
  load();
}
</script>
