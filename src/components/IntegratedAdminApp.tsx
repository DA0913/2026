import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Newspaper, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Award,
  Sliders,
  Database
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import AdminLogin from './AdminLogin';
import FormManagement from './FormManagement';
import NewsManagement from './NewsManagement';
import UnifiedCaseManagement from './UnifiedCaseManagement';
import VariantFormManagement from './VariantFormManagement';
import ButtonFormManager from './ButtonFormManager';
import DataSourceConfig from './DataSourceConfig';

const IntegratedAdminApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      name: '控制台',
      icon: LayoutDashboard,
      description: '系统概览和统计'
    },
    {
      id: 'forms',
      name: '表单管理',
      icon: FileText,
      description: '客户提交表单管理'
    },
    {
      id: 'news',
      name: '新闻管理',
      icon: Newspaper,
      description: '新闻资讯内容管理'
    },
    {
      id: 'cases',
      name: '案例管理',
      icon: Award,
      description: '客户案例与配置管理'
    },
    {
      id: 'variant-forms',
      name: '表单配置',
      icon: FileText,
      description: '变体表单链接管理'
    },
    {
      id: 'button-forms',
      name: '按钮表单路由',
      icon: FileText,
      description: '按钮与表单映射管理'
    },
    {
      id: 'users',
      name: '用户管理',
      icon: Users,
      description: '系统用户权限管理'
    },
    {
      id: 'settings',
      name: '系统设置',
      icon: Settings,
      description: '系统配置和参数'
    },
    {
      id: 'datasource',
      name: '数据源配置',
      icon: Database,
      description: '数据源切换和配置'
    }
  ];

  useEffect(() => {
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    setLoading(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#194fe8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'forms':
        return <FormManagement />;
      case 'news':
        return <NewsManagement />;
      case 'cases':
        return <UnifiedCaseManagement />;
      case 'variant-forms':
        return <VariantFormManagement />;
      case 'users':
        return <UserManagement />;
      case 'button-forms':
        return <ButtonFormManager />;
      case 'settings':
        return <SystemSettings />;
      case 'datasource':
        return <DataSourceManagement />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 侧边栏 */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* 侧边栏头部 */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#194fe8] rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">管理后台</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-[#194fe8] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className={`text-xs ${
                    activeTab === item.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </nav>

        {/* 侧边栏底部 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>退出登录</span>
          </button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 lg:ml-0">
        {/* 顶部导航栏 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {menuItems.find(item => item.id === activeTab)?.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {menuItems.find(item => item.id === activeTab)?.description}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* 搜索框 */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="搜索..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent w-64"
                />
              </div>

              {/* 通知 */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* 用户头像 */}
              <div className="w-8 h-8 bg-[#194fe8] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">管</span>
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>

      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// 控制台内容组件
const DashboardContent: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">表单提交</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-sm text-green-600">+12% 本月</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">新闻文章</p>
              <p className="text-2xl font-bold text-gray-900">48</p>
              <p className="text-sm text-green-600">+8% 本月</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">客户案例</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
              <p className="text-sm text-green-600">+15% 本月</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">案例配置</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-sm text-green-600">+3 本月</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Sliders className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:border-[#194fe8] hover:bg-blue-50 transition-colors text-center">
            <FileText className="w-8 h-8 text-[#194fe8] mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">查看表单</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-[#194fe8] hover:bg-blue-50 transition-colors text-center">
            <Newspaper className="w-8 h-8 text-[#194fe8] mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">发布新闻</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-[#194fe8] hover:bg-blue-50 transition-colors text-center">
            <Award className="w-8 h-8 text-[#194fe8] mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">管理案例</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-[#194fe8] hover:bg-blue-50 transition-colors text-center">
            <Sliders className="w-8 h-8 text-[#194fe8] mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">案例配置</span>
          </button>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最近活动</h3>
        <div className="space-y-4">
          {[
            { type: 'form', message: '新的表单提交：华为技术有限公司', time: '2分钟前' },
            { type: 'news', message: '发布新闻：久火ERP新功能上线', time: '1小时前' },
            { type: 'case', message: '更新客户案例：比亚迪成功案例', time: '1小时前' },
            { type: 'config', message: '新增案例配置：安克创新展示配置', time: '2小时前' },
            { type: 'system', message: '系统自动备份完成', time: '6小时前' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'form' ? 'bg-blue-500' :
                activity.type === 'news' ? 'bg-green-500' :
                activity.type === 'case' ? 'bg-orange-500' :
                activity.type === 'config' ? 'bg-purple-500' : 'bg-gray-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 用户管理组件
const UserManagement: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">用户管理</h3>
      <p className="text-gray-600">用户管理功能正在开发中...</p>
    </div>
  );
};

// 系统设置组件
const SystemSettings: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">系统设置</h3>
      <p className="text-gray-600">系统设置功能正在开发中...</p>
    </div>
  );
};

// 数据源管理组件
const DataSourceManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">数据源切换</h3>
        <DataSourceConfig />
      </div>
      
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">配置说明</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong>Supabase 配置:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• VITE_SUPABASE_URL: Supabase项目URL</li>
                <li>• VITE_SUPABASE_ANON_KEY: Supabase匿名密钥</li>
              </ul>
            </div>
            <div>
              <strong>JeecgBoot 配置:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• VITE_JEECG_API_BASE_URL: JeecgBoot API基础URL</li>
                <li>• VITE_JEECG_API_TOKEN: JeecgBoot API访问令牌</li>
              </ul>
            </div>
            <div>
              <strong>数据源切换:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• VITE_DEFAULT_DATA_SOURCE: 默认数据源 (supabase | jeecg)</li>
                <li>• 可在运行时通过界面切换数据源</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedAdminApp;