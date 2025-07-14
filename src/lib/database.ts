import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// 初始化数据库连接
const sequelize = new Sequelize(
  process.env.VITE_MYSQL_DATABASE || '',
  process.env.VITE_MYSQL_USER || '',
  process.env.VITE_MYSQL_PASSWORD || '',
  {
    host: process.env.VITE_MYSQL_HOST || 'localhost',
    port: parseInt(process.env.VITE_MYSQL_PORT || '3306'),
    dialect: 'mysql'
  }
);

// 定义用户模型
const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'admin'
  }
});

// 认证函数实现
export const authenticate = async (email: string, password: string) => {
  try {
    // 验证数据库连接
    await sequelize.authenticate();
    
    // 查询用户
    const user = await User.findOne({
      where: { email }
    });
    
    if (!user) {
      return { success: false, error: '用户不存在' };
    }
    
    // 这里应该有密码验证逻辑（实际项目中应使用bcrypt等工具）
    if (user.password !== password) {
      return { success: false, error: '密码错误' };
    }
    
    return { success: true, user: { id: user.id, email: user.email, role: user.role } };
  } catch (error) {
    console.error('认证错误:', error);
    return { success: false, error: '数据库连接失败' };
  }
};

export default sequelize;