import { useAuthContext } from "./useAuthContext"
import { usePostsContext } from "./usePostsContext"

export const useLogout = () => {
    const { dispatch } = useAuthContext()
    const { dispatch: workoutsDispatch } = usePostsContext()

    const logout = () => {
        // Remove user from storage
        localStorage.removeItem('user')

        // Dispatch logout action
        dispatch({type: 'LOGOUT'})
        workoutsDispatch({type: 'SET_WORKOTUS', payload: null})
    }

    return {logout}
}