import { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  access: {
    // Users can read but can't create, organizers can create but can't read other organizers events
    create: ({ req: { user } }) => {
      if (user?.roles.includes('admin')) return true
      if (user?.roles.includes('organizer')) return true
      return false
    },
    read: ({ req: { user } }) => {
      if (user?.roles.includes('admin')) return true
      if (user?.roles.includes('organizer')) {
        return {
          organizer: {
            equals: user?.id,
          },
        }
      }
      return true
    },
    update: ({ req: { user } }) => {
      if (user?.roles.includes('admin')) return true
      if (user?.roles.includes('organizer')) {
        return {
          organizer: {
            equals: user?.id,
          },
        }
      }
      return false
    },
    delete: ({ req: { user } }) => {
      if (user?.roles.includes('admin')) return true
      if (user?.roles.includes('organizer')) {
        return {
          organizer: {
            equals: user?.id,
          },
        }
      }
      return false
    },
  },
  admin: {
    useAsTitle: 'name',
    baseListFilter: ({ req: { user, payload } }) => {
      if (user?.roles.includes('admin')) return null
      return {
        organizer: {
          equals: user?.id,
        },
      }
    },
  },
  //   TODO: Add media
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'locations',
      hasMany: false,
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
    },
    {
      name: 'date',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      required: true,
    },
    {
      name: 'organizer',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
      required: true,
      defaultValue: ({ user }) => user?.id,
    },
    {
      name: 'media',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'hasChat',
      type: 'checkbox',
      required: false,
      defaultValue: false,
    },
  ],
}
