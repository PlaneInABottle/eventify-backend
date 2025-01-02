import { headers as getHeaders } from 'next/headers'
import { Payload } from 'payload'
import { PigeonMapFieldComponentsClient } from './Field.client'

export const PigeonMapFieldComponents: React.FC<{
  path: string
  readOnly: boolean
  payload: Payload
}> = async (args) => {
  const headers = await getHeaders()
  const { user } = await args.payload.auth({ headers })

  if (user && (user.roles.includes('organizer') || user.roles.includes('admin'))) {
    return (
      <PigeonMapFieldComponentsClient
        path={args.path}
        readOnly={args.readOnly}
        initialValue={[39.928033577, 32.858998868]}
      />
    )
  }

  return null
}
