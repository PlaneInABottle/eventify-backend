import { CollectionConfig } from 'payload'

export const Locations: CollectionConfig = {
  slug: 'locations',
  access: {
    create: ({ req: { user } }) => {
      /*
      Admins and organizers can create
      Users can't create
      */
      if (user?.roles.includes('admin')) return true
      if (user?.roles.includes('organizer')) return true
      return false
    },
    read: ({ req: { user } }) => {
      /*
      Admin can read all
      Organizer can read their own
      User can read all from api, for event data this needs to be stay readable
      */
      if (user?.roles.includes('admin')) return true
      if (user?.roles.includes('organizer')) {
        return {
          owner: {
            equals: user?.id,
          },
        }
      }
      return true
    },
    update: ({ req: { user } }) => {
      /*
      Admin can update all
      Organizer can update their own
      users can't update
      */
      if (user?.roles.includes('admin')) return true
      if (user?.roles.includes('organizer')) {
        return {
          owner: {
            equals: user?.id,
          },
        }
      }
      return false
    },

    delete: ({ req: { user } }) => {
      /*
      Admins can delete all
      Organizers can delete their own
      Users can't delete
      */
      if (user?.roles.includes('admin')) return true
      if (user?.roles.includes('organizer')) {
        return {
          owner: {
            equals: user?.id,
          },
        }
      }
      return false
    },
  },
  admin: {
    useAsTitle: 'name',
    hidden({ user }) {
      // Hide it in the admin ui, can be seen from api
      return Boolean(user?.roles.includes('user'))
    },
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'address',
      type: 'text',
      required: true,
    },

    {
      name: 'location',
      type: 'point',
      required: true,
      admin: {
        components: {
          Field: '@/components/PigeonMap/Field#PigeonMapFieldComponents',
        },
      },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      hidden: true,
      hasMany: false,
      defaultValue: ({ user }) => user?.id,
    },
  ],
}
