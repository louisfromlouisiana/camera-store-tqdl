import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './services/router';
import { ModalProvider } from './context/ModalProvider';
import { Provider } from 'react-redux';
import { store } from './services/redux/store';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './index.css';
import { FetchDataProvider } from './context/FetchDataProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <FetchDataProvider>
        <ModalProvider>
          <RouterProvider router={router} />
        </ModalProvider>
      </FetchDataProvider>
    </Provider>
  </React.StrictMode>
);
