import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.layer.css'
import './index.css'
import App from './App.jsx'
import { MantineProvider } from '@mantine/core'
import { ThemeProvider } from '@emotion/react'
import theme from './theme'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider   
      withGlobalStyles={false}
      withNormalizeCSS={false}
      withCssVariables={true}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </MantineProvider>
  </StrictMode>,
)
