import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ProviderServiceAttributes {
  id: string;
  serviceId: string;
  providerId: string;
  location: string;
  description: string;
  stars: number;
  durationMinutes: number;
  imageUrl?: string | null;
  meetingLink?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProviderServiceCreationAttributes
  extends Optional<
    ProviderServiceAttributes,
    'id' | 'stars' | 'imageUrl' | 'meetingLink' | 'createdAt' | 'updatedAt'
  > {}

export class ProviderService
  extends Model<ProviderServiceAttributes, ProviderServiceCreationAttributes>
  implements ProviderServiceAttributes
{
  declare id: string;
  declare serviceId: string;
  declare providerId: string;
  declare location: string;
  declare description: string;
  declare stars: number;
  declare durationMinutes: number;
  declare imageUrl: string | null | undefined;
  declare meetingLink: string | null | undefined;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ProviderService.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    serviceId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    providerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    stars: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0, max: 5 },
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    meetingLink: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'provider_service',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['serviceId', 'providerId'],
      },
    ],
  }
);
