import type { WorkflowOnlineUser, WorkflowOnlineUsersResponse } from '@/models/app'
import { useQuery } from '@tanstack/react-query'
import { consoleQuery } from '@/service/client'

type WorkflowOnlineUsersMap = Record<string, WorkflowOnlineUser[]>

type UseWorkflowOnlineUsersParams = {
  appIds: string[]
  enabled: boolean
}

const normalizeWorkflowOnlineUsers = (response?: WorkflowOnlineUsersResponse): WorkflowOnlineUsersMap => {
  const data = response?.data

  if (!data)
    return {}

  if (Array.isArray(data)) {
    return data.reduce<WorkflowOnlineUsersMap>((acc, item) => {
      if (item?.app_id)
        acc[item.app_id] = item.users || []
      return acc
    }, {})
  }

  return Object.entries(data).reduce<WorkflowOnlineUsersMap>((acc, [appId, users]) => {
    if (appId)
      acc[appId] = users || []
    return acc
  }, {})
}

export const useWorkflowOnlineUsers = ({
  appIds,
  enabled,
}: UseWorkflowOnlineUsersParams) => {
  const shouldFetch = enabled && appIds.length > 0
  const queryOptions = shouldFetch
    ? consoleQuery.apps.workflowOnlineUsers.queryOptions({
        input: { body: { app_ids: appIds } },
        select: normalizeWorkflowOnlineUsers,
        refetchInterval: 10000,
      })
    : {
        queryKey: ['console', 'apps', 'workflowOnlineUsers', 'disabled'],
        queryFn: async () => ({}),
        enabled: false,
        select: () => ({} as WorkflowOnlineUsersMap),
      }

  const { data: onlineUsersMap = {} } = useQuery(queryOptions)

  return {
    onlineUsersMap,
  }
}
