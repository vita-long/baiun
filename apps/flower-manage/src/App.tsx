import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import { Layout, ConfigProvider, Avatar, Dropdown, message } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import zhCN from 'antd/lib/locale/zh_CN';
import AppRoutes from './router/Routes';
import authStore from '@/store/authStore';
import './index.css';

const { Header, Footer } = Layout;

// 内部应用布局组件
const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  // 如果是认证页面，不显示完整布局
  if (isAuthPage) {
    return <AppRoutes />;
  }

  // 模拟用户信息
  const userInfo = {
    name: '管理员',
    avatar: '', // 使用默认头像
  };

  // 退出登录处理
  const handleLogout = () => {
    authStore.logout();
    message.success('退出登录成功');
    setTimeout(() => {
      navigate('/login');
    }, 30)
  };

  // 下拉菜单配置
  const menuProps = {
    items: [
      {
        key: 'logout',
        label: '退出登录',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout className="app-layout">
      {/* 顶部导航 */}
      <Header className="app-header">
        <div className="app-header-content">
          <h1 className="app-title">鲜花管理系统 - 后台管理</h1>
          <div className="app-user-info">
            <span className="user-name">{userInfo.name}</span>
            <Dropdown menu={menuProps} trigger={['click']}>
              <Avatar
                icon={<UserOutlined />}
                size={40}
                className="user-avatar"
                style={{ cursor: 'pointer' }}
              />
            </Dropdown>
          </div>
        </div>
      </Header>

      {/* 主要内容区 */}
      <Layout.Content className="app-content">
        <AppRoutes />
      </Layout.Content>

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
