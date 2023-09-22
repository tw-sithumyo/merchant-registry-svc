import { useQuery } from '@tanstack/react-query'

import type { AuditLogsFilterForm } from '@/lib/validations/auditLogsFilter'
import { FALLBACK_ERROR_MESSAGE } from '@/constants/errorMessage'
import { getAuditLogs } from '../auditLogs'

export function useAuditLogs(params: AuditLogsFilterForm) {
  return useQuery({
    queryKey: ['audits', params],
    queryFn: () => getAuditLogs(params),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Audit Logs Failed!',
      toastDescription: FALLBACK_ERROR_MESSAGE,
    },
  })
}
