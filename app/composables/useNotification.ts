export const useNotification = () => {
	const toast = useToast()

	return {
		success: (title: string, description?: string) => {
			toast.add({
				title,
				description,
				color: 'success'
			})
		},
		error: (title: string, description?: string) => {
			toast.add({
				title,
				description,
				color: 'error'
			})
		},
		info: (title: string, description?: string) => {
			toast.add({
				title,
				description,
				color: 'primary'
			})
		},
		warning: (title: string, description?: string) => {
			toast.add({
				title,
				description,
				color: 'warning'
			})
		}
	}
}
