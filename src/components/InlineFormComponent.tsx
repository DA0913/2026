import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface InlineFormComponentProps {
  className?: string;
}

const InlineFormComponent: React.FC<InlineFormComponentProps> = ({ className = '' }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    userName: '',
    phone: '',
    companyTypes: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const companyTypeOptions = [
    { value: 'factory', label: '工厂' },
    { value: 'trader', label: '贸易商' },
    { value: 'integrated', label: '工贸一体' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = '请输入公司名称';
    }

    if (!formData.userName.trim()) {
      newErrors.userName = '请输入用户姓名';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '请输入联系电话';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入正确的手机号码';
    }

    if (formData.companyTypes.length === 0) {
      newErrors.companyTypes = '请选择公司类型';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCompanyTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      companyTypes: prev.companyTypes.includes(type)
        ? prev.companyTypes.filter(t => t !== type)
        : [...prev.companyTypes, type]
    }));
    
    if (errors.companyTypes) {
      setErrors(prev => ({
        ...prev,
        companyTypes: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .insert([
          {
            company_name: formData.companyName,
            user_name: formData.userName,
            phone: formData.phone,
            company_types: formData.companyTypes,
            source_url: window.location.href,
            status: 'pending'
          }
        ]);

      if (error) {
        if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
          console.warn('网络连接问题，但表单可能已提交');
        } else {
          throw error;
        }
      }

      console.log('Form submitted successfully:', data);
      
      setSubmitSuccess(true);
      
      // 3秒后重置表单
      setTimeout(() => {
        setSubmitSuccess(false);
        setFormData({
          companyName: '',
          userName: '',
          phone: '',
          companyTypes: []
        });
      }, 3000);

    } catch (error) {
      console.error('Error submitting form:', error);
      
      if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
        setErrors({ submit: '网络连接失败，请检查网络后重试' });
      } else if (error?.code === 'PGRST116') {
        setErrors({ submit: '系统配置错误，请联系管理员' });
      } else if (error?.code === '42501') {
        setErrors({ submit: '权限不足，请联系管理员' });
      } else {
        setErrors({ submit: error?.message || '提交失败，请稍后重试' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 relative z-10 max-w-sm ml-auto ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            提交成功！
          </h4>
          <p className="text-gray-600">
            感谢您的咨询，我们会尽快与您联系
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 relative z-10 max-w-sm ml-auto ${className}`}>
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">立即体验</h3>
        <p className="text-gray-600 text-xs sm:text-sm">填写信息，专业顾问为您定制数字化解决方案</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            placeholder="请输入您的公司名称"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent transition-all ${
              errors.companyName ? 'border-red-300' : 'border-gray-300'
            } text-sm`}
            disabled={isSubmitting}
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.companyName}
            </p>
          )}
        </div>

        <div>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            placeholder="请输入您的姓名"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent transition-all ${
              errors.userName ? 'border-red-300' : 'border-gray-300'
            } text-sm`}
            disabled={isSubmitting}
          />
          {errors.userName && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.userName}
            </p>
          )}
        </div>

        <div>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="请输入手机号码"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent transition-all ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            } text-sm`}
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.phone}
            </p>
          )}
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2 text-xs sm:text-sm">
            {companyTypeOptions.map((option) => (
              <label key={option.value} className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.companyTypes.includes(option.value)}
                  onChange={() => handleCompanyTypeChange(option.value)}
                  className="w-3.5 h-3.5 text-[#194fe8] border-gray-300 rounded focus:ring-[#194fe8]"
                  disabled={isSubmitting}
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.companyTypes && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.companyTypes}
            </p>
          )}
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-1">
          同意《久火外贸ERP服务条款》和《隐私权政策》
        </p>

        {/* 提交错误 */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.submit}
            </p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#194fe8] hover:bg-[#1640c7] text-white font-medium py-2.5 sm:py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>提交中...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>立即开通</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InlineFormComponent;