import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './App.tsx'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import store, { persistor } from './store.ts'
import { ToastContainer } from "react-toastify"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      {/* PersistGate delays rendering until persisted state is rehydrated */}
      <PersistGate loading={null} persistor={persistor}>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <RouterProvider router={AppRouter} />
      </PersistGate>
    </Provider>
  </StrictMode>,
)
