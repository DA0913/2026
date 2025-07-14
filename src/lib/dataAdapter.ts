// 数据适配器
// 用于在Supabase和JeecgBoot之间进行数据转换和接口统一

import { supabase, FormSubmission, NewsArticle, CustomerCase, CaseConfiguration } from './supabase';
import JeecgApiService, { 
  JeecgFormSubmission, 
  JeecgNewsArticle, 
  JeecgCustomerCase, 
  JeecgCaseConfiguration,
  JeecgResponse,
  JeecgPageResult,
  JeecgPageParams
} from './jeecgApi';

// 数据源类型
export type DataSource = 'supabase' | 'jeecg';

// 全局数据源配置
let currentDataSource: DataSource = 'supabase';

// 设置当前数据源
export const setDataSource = (source: DataSource) => {
  currentDataSource = source;
  console.log(`Data source switched to: ${source}`);
};

// 获取当前数据源
export const getDataSource = (): DataSource => {
  return currentDataSource;
};

// ==================== 表单提交数据适配器 ====================

// Supabase -> JeecgBoot 数据转换
const convertFormSubmissionToJeecg = (supabaseData: FormSubmission): Omit<JeecgFormSubmission, 'id' | 'createTime' | 'updateTime'> => {
  return {
    companyName: supabaseData.company_name,
    userName: supabaseData.user_name,
    phone: supabaseData.phone,
    companyTypes: Array.isArray(supabaseData.company_types) ? supabaseData.company_types.join(',') : supabaseData.company_types,
    sourceUrl: supabaseData.source_url,
    status: supabaseData.status,
    notes: supabaseData.notes || '',
  };
};

// JeecgBoot -> Supabase 数据转换
const convertFormSubmissionToSupabase = (jeecgData: JeecgFormSubmission): Omit<FormSubmission, 'id' | 'created_at' | 'updated_at'> => {
  return {
    company_name: jeecgData.companyName,
    user_name: jeecgData.userName,
    phone: jeecgData.phone,
    company_types: jeecgData.companyTypes.split(',').filter(Boolean),
    source_url: jeecgData.sourceUrl,
    submitted_at: jeecgData.createTime,
    status: jeecgData.status as 'pending' | 'processing' | 'completed' | 'invalid',
    notes: jeecgData.notes,
  };
};

// 统一的表单提交服务
export class FormSubmissionService {
  // 获取表单提交列表
  static async getFormSubmissions(params?: JeecgPageParams) {
    if (currentDataSource === 'jeecg') {
      return await JeecgApiService.getFormSubmissions(params);
    } else {
      // Supabase 分页查询
      const { data, error, count } = await supabase
        .from('form_submissions')
        .select('*', { count: 'exact' })
        .range(
          ((params?.pageNo || 1) - 1) * (params?.pageSize || 10),
          (params?.pageNo || 1) * (params?.pageSize || 10) - 1
        )
        .order(params?.column || 'created_at', { ascending: params?.order === 'asc' });

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result: {
          records: data || [],
          total: count || 0,
          size: params?.pageSize || 10,
          current: params?.pageNo || 1,
          pages: Math.ceil((count || 0) / (params?.pageSize || 10)),
        },
        timestamp: Date.now(),
      } as JeecgResponse<JeecgPageResult<FormSubmission>>;
    }
  }

  // 创建表单提交
  static async createFormSubmission(data: Omit<FormSubmission, 'id' | 'created_at' | 'updated_at'>) {
    if (currentDataSource === 'jeecg') {
      const jeecgData = convertFormSubmissionToJeecg(data as any);
      return await JeecgApiService.createFormSubmission(jeecgData);
    } else {
      const { data: result, error } = await supabase
        .from('form_submissions')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result,
        timestamp: Date.now(),
      } as JeecgResponse<FormSubmission>;
    }
  }

  // 更新表单提交
  static async updateFormSubmission(id: string, data: Partial<FormSubmission>) {
    if (currentDataSource === 'jeecg') {
      const jeecgData = convertFormSubmissionToJeecg(data as any);
      return await JeecgApiService.updateFormSubmission(id, jeecgData);
    } else {
      const { data: result, error } = await supabase
        .from('form_submissions')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result,
        timestamp: Date.now(),
      } as JeecgResponse<FormSubmission>;
    }
  }

  // 删除表单提交
  static async deleteFormSubmission(id: string) {
    if (currentDataSource === 'jeecg') {
      return await JeecgApiService.deleteFormSubmission(id);
    } else {
      const { error } = await supabase
        .from('form_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result: null,
        timestamp: Date.now(),
      } as JeecgResponse<null>;
    }
  }
}

