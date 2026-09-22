import './style.css'
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app'

const rootElement = document.querySelector('#app')

if (rootElement) {
  createRoot(rootElement).render(createElement(App))
}
