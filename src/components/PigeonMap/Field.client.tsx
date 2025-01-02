'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import { Marker, Map, Point } from 'pigeon-maps'

type Props = {
  initialValue?: [number, number]
  path: string
  readOnly: boolean
}

export const PigeonMapFieldComponentsClient: React.FC<Props> = ({
  initialValue,
  path,
  readOnly,
}) => {
  const { formInitializing, setValue, value } = useField<[number, number]>({ path })
  const hasSetInitialValue = React.useRef(false)

  React.useEffect(() => {
    if (!hasSetInitialValue.current && !formInitializing && initialValue && !value) {
      setValue([initialValue[1], initialValue[0]])
      hasSetInitialValue.current = true
    }
  }, [initialValue, setValue, formInitializing, value])

  const displayPoint: Point = value ? [value[1], value[0]] : [0, 0]

  return (
    <Map
      height={300}
      defaultZoom={15}
      center={displayPoint}
      onBoundsChanged={({ center }) => {
        setValue([center[1], center[0]])
      }}
    >
      <Marker width={50} anchor={displayPoint} />
    </Map>
  )
}