// ==================== 新闻文章数据适配器 ====================

// Supabase -> JeecgBoot 数据转换
const convertNewsArticleToJeecg = (supabaseData: NewsArticle): Omit<JeecgNewsArticle, 'id' | 'createTime' | 'updateTime'> => {
  return {
    title: supabaseData.title,
    category: supabaseData.category,
    publishTime: supabaseData.publish_time,
    imageUrl: supabaseData.image_url || '',
    summary: supabaseData.summary || '',
    content: supabaseData.content || '',
    views: supabaseData.views,
    isFeatured: supabaseData.is_featured,
  };
};

// JeecgBoot -> Supabase 数据转换
const convertNewsArticleToSupabase = (jeecgData: JeecgNewsArticle): Omit<NewsArticle, 'id' | 'created_at' | 'updated_at'> => {
  return {
    title: jeecgData.title,
    category: jeecgData.category,
    publish_time: jeecgData.publishTime,
    image_url: jeecgData.imageUrl,
    summary: jeecgData.summary,
    content: jeecgData.content,
    views: jeecgData.views,
    is_featured: jeecgData.isFeatured,
  };
};

// 统一的新闻文章服务
export class NewsArticleService {
  // 获取新闻文章列表
  static async getNewsArticles(params?: JeecgPageParams) {
    if (currentDataSource === 'jeecg') {
      return await JeecgApiService.getNewsArticles(params);
    } else {
      const { data, error, count } = await supabase
        .from('news_articles')
        .select('*', { count: 'exact' })
        .range(
          ((params?.pageNo || 1) - 1) * (params?.pageSize || 10),
          (params?.pageNo || 1) * (params?.pageSize || 10) - 1
        )
        .order(params?.column || 'publish_time', { ascending: params?.order === 'asc' });

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result: {
          records: data || [],
          total: count || 0,
          size: params?.pageSize || 10,
          current: params?.pageNo || 1,
          pages: Math.ceil((count || 0) / (params?.pageSize || 10)),
        },
        timestamp: Date.now(),
      } as JeecgResponse<JeecgPageResult<NewsArticle>>;
    }
  }

  // 获取新闻文章详情
  static async getNewsArticle(id: string) {
    if (currentDataSource === 'jeecg') {
      return await JeecgApiService.getNewsArticle(id);
    } else {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result: data,
        timestamp: Date.now(),
      } as JeecgResponse<NewsArticle>;
    }
  }

  // 创建新闻文章
  static async createNewsArticle(data: Omit<NewsArticle, 'id' | 'created_at' | 'updated_at'>) {
    if (currentDataSource === 'jeecg') {
      const jeecgData = convertNewsArticleToJeecg(data as any);
      return await JeecgApiService.createNewsArticle(jeecgData);
    } else {
      const { data: result, error } = await supabase
        .from('news_articles')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result,
        timestamp: Date.now(),
      } as JeecgResponse<NewsArticle>;
    }
  }

  // 更新新闻文章
  static async updateNewsArticle(id: string, data: Partial<NewsArticle>) {
    if (currentDataSource === 'jeecg') {
      const jeecgData = convertNewsArticleToJeecg(data as any);
      return await JeecgApiService.updateNewsArticle(id, jeecgData);
    } else {
      const { data: result, error } = await supabase
        .from('news_articles')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result,
        timestamp: Date.now(),
      } as JeecgResponse<NewsArticle>;
    }
  }

  // 删除新闻文章
  static async deleteNewsArticle(id: string) {
    if (currentDataSource === 'jeecg') {
      return await JeecgApiService.deleteNewsArticle(id);
    } else {
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result: null,
        timestamp: Date.now(),
      } as JeecgResponse<null>;
    }
  }

  // 获取特色新闻
  static async getFeaturedNews(limit: number = 5) {
    if (currentDataSource === 'jeecg') {
      return await JeecgApiService.getFeaturedNews(limit);
    } else {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('is_featured', true)
        .order('publish_time', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result: data || [],
        timestamp: Date.now(),
      } as JeecgResponse<NewsArticle[]>;
    }
  }
}

// ==================== 客户案例数据适配器 ====================

// Supabase -> JeecgBoot 数据转换
const convertCustomerCaseToJeecg = (supabaseData: CustomerCase): Omit<JeecgCustomerCase, 'id' | 'createTime' | 'updateTime'> => {
  return {
    companyName: supabaseData.company_name,
    companyLogo: supabaseData.company_logo,
    industry: supabaseData.industry,
    description: supabaseData.description,
    results: supabaseData.results,
    metrics: JSON.stringify(supabaseData.metrics),
    isFeatured: supabaseData.is_featured,
    sortOrder: supabaseData.sort_order,
    status: supabaseData.status,
  };
};

