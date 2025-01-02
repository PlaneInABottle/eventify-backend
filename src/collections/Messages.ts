import { CollectionConfig, PayloadRequest } from 'payload'

interface Participant {
  id: string
}

export const Messages: CollectionConfig = {
  slug: 'messages',
  access: {
    create: async ({ req, data }) => {
      const { user, payload } = req
      if (!user) return false

      // If user is admin, allow creating messages
      if (user.roles?.includes('admin')) return true

      // For regular users, check if they are a participant of the chat
      const chatId = data?.chat

      if (!chatId) return false

      try {
        const chat = await payload.findByID({
          collection: 'event-chats',
          id: chatId,
        })

        if (!chat) return false

        // Check if user is a participant
        const participants = chat.participants || []
        const participantIds = participants.map((participant: string | Participant) =>
          typeof participant === 'string' ? participant : participant.id,
        )

        return participantIds.includes(user.id)
      } catch (error) {
        payload.logger.error('Error checking chat participation:', error)
        return false
      }
    },
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          const cookies = req.headers.get('cookie')
          const payloadToken = cookies
            ?.split(';')
            .find((cookie) => cookie.trim().startsWith('payload-token='))
            ?.split('=')[1]

          try {
            // Prepare the message data for socket broadcast
            const messageData = {
              event: 'receiveMessage',
              data: doc.message,
              room: doc.chat.id, // Using the chat field as the room
              // TODO: Add sendeR IMAGE
            }

            // Make request to socket server
            const socketResponse = await fetch(process.env.SOCKET_SERVER_URL + '/api/broadcast', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${payloadToken}`,
              },
              body: JSON.stringify(messageData),
            })

            if (!socketResponse.ok) {
              req.payload.logger.error(`Error broadcasting message: ${socketResponse.statusText}`)
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to broadcast message'
            req.payload.logger.error(`Error broadcasting message: ${message}`)
          }
        }
      },
    ],
  },
  admin: {
    useAsTitle: 'message',
  },
  fields: [
    {
      name: 'sender',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
      required: true,
      defaultValue: ({ user }) => user?.id,
      hidden: true,
    },
    {
      // TODO: Make this field content group with media and text, validate that one of them is present
      name: 'message',
      type: 'text',
      required: true,
    },
    {
      name: 'chat',
      type: 'relationship',
      relationTo: 'event-chats',
      hasMany: false,
      required: true,
    },
  ],
}
