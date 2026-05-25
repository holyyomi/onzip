import { useState } from 'react'
import ChecklistTab from '../life/ChecklistTab'

interface Props {
  externalRefreshKey: number
}

export default function LifePage({ externalRefreshKey }: Props) {
  const [refreshKey, setRefreshKey] = useState(0)
  const onRefresh = () => setRefreshKey((key) => key + 1)

  return (
    <ChecklistTab
      refreshKey={refreshKey + externalRefreshKey}
      onRefresh={onRefresh}
    />
  )
}
