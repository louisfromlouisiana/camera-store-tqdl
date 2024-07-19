import Modal from '@/Modal';
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaXmark, FaPaperPlane } from 'react-icons/fa6';
import { useSelector } from 'react-redux';
import { getUser } from '../../../services/redux/slice/userSlice';
import { ModalContext } from '../../../context/ModalProvider';
import { useGetUserChatQuery } from '../../../services/redux/query/users';
import { socket } from '../../../config/socket';
import icon from '../../../../public/icons/icon.png';
function ChatModal() {
  const user = useSelector(getUser);
  const navigate = useNavigate();
  const { state, setVisibleModal } = useContext(ModalContext);
  const {
    data: chatData,
    isSuccess: isSuccessChat,
    refetch: refetchChat,
  } = useGetUserChatQuery();
  const [messages, setMessages] = useState([]);
  const [endChat, setEndChat] = useState(false);
  const [noAdmin, setNoAdmin] = useState(false);
  const [isFocusCmt, setIsFocusCmt] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const messageRef = useRef();
  const chatContainerRef = useRef();

  const handleFocusComment = () => {
    if (messageRef.current) {
      messageRef.current.focus();
      setIsFocusCmt(true);
    }
  };

  useEffect(() => {
    if (isSuccessChat && chatData) {
      setMessages([...chatData]);
    }
  }, [isSuccessChat, chatData]);

  useEffect(() => {
    if (state.visibleChatModal && user) {
      // setMessages([]);
      refetchChat();
      socket.on('receiveMessage', (message) => {
        if (message?.error) {
          setNoAdmin(true);
        }
        setMessages((prevMessages) => [...prevMessages, message]);
      });
      socket.on('endChat', (data) => {
        if (data?.endChat) {
          setEndChat(true);
        }
      });
      socket.emit('joinChat', user);

      return () => {
        socket.off('receiveMessage');
        socket.off('endChat');
      };
    } else {
      setMessages([]);
    }
  }, [state.visibleChatModal, user]);
  const handleRefresh = () => {
    setMessages([]);
    setNoAdmin(false);
  };
  const sendMessage = () => {
    if (!currentMessage.trim() || endChat || noAdmin) {
      return;
    }
    const messageData = {
      sender: user,
      receiver: null,
      sentBy: user._id,
      content: currentMessage,
    };
    socket.emit('sendMessage', messageData);
    setCurrentMessage('');
    if (messageRef.current) {
      messageRef.current.textContent = '';
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  return (
    <Modal>
      <section
        className={`fixed w-[280px] sm:w-[320px] h-[465px] bg-neutral-50 z-50 bottom-0 right-4 border border-neutral-300 rounded-lg text-neutral-800 ${
          state.visibleChatModal ? 'flex' : 'hidden'
        } flex-col justify-between overflow-hidden`}
      >
        <div className='p-2 flex justify-between items-center gap-4 border-b border-neutral-300 bg-violet-500 text-white'>
          <div className='flex gap-4'>
            <p className='font-bold cursor-pointer'>LQ-CAMERA</p>
          </div>
          <div className='flex items-center gap-2'>
            <button
              title='Close chat'
              aria-label='close-chat'
              onClick={() => setVisibleModal('visibleChatModal')}
            >
              <FaXmark className='text-2xl' />
            </button>
          </div>
        </div>
        <div
          ref={chatContainerRef}
          className='relative px-2 py-4 w-full h-full overflow-y-auto flex flex-col gap-4'
        >
          {!user && (
            <>
              <div className='absolute top-0 left-0 w-full h-full bg-white opacity-50 z-10'></div>
              <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full z-20 text-neutral-800 flex flex-col justify-center items-center gap-4 text-sm md:text-base'>
                <p className='text-center font-bold'>
                  You have to login to chat with admin.
                </p>
                <button
                  className='font-bold text-violet-500'
                  onClick={() => {
                    setVisibleModal('visibleChatModal');
                    navigate('/login');
                  }}
                >
                  Login
                </button>
              </div>
            </>
          )}
          {noAdmin && (
            <>
              <div className='absolute top-0 left-0 w-full h-full bg-white opacity-50 z-10'></div>
              <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full z-20 text-neutral-800 flex flex-col justify-center items-center gap-4 text-sm md:text-base'>
                <p className='text-center font-bold'>
                  There are currently no active admins. Please try again later!
                </p>
                <button
                  className='font-bold text-violet-500'
                  onClick={handleRefresh}
                >
                  Refresh
                </button>
              </div>
            </>
          )}
          {endChat && (
            <>
              <div className='absolute top-0 left-0 w-full h-full bg-white opacity-50 z-10'></div>
              <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full z-20 text-neutral-800 flex flex-col justify-center items-center gap-4 text-sm md:text-base'>
                <p className='text-center font-bold'>
                  The chat has ended, the data will automatically be deleted
                  immediately after you refresh the page.
                </p>
              </div>
            </>
          )}
          {messages?.map((m) => {
            const sentBy = m?.sentBy === user?._id;
            return (
              <div
                key={m._id}
                className={`w-full flex items-center gap-2 ${
                  sentBy ? 'justify-end' : 'justify-start'
                }`}
              >
                {!sentBy && (
                  <img
                    className='size-[36px] rounded-full object-cover'
                    src={icon}
                    alt='lq-camera'
                    {...{ fetchPriority: 'low' }}
                  />
                )}
                <p
                  className={`max-w-[180px] px-2 py-1 rounded-3xl break-words ${
                    sentBy ? 'bg-violet-500 text-neutral-100' : 'bg-neutral-200'
                  }`}
                >
                  {m?.content}
                </p>
              </div>
            );
          })}
        </div>
        <div className='relative w-full p-2' onClick={handleFocusComment}>
          <div
            onBlur={() => {
              setIsFocusCmt(false);
            }}
            onKeyDown={handleKeyDown}
            ref={messageRef}
            className='rounded-3xl px-4 py-2 bg-neutral-200 max-h-[180px] focus:outline overflow-y-auto'
            contentEditable
            onInput={(e) => setCurrentMessage(e.currentTarget.textContent)}
          ></div>
          {!isFocusCmt && !currentMessage && (
            <div
              className='absolute top-1/2 left-6 -translate-y-1/2'
              onClick={handleFocusComment}
            >
              <p>Aa</p>
            </div>
          )}
          <button
            className='absolute bottom-[35%] right-6 z-10 hover:text-violet-500 transition-colors'
            aria-label='send-btn'
            disabled={!currentMessage.trim()}
            onClick={sendMessage}
          >
            <FaPaperPlane />
          </button>
        </div>
      </section>
    </Modal>
  );
}

export default ChatModal;
