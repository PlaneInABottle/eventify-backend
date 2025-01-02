import { IsAdmin, IsAdminFieldLevel } from '@/access/IsAdmin'
import { isAdminOrSelf } from '@/access/IsAdminOrSelf'
import {
  uploadProfilePictureHandler,
  deleteProfilePictureHandler,
} from '@/endpoints/users/profilePicture'
import { toggleFavoriteEventHandler } from '@/endpoints/users/toggleFavoriteEvent'
import { signUpHandler } from '@/endpoints/users/signUp'
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    create: IsAdmin,

    update: isAdminOrSelf,
    delete: isAdminOrSelf,
  },
  admin: {
    useAsTitle: 'email',
    baseListFilter: ({ req: { user } }) => {
      if (user?.roles.includes('admin')) return null
      return {
        id: {
          equals: user?.id,
        },
      }
    },
  },
  auth: true,
  endpoints: [
    {
      path: '/profile-picture',
      method: 'post',
      handler: uploadProfilePictureHandler,
    },
    {
      path: '/profile-picture',
      method: 'delete',
      handler: deleteProfilePictureHandler,
    },
    {
      path: '/toggle-favorite-event/:eventId',
      method: 'post',
      handler: toggleFavoriteEventHandler,
    },
    {
      path: '/sign-up',
      method: 'post',
      handler: signUpHandler,
    },
  ],
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'age',
      type: 'number',
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'roles',
      type: 'select',
      required: true,
      saveToJWT: true,
      defaultValue: 'user',
      options: ['admin', 'organizer', 'user'],
      access: {
        create: IsAdminFieldLevel,
        update: IsAdminFieldLevel,
      },
    },
    {
      name: 'profilePicture',
      type: 'relationship',
      relationTo: 'media',
      hasMany: false,
      filterOptions: ({ user }) => {
        if (user?.roles?.includes('admin')) return true

        return {
          uploadedBy: {
            equals: user?.id,
          },
        }
      },
      admin: {
        description: 'Choose a profile picture from your uploaded media',
      },
    },
    {
      name: 'favoriteEvents',
      type: 'relationship',
      relationTo: 'events',
      hasMany: true,
      admin: {
        description: 'Events that the user has saved/favorited',
        position: 'sidebar',
      },
    },
    {
      name: 'participatingChats',
      type: 'join',
      collection: 'event-chats',
      on: 'participants',
      access: {
        read: ({ req: { user }, id }) => {
          if (user?.roles?.includes('admin')) return true
          return id === user?.id
        },
      },
    },
  ],
}
