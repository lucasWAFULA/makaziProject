import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './i18n'
import App from './App'
import { CurrencyProvider } from './context/CurrencyContext'
import './index.css'
import './currency.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <App />
      </CurrencyProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
