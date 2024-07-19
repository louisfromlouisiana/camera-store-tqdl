import Modal from '@/Modal';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  FaPlus,
  FaMinus,
  FaAngleLeft,
  FaAngleRight,
  FaXmark,
} from 'react-icons/fa6';
import useClickOutside from '../../hooks/useClickOutside';
import { ModalContext } from '../../context/ModalProvider';
function ImageModal() {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const { state, setVisibleModal } = useContext(ModalContext);
  const [modalRef, clickOutside] = useClickOutside('visibleImageModal');
  const [curImage, setCurImage] = useState(
    () => state?.visibleImageModal?.curImage || 1
  );
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const handleNext = useCallback(() => {
    setCurImage((prevImage) => {
      if (prevImage >= state?.visibleImageModal?.totalImages) return 1;
      return prevImage + 1;
    });
  }, [state?.visibleImageModal?.totalImages]);
  const handlePrev = useCallback(() => {
    setCurImage((prevImage) => {
      if (prevImage <= 1) return state?.visibleImageModal?.totalImages;
      return prevImage - 1;
    });
  }, [state?.visibleImageModal?.totalImages]);
  const handleZoomIn = useCallback(() => {
    setScale((scale) => scale + 0.1);
  }, []);
  const handleZoomOut = useCallback(() => {
    setScale((scale) => scale - 0.1);
  }, []);
  useEffect(() => {
    const image = imgRef.current;
    let isDragging = false;
    let prevPosition = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      prevPosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevPosition.x;
      const deltaY = e.clientY - prevPosition.y;
      setPosition((position) => ({
        x: position.x + deltaX,
        y: position.y + deltaY,
      }));
      prevPosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    image?.addEventListener('mousedown', handleMouseDown);
    image?.addEventListener('mousemove', handleMouseMove);
    image?.addEventListener('mouseup', handleMouseUp);

    return () => {
      image?.removeEventListener('mousedown', handleMouseDown);
      image?.removeEventListener('mousemove', handleMouseMove);
      image?.removeEventListener('mouseup', handleMouseUp);
    };
  }, [imgRef, scale]);
  return (
    <Modal>
      <section
        ref={containerRef}
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        className='fixed top-0 left-0 w-full h-full z-[999] flex justify-center items-center px-6'
        onClick={clickOutside}
      >
        <div
          ref={modalRef}
          className='bg-white max-h-[80vh] overflow-y-auto flex flex-col gap-4'
        >
          <div className='w-full flex justify-end px-4 pt-4'>
            <button
              className='w-max'
              aria-label='close-image-slider'
              onClick={() => setVisibleModal('visibleImageModal')}
            >
              <FaXmark className='text-2xl text-neutral-600' />
            </button>
          </div>
          <div className='relative max-w-[600px] max-h-[600px] border border-neutral-300 overflow-hidden'>
            <div className='absolute top-0 left-0 z-50 flex flex-col bg-violet-500'>
              <button
                className='p-4 text-white border-b border-neutral-300'
                aria-label='zoom-in-img'
                onClick={handleZoomIn}
              >
                <FaPlus />
              </button>
              <button
                className='p-4 text-white'
                aria-label='zoom-out-img'
                onClick={handleZoomOut}
              >
                <FaMinus />
              </button>
            </div>
            {state.visibleImageModal && (
              <img
                ref={imgRef}
                className='w-full min-w-[250px] max-w-[480px] h-full min-h-[250px] max-h-[480px] object-cover'
                style={{
                  transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                }}
                src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${
                  state?.visibleImageModal?.images[curImage - 1]?.url
                }`}
                alt={`img-${curImage}`}
                draggable={false}
                fetchPriority='low'
              />
            )}
          </div>
          <div className='p-4 flex items-center'>
            <div className='flex items-center gap-2'>
              <button aria-label='left-btn-slider' onClick={handlePrev}>
                <FaAngleLeft className='text-xl text-neutral-600' />
              </button>
              <button aria-label='right-btn-slider' onClick={handleNext}>
                <FaAngleRight className='text-xl text-neutral-600' />
              </button>
            </div>
            <div className='w-full flex justify-center items-center'>
              <p className='tracking-[4px] text-neutral-600 text-sm md:text-base'>
                {curImage}/{state?.visibleImageModal?.totalImages}
              </p>
            </div>
          </div>
        </div>
      </section>
    </Modal>
  );
}

export default ImageModal;
