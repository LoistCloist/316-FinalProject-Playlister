import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import {Typography} from '@mui/material'
import AppBanner from './components/Screens/AppBanner'
import WelcomeScreen from './components/Screens/WelcomeScreen'
import CreateAccountScreen from './components/Screens/CreateAccountScreen'
import LoginScreen from './components/Screens/LoginScreen'
import EditAccountScreen from './components/Screens/EditAccountScreen'
import PlaylistsScreen from './components/Screens/PlaylistsScreen'
import SongCatalogScreen from './components/Screens/SongCatalogScreen'
import { AuthContextProvider } from './auth'
import { PlaylistStoreContextProvider } from './stores/playlist_store'
import { SongStoreContextProvider } from './stores/song_store'

function App() {
  return (
    <>
    <BrowserRouter>
      <AuthContextProvider>
        <PlaylistStoreContextProvider>
          <AppBanner />
          <Routes>
            <Route path="/register" element={<CreateAccountScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/editAccount" element={<EditAccountScreen />} />
            <Route path="/playlists" element={<PlaylistsScreen />} />
            <Route path="/songs" element={<SongCatalogScreen />} />
            <Route path="*" element={<WelcomeScreen />} />
          </Routes>
        </PlaylistStoreContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
    </>
  )
}

export default App
