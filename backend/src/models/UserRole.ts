import { Model, DataTypes, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface UserRoleAttributes {
  id: string;
  userId: string;
  roleId: string;
  createdAt?: Date;
}

export interface UserRoleCreationAttributes extends Optional<
  UserRoleAttributes,
  "id" | "createdAt"
> {}

export class UserRole
  extends Model<UserRoleAttributes, UserRoleCreationAttributes>
  implements UserRoleAttributes
{
  declare id: string;
  declare userId: string;
  declare roleId: string;
  declare readonly createdAt: Date;
}

UserRole.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "user_roles",
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ["userId", "roleId"],
      },
    ],
  },
);
