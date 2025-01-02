import { CollectionConfig, Where } from 'payload'
import { toggleParticipantHandler } from '../endpoints/event-chats/toggleParticipant'

export const EventChats: CollectionConfig = {
  slug: 'event-chats',
  access: {
    create: ({ req: { user } }) => {
      // Checks at the beginning, don't check event etc can't see
      if (user?.roles.includes('admin') || user?.roles.includes('organizer')) return true
      return false
    },
    read: ({ req: { user } }) => {
      // This is differen
      if (user?.roles.includes('admin')) return true
      if (user?.roles.includes('organizer')) {
        return {
          'event.organizer': {
            equals: user?.id,
          },
        }
      }
      return true
    },
    update: ({ req: { user } }) => {
      // Allow admins full update access
      if (user?.roles.includes('admin')) return true

      // Allow organizers to update their own event chats
      if (user?.roles.includes('organizer')) {
        return {
          'event.organizer': {
            equals: user?.id,
          },
        }
      }

      // For regular users, only allow updates through the toggle-participation endpoint
      // This is handled by the endpoint's handler, so we can deny direct updates
      return false
    },
    delete: ({ req: { user } }) => {
      if (user?.roles.includes('admin')) return true
      if (user?.roles.includes('organizer')) {
        return {
          'event.organizer': {
            equals: user?.id,
          },
        }
      }
      return false
    },
  },
  endpoints: [
    {
      path: '/:chatId/toggle-participation',
      method: 'post',
      handler: toggleParticipantHandler,
    },
  ],
  fields: [
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      hasMany: false,
      required: true,
      unique: true,
      filterOptions: ({ user }) => {
        if (user?.roles?.includes('admin')) return true
        if (user?.roles?.includes('organizer')) {
          return {
            and: [
              {
                hasChat: {
                  equals: true,
                },
              },
              {
                organizer: {
                  equals: user?.id,
                },
              },
            ],
          } as Where
        }
        return true
      },
    },
    {
      name: 'participants',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Participants in the chat, you can only remove participants',
      },
      filterOptions: ({ user, data }) => {
        console.log(data, user)
        if (user?.roles?.includes('admin')) return true
        if (user?.roles?.includes('organizer')) {
          return {
            or: [
              {
                id: {
                  equals: user?.id,
                },
              },
              {
                id: {
                  in: data?.participants,
                },
              },
            ],
          }
        }
        return true
      },
      hasMany: true,
    },
  ],
}
