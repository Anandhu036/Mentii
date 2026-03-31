import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastProvider } from './utils/Toast'

import Navbar        from './components/Navbar'
import Home          from './components/Home'
import Login         from './components/Login'
import Register      from './components/Register'
import Dashboard     from './components/Dashboard'
import PrivateRoutes from './components/PrivateRoutes'

const theme = createTheme({
    palette: {
        background: { default: '#ffffff' },
        primary:    { main: '#111827' },
        text:       { primary: '#111827', secondary: '#6b7280' },
    },
    typography: { fontFamily: '"Outfit", sans-serif' },
    shape:      { borderRadius: 16 },
    components: {
        MuiCard: {
            styleOverrides: {
                root: { boxShadow: 'none', border: '1px solid #f3f4f6' }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: { textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }
            }
        },
        MuiPaper:  { styleOverrides: { root: { boxShadow: 'none' } } },
        MuiDialog: { styleOverrides: { paper: { borderRadius: '16px', border: '1px solid #f3f4f6' } } },
    }
});

function App() {
    
    const [editProfileOpen, setEditProfileOpen] = useState(false);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {/* ToastProvider wraps everything so every component can call useToast() */}
            <ToastProvider>
                <Navbar onEditProfile={() => setEditProfileOpen(true)} />
                <Routes>
                    <Route path='/'         element={<Home />} />
                    <Route path='/login'    element={<Login />} />
                    <Route path='/register' element={<Register />} />
                    <Route element={<PrivateRoutes />}>
                        <Route
                            path='/dashboard'
                            element={
                                <Dashboard
                                    editProfileOpen={editProfileOpen}
                                    setEditProfileOpen={setEditProfileOpen}
                                />
                            }
                        />
                    </Route>
                </Routes>
            </ToastProvider>
        </ThemeProvider>
    );
}

export default App;