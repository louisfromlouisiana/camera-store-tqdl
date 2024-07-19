import { Suspense, lazy, useContext, useEffect } from 'react';
import { ModalContext } from './context/ModalProvider';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Loading from './components/ui/Loading';
import { useSelector } from 'react-redux';
import { getUser } from './services/redux/slice/userSlice';
import { FaComments } from 'react-icons/fa6';
import { socket } from './config/socket';
const ToastModal = lazy(() => import('./components/modal/ToastModal'));
const ConfirmModal = lazy(() => import('./components/modal/ConfirmModal'));
const ChatModal = lazy(() => import('./components/modal/users/ChatModal'));
function App() {
  const navigate = useNavigate();
  const { state, setVisibleModal } = useContext(ModalContext);
  const user = useSelector(getUser);
  useEffect(() => {
    if (user && user?.role?.name === 'admin') {
      socket.emit('joinChat', user);
    }
  }, [user]);
  return (
    <Suspense fallback={<Loading />}>
      <Header />
      <main className='relative min-h-[80vh] py-[72px] w-full bg-neutral-50'>
        <Outlet />
      </main>
      {state?.visibleToastModal && <ToastModal />}
      {state?.visibleConfirmModal && <ConfirmModal />}
      {state?.visibleChatModal && <ChatModal />}
      {user && !user?.isVerified && (
        <button
          className='fixed bottom-8 right-8 bg-violet-500 hover:bg-violet-700 transition-colors text-neutral-100 px-4 py-2 rounded'
          onClick={() => navigate('/verified')}
        >
          Verify Account
        </button>
      )}
      {user?.role?.name !== 'admin' && (
        <button
          className='fixed bottom-16 right-8 bg-violet-500 text-white rounded-full p-4'
          onClick={() => setVisibleModal('visibleChatModal')}
        >
          <FaComments className='text-2xl md:text-3xl' />
        </button>
      )}
      <Footer />
    </Suspense>
  );
}

export default App;
