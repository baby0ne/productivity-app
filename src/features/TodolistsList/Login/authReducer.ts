import {authAPI, LoginParamsType} from '../../../api/todolists-api'
import {handleServerAppError, handleServerNetworkError} from '../../../utils/error-utils'
import {setAppStatusAC} from '../../../app/app-reducer'
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit"

//thunks
export const loginTC = createAsyncThunk('auth/login', async (param: LoginParamsType, {dispatch}) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await authAPI.login(param)

        if (res.data.resultCode === 0) {
            dispatch(setAppStatusAC({status: 'succeeded'}))
            return {isLoggedIn: true}
        } else {
            handleServerAppError(res.data, dispatch)
            return {isLoggedIn: false}
        }
    } catch (error) {
        handleServerNetworkError(error, dispatch)
        return {isLoggedIn: false}
    }
})
export const logoutTC = createAsyncThunk('auth/logout', async (arg, {dispatch}) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await authAPI.logout()

        if (res.data.resultCode === 0) {
            dispatch(setAppStatusAC({status: 'succeeded'}))
            return {isLoggedIn: false}
        } else {
            handleServerAppError(res.data, dispatch)
            return {isLoggedIn: true}
        }
    } catch (error) {
        handleServerNetworkError(error, dispatch)
        return {isLoggedIn: true}
    }
})
export const initializeAppTC = createAsyncThunk('auth/initializeApp', async (arg, {dispatch}) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await authAPI.me()

        if (res.data.resultCode === 0) {
            dispatch(setIsLoggedInAC({value: true}))
            dispatch(setAppStatusAC({status: 'succeeded'}))
        } else {
            handleServerAppError(res.data, dispatch)
        }
    } catch (error) {
        handleServerNetworkError(error, dispatch)
    }
})

const slice = createSlice({
    name: 'auth',
    initialState: {
        isLoggedIn: false,
        isInitialized: false,
    },
    reducers: {
        setIsLoggedInAC(state, action: PayloadAction<{ value: boolean }>) {
            state.isLoggedIn = action.payload.value
        },
    },
    extraReducers: builder => {
        builder.addCase(loginTC.fulfilled, (state, action) => {
            state.isLoggedIn = action.payload.isLoggedIn
        })
        builder.addCase(logoutTC.fulfilled, (state, action) => {
            state.isLoggedIn = action.payload.isLoggedIn
        })
        builder.addCase(initializeAppTC.fulfilled, (state) => {
            state.isInitialized = true
        })
    }
})

export const authReducer = slice.reducer

export const {
    setIsLoggedInAC,
} = slice.actions