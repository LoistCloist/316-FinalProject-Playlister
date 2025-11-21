import './App.css'
import WelcomeScreen from './components/Screens/WelcomeScreen'
//import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import {Typography} from '@mui/material'
import AppBanner from './components/Screens/AppBanner'

function App() {
  return (
    <>
      <WelcomeScreen />
      <Typography variant="h1"> Playlister</Typography>
      <AppBanner />
    </>
  )
}

export default App
