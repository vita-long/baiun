import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import AppRoutes from './router/Routes';
import AppHeader from './components/Header';
import zhCN from 'antd/locale/zh_CN';
import './index.css';

const { Content, Footer } = Layout;

// 内部应用布局组件
const AppLayout: React.FC = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  // 如果是认证页面，不显示完整布局
  if (isAuthPage) {
    return <AppRoutes />;
  }

  return (
    <Layout className="app-layout">
      {/* 顶部导航 */}
      <AppHeader />

      {/* 主要内容区 */}
      <Content className="app-content">
        <AppRoutes />
      </Content>

      {/* 底部备案区 */}
      <Footer className="app-footer">© 2024 鲜花管理系统 版权所有</Footer>
    </Layout>
  );
};

// 主应用组件
function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <AppLayout />
      </Router>
    </ConfigProvider>
  );
}

export default App
