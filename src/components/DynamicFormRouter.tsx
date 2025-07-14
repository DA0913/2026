import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import FormModal from './FormModal';

interface DynamicFormRouterProps {
  buttonId: string;
  children: React.ReactNode;
  className?: string;
}

interface ButtonFormMapping {
  id: string;
  button_id: string;
  form_id: string;
  is_active: boolean;
}

interface FormConfig {
  id: string;
  name: string;
  description: string;
  form_url: string;
  form_config: any;
}

const DynamicFormRouter: React.FC<DynamicFormRouterProps> = ({ 
  buttonId, 
  children, 
  className = '' 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 模拟数据
  const mockMappings: ButtonFormMapping[] = [
    {
      id: '1',
      button_id: 'btn-1',
      form_id: 'form-1',
      is_active: true
    },
    {
      id: '2',
      button_id: 'btn-2',
      form_id: 'form-2',
      is_active: true
    },
    {
      id: '3',
      button_id: 'btn-3',
      form_id: 'form-3',
      is_active: true
    }
  ];

  const mockFormConfigs: FormConfig[] = [
    {
      id: 'form-1',
      name: '首页咨询表单',
      description: '首页Hero区域的主要咨询表单',
      form_url: '/api/forms/hero-consultation',
      form_config: {
        fields: [
          { name: 'company_name', label: '公司名称', type: 'text', required: true },
          { name: 'contact_name', label: '联系人', type: 'text', required: true },
          { name: 'phone', label: '联系电话', type: 'tel', required: true },
          { name: 'email', label: '邮箱', type: 'email', required: false }
        ],
        styling: { theme: 'primary', primaryColor: '#194fe8' },
        behavior: { showProgress: true, autoSave: true }
      }
    },
    {
      id: 'form-2',
      name: '联系页表单',
      description: '联系我们页面的表单',
      form_url: '/api/forms/contact-form',
      form_config: {
        fields: [
          { name: 'name', label: '姓名', type: 'text', required: true },
          { name: 'email', label: '邮箱', type: 'email', required: true },
          { name: 'message', label: '留言内容', type: 'textarea', required: true }
        ],
        styling: { theme: 'secondary', primaryColor: '#10b981' },
        behavior: { showProgress: false, redirectAfterSubmit: '/thank-you' }
      }
    },
    {
      id: 'form-3',
      name: '解决方案咨询表单',
      description: '解决方案页面的咨询表单',
      form_url: '/api/forms/solutions-form',
      form_config: {
        fields: [
          { name: 'company_name', label: '公司名称', type: 'text', required: true },
          { name: 'industry', label: '所属行业', type: 'select', required: true, options: ['制造业', '贸易', '服务业'] },
          { name: 'requirements', label: '需求描述', type: 'textarea', required: true }
        ],
        styling: { theme: 'primary', primaryColor: '#194fe8' },
        behavior: { showProgress: true, autoSave: false }
      }
    }
  ];

  useEffect(() => {
    // 实际项目中，这里应该从数据库获取映射和表单配置
    const fetchFormConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. 查找按钮-表单映射
        const mapping = mockMappings.find(m => m.button_id === buttonId && m.is_active);
        
        if (!mapping) {
          console.log(`未找到按钮ID ${buttonId} 的活跃映射`);
          return;
        }
        
        // 2. 获取对应的表单配置
        const config = mockFormConfigs.find(f => f.id === mapping.form_id);
        
        if (!config) {
          console.log(`未找到表单ID ${mapping.form_id} 的配置`);
          return;
        }
        
        setFormConfig(config);
      } catch (error) {
        console.error('获取表单配置失败:', error);
        setError('加载表单配置失败');
      } finally {
        setLoading(false);
      }
    };

    fetchFormConfig();
  }, [buttonId]);

  const handleClick = () => {
    if (!formConfig) {
      console.warn(`按钮 ${buttonId} 没有关联的表单配置`);
      return;
    }
    
    setIsModalOpen(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={className}
        disabled={loading}
      >
        {children}
      </button>
      
      {formConfig && (
        <FormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          sourceUrl={window.location.href}
          formConfig={formConfig}
        />
      )}
    </>
  );
};

export default DynamicFormRouter;