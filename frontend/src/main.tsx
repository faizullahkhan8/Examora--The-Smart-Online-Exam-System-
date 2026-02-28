import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './App.tsx'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './store.ts'
import { ToastContainer } from "react-toastify"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
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
    </Provider>
  </StrictMode>,
)
