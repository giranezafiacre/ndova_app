import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ServiceAttributes {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ServiceCreationAttributes
  extends Optional<
    ServiceAttributes,
    'id' | 'description' | 'isActive' | 'createdAt' | 'updatedAt'
  > {}

export class Service
  extends Model<ServiceAttributes, ServiceCreationAttributes>
  implements ServiceAttributes
{
  declare id: string;
  declare name: string;
  declare description: string | null | undefined;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Service.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'services',
    timestamps: true,
  }
);
