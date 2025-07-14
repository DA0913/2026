// JeecgBoot API 服务层
// 用于与JeecgBoot后端进行通信

// 环境变量配置
const JEECG_API_BASE_URL = import.meta.env.VITE_JEECG_API_BASE_URL || 'http://localhost:8080/jeecg-boot';
const JEECG_API_TOKEN = import.meta.env.VITE_JEECG_API_TOKEN || '';

// API 响应类型定义
export interface JeecgResponse<T = any> {
  success: boolean;
  message: string;
  code: number;
  result: T;
  timestamp: number;
}

export interface JeecgPageResult<T = any> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// 通用分页参数
export interface JeecgPageParams {
  pageNo?: number;
  pageSize?: number;
  column?: string;
  order?: 'asc' | 'desc';
}

// 用户相关类型
export interface JeecgUser {
  id: string;
  username: string;
  realname: string;
  avatar?: string;
  email?: string;
  phone?: string;
  status: number;
  createTime: string;
  updateTime: string;
}

// 表单提交相关类型
export interface JeecgFormSubmission {
  id: string;
  companyName: string;
  userName: string;
  phone: string;
  companyTypes: string;
  sourceUrl: string;
  status: string;
  notes?: string;
  createTime: string;
  updateTime: string;
}

// 新闻文章相关类型
export interface JeecgNewsArticle {
  id: string;
  title: string;
  category: string;
  publishTime: string;
  imageUrl?: string;
  summary?: string;
  content?: string;
  views: number;
  isFeatured: boolean;
  createTime: string;
  updateTime: string;
}

// 客户案例相关类型
export interface JeecgCustomerCase {
  id: string;
  companyName: string;
  companyLogo: string;
  industry: string;
  description: string;
  results: string;
  metrics: string; // JSON字符串
  isFeatured: boolean;
  sortOrder: number;
  status: string;
  createTime: string;
  updateTime: string;
}

// 案例配置相关类型
export interface JeecgCaseConfiguration {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  companyName: string;
  companyLogo: string;
  stockCode?: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createTime: string;
  updateTime: string;
}

// 文件上传相关类型
export interface JeecgFileUpload {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  createTime: string;
}

// 系统配置相关类型
export interface JeecgSystemConfig {
  id: string;
  configKey: string;
  configValue: string;
  configName: string;
  description?: string;
  createTime: string;
  updateTime: string;
}

// HTTP请求工具类
class JeecgHttpClient {
  private baseURL: string;
  private token: string;

  constructor(baseURL: string, token: string) {
    this.baseURL = baseURL;
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<JeecgResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Access-Token': this.token,
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('JeecgBoot API request failed:', error);
      throw error;
    }
  }

  // GET请求
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<JeecgResponse<T>> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, String(params[key]));
        }
      });
    }
    
    return this.request<T>(url.pathname + url.search);
  }

  // POST请求
  async post<T>(endpoint: string, data?: any): Promise<JeecgResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT请求
  async put<T>(endpoint: string, data?: any): Promise<JeecgResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<JeecgResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // 文件上传
  async uploadFile<T>(endpoint: string, file: File): Promise<JeecgResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: {
        'X-Access-Token': this.token,
      },
      body: formData,
    });
  }
}

// 创建HTTP客户端实例
const jeecgClient = new JeecgHttpClient(JEECG_API_BASE_URL, JEECG_API_TOKEN);

// API服务类
export class JeecgApiService {
  // ==================== 用户管理 ====================
  
  // 用户登录
  static async login(username: string, password: string): Promise<JeecgResponse<{ token: string; userInfo: JeecgUser }>> {
    return jeecgClient.post('/sys/login', { username, password });
  }

  // 获取用户信息
  static async getUserInfo(): Promise<JeecgResponse<JeecgUser>> {
    return jeecgClient.get('/sys/user/getUserInfo');
  }

  // 用户登出
  static async logout(): Promise<JeecgResponse<null>> {
    return jeecgClient.post('/sys/logout');
  }

  // ==================== 表单提交管理 ====================
  
  // 获取表单提交列表
  static async getFormSubmissions(params?: JeecgPageParams): Promise<JeecgResponse<JeecgPageResult<JeecgFormSubmission>>> {
    return jeecgClient.get('/form/submission/list', params);
  }

  // 创建表单提交
  static async createFormSubmission(data: Omit<JeecgFormSubmission, 'id' | 'createTime' | 'updateTime'>): Promise<JeecgResponse<JeecgFormSubmission>> {
    return jeecgClient.post('/form/submission/add', data);
  }

  // 更新表单提交
  static async updateFormSubmission(id: string, data: Partial<JeecgFormSubmission>): Promise<JeecgResponse<JeecgFormSubmission>> {
    return jeecgClient.put(`/form/submission/edit/${id}`, data);
  }

  // 删除表单提交
  static async deleteFormSubmission(id: string): Promise<JeecgResponse<null>> {
    return jeecgClient.delete(`/form/submission/delete/${id}`);
  }

  // 批量删除表单提交
  static async batchDeleteFormSubmissions(ids: string[]): Promise<JeecgResponse<null>> {
    return jeecgClient.post('/form/submission/deleteBatch', { ids });
  }

  // ==================== 新闻文章管理 ====================
  
  // 获取新闻文章列表
  static async getNewsArticles(params?: JeecgPageParams): Promise<JeecgResponse<JeecgPageResult<JeecgNewsArticle>>> {
    return jeecgClient.get('/news/article/list', params);
  }

