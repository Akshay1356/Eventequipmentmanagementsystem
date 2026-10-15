import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import Home from '../pages/Home';
import EquipmentPage from '../pages/EquipmentPage';
import EquipmentDetailsPage from '../pages/EquipmentDetailsPage';
import BookingPage from '../pages/BookingPage';
import BookingDetailsPage from '../pages/BookingDetailsPage';
import CustomerDashboardPage from '../pages/CustomerDashboardPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'equipment',
        element: <EquipmentPage />,
      },
      {
        path: 'equipment/:id',
        element: <EquipmentDetailsPage />,
      },
      {
        path: 'book/:id',
        element: <BookingPage />,
      },
      {
        path: 'my-bookings',
        element: <CustomerDashboardPage />,
      },
      {
        path: 'my-bookings/:id',
        element: <BookingDetailsPage />,
      },
      {
        path: 'admin',
        element: <AdminDashboardPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
