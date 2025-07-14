import React from 'react';
import JeecgConnectionTest from './JeecgConnectionTest';

const SetupTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            官网配置测试
          </h1>
          <p className="text-lg text-gray-600">
            验证JeecgBoot连接和基本功能配置
          </p>
        </div>
        
        <JeecgConnectionTest />
        
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">下一步操作</h2>
          <div className="space-y-3 text-gray-700">
            <p>✅ <strong>第一步：</strong> 配置环境变量（.env文件）</p>
            <p>🔄 <strong>第二步：</strong> 验证JeecgBoot连接（当前步骤）</p>
            <p>⏳ <strong>第三步：</strong> 配置数据模型和表结构</p>
            <p>⏳ <strong>第四步：</strong> 设置内容管理功能</p>
            <p>⏳ <strong>第五步：</strong> 配置前台展示页面</p>
            <p>⏳ <strong>第六步：</strong> 测试和优化</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupTestPage; 