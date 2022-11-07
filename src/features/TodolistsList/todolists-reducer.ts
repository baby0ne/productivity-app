import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {RequestStatusType, setAppStatusAC} from '../../app/app-reducer'
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit"
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";

// thunks
export const fetchTodolistsTC = createAsyncThunk('todolists/fetchTodolist',
    async (payload, {dispatch, rejectWithValue}) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        try {
            const res = await todolistsAPI.getTodolists()
            dispatch(setAppStatusAC({status: 'succeeded'}))
            return {todolists: res.data}
        } catch (error) {
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(null)
        }
    })

export const removeTodolistTC = createAsyncThunk('todolists/removeTodolist',
    async (payload: { todolistId: string }, {dispatch}) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        dispatch(changeTodolistEntityStatusAC({id: payload.todolistId, status: 'loading'}))

        const res = await todolistsAPI.deleteTodolist(payload.todolistId)
        dispatch(setAppStatusAC({status: 'succeeded'}))
        return {id: payload.todolistId}
    })

export const addTodolistTC = createAsyncThunk('todolists/addTodolist',
    async (payload: { title: string }, {dispatch, rejectWithValue}) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        try {
            const res = await todolistsAPI.createTodolist(payload.title)
            if (res.data.resultCode === 0) {
                dispatch(setAppStatusAC({status: 'succeeded'}))
                return {todolist: res.data.data.item}
            } else {
                handleServerAppError(res.data, dispatch);
                return rejectWithValue(null)
            }
        } catch (error) {
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(null)
        }
    })

export const changeTodolistTitleTC = createAsyncThunk('todolists/changeTodolistTitle',
    async (payload: { id: string, title: string }, {dispatch, rejectWithValue}) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        try {
            const res = await todolistsAPI.updateTodolist(payload.id, payload.title)
            if (res.data.resultCode === 0) {
                dispatch(setAppStatusAC({status: 'succeeded'}))
                return {id: payload.id, title: payload.title}
            } else {
                handleServerAppError(res.data, dispatch)
                return rejectWithValue(null)
            }
        } catch (error) {
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(null)
        }
    }
)

const slice = createSlice({
    name: 'todolists',
    initialState: [] as Array<TodolistDomainType>,
    reducers: {
        changeTodolistFilterAC(state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            if (index > -1) {
                state[index].filter = action.payload.filter
            }
        },
        changeTodolistEntityStatusAC(state, action: PayloadAction<{ id: string, status: RequestStatusType }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            if (index > -1) {
                state[index].entityStatus = action.payload.status
            }
        },
    },
    extraReducers: builder => {
        builder.addCase(fetchTodolistsTC.fulfilled, (state, action) => {
            return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        })
        builder.addCase(removeTodolistTC.fulfilled, (state, action) => {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            if (index > -1) {
                state.splice(index, 1)
            }
        })
        builder.addCase(addTodolistTC.fulfilled, (state, action) => {
            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
        })
        builder.addCase(changeTodolistTitleTC.fulfilled, (state, action) => {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            if (index > -1) {
                state[index].title = action.payload.title
            }
        })
    }
})

export const todolistsReducer = slice.reducer

export const {
    changeTodolistEntityStatusAC,
    changeTodolistFilterAC,
} = slice.actions


//types
export type FilterValuesType = 'all' | 'active' | 'completed'
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}