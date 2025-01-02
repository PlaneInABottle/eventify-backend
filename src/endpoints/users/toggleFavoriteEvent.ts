import { PayloadHandler, PayloadRequest } from 'payload'

export const toggleFavoriteEventHandler: PayloadHandler = async (
  req: PayloadRequest,
): Promise<Response> => {
  const { payload, user } = req
  try {
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const eventId = req.routeParams?.eventId as string

    // Extract IDs from favoriteEvents, handling both ID strings and populated objects
    const currentFavorites = (user.favoriteEvents || []).map((event) =>
      typeof event === 'string' ? event : event.id,
    )

    // Toggle logic: remove if exists, add if doesn't exist
    let updatedFavorites: string[]
    let message: string

    if (currentFavorites.includes(eventId)) {
      // Remove the event if it exists
      updatedFavorites = currentFavorites.filter((id) => id !== eventId)
      message = 'Event removed from favorites successfully'
    } else {
      // Add the event if it doesn't exist
      updatedFavorites = [...currentFavorites, eventId]
      message = 'Event added to favorites successfully'
    }

    // Update user with new favorites
    await req.payload.update({
      collection: 'users',
      id: user.id,
      user: user,
      data: {
        favoriteEvents: updatedFavorites,
      },
    })

    return Response.json({
      message,
      favoriteEvents: updatedFavorites,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to toggle favorite event'
    payload.logger.error(message)
    return Response.json({ error: message }, { status: 500 })
  }
}
