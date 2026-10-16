import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {App} from './App';
import {createSlateAdapter} from './adapter';
import type {Provider} from './wallet';
import './styles.css';
const adapterFactory=(provider?:Provider,account?:string)=>createSlateAdapter({address:import.meta.env.VITE_CONTRACT_ADDRESS,provider,account});
createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><App adapterFactory={adapterFactory}/></BrowserRouter></React.StrictMode>);
