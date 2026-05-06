import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import './styles/social-brand.css';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home';
import About from './pages/About';
import Program from './pages/Program';
import Receipt from './pages/Receipt';
import Contact from './pages/Contact';
import Chiefs from './pages/Chiefs';

import Auth from './pages/Auth';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminPostEditor from './pages/AdminPostEditor';
import AdminProgramEditor from './pages/AdminProgramEditor';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ChiefDetail from './pages/ChiefDetail';
import ProgramDetail from './pages/ProgramDetail';
import PostDetail from './pages/PostDetail';
import Checkout from './pages/Checkout';
import PaymentResult from './pages/PaymentResult';
import StudentWork from './pages/StudentWork';
import NotFound from './pages/NotFound';
import { ROUTES } from './constants/routes';
import ScrollToTop from './components/Shared/ScrollToTop';
import { SiteConfigProvider } from './context/SiteConfigContext';

function App() {
  return (
    <SiteConfigProvider>
      <LanguageProvider>
    <Router basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <Routes>
        {/* ALL ROUTES UNDER PUBLIC LAYOUT FOR UNIFIED THEME CSS */}
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.ABOUT} element={<About />} />
          <Route path={ROUTES.PROGRAM} element={<Program />} />
          <Route path={ROUTES.RECEIPT} element={<Receipt />} />
          <Route path={ROUTES.STUDENT_WORK} element={<StudentWork />} />
          <Route path={ROUTES.CONTACT} element={<Contact />} />
          <Route path={ROUTES.AUTH} element={<Auth />} />
          <Route path={ROUTES.CHIEFS} element={<Chiefs />} />
          
          {/* Detail Pages */}
          <Route path={ROUTES.CHIEF_DETAIL_PATTERN} element={<ChiefDetail />} />
          <Route path={ROUTES.PROGRAM_DETAIL_PATTERN} element={<ProgramDetail />} />
          <Route path={ROUTES.POST_DETAIL_PATTERN} element={<PostDetail />} />
          <Route path={ROUTES.CHECKOUT_PATTERN} element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path={ROUTES.PAYMENT_RESULT} element={<PaymentResult />} />

          {/* Protected Routes */}
          <Route path={ROUTES.MY_ACCOUNT} element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />

          {/* 404 Catch-All within PublicLayout */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ADMIN LAYOUT (No Header/Footer from Muka) */}
        <Route path={ROUTES.ADMIN} element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path={ROUTES.ADMIN_POST_NEW} element={
          <ProtectedRoute requireAdmin={true}>
            <AdminPostEditor />
          </ProtectedRoute>
        } />
        <Route path={ROUTES.ADMIN_POST_EDIT_PATTERN} element={
          <ProtectedRoute requireAdmin={true}>
            <AdminPostEditor />
          </ProtectedRoute>
        } />
        <Route path={ROUTES.ADMIN_PROGRAM_NEW} element={
          <ProtectedRoute requireAdmin={true}>
            <AdminProgramEditor />
          </ProtectedRoute>
        } />
        <Route path={ROUTES.ADMIN_PROGRAM_EDIT_PATTERN} element={
          <ProtectedRoute requireAdmin={true}>
            <AdminProgramEditor />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
    <ToastContainer 
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="colored"
    />
    </LanguageProvider>
    </SiteConfigProvider>
  );
}

export default App;
