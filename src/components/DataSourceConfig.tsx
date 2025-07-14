import React, { useState, useEffect } from 'react';
import { setDataSource, getDataSource, DataSource } from '../lib/dataAdapter';

interface DataSourceConfigProps {
  className?: string;
}

const DataSourceConfig: React.FC<DataSourceConfigProps> = ({ className = '' }) => {
  const [currentSource, setCurrentSource] = useState<DataSource>('supabase');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 从环境变量获取默认数据源
    const defaultSource = import.meta.env.VITE_DEFAULT_DATA_SOURCE as DataSource || 'supabase';
    setCurrentSource(defaultSource);
    setDataSource(defaultSource);
  }, []);

  const handleSourceChange = (source: DataSource) => {
    setCurrentSource(source);
    setDataSource(source);
    setIsVisible(false);
  };

  const getSourceDisplayName = (source: DataSource) => {
    switch (source) {
      case 'supabase':
        return 'Supabase';
      case 'jeecg':
        return 'JeecgBoot';
      default:
        return source;
    }
  };

  const getSourceStatus = (source: DataSource) => {
    const jeecgUrl = import.meta.env.VITE_JEECG_API_BASE_URL;
    const jeecgToken = import.meta.env.VITE_JEECG_API_TOKEN;
    
    if (source === 'jeecg') {
      if (!jeecgUrl || jeecgUrl.includes('localhost') || jeecgUrl.includes('your')) {
        return '未配置';
      }
      if (!jeecgToken || jeecgToken.includes('your')) {
        return 'Token未配置';
      }
      return '已配置';
    }
    
    return '已配置';
  };

  const getSourceColor = (source: DataSource) => {
    const status = getSourceStatus(source);
    switch (status) {
      case '已配置':
        return 'text-green-600';
      case '未配置':
      case 'Token未配置':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* 数据源切换按钮 */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        title="切换数据源"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        <span>数据源: {getSourceDisplayName(currentSource)}</span>
        <svg className={`w-4 h-4 transition-transform ${isVisible ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isVisible && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="p-3">
            <h3 className="text-sm font-medium text-gray-900 mb-2">选择数据源</h3>
            
            {/* Supabase 选项 */}
            <button
              onClick={() => handleSourceChange('supabase')}
              className={`w-full text-left p-2 rounded-md transition-colors ${
                currentSource === 'supabase' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Supabase</div>
                  <div className="text-xs text-gray-500">实时数据库和认证服务</div>
                </div>
                <div className={`text-xs ${getSourceColor('supabase')}`}>
                  {getSourceStatus('supabase')}
                </div>
              </div>
            </button>

            {/* JeecgBoot 选项 */}
            <button
              onClick={() => handleSourceChange('jeecg')}
              className={`w-full text-left p-2 rounded-md transition-colors mt-2 ${
                currentSource === 'jeecg' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">JeecgBoot</div>
                  <div className="text-xs text-gray-500">企业级低代码平台</div>
                </div>
                <div className={`text-xs ${getSourceColor('jeecg')}`}>
                  {getSourceStatus('jeecg')}
                </div>
              </div>
            </button>

            {/* 配置说明 */}
            <div className="mt-3 p-2 bg-gray-50 rounded-md">
              <div className="text-xs text-gray-600">
                <div className="font-medium mb-1">配置说明:</div>
                <div>• Supabase: 配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY</div>
                <div>• JeecgBoot: 配置 VITE_JEECG_API_BASE_URL 和 VITE_JEECG_API_TOKEN</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 点击外部关闭 */}
      {isVisible && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsVisible(false)}
        />
      )}
    </div>
  );
};

export default DataSourceConfig; 