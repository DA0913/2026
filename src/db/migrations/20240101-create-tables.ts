import { sequelize } from '../../lib/mysql';
import FormSubmission from '../../models/FormSubmission';
import CustomerCase from '../../models/CustomerCase';
// 导入其他模型...

const runMigrations = async () => {
  try {
    // 同步所有模型
    await sequelize.sync({ force: false }); // force: false 不会删除现有表
    console.log('数据库迁移完成');
  } catch (error) {
    console.error('数据库迁移失败:', error);
  }
};

runMigrations();