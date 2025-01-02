import { addDataAndFileToRequest } from '@payloadcms/next/utilities'
import { NextResponse } from 'next/server'
import type { PayloadRequest } from 'payload'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const signUpHandler = async (req: PayloadRequest): Promise<Response> => {
  await addDataAndFileToRequest(req)
  const { payload } = req
  try {
    if (!req.data) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 })
    }
    const { email, password } = req.data
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    // TODO: Add password validation
    if (password.length < 2) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Create user with default role as 'user'
    const user = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        name: 'New User',
        roles: 'user', // Default role as defined in Users collection
      },
    })

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          roles: user.roles,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create user'
    payload.logger.error(message)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
