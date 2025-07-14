# JeecgBoot API 接口文档

本文档描述了前端网站与JeecgBoot后端的数据接口规范。

## 基础配置

### 环境变量
```bash
# JeecgBoot API 基础URL
VITE_JEECG_API_BASE_URL=http://localhost:8080/jeecg-boot

# JeecgBoot API 访问令牌
VITE_JEECG_API_TOKEN=your_jeecg_api_token

# 默认数据源
VITE_DEFAULT_DATA_SOURCE=jeecg
```

### 请求头
所有API请求都需要包含以下请求头：
```
Content-Type: application/json
X-Access-Token: {your_api_token}
```

### 响应格式
所有API响应都遵循以下格式：
```json
{
  "success": true,
  "message": "操作成功",
  "code": 200,
  "result": {},
  "timestamp": 1640995200000
}
```

## 用户管理接口

### 用户登录
- **URL**: `POST /sys/login`
- **参数**:
  ```json
  {
    "username": "admin",
    "password": "123456"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "登录成功",
    "code": 200,
    "result": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "userInfo": {
        "id": "1",
        "username": "admin",
        "realname": "管理员",
        "avatar": "https://example.com/avatar.jpg",
        "email": "admin@example.com",
        "phone": "13800138000",
        "status": 1,
        "createTime": "2024-01-01T00:00:00Z",
        "updateTime": "2024-01-01T00:00:00Z"
      }
    }
  }
  ```

### 获取用户信息
- **URL**: `GET /sys/user/getUserInfo`
- **响应**: 返回当前登录用户信息

### 用户登出
- **URL**: `POST /sys/logout`
- **响应**: 登出成功

## 表单提交管理接口

### 获取表单提交列表
- **URL**: `GET /form/submission/list`
- **参数**:
  ```
  pageNo=1&pageSize=10&column=createTime&order=desc
  ```
- **响应**:
  ```json
  {
    "success": true,
    "result": {
      "records": [
        {
          "id": "1",
          "companyName": "示例公司",
          "userName": "张三",
          "phone": "13800138000",
          "companyTypes": "制造业,贸易",
          "sourceUrl": "https://example.com",
          "status": "pending",
          "notes": "备注信息",
          "createTime": "2024-01-01T00:00:00Z",
          "updateTime": "2024-01-01T00:00:00Z"
        }
      ],
      "total": 100,
      "size": 10,
      "current": 1,
      "pages": 10
    }
  }
  ```

### 创建表单提交
- **URL**: `POST /form/submission/add`
- **参数**:
  ```json
  {
    "companyName": "示例公司",
    "userName": "张三",
    "phone": "13800138000",
    "companyTypes": "制造业,贸易",
    "sourceUrl": "https://example.com",
    "status": "pending",
    "notes": "备注信息"
  }
  ```

### 更新表单提交
- **URL**: `PUT /form/submission/edit/{id}`
- **参数**: 同创建接口

### 删除表单提交
- **URL**: `DELETE /form/submission/delete/{id}`

### 批量删除表单提交
- **URL**: `POST /form/submission/deleteBatch`
- **参数**:
  ```json
  {
    "ids": ["1", "2", "3"]
  }
  ```

## 新闻文章管理接口

### 获取新闻文章列表
- **URL**: `GET /news/article/list`
- **参数**: 同表单提交列表
- **响应**:
  ```json
  {
    "success": true,
    "result": {
      "records": [
        {
          "id": "1",
          "title": "新闻标题",
          "category": "行业动态",
          "publishTime": "2024-01-01T00:00:00Z",
          "imageUrl": "https://example.com/image.jpg",
          "summary": "新闻摘要",
          "content": "新闻内容",
          "views": 100,
          "isFeatured": true,
          "createTime": "2024-01-01T00:00:00Z",
          "updateTime": "2024-01-01T00:00:00Z"
        }
      ],
      "total": 50,
      "size": 10,
      "current": 1,
      "pages": 5
    }
  }
  ```

### 获取新闻文章详情
- **URL**: `GET /news/article/queryById/{id}`

### 创建新闻文章
- **URL**: `POST /news/article/add`
- **参数**:
  ```json
  {
    "title": "新闻标题",
    "category": "行业动态",
    "publishTime": "2024-01-01T00:00:00Z",
    "imageUrl": "https://example.com/image.jpg",
    "summary": "新闻摘要",
    "content": "新闻内容",
    "views": 0,
    "isFeatured": false
  }
  ```

### 更新新闻文章
- **URL**: `PUT /news/article/edit/{id}`

### 删除新闻文章
- **URL**: `DELETE /news/article/delete/{id}`

### 获取特色新闻
- **URL**: `GET /news/article/featured`
- **参数**: `limit=5`

## 客户案例管理接口

### 获取客户案例列表
- **URL**: `GET /customer/case/list`
- **响应**:
  ```json
  {
    "success": true,
    "result": {
      "records": [
        {
          "id": "1",
          "companyName": "客户公司",
          "companyLogo": "https://example.com/logo.png",
          "industry": "制造业",
          "description": "案例描述",
          "results": "实施结果",
          "metrics": "{\"revenue\": 1000000, \"efficiency\": 0.8}",
          "isFeatured": true,
          "sortOrder": 1,
          "status": "active",
          "createTime": "2024-01-01T00:00:00Z",
          "updateTime": "2024-01-01T00:00:00Z"
        }
      ]
    }
  }
  ```

