import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  useDeleteChatMutation,
  useGetChatDetailsFromAdminQuery,
  useGetNewestChatFromAdminQuery,
} from '../../../services/redux/query/users';
import useObserver from '../../../hooks/useObserver';
import { useSelector } from 'react-redux';
import { getUser } from '../../../services/redux/slice/userSlice';
import { formatDistanceStrict } from 'date-fns';
import { FaPaperPlane, FaRegTrashCan } from 'react-icons/fa6';
import { socket } from '../../../config/socket';
import { ModalContext } from '../../../context/ModalProvider';

function MessagesLayout() {
  const user = useSelector(getUser);
  const { setVisibleModal } = useContext(ModalContext);
  const [hasMore, setHasMore] = useState(true);
  const [curPage, setCurPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isFocusCmt, setIsFocusCmt] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const messageRef = useRef();
  const chatContainerRef = useRef();

  const {
    data: messagesData,
    isSuccess: isSuccessMessages,
    refetch: refetchNewest,
  } = useGetNewestChatFromAdminQuery(`?page=${curPage}`);

  const {
    data: chatDetailsData,
    isSuccess: isSuccessChat,
    isFetching: isFetchingChat,
    refetch: refetchChatDetails,
  } = useGetChatDetailsFromAdminQuery(selectedUser, {
    skip: !selectedUser,
    refetchOnMountOrArgChange: selectedUser,
  });

  const [
    deleteChat,
    {
      data: deleteData,
      isSuccess: isSuccessDelete,
      isLoading: isLoadingDelete,
      isError: isErrorDelete,
      error: errorDelete,
    },
  ] = useDeleteChatMutation();

  const { itemRef } = useObserver(
    hasMore,
    curPage,
    setCurPage,
    isSuccessMessages,
    messagesData?.messages,
    messagesData?.totalPage
  );

  useEffect(() => {
    if (isSuccessMessages && messagesData) {
      setUsers((prevUsers) => {
        if (curPage === 1) {
          return [...messagesData?.messages];
        } else {
          return [...new Set([...prevUsers, ...messagesData?.messages])];
        }
      });
      if (messagesData?.totalPage === curPage) {
        setHasMore(false);
      }
    }
  }, [isSuccessMessages, messagesData, curPage]);

  const renderedNewestMessages = useMemo(() => {
    return users.map((m) => {
      const lastSent = m.lastSent === user?._id;
      return (
        <article
          className='relative w-full p-4 flex gap-2 hover:bg-neutral-100 transition-colors rounded cursor-pointer'
          key={m?._id}
          onClick={() => setSelectedUser(m?.sender._id)}
        >
          <div>
            <div className='w-12 h-12 overflow-hidden rounded-full'>
              <img
                src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${
                  m?.sender?.image?.url
                }`}
                alt={m?.sender?.image?.name}
                fetchPriority='low'
              />
            </div>
          </div>
          <div className='w-full h-full'>
            <div className='flex justify-between items-center gap-4'>
              <p className='truncate max-w-[200px] font-medium'>
                {m?.sender?.email}
              </p>
              {!m?.isRead && (
                <span className='relative before:absolute before:w-2 before:h-2 before:rounded-full before:bg-blue-500 before:top-1/2 before:-translate-y-1/2 before:right-[2px]'></span>
              )}
            </div>
            <div className='w-full text-neutral-500 flex items-center gap-6'>
              <p className='text-sm max-w-[150px] truncate'>
                {lastSent ? 'You' : 'Customer'}: {m?.content}
              </p>
              <div className='relative flex justify-between items-center'>
                <span className='absolute w-1 h-1 rounded-full bg-neutral-500 top-1/2 -translate-y-1/2 -left-2'></span>
                <p className='text-[12px] flex'>
                  {formatDistanceStrict(
                    new Date(Date.now()),
                    new Date(m?.updated_at)
                  )}
                </p>
              </div>
            </div>
          </div>
        </article>
      );
    });
  }, [users, user]);

  const handleFocusComment = () => {
    if (messageRef.current) {
      messageRef.current.focus();
      setIsFocusCmt(true);
    }
  };

  const sendMessage = () => {
    if (!currentMessage.trim()) {
      return;
    }
    const messageData = {
      sender: chatDetailsData[0].sender,
      receiver: user._id,
      sentBy: user._id,
      content: currentMessage,
      refetch: true,
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
    if (selectedUser) {
      refetchChatDetails();
    }
  }, [selectedUser]);
  useEffect(() => {
    if (isSuccessChat && chatDetailsData) {
      setMessages([...chatDetailsData]);
    }
  }, [isSuccessChat, chatDetailsData]);

  useEffect(() => {
    const handleReceiveMessage = (message) => {
      if (message?.refetch === true) {
        setUsers([]);
        setCurPage(1);
        refetchNewest();
      }
      if (
        message?.sender?._id === chatDetailsData[0]?.sender._id ||
        message?.sender === chatDetailsData[0]?.sender._id
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };

    const handleEndChat = () => {
      setEndChat(true);
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('endChat', handleEndChat);
    socket.emit('joinChat', user);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('endChat', handleEndChat);
    };
  }, [refetchNewest, user, chatDetailsData?.[0]]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isSuccessDelete && deleteData) {
      refetchNewest();
      setSelectedUser(null);
      setMessages([]);
      socket.emit('endChat', { sender: chatDetailsData[0]?.sender?._id });
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: deleteData?.message,
        },
      });
    }
    if (isErrorDelete && errorDelete) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorDelete?.data?.message,
        },
      });
    }
  }, [
    isSuccessDelete,
    deleteData,
    isErrorDelete,
    errorDelete,
    setVisibleModal,
    refetchNewest,
    chatDetailsData,
  ]);
  return (
    <>
      <section className='col-span-1 lg:col-span-4 w-full flex flex-col gap-6 border border-neutral-300 p-4 sm:p-8 rounded-xl shadow-lg'>
        <div className='flex justify-between items-center gap-4'>
          <h1 className='text-xl sm:text-2xl font-bold'>Messages</h1>
        </div>
        <div className='w-full h-full p-4 border border-neutral-300 rounded flex items-stretch gap-4'>
          <div className='max-w-[360px] h-[100vh] flex flex-col overflow-x-hidden overflow-y-auto'>
            {renderedNewestMessages}
            {hasMore && (
              <div className='text-center my-4' ref={itemRef}>
                Loading more...
              </div>
            )}
          </div>
          {selectedUser && (
            <div className='flex-1 pl-4 border-l border-neutral-300'>
              {selectedUser &&
                (isFetchingChat ? (
                  <div className='w-full h-full flex justify-center items-center'>
                    <p className='text-xl font-bold tracking-[2px]'>
                      ...Loading
                    </p>
                  </div>
                ) : (
                  <div className='h-[100vh] bg-neutral-50 z-50 bottom-0 right-4 border border-neutral-300 rounded-lg text-neutral-800 flex flex-col justify-between overflow-hidden'>
                    {isSuccessChat && (
                      <div className='p-4 flex justify-between items-center gap-4 border-b border-neutral-300 bg-violet-500 text-white'>
                        <div className='flex gap-4'>
                          <img
                            className='size-[36px] rounded-full object-cover'
                            src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${
                              chatDetailsData[0]?.sender?.image?.url
                            }`}
                            alt={chatDetailsData[0]?.sender?.image?.name}
                            {...{ fetchPriority: 'low' }}
                          />
                          <p className='font-bold cursor-pointer'>
                            {chatDetailsData[0]?.sender?.email}
                          </p>
                        </div>
                        <button
                          className='px-4 py-2 bg-neutral-800 text-white font-bold flex items-center gap-2 rounded'
                          onClick={() =>
                            setVisibleModal({
                              visibleConfirmModal: {
                                icon: (
                                  <FaRegTrashCan className='text-red-500' />
                                ),
                                question: `Are you sure you want to end this chat?`,
                                description: 'This cannot be undone!',
                                loading: isLoadingDelete,
                                acceptFunc: () =>
                                  deleteChat(chatDetailsData[0]?.sender._id),
                              },
                            })
                          }
                        >
                          <p>End chat</p>
                          <FaRegTrashCan />
                        </button>
                      </div>
                    )}
                    <div
                      ref={chatContainerRef}
                      className='relative px-2 py-4 w-full h-full overflow-y-auto flex flex-col gap-4'
                    >
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
                                src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${
                                  m?.sender?.image?.url
                                }`}
                                alt={m?.sender?.image?.name}
                                {...{ fetchPriority: 'low' }}
                              />
                            )}
                            <p
                              className={`max-w-[180px] px-2 py-1 rounded-3xl break-words ${
                                sentBy
                                  ? 'bg-violet-500 text-neutral-100'
                                  : 'bg-neutral-200'
                              }`}
                            >
                              {m?.content}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    <div
                      className='relative w-full p-2'
                      onClick={handleFocusComment}
                    >
                      <div
                        onBlur={() => {
                          setIsFocusCmt(false);
                        }}
                        onKeyDown={handleKeyDown}
                        ref={messageRef}
                        className='rounded-3xl px-4 py-2 bg-neutral-200 max-h-[180px] focus:outline overflow-y-auto'
                        contentEditable
                        onInput={(e) =>
                          setCurrentMessage(e.currentTarget.textContent)
                        }
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
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default MessagesLayout;
