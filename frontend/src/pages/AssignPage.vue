<template>
  <h2 class="mb-4">มอบหมายกรรมการ</h2>

  <v-card class="pa-4 mb-4">
    <v-form ref="formRef" @submit.prevent="assign">
      <v-row>
        <v-col cols="12" md="6">
          <v-select v-model="form.period_id" label="รอบการประเมิน" :items="periods" item-title="name" item-value="id"
            :rules="[rules.required]" @update:model-value="load" />
        </v-col>
        <v-col cols="12" md="6">
          <v-select v-model="form.evaluatee_id" label="ผู้รับการประเมิน" :items="evaluatees" item-title="full_name"
            item-value="id" :rules="[rules.required]" />
        </v-col>
        <v-col cols="12" md="6">
          <v-select v-model="form.evaluator_id" label="กรรมการ" :items="evaluators" item-title="full_name"
            item-value="id" :rules="[rules.required]" />
        </v-col>
        <v-col cols="12" md="6">
          <v-select v-model="form.committee_role" label="บทบาทกรรมการ" :items="roles" :rules="[rules.required]" />
        </v-col>
      </v-row>
      <v-btn type="submit" color="primary">มอบหมาย</v-btn>
    </v-form>
  </v-card>

  <v-table v-if="form.period_id">
    <thead>
      <tr><th>ผู้รับการประเมิน</th><th>กรรมการ</th><th>บทบาท</th><th>สถานะ</th><th></th></tr>
    </thead>
    <tbody>
      <tr v-for="a in list" :key="a.id">
        <td>{{ a.evaluatee_name }}</td>
        <td>{{ a.evaluator_name }}</td>
        <td>{{ committeeNames[a.committee_role] }}</td>
        <td><v-chip :color="statusColors[a.status]">{{ statusNames[a.status] }}</v-chip></td>
        <td><v-btn size="small" color="red" @click="remove(a)">ยกเลิก</v-btn></td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api, state, rules, committeeNames, statusNames, statusColors } from '../api';

const formRef = ref();
const form = ref({ committee_role: 'member' });
const periods = ref([]);
const evaluatees = ref([]);
const evaluators = ref([]);
const list = ref([]);
const roles = [
  { title: 'ประธาน', value: 'chair' },
  { title: 'กรรมการร่วม', value: 'member' },
];

onMounted(async () => {
  periods.value = (await api.get('/periods')).data;
  evaluatees.value = (await api.get('/users?role=evaluatee')).data;
  evaluators.value = (await api.get('/users?role=evaluator')).data;
});

async function load() {
  list.value = (await api.get('/assignments?period_id=' + form.value.period_id)).data;
}

async function assign() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  const res = await api.post('/assignments', form.value);
  state.message = res.message;
  load();
}

async function remove(a) {
  if (!confirm('ยกเลิกการมอบหมาย ' + a.evaluator_name + ' ?')) return;
  await api.delete('/assignments/' + a.id);
  load();
}
</script>
