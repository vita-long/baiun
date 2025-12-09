import React, { lazy, Suspense } from 'react';
import { Routes as RouterRoutes, Route, useLocation } from 'react-router-dom';
import NavMenu from '../components/NavMenu';

// 定义路由配置接口，支持嵌套路由
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  children?: RouteConfig[];
}

// 非认证路由配置
const nonAuthRoutes: RouteConfig[] = [
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
];

// 主路由配置
const mainRoutes: RouteConfig[] = [
  {
    path: '/',
    element: lazy(() => import('@/pages/Dashboard')),
  },
  {
    path: '/ico',
    element: lazy(() => import('@/pages/Ico')),
  },
  {
    path: '/image-cover',
    element: lazy(() => import('@/pages/ImageCover')),
  },
  {
    path: '/redis',
    element: lazy(() => import('@/pages/Redis')),
  },
  {
    path: '/bukets',
    element: lazy(() => import('@/pages/bukets')),
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

// 判断是否为认证页面
const isAuthPage = (path: string): boolean => {
  return path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/forgot-password');
};

const AppRoutesContent: React.FC = () => {
  const location = useLocation();
  const isAuth = isAuthPage(location.pathname);

  // 认证页面不需要额外的padding
  if (isAuth) {
    return (
      <RouterRoutes>
        {generateRoutes(nonAuthRoutes)}
        {generateRoutes(mainRoutes)}
      </RouterRoutes>
    );
  }

  // 非认证页面显示导航栏并应用padding
  return (
    <div style={{
      padding: '0 24px',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      {/* <NavMenu /> */}
      <RouterRoutes>
        {generateRoutes(nonAuthRoutes)}
        {generateRoutes(mainRoutes)}
      </RouterRoutes>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  return <AppRoutesContent />;
};

export default AppRoutes;