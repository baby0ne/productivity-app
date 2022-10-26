import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType, setAppStatusAC} from '../../app/app-reducer'
import {createSlice, PayloadAction} from "@reduxjs/toolkit"
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";

const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
    name: 'todolists',
    initialState,
    reducers: {
        removeTodolistAC(state, action: PayloadAction<{ id: string }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            if (index > -1) {
                state.splice(index, 1)
            }
        },
        addTodolistAC(state, action: PayloadAction<{ todolist: TodolistType }>) {
            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
        },
        changeTodolistTitleAC(state, action: PayloadAction<{ id: string, title: string }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            if (index > -1) {
                state[index].title = action.payload.title
            }
        },
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
        setTodolistsAC(state, action: PayloadAction<{ todolists: Array<TodolistType> }>) {
            return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        }
    }
})

export const todolistsReducer = slice.reducer

export const {
    removeTodolistAC,
    changeTodolistEntityStatusAC,
    changeTodolistFilterAC,
    changeTodolistTitleAC,
    addTodolistAC,
    setTodolistsAC,
} = slice.actions

// thunks
export const fetchTodolistsTC = () => {
    return (dispatch: Dispatch) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        todolistsAPI.getTodolists()
            .then((res) => {
                dispatch(setTodolistsAC({todolists: res.data}))
                dispatch(setAppStatusAC({status: 'succeeded'}))
            })
    }
}
export const removeTodolistTC = (todolistId: string) => {
    return (dispatch: Dispatch) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        dispatch(changeTodolistEntityStatusAC({id: todolistId, status: 'loading'}))
        todolistsAPI.deleteTodolist(todolistId)
            .then((res) => {
                dispatch(removeTodolistAC({id: todolistId}))
                //скажем глобально приложению, что асинхронная операция завершена
                dispatch(setAppStatusAC({status: 'succeeded'}))
            })
    }
}
export const addTodolistTC = (title: string) => {
    return (dispatch: Dispatch) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                if (res.data.resultCode === 0) {
                    dispatch(addTodolistAC({todolist: res.data.data.item}))
                    dispatch(setAppStatusAC({status: 'succeeded'}))
                } else {
                    handleServerAppError(res.data, dispatch);
                }
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch)
            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                if (res.data.resultCode === 0) {
                    dispatch(changeTodolistTitleAC({id: id, title}))
                    dispatch(setAppStatusAC({status: 'succeeded'}))
                } else {
                    handleServerAppError(res.data, dispatch);
                }
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch)
            })
    }
}

//types
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}