  // 获取新闻文章详情
  static async getNewsArticle(id: string): Promise<JeecgResponse<JeecgNewsArticle>> {
    return jeecgClient.get(`/news/article/queryById/${id}`);
  }

  // 创建新闻文章
  static async createNewsArticle(data: Omit<JeecgNewsArticle, 'id' | 'createTime' | 'updateTime'>): Promise<JeecgResponse<JeecgNewsArticle>> {
    return jeecgClient.post('/news/article/add', data);
  }

  // 更新新闻文章
  static async updateNewsArticle(id: string, data: Partial<JeecgNewsArticle>): Promise<JeecgResponse<JeecgNewsArticle>> {
    return jeecgClient.put(`/news/article/edit/${id}`, data);
  }

  // 删除新闻文章
  static async deleteNewsArticle(id: string): Promise<JeecgResponse<null>> {
    return jeecgClient.delete(`/news/article/delete/${id}`);
  }

  // 获取特色新闻
  static async getFeaturedNews(limit: number = 5): Promise<JeecgResponse<JeecgNewsArticle[]>> {
    return jeecgClient.get('/news/article/featured', { limit });
  }

  // ==================== 客户案例管理 ====================
  
  // 获取客户案例列表
  static async getCustomerCases(params?: JeecgPageParams): Promise<JeecgResponse<JeecgPageResult<JeecgCustomerCase>>> {
    return jeecgClient.get('/customer/case/list', params);
  }

  // 获取客户案例详情
  static async getCustomerCase(id: string): Promise<JeecgResponse<JeecgCustomerCase>> {
    return jeecgClient.get(`/customer/case/queryById/${id}`);
  }

  // 创建客户案例
  static async createCustomerCase(data: Omit<JeecgCustomerCase, 'id' | 'createTime' | 'updateTime'>): Promise<JeecgResponse<JeecgCustomerCase>> {
    return jeecgClient.post('/customer/case/add', data);
  }

  // 更新客户案例
  static async updateCustomerCase(id: string, data: Partial<JeecgCustomerCase>): Promise<JeecgResponse<JeecgCustomerCase>> {
    return jeecgClient.put(`/customer/case/edit/${id}`, data);
  }

  // 删除客户案例
  static async deleteCustomerCase(id: string): Promise<JeecgResponse<null>> {
    return jeecgClient.delete(`/customer/case/delete/${id}`);
  }

  // 获取特色案例
  static async getFeaturedCases(limit: number = 6): Promise<JeecgResponse<JeecgCustomerCase[]>> {
    return jeecgClient.get('/customer/case/featured', { limit });
  }

  // ==================== 案例配置管理 ====================
  
  // 获取案例配置列表
  static async getCaseConfigurations(params?: JeecgPageParams): Promise<JeecgResponse<JeecgPageResult<JeecgCaseConfiguration>>> {
    return jeecgClient.get('/case/config/list', params);
  }

  // 创建案例配置
  static async createCaseConfiguration(data: Omit<JeecgCaseConfiguration, 'id' | 'createTime' | 'updateTime'>): Promise<JeecgResponse<JeecgCaseConfiguration>> {
    return jeecgClient.post('/case/config/add', data);
  }

  // 更新案例配置
  static async updateCaseConfiguration(id: string, data: Partial<JeecgCaseConfiguration>): Promise<JeecgResponse<JeecgCaseConfiguration>> {
    return jeecgClient.put(`/case/config/edit/${id}`, data);
  }

  // 删除案例配置
  static async deleteCaseConfiguration(id: string): Promise<JeecgResponse<null>> {
    return jeecgClient.delete(`/case/config/delete/${id}`);
  }

  // ==================== 文件上传管理 ====================
  
  // 上传文件
  static async uploadFile(file: File): Promise<JeecgResponse<JeecgFileUpload>> {
    return jeecgClient.uploadFile('/sys/common/upload', file);
  }

  // 删除文件
  static async deleteFile(fileId: string): Promise<JeecgResponse<null>> {
    return jeecgClient.delete(`/sys/common/deleteFile/${fileId}`);
  }

  // ==================== 系统配置管理 ====================
  
  // 获取系统配置
  static async getSystemConfigs(params?: JeecgPageParams): Promise<JeecgResponse<JeecgPageResult<JeecgSystemConfig>>> {
    return jeecgClient.get('/sys/config/list', params);
  }

  // 获取单个配置
  static async getSystemConfig(key: string): Promise<JeecgResponse<JeecgSystemConfig>> {
    return jeecgClient.get(`/sys/config/queryByKey/${key}`);
  }

  // 更新系统配置
  static async updateSystemConfig(key: string, value: string): Promise<JeecgResponse<JeecgSystemConfig>> {
    return jeecgClient.put(`/sys/config/updateByKey/${key}`, { configValue: value });
  }

  // ==================== 数据统计 ====================
  
  // 获取表单提交统计
  static async getFormSubmissionStats(): Promise<JeecgResponse<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    invalid: number;
  }>> {
    return jeecgClient.get('/form/submission/stats');
  }

  // 获取新闻文章统计
  static async getNewsArticleStats(): Promise<JeecgResponse<{
    total: number;
    featured: number;
    published: number;
    draft: number;
  }>> {
    return jeecgClient.get('/news/article/stats');
  }

  // 获取客户案例统计
  static async getCustomerCaseStats(): Promise<JeecgResponse<{
    total: number;
    featured: number;
    active: number;
    inactive: number;
  }>> {
    return jeecgClient.get('/customer/case/stats');
  }
}

// 导出默认实例
export default JeecgApiService; 