
<template>
  <v-select
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :items="type === 'yesno' ? yesno : scale"
    :label="label"
    :disabled="disabled"
  />
</template>

<script setup>
defineProps(['modelValue', 'type', 'label', 'disabled']);
const emit = defineEmits(['update:modelValue']);

const yesno = [
  { title: 'มี', value: 1 },
  { title: 'ไม่มี', value: 0 },
];
const scale = [
  { title: '1 - ปฏิบัติได้ต่ำกว่าระดับการปฏิบัติที่คาดหวังมาก', value: 1 },
  { title: '2 - ปฏิบัติได้ต่ำกว่าระดับการปฏิบัติที่คาดหวัง', value: 2 },
  { title: '3 - ปฏิบัติได้ตามระดับการปฏิบัติที่คาดหวัง', value: 3 },
  { title: '4 - ปฏิบัติได้สูงกว่าระดับการปฏิบัติที่คาดหวัง', value: 4 },
];
</script>
