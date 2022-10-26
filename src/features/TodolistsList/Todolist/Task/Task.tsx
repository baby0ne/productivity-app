import React, {ChangeEvent, useCallback} from 'react'
import {EditableSpan} from '../../../../components/EditableSpan/EditableSpan'
import {Delete} from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import {TaskStatuses, TaskType} from '../../../../api/todolists-api'

type TaskPropsType = {
    task: TaskType
    todolistId: string
    changeTaskStatus: (id: string, status: TaskStatuses, todolistId: string) => void
    changeTaskTitle: (taskId: string, newTitle: string, todolistId: string) => void
    removeTask: (taskId: string, todolistId: string) => void
}
export const Task = React.memo((props: TaskPropsType) => {

    const {
        removeTask,
        task,
        changeTaskTitle,
        todolistId,
        changeTaskStatus,
    } = props

    const onClickHandler = useCallback(() => removeTask(task.id, todolistId), [task.id, todolistId, removeTask]);

    const onChangeHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        let newIsDoneValue = e.currentTarget.checked
        changeTaskStatus(task.id, newIsDoneValue ? TaskStatuses.Completed : TaskStatuses.New, todolistId)
    }, [task.id, todolistId, changeTaskStatus]);

    const onTitleChangeHandler = useCallback((newValue: string) => {
        changeTaskTitle(task.id, newValue, todolistId)
    }, [task.id, todolistId, changeTaskTitle]);

    return <div key={task.id} className={task.status === TaskStatuses.Completed ? 'is-done' : ''}>
        <Checkbox
            checked={task.status === TaskStatuses.Completed}
            color="primary"
            onChange={onChangeHandler}
        />

        <EditableSpan value={task.title} onChange={onTitleChangeHandler}/>
        <IconButton onClick={onClickHandler}>
            <Delete/>
        </IconButton>
    </div>
})
