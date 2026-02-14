import NavMenu from '@/components/NavMenu';
import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

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
    element: lazy(() => import('@/pages/dashboard')),
  }
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

const AppRoutesContent: React.FC = () => {
  const location = useLocation();
  return (
    <div className="h-screen">
      <NavMenu />
      <Routes>
        {generateRoutes(mainRoutes)}
      </Routes>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  return <AppRoutesContent />;
};

export default AppRoutes;