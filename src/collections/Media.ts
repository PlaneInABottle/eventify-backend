import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: ({ req: { user } }) => {
      return true
    },
    read: ({ req: { user } }) => {
      if (user?.roles.includes('admin')) return true
      // if (!!user) {
      //   return {
      //     uploadedBy: {
      //       equals: user?.id,
      //     },
      //   }
      // }
      return true
    },
    update: ({ req: { user } }) => {
      if (user?.roles.includes('admin')) return true
      if (!!user) {
        return {
          uploadedBy: {
            equals: user?.id,
          },
        }
      }
      return false
    },
    delete: ({ req: { user } }) => {
      if (user?.roles.includes('admin')) return true
      if (!!user) {
        return {
          uploadedBy: {
            equals: user?.id,
          },
        }
      }
      return false
    },
  },
  admin: {
    baseListFilter: ({ req: { user } }) => {
      if (user?.roles.includes('admin')) return null
      return {
        uploadedBy: {
          equals: user?.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      defaultValue: ({ user }) => user?.id,
      admin: {
        hidden: true,
      },
    },
  ],
  upload: true,
}
