import React, { useEffect } from 'react'
import './App.css'
import { TodolistsList } from '../features/TodolistsList/TodolistsList'
import { useDispatch, useSelector } from 'react-redux'
import { AppRootStateType } from './store'
import { RequestStatusType } from './app-reducer'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import LinearProgress from '@mui/material/LinearProgress';
import { Menu } from '@mui/icons-material';
import { ErrorSnackbar } from '../components/ErrorSnackbar/ErrorSnackbar'
import { Login } from '../features/TodolistsList/Login/Login'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { initializeAppTC, logoutTC } from '../features/TodolistsList/Login/authReducer'
import CircularProgress from '@mui/material/CircularProgress'

type PropsType = {
   demo?: boolean
}

function App({ demo = false }: PropsType) {
   const status = useSelector<AppRootStateType, RequestStatusType>((state) => state.app.status);
   const isInitialized = useSelector<AppRootStateType, boolean>((state) => state.auth.isInitialized);
   const isLoggedIn = useSelector<AppRootStateType, boolean>(state => state.auth.isLoggedIn);
   const dispatch = useDispatch();

   useEffect(() => {
      dispatch(initializeAppTC());
   }, []);

   const onClickHandler = () => {
      dispatch(logoutTC())
   }

   if (!isInitialized) {
      return <div
         style={{ position: 'fixed', top: '30%', textAlign: 'center', width: '100%' }}>
         <CircularProgress />
      </div>
   }

   return (
      <div className="App">
         <BrowserRouter>
            <ErrorSnackbar />
            <AppBar position="static">
               <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <IconButton edge="start" color="inherit" aria-label="menu">
                     <Menu />
                  </IconButton>
                  <Typography variant="h6">
                     Todolist
                  </Typography>
                  <Button color="inherit"
                     onClick={onClickHandler}
                  >{isLoggedIn ? 'Logout' : 'Login'}</Button>
               </Toolbar>
               {status === 'loading' && <LinearProgress />}
            </AppBar>
            <Container fixed>
               <Routes>
                  <Route path={'/'} element={<TodolistsList demo={demo} />} />
                  <Route path={'/login'} element={<Login />} />
                  <Route path={'/404'} element={<h1> 404 page not found </h1>} />
                  <Route path={'*'} element={<Navigate to={'/404'} />} />
               </Routes>
            </Container>
         </BrowserRouter>
      </div>
   )
}

export default App;