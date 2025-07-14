import React, { useState, useEffect } from 'react';
import { JeecgApiService } from '../lib/jeecgApi';

const JeecgConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [systemConfigs, setSystemConfigs] = useState<any[]>([]);

  const testConnection = async () => {
    setConnectionStatus('testing');
    setErrorMessage('');
    
    try {
      // 测试获取系统配置
      const response = await JeecgApiService.getSystemConfigs({ pageSize: 5 });
      
      if (response.success) {
        setConnectionStatus('success');
        setSystemConfigs(response.result.records || []);
      } else {
        setConnectionStatus('error');
        setErrorMessage(response.message || '连接失败');
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '未知错误');
    }
  };

  useEffect(() => {
    // 页面加载时自动测试连接
    testConnection();
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'testing': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'success': return '连接成功';
      case 'error': return '连接失败';
      case 'testing': return '测试中...';
      default: return '未测试';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">JeecgBoot 连接测试</h2>
      
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <span className={`font-semibold ${getStatusColor()}`}>
            连接状态: {getStatusText()}
          </span>
          <button
            onClick={testConnection}
            disabled={connectionStatus === 'testing'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {connectionStatus === 'testing' ? '测试中...' : '重新测试'}
          </button>
        </div>
        
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
            <strong>错误信息:</strong> {errorMessage}
          </div>
        )}
      </div>

      {connectionStatus === 'success' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">系统配置信息</h3>
          <div className="grid gap-4">
            {systemConfigs.map((config) => (
              <div key={config.id} className="p-4 border border-gray-200 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800">{config.configName}</h4>
                    <p className="text-sm text-gray-600">{config.configKey}</p>
                    <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {config.configValue}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {systemConfigs.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              暂无系统配置数据
            </p>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-semibold text-blue-800 mb-2">配置说明</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 确保JeecgBoot后端服务正在运行</li>
          <li>• 检查环境变量中的API地址和Token是否正确</li>
          <li>• 确认网络连接和防火墙设置</li>
          <li>• 如果连接失败，请检查JeecgBoot的日志信息</li>
        </ul>
      </div>
    </div>
  );
};

export default JeecgConnectionTest; 