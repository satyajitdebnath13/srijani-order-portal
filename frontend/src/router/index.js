import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { guest: true }
  },
  {
    path: '/setup-password/:token',
    name: 'SetupPassword',
    component: () => import('@/views/SetupPassword.vue'),
    meta: { guest: true }
  },
  
  // Admin Routes
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue')
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('@/views/admin/Orders.vue')
      },
      {
        path: 'orders/create',
        name: 'CreateOrder',
        component: () => import('@/views/admin/CreateOrder.vue')
      },
      {
        path: 'orders/:id',
        name: 'AdminOrderDetail',
        component: () => import('@/views/admin/OrderDetail.vue')
      },
      {
        path: 'customers',
        name: 'Customers',
        component: () => import('@/views/admin/Customers.vue')
      },
      {
        path: 'customers/:id',
        name: 'CustomerDetail',
        component: () => import('@/views/admin/CustomerDetail.vue')
      },
      {
        path: 'support',
        name: 'AdminSupport',
        component: () => import('@/views/admin/Support.vue')
      },
      {
        path: 'support/:id',
        name: 'AdminSupportDetail',
        component: () => import('@/views/admin/SupportDetail.vue')
      },
      {
        path: 'returns',
        name: 'AdminReturns',
        component: () => import('@/views/admin/Returns.vue')
      },
      {
        path: 'returns/:id',
        name: 'AdminReturnDetail',
        component: () => import('@/views/admin/ReturnDetail.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/admin/Settings.vue')
      }
    ]
  },
  
  // Customer Routes
  {
    path: '/dashboard',
    component: () => import('@/layouts/CustomerLayout.vue'),
    meta: { requiresAuth: true, role: 'customer' },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/customer/Dashboard.vue')
      },
      {
        path: '/orders',
        name: 'Orders',
        component: () => import('@/views/customer/Orders.vue')
      },
      {
        path: '/orders/:id',
        name: 'OrderDetail',
        component: () => import('@/views/customer/OrderDetail.vue')
      },
      {
        path: '/orders/:id/approve',
        name: 'ApproveOrder',
        component: () => import('@/views/customer/ApproveOrder.vue')
      },
      {
        path: '/support',
        name: 'Support',
        component: () => import('@/views/customer/Support.vue')
      },
      {
        path: '/support/create',
        name: 'CreateTicket',
        component: () => import('@/views/customer/CreateTicket.vue')
      },
      {
        path: '/support/:id',
        name: 'SupportDetail',
        component: () => import('@/views/customer/SupportDetail.vue')
      },
      {
        path: '/returns',
        name: 'Returns',
        component: () => import('@/views/customer/Returns.vue')
      },
      {
        path: '/returns/create',
        name: 'CreateReturn',
        component: () => import('@/views/customer/CreateReturn.vue')
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/customer/Profile.vue')
      }
    ]
  },
  
  // Legal Pages
  {
    path: '/legal/terms',
    name: 'Terms',
    component: () => import('@/views/legal/Terms.vue')
  },
  {
    path: '/legal/privacy',
    name: 'Privacy',
    component: () => import('@/views/legal/Privacy.vue')
  },
  {
    path: '/legal/returns',
    name: 'ReturnPolicy',
    component: () => import('@/views/legal/ReturnPolicy.vue')
  },
  {
    path: '/legal/shipping',
    name: 'ShippingPolicy',
    component: () => import('@/views/legal/ShippingPolicy.vue')
  },
  
  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiredRole = to.meta.role;
  const isGuest = to.meta.guest;
  
  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (isGuest && authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      next('/admin/dashboard');
    } else {
      next('/dashboard');
    }
  } else if (requiredRole && authStore.user?.role !== requiredRole) {
    // Redirect to appropriate dashboard if role doesn't match
    if (authStore.isAdmin) {
      next('/admin/dashboard');
    } else {
      next('/dashboard');
    }
  } else {
    next();
  }
});

export default router;

