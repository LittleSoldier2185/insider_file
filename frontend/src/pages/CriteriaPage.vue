<template>
  <v-btn to="/periods" prepend-icon="mdi-arrow-left" variant="text">กลับ</v-btn>
  <h2 class="mb-4">{{ period.name }} ({{ period.start_date }} ถึง {{ period.end_date }})</h2>

  
  <v-card class="pa-4 mb-4">
    <v-card-title>เพิ่มหัวข้อการประเมิน</v-card-title>
    <v-form ref="topicRef" @submit.prevent="addTopic" class="d-flex ga-2">
      <v-text-field v-model="topicName" label="ชื่อหัวข้อ" :rules="[rules.required]" />
      <v-btn type="submit" color="primary" class="mt-2">เพิ่ม</v-btn>
    </v-form>
  </v-card>

  
  <v-card class="pa-4 mb-4">
    <v-card-title>{{ item.id ? 'แก้ไขตัวชี้วัด' : 'เพิ่มตัวชี้วัด' }}</v-card-title>
    <v-form ref="itemRef" @submit.prevent="saveItem">
      <v-row>
        <v-col cols="12" md="6">
          <v-select
            v-model="item.topic_id"
            label="หัวข้อ"
            :items="period.topics"
            item-title="name"
            item-value="id"
            :disabled="!!item.id"
            :rules="[rules.required]"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="item.name" label="ชื่อตัวชี้วัด" :rules="[rules.required]" />
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="item.detail" label="รายละเอียด" rows="2" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model.number="item.weight" label="น้ำหนักคะแนน" type="number" :rules="[rules.required]" />
        </v-col>
        <v-col cols="12" md="4">
          <v-select v-model="item.score_type" label="รูปแบบการประเมิน" :items="types" :rules="[rules.required]" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="item.evidence" label="หลักฐานที่ใช้แนบ" />
        </v-col>
      </v-row>
      
      <v-alert v-if="item.score_type === 'scale'" type="info" variant="tonal" class="mb-4">
        ระดับ 1 = ต่ำกว่าที่คาดหวังมาก, 2 = ต่ำกว่าที่คาดหวัง, 3 = ตามที่คาดหวัง, 4 = สูงกว่าที่คาดหวัง
      </v-alert>
      <v-btn type="submit" color="primary" class="mr-2">บันทึกตัวชี้วัด</v-btn>
      <v-btn @click="item = { weight: 1, score_type: 'scale' }">ล้างฟอร์ม</v-btn>
    </v-form>
  </v-card>

  
  <v-card v-for="t in period.topics" :key="t.id" class="pa-4 mb-4">
    <v-card-title class="d-flex flex-wrap ga-2">
      {{ t.name }}
      <v-spacer />
      <v-btn size="small" @click="renameTopic(t)">แก้ชื่อ</v-btn>
      <v-btn size="small" color="red" @click="removeTopic(t)">ลบหัวข้อ</v-btn>
    </v-card-title>
    <v-table>
      <thead>
        <tr><th>ตัวชี้วัด</th><th>น้ำหนัก</th><th>รูปแบบ</th><th>หลักฐาน</th><th>จัดการ</th></tr>
      </thead>
      <tbody>
        <tr v-for="i in t.indicators" :key="i.id">
          <td>{{ i.name }}<br /><small>{{ i.detail }}</small></td>
          <td>{{ i.weight }}</td>
          <td>{{ i.score_type === 'yesno' ? 'มี/ไม่มี' : 'สเกล 1-4' }}</td>
          <td>{{ i.evidence }}</td>
          <td>
            <v-btn size="small" @click="item = { ...i }">แก้ไข</v-btn>
            <v-btn size="small" color="red" @click="removeItem(i)">ลบ</v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api, state, rules } from '../api';

const route = useRoute();
const period = ref({ topics: [] });
const topicRef = ref();
const itemRef = ref();
const topicName = ref('');
const item = ref({ weight: 1, score_type: 'scale' });
const types = [
  { title: 'มี / ไม่มี', value: 'yesno' },
  { title: 'สเกลคะแนน 1-4', value: 'scale' },
];

async function load() {
  period.value = (await api.get('/periods/' + route.params.id)).data;
}
onMounted(load);

async function addTopic() {
  const { valid } = await topicRef.value.validate();
  if (!valid) return;
  const res = await api.post('/topics', { period_id: period.value.id, name: topicName.value });
  state.message = res.message;
  topicName.value = '';
  topicRef.value.resetValidation();
  load();
}

async function renameTopic(t) {
  const name = prompt('ชื่อหัวข้อใหม่', t.name);
  if (!name) return;
  await api.put('/topics/' + t.id, { name });
  load();
}

async function removeTopic(t) {
  if (!confirm('ลบหัวข้อ ' + t.name + ' และตัวชี้วัดทั้งหมดในหัวข้อ?')) return;
  await api.delete('/topics/' + t.id);
  load();
}

async function saveItem() {
  const { valid } = await itemRef.value.validate();
  if (!valid) return;
  const res = item.value.id
    ? await api.put('/indicators/' + item.value.id, item.value)
    : await api.post('/indicators', item.value);
  state.message = res.message;
  item.value = { weight: 1, score_type: 'scale' };
  itemRef.value.resetValidation();
  load();
}

async function removeItem(i) {
  if (!confirm('ลบตัวชี้วัด ' + i.name + ' ?')) return;
  await api.delete('/indicators/' + i.id);
  load();
}
</script>