### 获取客户案例详情
- **URL**: `GET /customer/case/queryById/{id}`

### 创建客户案例
- **URL**: `POST /customer/case/add`
- **参数**:
  ```json
  {
    "companyName": "客户公司",
    "companyLogo": "https://example.com/logo.png",
    "industry": "制造业",
    "description": "案例描述",
    "results": "实施结果",
    "metrics": "{\"revenue\": 1000000, \"efficiency\": 0.8}",
    "isFeatured": true,
    "sortOrder": 1,
    "status": "active"
  }
  ```

### 更新客户案例
- **URL**: `PUT /customer/case/edit/{id}`

### 删除客户案例
- **URL**: `DELETE /customer/case/delete/{id}`

### 获取特色案例
- **URL**: `GET /customer/case/featured`
- **参数**: `limit=6`

## 案例配置管理接口

### 获取案例配置列表
- **URL**: `GET /case/config/list`
- **响应**:
  ```json
  {
    "success": true,
    "result": {
      "records": [
        {
          "id": "1",
          "title": "配置标题",
          "subtitle": "配置副标题",
          "description": "配置描述",
          "companyName": "公司名称",
          "companyLogo": "https://example.com/logo.png",
          "stockCode": "000001",
          "imageUrl": "https://example.com/image.jpg",
          "linkUrl": "https://example.com",
          "isActive": true,
          "sortOrder": 1,
          "createTime": "2024-01-01T00:00:00Z",
          "updateTime": "2024-01-01T00:00:00Z"
        }
      ]
    }
  }
  ```

### 创建案例配置
- **URL**: `POST /case/config/add`

### 更新案例配置
- **URL**: `PUT /case/config/edit/{id}`

### 删除案例配置
- **URL**: `DELETE /case/config/delete/{id}`

## 文件上传管理接口

### 上传文件
- **URL**: `POST /sys/common/upload`
- **Content-Type**: `multipart/form-data`
- **参数**: `file` (文件对象)
- **响应**:
  ```json
  {
    "success": true,
    "result": {
      "id": "file_id",
      "fileName": "example.jpg",
      "fileUrl": "https://example.com/files/example.jpg",
      "fileSize": 1024000,
      "fileType": "image/jpeg",
      "createTime": "2024-01-01T00:00:00Z"
    }
  }
  ```

### 删除文件
- **URL**: `DELETE /sys/common/deleteFile/{fileId}`

## 系统配置管理接口

### 获取系统配置列表
- **URL**: `GET /sys/config/list`

### 获取单个配置
- **URL**: `GET /sys/config/queryByKey/{key}`

### 更新系统配置
- **URL**: `PUT /sys/config/updateByKey/{key}`
- **参数**:
  ```json
  {
    "configValue": "新的配置值"
  }
  ```

## 数据统计接口

### 获取表单提交统计
- **URL**: `GET /form/submission/stats`
- **响应**:
  ```json
  {
    "success": true,
    "result": {
      "total": 100,
      "pending": 20,
      "processing": 30,
      "completed": 40,
      "invalid": 10
    }
  }
  ```

### 获取新闻文章统计
- **URL**: `GET /news/article/stats`
- **响应**:
  ```json
  {
    "success": true,
    "result": {
      "total": 50,
      "featured": 10,
      "published": 40,
      "draft": 10
    }
  }
  ```

### 获取客户案例统计
- **URL**: `GET /customer/case/stats`
- **响应**:
  ```json
  {
    "success": true,
    "result": {
      "total": 30,
      "featured": 6,
      "active": 25,
      "inactive": 5
    }
  }
  ```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 使用示例

### 前端调用示例

```typescript
import { FormSubmissionService } from '../lib/dataAdapter';

// 获取表单提交列表
const getFormSubmissions = async () => {
  try {
    const response = await FormSubmissionService.getFormSubmissions({
      pageNo: 1,
      pageSize: 10,
      column: 'createTime',
      order: 'desc'
    });
    
    if (response.success) {
      console.log('表单提交列表:', response.result.records);
    }
  } catch (error) {
    console.error('获取表单提交失败:', error);
  }
};

// 创建表单提交
const createFormSubmission = async (data: any) => {
  try {
    const response = await FormSubmissionService.createFormSubmission(data);
    
    if (response.success) {
      console.log('创建成功:', response.result);
    }
  } catch (error) {
    console.error('创建失败:', error);
  }
};
```

### 数据源切换

```typescript
import { setDataSource } from '../lib/dataAdapter';

// 切换到JeecgBoot数据源
setDataSource('jeecg');

// 切换到Supabase数据源
setDataSource('supabase');
```

## 注意事项

1. **认证**: 所有API请求都需要有效的访问令牌
2. **分页**: 列表接口支持分页查询，默认每页10条记录
3. **文件上传**: 支持图片、文档等多种文件格式
4. **数据格式**: 日期时间使用ISO 8601格式
5. **错误处理**: 建议在前端实现统一的错误处理机制
6. **缓存**: 可以根据需要实现数据缓存机制
7. **权限**: 不同用户角色可能有不同的访问权限

## 部署说明

1. 确保JeecgBoot后端服务正常运行
2. 配置正确的API基础URL和访问令牌
3. 设置环境变量 `VITE_DEFAULT_DATA_SOURCE=jeecg`
4. 测试所有接口的连接性
5. 配置CORS策略（如果需要）
6. 设置适当的请求超时时间 