// JeecgBoot -> Supabase 数据转换
const convertCustomerCaseToSupabase = (jeecgData: JeecgCustomerCase): Omit<CustomerCase, 'id' | 'created_at' | 'updated_at'> => {
  return {
    company_name: jeecgData.companyName,
    company_logo: jeecgData.companyLogo,
    industry: jeecgData.industry,
    description: jeecgData.description,
    results: jeecgData.results,
    metrics: JSON.parse(jeecgData.metrics || '{}'),
    is_featured: jeecgData.isFeatured,
    sort_order: jeecgData.sortOrder,
    status: jeecgData.status as 'active' | 'inactive',
  };
};

// 统一的客户案例服务
export class CustomerCaseService {
  // 获取客户案例列表
  static async getCustomerCases(params?: JeecgPageParams) {
    if (currentDataSource === 'jeecg') {
      return await JeecgApiService.getCustomerCases(params);
    } else {
      const { data, error, count } = await supabase
        .from('customer_cases')
        .select('*', { count: 'exact' })
        .range(
          ((params?.pageNo || 1) - 1) * (params?.pageSize || 10),
          (params?.pageNo || 1) * (params?.pageSize || 10) - 1
        )
        .order(params?.column || 'sort_order', { ascending: params?.order === 'asc' });

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result: {
          records: data || [],
          total: count || 0,
          size: params?.pageSize || 10,
          current: params?.pageNo || 1,
          pages: Math.ceil((count || 0) / (params?.pageSize || 10)),
        },
        timestamp: Date.now(),
      } as JeecgResponse<JeecgPageResult<CustomerCase>>;
    }
  }

  // 获取客户案例详情
  static async getCustomerCase(id: string) {
    if (currentDataSource === 'jeecg') {
      return await JeecgApiService.getCustomerCase(id);
    } else {
      const { data, error } = await supabase
        .from('customer_cases')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result: data,
        timestamp: Date.now(),
      } as JeecgResponse<CustomerCase>;
    }
  }

  // 创建客户案例
  static async createCustomerCase(data: Omit<CustomerCase, 'id' | 'created_at' | 'updated_at'>) {
    if (currentDataSource === 'jeecg') {
      const jeecgData = convertCustomerCaseToJeecg(data as any);
      return await JeecgApiService.createCustomerCase(jeecgData);
    } else {
      const { data: result, error } = await supabase
        .from('customer_cases')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result,
        timestamp: Date.now(),
      } as JeecgResponse<CustomerCase>;
    }
  }

  // 更新客户案例
  static async updateCustomerCase(id: string, data: Partial<CustomerCase>) {
    if (currentDataSource === 'jeecg') {
      const jeecgData = convertCustomerCaseToJeecg(data as any);
      return await JeecgApiService.updateCustomerCase(id, jeecgData);
    } else {
      const { data: result, error } = await supabase
        .from('customer_cases')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result,
        timestamp: Date.now(),
      } as JeecgResponse<CustomerCase>;
    }
  }

  // 删除客户案例
  static async deleteCustomerCase(id: string) {
    if (currentDataSource === 'jeecg') {
      return await JeecgApiService.deleteCustomerCase(id);
    } else {
      const { error } = await supabase
        .from('customer_cases')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result: null,
        timestamp: Date.now(),
      } as JeecgResponse<null>;
    }
  }

  // 获取特色案例
  static async getFeaturedCases(limit: number = 6) {
    if (currentDataSource === 'jeecg') {
      return await JeecgApiService.getFeaturedCases(limit);
    } else {
      const { data, error } = await supabase
        .from('customer_cases')
        .select('*')
        .eq('is_featured', true)
        .eq('status', 'active')
        .order('sort_order', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result: data || [],
        timestamp: Date.now(),
      } as JeecgResponse<CustomerCase[]>;
    }
  }
}

// ==================== 案例配置数据适配器 ====================

// Supabase -> JeecgBoot 数据转换
const convertCaseConfigurationToJeecg = (supabaseData: CaseConfiguration): Omit<JeecgCaseConfiguration, 'id' | 'createTime' | 'updateTime'> => {
  return {
    title: supabaseData.title,
    subtitle: supabaseData.subtitle || '',
    description: supabaseData.description || '',
    companyName: supabaseData.company_name,
    companyLogo: supabaseData.company_logo,
    stockCode: supabaseData.stock_code || '',
    imageUrl: supabaseData.image_url || '',
    linkUrl: supabaseData.link_url || '',
    isActive: supabaseData.is_active,
    sortOrder: supabaseData.sort_order,
  };
};

