import {createSlice, PayloadAction} from "@reduxjs/toolkit"

const initialState = {
    status: 'idle' as RequestStatusType,
    error: null as string | null,
}

export type AppStateType = typeof initialState

const slice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setAppStatusAC(state, action: PayloadAction<{ status: RequestStatusType }>) {
            state.status = action.payload.status
        },
        setAppErrorAC(state, action: PayloadAction<{ error: string | null }>) {
            state.error = action.payload.error
        }
    }
})

export const appReducer = slice.reducer

export const {
    setAppStatusAC,
    setAppErrorAC,
} = slice.actions

//types
export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
