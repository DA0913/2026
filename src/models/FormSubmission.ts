import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../lib/mysql';

class FormSubmission extends Model {
  public id!: string;
  public company_name!: string;
  public user_name!: string;
  public phone!: string;
  public company_types!: string[];
  public source_url!: string;
  public status!: 'pending' | 'processing' | 'completed' | 'invalid';
  public notes?: string;
  public created_at!: Date;
  public updated_at!: Date;
}

FormSubmission.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  company_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  company_types: {
    type: DataTypes.JSON,
    allowNull: false
  },
  source_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'invalid'),
    defaultValue: 'pending'
  },
  notes: DataTypes.TEXT,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'form_submissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default FormSubmission;