// JeecgBoot -> Supabase 数据转换
const convertCaseConfigurationToSupabase = (jeecgData: JeecgCaseConfiguration): Omit<CaseConfiguration, 'id' | 'created_at' | 'updated_at'> => {
  return {
    title: jeecgData.title,
    subtitle: jeecgData.subtitle,
    description: jeecgData.description,
    company_name: jeecgData.companyName,
    company_logo: jeecgData.companyLogo,
    stock_code: jeecgData.stockCode,
    image_url: jeecgData.imageUrl,
    link_url: jeecgData.linkUrl,
    is_active: jeecgData.isActive,
    sort_order: jeecgData.sortOrder,
  };
};

// 统一的案例配置服务
export class CaseConfigurationService {
  // 获取案例配置列表
  static async getCaseConfigurations(params?: JeecgPageParams) {
    if (currentDataSource === 'jeecg') {
      return await JeecgApiService.getCaseConfigurations(params);
    } else {
      const { data, error, count } = await supabase
        .from('case_configurations')
        .select('*', { count: 'exact' })
        .range(
          ((params?.pageNo || 1) - 1) * (params?.pageSize || 10),
          (params?.pageNo || 1) * (params?.pageSize || 10) - 1
        )
        .order(params?.column || 'sort_order', { ascending: params?.order === 'asc' });

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result: {
          records: data || [],
          total: count || 0,
          size: params?.pageSize || 10,
          current: params?.pageNo || 1,
          pages: Math.ceil((count || 0) / (params?.pageSize || 10)),
        },
        timestamp: Date.now(),
      } as JeecgResponse<JeecgPageResult<CaseConfiguration>>;
    }
  }

  // 创建案例配置
  static async createCaseConfiguration(data: Omit<CaseConfiguration, 'id' | 'created_at' | 'updated_at'>) {
    if (currentDataSource === 'jeecg') {
      const jeecgData = convertCaseConfigurationToJeecg(data as any);
      return await JeecgApiService.createCaseConfiguration(jeecgData);
    } else {
      const { data: result, error } = await supabase
        .from('case_configurations')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result,
        timestamp: Date.now(),
      } as JeecgResponse<CaseConfiguration>;
    }
  }

  // 更新案例配置
  static async updateCaseConfiguration(id: string, data: Partial<CaseConfiguration>) {
    if (currentDataSource === 'jeecg') {
      const jeecgData = convertCaseConfigurationToJeecg(data as any);
      return await JeecgApiService.updateCaseConfiguration(id, jeecgData);
    } else {
      const { data: result, error } = await supabase
        .from('case_configurations')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result,
        timestamp: Date.now(),
      } as JeecgResponse<CaseConfiguration>;
    }
  }

  // 删除案例配置
  static async deleteCaseConfiguration(id: string) {
    if (currentDataSource === 'jeecg') {
      return await JeecgApiService.deleteCaseConfiguration(id);
    } else {
      const { error } = await supabase
        .from('case_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result: null,
        timestamp: Date.now(),
      } as JeecgResponse<null>;
    }
  }
}

// ==================== 文件上传服务 ====================

export class FileUploadService {
  // 上传文件
  static async uploadFile(file: File) {
    if (currentDataSource === 'jeecg') {
      return await JeecgApiService.uploadFile(file);
    } else {
      // Supabase 文件上传
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);

      return {
        success: true,
        message: 'Success',
        code: 200,
        result: {
          id: data.path,
          fileName: file.name,
          fileUrl: urlData.publicUrl,
          fileSize: file.size,
          fileType: file.type,
          createTime: new Date().toISOString(),
        },
        timestamp: Date.now(),
      } as JeecgResponse<any>;
    }
  }

  // 删除文件
  static async deleteFile(fileId: string) {
    if (currentDataSource === 'jeecg') {
      return await JeecgApiService.deleteFile(fileId);
    } else {
      const { error } = await supabase.storage
        .from('uploads')
        .remove([fileId]);

      if (error) throw error;

      return {
        success: true,
        message: 'Success',
        code: 200,
        result: null,
        timestamp: Date.now(),
      } as JeecgResponse<null>;
    }
  }
}

// 所有服务类已经在上面导出，这里不需要重复导出 