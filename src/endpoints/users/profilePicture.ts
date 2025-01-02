import { PayloadHandler, PayloadRequest } from 'payload'
import { addDataAndFileToRequest } from '@payloadcms/next/utilities'

export const uploadProfilePictureHandler: PayloadHandler = async (
  req: PayloadRequest,
): Promise<Response> => {
  const { payload, user } = req
  try {
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Delete old profile picture if it exists
    if (user.profilePicture) {
      await payload.delete({
        collection: 'media',
        id: typeof user.profilePicture === 'string' ? user.profilePicture : user.profilePicture.id,
      })
    }

    // Add file data to request
    await addDataAndFileToRequest(req)
    const { file } = req

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Upload the file to media collection
    const media = await req.payload.create({
      collection: 'media',
      data: {
        alt: `Profile picture for user ${user.id}`,
        uploadedBy: user.id,
      },
      file,
    })

    // Update user's profile picture
    await req.payload.update({
      collection: 'users',
      id: user.id,
      data: {
        profilePicture: media.id,
      },
      user: user,
    })

    return new Response(
      JSON.stringify({
        message: 'Profile picture updated successfully',
        media,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload profile picture'
    payload.logger.error(message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const deleteProfilePictureHandler: PayloadHandler = async (
  req: PayloadRequest,
): Promise<Response> => {
  const { payload, user } = req
  try {
    // Get the current user from the request
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get the user's current profile picture
    const userData = await req.payload.findByID({
      collection: 'users',
      id: user.id,
    })

    if (userData.profilePicture) {
      // Delete the media file
      await req.payload.delete({
        collection: 'media',
        id: userData.profilePicture as string,
      })
    }

    // Remove the profile picture reference from user
    await req.payload.update({
      collection: 'users',
      id: user.id,
      data: {
        profilePicture: null,
      },
    })

    return new Response(JSON.stringify({ message: 'Profile picture removed successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to remove profile picture'
    payload.logger.error(message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
