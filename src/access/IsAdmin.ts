import { Access, FieldAccess } from 'payload'

export const IsAdminFieldLevel: FieldAccess = ({ req: { user } }) => {
  return Boolean(user?.roles.includes('admin'))
}

export const IsAdmin: Access = ({ req: { user } }) => {
  return Boolean(user?.roles.includes('admin'))
}
