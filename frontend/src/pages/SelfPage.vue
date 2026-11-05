<template>
  <h2 class="mb-4">ประเมินตนเอง</h2>
  <v-select v-model="periodId" label="เลือกรอบการประเมิน" :items="periods" item-title="name" item-value="id"
    @update:model-value="load" />

  <template v-if="data">
    
    <v-card class="pa-4 mb-4">
      <div class="mb-2">ความก้าวหน้า (กรอกคะแนนและรายละเอียดแล้ว): {{ data.progress }}%</div>
      <v-progress-linear :model-value="data.progress" color="teal" height="14" />
      <v-alert v-if="!data.can_edit" type="warning" class="mt-4">{{ data.lock_reason }}</v-alert>
      <v-btn class="mt-4" color="primary" prepend-icon="mdi-file-pdf-box"
        :to="'/result/' + periodId + '/' + state.user.id">ดูรายงาน / Export PDF</v-btn>
    </v-card>

    
    <v-card v-for="item in data.indicators" :key="item.id" class="pa-4 mb-4">
      <v-card-title class="text-wrap">{{ item.topic_name }} / {{ item.name }}</v-card-title>
      <v-card-subtitle class="text-wrap">
        {{ item.detail }} · น้ำหนัก {{ item.weight }} · หลักฐาน: {{ item.evidence || '-' }}
      </v-card-subtitle>

      
      <div class="d-flex ga-2 mt-4">
        <ScoreSelect v-model="item.my_score" :type="item.score_type" label="คะแนนตนเอง" :disabled="!data.can_edit" />
        <v-btn color="primary" class="mt-2" :disabled="!data.can_edit" @click="saveScore(item)">บันทึก</v-btn>
      </div>

      
      <v-list density="compact">
        <v-list-item v-for="d in item.details" :key="d.id">
          <v-list-item-title class="text-wrap">{{ d.detail }}</v-list-item-title>
          <a v-if="d.url" :href="d.url" target="_blank" class="mr-3">เปิดลิงก์</a>
          <a v-if="d.file_name" :href="fileUrl(d.file_name)">ดาวน์โหลดไฟล์</a>
          <template #append v-if="data.can_edit">
            <v-btn size="small" icon="mdi-pencil" variant="text" @click="editDetail(d)" />
            <v-btn size="small" icon="mdi-delete" variant="text" color="red" @click="removeDetail(d)" />
          </template>
        </v-list-item>
      </v-list>

      
      <v-row v-if="data.can_edit">
        <v-col cols="12" md="4">
          <v-text-field v-model="forms[item.id].detail" label="รายละเอียดประกอบ" />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field v-model="forms[item.id].url" label="URL หลักฐาน (ถ้ามี)" />
        </v-col>
        <v-col cols="12" md="3">
          <v-file-input v-model="forms[item.id].file" label="ไฟล์ PDF/รูป" accept=".pdf,.png,.jpg,.jpeg" />
        </v-col>
        <v-col cols="12" md="2">
          <v-btn color="primary" class="mt-2" @click="addDetail(item)">เพิ่ม</v-btn>
        </v-col>
      </v-row>
    </v-card>

    
    <v-card class="pa-4">
      <v-card-title>ความคิดเห็นของกรรมการ</v-card-title>
      <p v-for="c in data.committees" :key="c.full_name" class="mb-2">
        <strong>{{ c.full_name }} ({{ committeeNames[c.committee_role] }})</strong>:
        {{ c.comment || 'ยังไม่ได้ยืนยันผล' }}
      </p>
    </v-card>
  </template>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api, state, fileUrl, committeeNames } from '../api';
import ScoreSelect from '../components/ScoreSelect.vue';

const periods = ref([]);
const periodId = ref(null);
const data = ref(null);
const forms = ref({}); 

onMounted(async () => {
  periods.value = (await api.get('/self/periods')).data;
});

async function load() {
  data.value = (await api.get('/self/periods/' + periodId.value)).data;
  for (const item of data.value.indicators) {
    forms.value[item.id] = { detail: '', url: '', file: null };
  }
}

async function saveScore(item) {
  if (item.my_score === null) return (state.message = 'เลือกคะแนนก่อน');
  const res = await api.put('/self/scores', { indicator_id: item.id, score: item.my_score });
  state.message = res.message;
  load();
}

async function addDetail(item) {
  const f = forms.value[item.id];
  if (!f.detail) return (state.message = 'กรอกรายละเอียดก่อน');
  
  const body = new FormData();
  body.append('indicator_id', item.id);
  body.append('detail', f.detail);
  body.append('url', f.url);
  if (f.file) body.append('file', f.file);
  const res = await api.post('/self/details', body);
  state.message = res.message;
  load();
}

async function editDetail(d) {
  const detail = prompt('แก้ไขรายละเอียด', d.detail);
  if (!detail) return;
  const res = await api.put('/self/details/' + d.id, { detail, url: d.url });
  state.message = res.message;
  load();
}

async function removeDetail(d) {
  if (!confirm('ลบรายละเอียดนี้?')) return;
  await api.delete('/self/details/' + d.id);
  load();
}
</script>
