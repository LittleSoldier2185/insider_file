import axios from 'axios';
import { reactive } from 'vue';

export const state = reactive({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  message: '',
});

export const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  config.headers.Authorization = 'Bearer ' + localStorage.getItem('token');
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    state.message = err.response?.data?.message || 'เชื่อมต่อ API ไม่ได้';
    if (err.response?.status === 401) logout();
    return Promise.reject(err);
  },
);

export function saveLogin(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  state.user = user;
}

export function logout() {
  localStorage.clear();
  state.user = null;
}

export function fileUrl(name) {
  return '/api/files/' + name + '?token=' + localStorage.getItem('token');
}

export const rules = {
  required: (v) => (v !== null && v !== undefined && v !== '') || 'ห้ามว่าง',
  email: (v) => !v || /^\S+@\S+\.\S+$/.test(v) || 'รูปแบบอีเมลไม่ถูกต้อง',
  min8: (v) => (v && v.length >= 8) || 'อย่างน้อย 8 ตัวอักษร',
};

export const roleNames = { admin: 'ฝ่ายบุคลากร', evaluatee: 'ผู้รับการประเมิน', evaluator: 'กรรมการ' };
export const committeeNames = { chair: 'ประธาน', member: 'กรรมการร่วม' };
export const statusNames = { pending: 'ยังไม่ได้ประเมิน', draft: 'บันทึกร่าง', confirmed: 'ยืนยันผลแล้ว' };
export const statusColors = { pending: 'grey', draft: 'orange', confirmed: 'green' };
