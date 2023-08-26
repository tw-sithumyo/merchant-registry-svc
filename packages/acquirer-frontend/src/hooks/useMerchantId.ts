import { useEffect, useState } from 'react'

export default function useMerchantId() {
  const [merchantId, setMerchantId] = useState<string | null>(null)

  useEffect(() => {
    const merchantId = sessionStorage.getItem('merchantId')
    if (!merchantId) return

    setMerchantId(merchantId)
  }, [])

  return merchantId
}
