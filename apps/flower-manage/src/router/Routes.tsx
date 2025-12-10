import React, { lazy, Suspense } from 'react';
import { Routes as RouterRoutes, Route } from 'react-router-dom';

// 定义路由配置接口，支持嵌套路由
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  children?: RouteConfig[];
}

// 主路由配置
const mainRoutes: RouteConfig[] = [
  {
    path: '/',
    element: lazy(() => import('@/pages/Dashboard')),
  },
  {
    path: '/categories',
    element: lazy(() => import('@/pages/Categories')),
  },
  {
    path: '/products',
    element: lazy(() => import('@/pages/Products')),
  },
  {
    path: '/orders',
    element: lazy(() => import('@/pages/Order')),
  },
  {
    path: '/payment-methods',
    element: lazy(() => import('@/pages/PaymentMethod')),
  },
  {
    path: '/login',
    element: lazy(() => import('@/pages/auth/LoginPage')),
  },
  {
    path: '/register',
    element: lazy(() => import('@/pages/auth/RegisterPage')),
  },
  {
    path: '/forgot-password',
    element: lazy(() => import('@/pages/auth/ForgotPasswordPage')),
  },
  // 示例：支持嵌套路由
  /*
  {
    path: '/tools',
    element: lazy(() => import('@/pages/Tools')),
    children: [
      {
        path: 'settings',
        element: lazy(() => import('@/pages/Tools/Settings')),
      },
    ],
  },
  */
];

// 递归生成路由组件
const generateRoutes = (routes: RouteConfig[]): React.ReactNode => {
  return routes.map((route) => {
    const LazyComponent = route.element;
    return (
      <Route
        key={route.path}
        path={route.path}
        element={
          <Suspense fallback={<div>加载中...</div>}>
            <LazyComponent />
          </Suspense>
        }
      >
        {route.children && generateRoutes(route.children)}
      </Route>
    );
  });
};

const AppRoutesContent: React.FC = () => (
  <RouterRoutes>
    {generateRoutes(mainRoutes)}
  </RouterRoutes>
);

const AppRoutes: React.FC = () => {
  return <AppRoutesContent />;
};

export default AppRoutes;