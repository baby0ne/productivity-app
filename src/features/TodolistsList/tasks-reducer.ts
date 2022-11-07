import {
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    TodolistType,
    UpdateTaskModelType
} from '../../api/todolists-api'
import {AppRootStateType} from '../../app/store'
import {setAppStatusAC} from '../../app/app-reducer'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {addTodolistTC, fetchTodolistsTC, removeTodolistTC} from './todolists-reducer'


export const fetchTasksTC = createAsyncThunk('tasks/fetchTask',
    async (todolistId: string, {dispatch}) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        const res = await todolistsAPI.getTasks(todolistId)
        const tasks = res.data.items
        dispatch(setAppStatusAC({status: 'succeeded'}))
        return {tasks, todolistId}
    })

export const removeTaskTC = createAsyncThunk('tasks/removeTask',
    async (payload: { taskId: string, todolistId: string }, {dispatch}) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        const res = await todolistsAPI.deleteTask(payload.todolistId, payload.taskId)
        dispatch(setAppStatusAC({status: 'succeeded'}))
        return {taskId: payload.taskId, todolistId: payload.todolistId}
    })

export const addTaskTC = createAsyncThunk('tasks/addTask',
    async (payload: { title: string, todolistId: string }, {dispatch, rejectWithValue}) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        try {
            const res = await todolistsAPI.createTask(payload.todolistId, payload.title)
            if (res.data.resultCode === 0) {
                dispatch(setAppStatusAC({status: 'succeeded'}))
                return res.data.data.item
            } else {
                handleServerAppError(res.data, dispatch);
                return rejectWithValue(null)
            }
        } catch (error) {
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(null)
        }
    })

export const updateTaskTC = createAsyncThunk('tasks/updateTask',
    async (payload: { taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string }, {
        dispatch,
        getState,
        rejectWithValue
    }) => {
        dispatch(setAppStatusAC({status: 'loading'}))

        const state = getState() as AppRootStateType

        const task = state.tasks[payload.todolistId].find(t => t.id === payload.taskId)

        if (!task) {
            return rejectWithValue('task not found in the state')
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...payload.domainModel
        }
        try {
            const res = await todolistsAPI.updateTask(payload.todolistId, payload.taskId, apiModel)
            if (res.data.resultCode === 0) {
                dispatch(setAppStatusAC({status: 'succeeded'}))
                return {...payload}
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
    name: 'tasks',
    initialState: {} as TasksStateType,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(addTodolistTC.fulfilled, (state, action) => {
            state[action.payload.todolist.id] = []
        })
        builder.addCase(removeTodolistTC.fulfilled, (state, action) => {
            delete state[action.payload.id]
        })
        builder.addCase(fetchTodolistsTC.fulfilled, (state, action) => {
            action.payload.todolists.forEach((tl: TodolistType) => {
                state[tl.id] = []
            })
        })
        builder.addCase(fetchTasksTC.fulfilled, (state, action) => {
            state[action.payload.todolistId] = action.payload.tasks
        })
        builder.addCase(removeTaskTC.fulfilled, (state, action) => {
            const index = state[action.payload.todolistId].findIndex(t => t.id === action.payload.taskId)
            if (index > -1) {
                state[action.payload.todolistId].splice(index, 1)
            }
        })
        builder.addCase(addTaskTC.fulfilled, (state, action) => {
            state[action.payload.todoListId].unshift(action.payload)
        })
        builder.addCase(updateTaskTC.fulfilled, (state, action) => {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(t => t.id === action.payload.taskId)
            if (index > -1) {
                state[action.payload.todolistId][index] = {...tasks[index], ...action.payload.domainModel}
            }
        })
    }
})

export const tasksReducer = slice.reducer

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}