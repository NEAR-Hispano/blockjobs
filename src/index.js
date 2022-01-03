import React from 'react'
import ReactDOM from 'react-dom'
import './assets/main.css';
import App from './App'
import { initContract } from './utils'

window.nearInitPromise = initContract()
  .then(() => {
    ReactDOM.render(
      <App />,
      document.querySelector('#root')
    )
  })
  .catch(console.error)
