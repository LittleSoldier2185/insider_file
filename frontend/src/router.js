import { createRouter, createWebHistory } from 'vue-router';
import { state } from './api';

const routes = [
  { path: '/login', component: () => import('./pages/LoginPage.vue') },
  { path: '/password', component: () => import('./pages/PasswordPage.vue') },
  { path: '/profile', component: () => import('./pages/ProfilePage.vue') },
  { path: '/result/:periodId/:userId', component: () => import('./pages/ResultPage.vue') },
  { path: '/dashboard', component: () => import('./pages/DashboardPage.vue'), meta: { role: 'admin' } },
  { path: '/users', component: () => import('./pages/UsersPage.vue'), meta: { role: 'admin' } },
  { path: '/periods', component: () => import('./pages/PeriodsPage.vue'), meta: { role: 'admin' } },
  { path: '/periods/:id', component: () => import('./pages/CriteriaPage.vue'), meta: { role: 'admin' } },
  { path: '/assign', component: () => import('./pages/AssignPage.vue'), meta: { role: 'admin' } },
  { path: '/track', component: () => import('./pages/TrackPage.vue'), meta: { role: 'admin' } },
  { path: '/backup', component: () => import('./pages/BackupPage.vue'), meta: { role: 'admin' } },
  { path: '/self', component: () => import('./pages/SelfPage.vue'), meta: { role: 'evaluatee' } },
  { path: '/evaluate', component: () => import('./pages/EvaluateListPage.vue'), meta: { role: 'evaluator' } },
  { path: '/evaluate/:id', component: () => import('./pages/EvaluatePage.vue'), meta: { role: 'evaluator' } },
  { path: '/:any(.*)*', redirect: '/login' },
];

const router = createRouter({ history: createWebHistory(), routes });

export function homeOf(user) {
  if (user.must_change_password) return '/password';
  return { admin: '/dashboard', evaluatee: '/self', evaluator: '/evaluate' }[user.role];
}

router.beforeEach((to) => {
  const user = state.user;
  if (!user) return to.path === '/login' ? true : '/login';
  if (user.must_change_password && to.path !== '/password') return '/password';
  if (to.path === '/login') return homeOf(user);
  if (to.meta.role && to.meta.role !== user.role) return homeOf(user);
});

export default router;
