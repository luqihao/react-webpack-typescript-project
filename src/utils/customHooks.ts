import { useContext } from 'react'
import { RootContext } from '@components/common/RootProvider'

/**
 * 提供整个store
 *
 * @export
 * @returns
 */
export function useRootStore() {
	return useContext(RootContext)
}
