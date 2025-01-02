import { PayloadHandler, PayloadRequest } from 'payload'

export const toggleParticipantHandler: PayloadHandler = async (
  req: PayloadRequest,
): Promise<Response> => {
  const { payload, user } = req
  try {
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chatId = req.routeParams?.chatId as string

    if (!chatId) {
      return Response.json({ error: 'Chat ID is required' }, { status: 400 })
    }

    // Get the current chat with populated event
    const chat = await payload.findByID({
      collection: 'event-chats',
      id: chatId,
      depth: 1,
    })

    if (!chat) {
      return Response.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Get current participants
    const currentParticipants = (chat.participants || []).map((participant) =>
      typeof participant === 'string' ? participant : participant.id,
    )

    let updatedParticipants: string[]
    let message: string

    // Toggle participation
    if (currentParticipants.includes(user.id)) {
      // Remove user if they're already a participant
      updatedParticipants = currentParticipants.filter((id) => id !== user.id)
      message = 'Successfully left the chat'
    } else {
      // Add user if they're not a participant
      updatedParticipants = [...currentParticipants, user.id]
      message = 'Successfully joined the chat'
    }

    // Update the chat with new participants
    // Use overrideAccess: true to bypass access control for this specific operation
    await payload.update({
      collection: 'event-chats',
      id: chatId,
      data: {
        participants: updatedParticipants,
      },
      overrideAccess: true, // This allows the update to bypass access control
    })

    return Response.json({
      message,
      participants: updatedParticipants,
      isParticipant: !currentParticipants.includes(user.id), // Return the new participation status
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to toggle chat participation'
    payload.logger.error(message)
    return Response.json({ error: message }, { status: 500 })
  }
}
