import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Star,
  Building,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Award,
  Sliders,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { supabase, CustomerCase, CaseConfiguration } from '../lib/supabase';
import ImageUploader from './ImageUploader';

const UnifiedCaseManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cases' | 'configurations'>('cases');
  const [cases, setCases] = useState<CustomerCase[]>([]);
  const [configurations, setConfigurations] = useState<CaseConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomerCase | CaseConfiguration | null>(null);
  const [editorType, setEditorType] = useState<'case' | 'config'>('case');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 客户案例表单数据
  const [caseFormData, setCaseFormData] = useState({
    company_name: '',
    company_logo: '',
    industry: '',
    description: '',
    results: '',
    image_url: '',
    is_featured: false,
    sort_order: 0,
    status: 'active' as const
  });

  // 案例配置表单数据
  const [configFormData, setConfigFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    company_name: '',
    company_logo: '',
    stock_code: '',
    image_url: '',
    link_url: '',
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 获取客户案例
      const { data: casesData, error: casesError } = await supabase
        .from('customer_cases')
        .select('*')
        .order('sort_order', { ascending: true });

      if (casesError) throw casesError;
      setCases(casesData || []);

      // 获取案例配置
      const { data: configsData, error: configsError } = await supabase
        .from('case_configurations')
        .select('*')
        .order('sort_order', { ascending: true });

      if (configsError) throw configsError;
      setConfigurations(configsData || []);

    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!caseFormData.company_name.trim() || !caseFormData.industry.trim()) {
      setSubmitError('请填写必填字段');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      if (editingItem && 'industry' in editingItem) {
        // 更新案例
        const { error } = await supabase
          .from('customer_cases')
          .update({
            ...caseFormData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        // 创建新案例
        const { error } = await supabase
          .from('customer_cases')
          .insert([caseFormData]);

        if (error) throw error;
      }

      await fetchData();
      resetForm();
    } catch (error) {
      console.error('保存案例失败:', error);
      setSubmitError('保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!configFormData.title.trim() || !configFormData.company_name.trim()) {
      setSubmitError('请填写必填字段');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      if (editingItem && 'title' in editingItem) {
        // 更新配置
        const { error } = await supabase
          .from('case_configurations')
          .update({
            ...configFormData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        // 创建新配置
        const { error } = await supabase
          .from('case_configurations')
          .insert([configFormData]);

        if (error) throw error;
      }

      await fetchData();
      resetForm();
    } catch (error) {
      console.error('保存配置失败:', error);
      setSubmitError('保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: CustomerCase | CaseConfiguration, type: 'case' | 'config') => {
    setEditingItem(item);
    setEditorType(type);
    
    if (type === 'case' && 'industry' in item) {
      setCaseFormData({
        company_name: item.company_name,
        company_logo: item.company_logo,
        industry: item.industry,
        description: item.description,
        results: item.results,
        image_url: item.image_url || '',
        is_featured: item.is_featured,
        sort_order: item.sort_order,
        status: item.status
      });
    } else if (type === 'config' && 'title' in item) {
      setConfigFormData({
        title: item.title,
        subtitle: item.subtitle || '',
        description: item.description || '',
        company_name: item.company_name,
        company_logo: item.company_logo,
        stock_code: item.stock_code || '',
        image_url: item.image_url || '',
        link_url: item.link_url || '',
        is_active: item.is_active,
        sort_order: item.sort_order
      });
    }
    
    setShowEditor(true);
  };

  const handleDelete = async (id: string, type: 'case' | 'config') => {
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
      const table = type === 'case' ? 'customer_cases' : 'case_configurations';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean, type: 'case' | 'config') => {
    try {
      if (type === 'case') {
        const { error } = await supabase
          .from('customer_cases')
          .update({ is_featured: !currentStatus })
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('case_configurations')
          .update({ is_active: !currentStatus })
          .eq('id', id);
        if (error) throw error;
      }
      
      await fetchData();
    } catch (error) {
      console.error('更新状态失败:', error);
    }
  };

  const resetForm = () => {
    setCaseFormData({
      company_name: '',
      company_logo: '',
      industry: '',
      description: '',
      results: '',
      image_url: '',
      is_featured: false,
      sort_order: 0,
      status: 'active'
    });
    setConfigFormData({
      title: '',
      subtitle: '',
      description: '',
      company_name: '',
      company_logo: '',
      stock_code: '',
      image_url: '',
      link_url: '',
      is_active: true,
      sort_order: 0
    });
    setEditingItem(null);
    setShowEditor(false);
    setSubmitError(null);
  };

  const openNewEditor = (type: 'case' | 'config') => {
    setEditorType(type);
    setEditingItem(null);
    setShowEditor(true);
  };

  const filteredCases = cases.filter(case_ =>
    case_.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConfigs = configurations.filter(config =>
    config.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#194fe8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">客户案例</p>
              <p className="text-2xl font-bold text-gray-900">{cases.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">精选案例</p>
              <p className="text-2xl font-bold text-orange-600">
                {cases.filter(c => c.is_featured).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">案例配置</p>
              <p className="text-2xl font-bold text-purple-600">{configurations.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Sliders className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">激活配置</p>
              <p className="text-2xl font-bold text-green-600">
                {configurations.filter(c => c.is_active).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 标签页和操作栏 */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* 标签页 */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('cases')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'cases'
                  ? 'bg-white text-[#194fe8] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              客户案例管理
            </button>
            <button
              onClick={() => setActiveTab('configurations')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'configurations'
                  ? 'bg-white text-[#194fe8] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              案例配置管理
            </button>
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
              />
            </div>

            {/* 新建按钮 */}
            <button
              onClick={() => openNewEditor(activeTab === 'cases' ? 'case' : 'config')}
              className="flex items-center space-x-2 bg-[#194fe8] hover:bg-[#1640c7] text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>新建{activeTab === 'cases' ? '案例' : '配置'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'cases' ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    公司信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    行业
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    排序
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCases.map((case_) => (
                  <tr key={case_.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-sm font-bold text-gray-600">{case_.company_logo}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {case_.company_name}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {case_.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {case_.industry}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          case_.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {case_.status === 'active' ? '激活' : '停用'}
                        </span>
                        {case_.is_featured && (
                          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                            精选
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {case_.sort_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(case_, 'case')}
                          className="text-[#194fe8] hover:text-[#1640c7] transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFeatured(case_.id, case_.is_featured, 'case')}
                          className="text-orange-600 hover:text-orange-700 transition-colors"
                          title={case_.is_featured ? '取消精选' : '设为精选'}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(case_.id, 'case')}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    配置信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    公司
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    排序
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConfigs.map((config) => (
                  <tr key={config.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start space-x-3">
                        {config.image_url && (
                          <img
                            src={config.image_url}
                            alt={config.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {config.title}
                          </div>
                          {config.subtitle && (
                            <div className="text-sm text-gray-500">{config.subtitle}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mr-2">
                          <span className="text-xs font-bold text-gray-600">{config.company_logo}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{config.company_name}</div>
                          {config.stock_code && (
                            <div className="text-xs text-gray-500">{config.stock_code}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        config.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {config.is_active ? '激活' : '停用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {config.sort_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(config, 'config')}
                          className="text-[#194fe8] hover:text-[#1640c7] transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFeatured(config.id, config.is_active, 'config')}
                          className="text-green-600 hover:text-green-700 transition-colors"
                          title={config.is_active ? '停用' : '激活'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(config.id, 'config')}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {((activeTab === 'cases' && filteredCases.length === 0) || 
          (activeTab === 'configurations' && filteredConfigs.length === 0)) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'cases' ? (
                <Building className="w-8 h-8 text-gray-400" />
              ) : (
                <Sliders className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <p className="text-gray-500">暂无{activeTab === 'cases' ? '案例' : '配置'}数据</p>
          </div>
        )}
      </div>

      {/* 编辑器模态框 */}
      {showEditor && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={resetForm} />
            
            <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingItem ? '编辑' : '新建'}{editorType === 'case' ? '客户案例' : '案例配置'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={editorType === 'case' ? handleCaseSubmit : handleConfigSubmit} className="p-6 space-y-6">
                {editorType === 'case' ? (
                  <>
                    {/* 客户案例表单 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          公司名称 *
                        </label>
                        <input
                          type="text"
                          required
                          value={caseFormData.company_name}
                          onChange={(e) => setCaseFormData({ ...caseFormData, company_name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          placeholder="请输入公司名称"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          公司Logo
                        </label>
                        <input
                          type="text"
                          value={caseFormData.company_logo}
                          onChange={(e) => setCaseFormData({ ...caseFormData, company_logo: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          placeholder="请输入Logo字母或URL"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          所属行业 *
                        </label>
                        <input
                          type="text"
                          required
                          value={caseFormData.industry}
                          onChange={(e) => setCaseFormData({ ...caseFormData, industry: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          placeholder="请输入所属行业"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          排序顺序
                        </label>
                        <input
                          type="number"
                          value={caseFormData.sort_order}
                          onChange={(e) => setCaseFormData({ ...caseFormData, sort_order: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          placeholder="排序顺序"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        案例描述
                      </label>
                      <textarea
                        value={caseFormData.description}
                        onChange={(e) => setCaseFormData({ ...caseFormData, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                        rows={3}
                        placeholder="请输入案例描述"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        实施效果
                      </label>
                      <textarea
                        value={caseFormData.results}
                        onChange={(e) => setCaseFormData({ ...caseFormData, results: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                        rows={3}
                        placeholder="请输入实施效果"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        案例图片
                      </label>
                      <ImageUploader
                        value={caseFormData.image_url}
                        onChange={(url) => setCaseFormData({ ...caseFormData, image_url: url })}
                        placeholder="上传案例图片"
                      />
                    </div>

                    <div className="flex items-center space-x-6">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={caseFormData.is_featured}
                          onChange={(e) => setCaseFormData({ ...caseFormData, is_featured: e.target.checked })}
                          className="w-4 h-4 text-[#194fe8] border-gray-300 rounded focus:ring-[#194fe8]"
                        />
                        <span className="text-sm font-medium text-gray-700">设为精选案例</span>
                      </label>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          状态
                        </label>
                        <select
                          value={caseFormData.status}
                          onChange={(e) => setCaseFormData({ ...caseFormData, status: e.target.value as 'active' | 'inactive' })}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                        >
                          <option value="active">激活</option>
                          <option value="inactive">停用</option>
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* 案例配置表单 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          配置标题 *
                        </label>
                        <input
                          type="text"
                          required
                          value={configFormData.title}
                          onChange={(e) => setConfigFormData({ ...configFormData, title: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          placeholder="请输入配置标题"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          副标题
                        </label>
                        <input
                          type="text"
                          value={configFormData.subtitle}
                          onChange={(e) => setConfigFormData({ ...configFormData, subtitle: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          placeholder="请输入副标题"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          公司名称 *
                        </label>
                        <input
                          type="text"
                          required
                          value={configFormData.company_name}
                          onChange={(e) => setConfigFormData({ ...configFormData, company_name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          placeholder="请输入公司名称"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          公司Logo
                        </label>
                        <input
                          type="text"
                          value={configFormData.company_logo}
                          onChange={(e) => setConfigFormData({ ...configFormData, company_logo: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          placeholder="请输入Logo字母"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          股票代码
                        </label>
                        <input
                          type="text"
                          value={configFormData.stock_code}
                          onChange={(e) => setConfigFormData({ ...configFormData, stock_code: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          placeholder="请输入股票代码"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          链接地址
                        </label>
                        <input
                          type="url"
                          value={configFormData.link_url}
                          onChange={(e) => setConfigFormData({ ...configFormData, link_url: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          placeholder="请输入链接地址"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          排序顺序
                        </label>
                        <input
                          type="number"
                          value={configFormData.sort_order}
                          onChange={(e) => setConfigFormData({ ...configFormData, sort_order: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          placeholder="排序顺序"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        配置描述
                      </label>
                      <textarea
                        value={configFormData.description}
                        onChange={(e) => setConfigFormData({ ...configFormData, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                        rows={3}
                        placeholder="请输入配置描述"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        配置图片
                      </label>
                      <ImageUploader
                        value={configFormData.image_url}
                        onChange={(url) => setConfigFormData({ ...configFormData, image_url: url })}
                        placeholder="上传配置图片"
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={configFormData.is_active}
                          onChange={(e) => setConfigFormData({ ...configFormData, is_active: e.target.checked })}
                          className="w-4 h-4 text-[#194fe8] border-gray-300 rounded focus:ring-[#194fe8]"
                        />
                        <span className="text-sm font-medium text-gray-700">激活此配置</span>
                      </label>
                    </div>
                  </>
                )}

                {/* 错误提示 */}
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {submitError}
                    </p>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isSubmitting}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-[#194fe8] hover:bg-[#1640c7] text-white rounded-lg transition-colors flex items-center space-x-2 font-medium disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>保存中...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{editingItem ? '更新' : '创建'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedCaseManagement;