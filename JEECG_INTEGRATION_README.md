# JeecgBoot 集成说明

本文档说明如何在前端网站中集成和使用JeecgBoot后端服务。

## 概述

前端网站已经预留了完整的JeecgBoot数据接口，支持在Supabase和JeecgBoot之间无缝切换数据源。所有数据操作都通过统一的服务层进行，确保代码的一致性和可维护性。

## 文件结构

```
src/lib/
├── jeecgApi.ts          # JeecgBoot API服务层
├── dataAdapter.ts       # 数据适配器（统一接口）
└── supabase.ts          # Supabase服务层

src/components/
├── DataSourceConfig.tsx # 数据源配置组件
└── IntegratedAdminApp.tsx # 管理后台（已集成数据源切换）

docs/
├── JEECG_API_DOCS.md    # 详细API接口文档
└── env.example          # 环境变量示例
```

## 快速开始

### 1. 环境配置

复制环境变量示例文件：
```bash
cp env.example .env.local
```

编辑 `.env.local` 文件，配置JeecgBoot相关参数：
```bash
# JeecgBoot 配置
VITE_JEECG_API_BASE_URL=http://localhost:8080/jeecg-boot
VITE_JEECG_API_TOKEN=your_jeecg_api_token

# 默认数据源
VITE_DEFAULT_DATA_SOURCE=jeecg
```

### 2. 数据源切换

#### 方式一：环境变量配置
在 `.env.local` 中设置：
```bash
VITE_DEFAULT_DATA_SOURCE=jeecg
```

#### 方式二：运行时切换
在管理后台的"数据源配置"页面中，可以实时切换数据源。

#### 方式三：代码中切换
```typescript
import { setDataSource } from '../lib/dataAdapter';

// 切换到JeecgBoot
setDataSource('jeecg');

// 切换到Supabase
setDataSource('supabase');
```

### 3. 使用统一服务

所有数据操作都通过统一的服务层进行：

```typescript
import { 
  FormSubmissionService, 
  NewsArticleService, 
  CustomerCaseService,
  CaseConfigurationService,
  FileUploadService 
} from '../lib/dataAdapter';

// 表单提交管理
const submissions = await FormSubmissionService.getFormSubmissions({
  pageNo: 1,
  pageSize: 10
});

// 新闻文章管理
const articles = await NewsArticleService.getNewsArticles();

// 客户案例管理
const cases = await CustomerCaseService.getCustomerCases();

// 文件上传
const uploadResult = await FileUploadService.uploadFile(file);
```

## 核心功能

### 1. 数据适配器 (`dataAdapter.ts`)

数据适配器提供了统一的数据操作接口，自动处理不同数据源之间的差异：

- **自动数据转换**: 在Supabase和JeecgBoot之间自动转换数据格式
- **统一响应格式**: 所有接口都返回统一的响应格式
- **错误处理**: 统一的错误处理机制
- **分页支持**: 支持分页查询，参数统一

### 2. JeecgBoot API服务 (`jeecgApi.ts`)

完整的JeecgBoot API封装，包含：

- **用户管理**: 登录、登出、用户信息
- **表单提交管理**: CRUD操作、批量删除、统计
- **新闻文章管理**: CRUD操作、特色新闻
- **客户案例管理**: CRUD操作、特色案例
- **案例配置管理**: CRUD操作
- **文件上传管理**: 文件上传、删除
- **系统配置管理**: 配置查询、更新
- **数据统计**: 各类数据统计

### 3. 数据源配置组件 (`DataSourceConfig.tsx`)

可视化的数据源配置界面：

- **实时切换**: 无需重启应用即可切换数据源
- **状态显示**: 显示各数据源的配置状态
- **配置说明**: 提供详细的配置指导

## API接口规范

### 请求格式
```typescript
// GET请求
GET /api/endpoint?pageNo=1&pageSize=10&column=createTime&order=desc

// POST请求
POST /api/endpoint
Content-Type: application/json
X-Access-Token: your_token

{
  "field1": "value1",
  "field2": "value2"
}
```

### 响应格式
```typescript
{
  success: boolean;
  message: string;
  code: number;
  result: T;
  timestamp: number;
}
```

### 分页响应
```typescript
{
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}
```

## 数据模型映射

### 表单提交
| Supabase字段 | JeecgBoot字段 | 说明 |
|-------------|---------------|------|
| company_name | companyName | 公司名称 |
| user_name | userName | 用户姓名 |
| phone | phone | 联系电话 |
| company_types | companyTypes | 公司类型（数组转字符串） |
| source_url | sourceUrl | 来源URL |
| status | status | 状态 |
| notes | notes | 备注 |

### 新闻文章
| Supabase字段 | JeecgBoot字段 | 说明 |
|-------------|---------------|------|
| title | title | 标题 |
| category | category | 分类 |
| publish_time | publishTime | 发布时间 |
| image_url | imageUrl | 图片URL |
| summary | summary | 摘要 |
| content | content | 内容 |
| views | views | 浏览量 |
| is_featured | isFeatured | 是否特色 |

### 客户案例
| Supabase字段 | JeecgBoot字段 | 说明 |
|-------------|---------------|------|
| company_name | companyName | 公司名称 |
| company_logo | companyLogo | 公司Logo |
| industry | industry | 行业 |
| description | description | 描述 |
| results | results | 结果 |
| metrics | metrics | 指标（对象转JSON字符串） |
| is_featured | isFeatured | 是否特色 |
| sort_order | sortOrder | 排序 |
| status | status | 状态 |

## 部署指南

### 1. 开发环境

1. 启动JeecgBoot后端服务
2. 配置环境变量
3. 启动前端开发服务器
4. 在管理后台测试数据源切换

### 2. 生产环境

1. 确保JeecgBoot服务正常运行
2. 配置生产环境的API地址和令牌
3. 设置适当的环境变量
4. 测试所有接口的连接性
5. 配置CORS策略（如需要）

### 3. 环境变量检查清单

- [ ] `VITE_JEECG_API_BASE_URL` - JeecgBoot API基础URL
- [ ] `VITE_JEECG_API_TOKEN` - JeecgBoot API访问令牌
- [ ] `VITE_DEFAULT_DATA_SOURCE` - 默认数据源
- [ ] `VITE_SUPABASE_URL` - Supabase项目URL（备用）
- [ ] `VITE_SUPABASE_ANON_KEY` - Supabase匿名密钥（备用）

## 故障排除

### 常见问题

1. **API连接失败**
   - 检查JeecgBoot服务是否正常运行
   - 验证API地址和端口是否正确
   - 确认网络连接和防火墙设置

2. **认证失败**
   - 检查API令牌是否有效
   - 确认令牌权限是否足够
   - 验证令牌格式是否正确

3. **数据格式错误**
   - 检查数据模型映射是否正确
   - 确认字段类型是否匹配
   - 验证必填字段是否完整

4. **CORS错误**
   - 在JeecgBoot中配置CORS策略
   - 确认允许的域名和端口
   - 检查请求头设置

### 调试技巧

1. **查看网络请求**
   - 使用浏览器开发者工具查看网络请求
   - 检查请求和响应的详细信息

2. **日志输出**
   - 在控制台查看API调用的日志
   - 检查错误信息和堆栈跟踪

3. **数据源状态**
   - 在管理后台查看数据源配置状态
   - 确认当前使用的数据源

## 扩展开发

### 添加新的数据模型

1. 在 `jeecgApi.ts` 中定义新的类型和接口
2. 在 `dataAdapter.ts` 中添加数据转换逻辑
3. 创建对应的服务类
4. 更新API文档

### 自定义API端点

1. 在 `JeecgApiService` 中添加新的方法
2. 在数据适配器中添加对应的处理逻辑
3. 更新类型定义和文档

### 添加新的数据源

1. 创建新的API服务类
2. 在数据适配器中添加新的数据源支持
3. 更新数据源配置组件
4. 添加相应的类型定义

## 联系支持

如果在集成过程中遇到问题，请：

1. 查看本文档的故障排除部分
2. 检查API文档中的详细说明
3. 查看控制台错误信息
4. 联系开发团队获取支持

---

**注意**: 本文档会随着功能更新而持续维护，请确保使用最新版本。 