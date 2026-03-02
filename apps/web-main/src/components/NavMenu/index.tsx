import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu';
import { Home, Wrench, Film, Sparkles } from 'lucide-react';
import HeaderIcon from '@/assets/ling.jpg';

export interface NavItem {
  key: string;
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const navConfig: NavItem[] = [
  {
    key: 'home',
    label: '首页',
    path: '/',
    icon: <Home className="h-4 w-4" />,
  },
  {
    key: 'tools',
    label: '工具类',
    path: '/wrench',
    icon: <Wrench className="h-4 w-4" />,
  },
  {
    key: 'ainimation',
    label: '动画',
    path: '/ainimation',
    icon: <Film className="h-4 w-4" />,
  },
  {
    key: 'threejs',
    label: 'ThreeJS',
    path: '/threejs',
    icon: <Sparkles className="h-4 w-4" />,
  },
];

/**
 * 导航菜单组件
 * 提供应用的顶部导航功能，包含logo和导航链接
 */
const NavMenu: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="w-full bg-white border-b border-border py-4 px-6 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo 部分 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary shadow-md transition-transform duration-300 hover:scale-105">
            <img
              src={HeaderIcon}
              width={40}
              height={40}
              alt="logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xl font-bold text-foreground">应用名称</span>
        </div>

        {/* 导航菜单部分 */}
        <NavigationMenu className="w-auto">
          <NavigationMenuList className="gap-4">
            {navConfig.map((item) => (
              <NavigationMenuItem key={item.key} className="group">
                {item.path ? (
                  <NavigationMenuLink
                    asChild
                    className={`px-4 py-2 rounded-md transition-all duration-300 hover:bg-accent hover:text-accent-foreground group-hover:scale-105 ${location.pathname === item.path ? 'bg-accent text-accent-foreground shadow-md' : ''
                      }`}
                  >
                    <Link to={item.path}>
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  </NavigationMenuLink>
                ) : (
                  <NavigationMenuLink className="px-4 py-2 rounded-md transition-all duration-300 hover:bg-accent hover:text-accent-foreground group-hover:scale-105">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* 右侧占位 */}
        <div className="w-24"></div>
      </div>
    </nav>
  );
};

export default NavMenu;