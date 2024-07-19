import Modal from '@/Modal';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ModalContext } from '../../../context/ModalProvider';
import useClickOutside from '../../../hooks/useClickOutside';
import { IoCloudUploadOutline } from 'react-icons/io5';
import { FaXmark } from 'react-icons/fa6';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FetchDataContext } from '../../../context/FetchDataProvider';
import { usePostProductMutation } from '../../../services/redux/query/products';
import { formats, modules } from '../../../config/quill';
import {
  formatAndPreserveCursor,
  formatNumber,
} from '../../../services/utils/format';
function AddProductModal() {
  const { state, setVisibleModal } = useContext(ModalContext);
  const [modalRef, clickOutside] = useClickOutside();
  const { categories } = useContext(FetchDataContext);
  const imgRef = useRef();
  const [specification, setSpecification] = useState({
    name: '',
    value: '',
  });
  const [question, setQuestion] = useState({
    title: '',
    answer: '',
  });
  const [form, setForm] = useState({
    name: '',
    images: [],
    description: '',
    price: '',
    quantity: '',
    category: '',
    specifications: [],
    questions: [],
    status: '',
  });
  // const [
  //   checkSpecification,
  //   {
  //     data: specificationData,
  //     isSuccess: isSuccessSpecification,
  //     isLoading: isLoadingSpecification,
  //     isError: isErrorSpecification,
  //     error: errorSpecification,
  //   },
  // ] = useCheckSpecificationMutation();
  const [
    postProduct,
    {
      data: postProductData,
      isSuccess: isSuccessPostProduct,
      isLoading: isLoadingPostProduct,
      isError: isErrorPostProduct,
      error: errorPostProduct,
    },
  ] = usePostProductMutation();
  const handleUploadImg = () => {
    if (imgRef?.current) {
      imgRef.current.click();
    }
  };
  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    setForm({ ...form, images: [...form.images, file] });
  };

  const handleAddSpecification = useCallback(() => {
    setForm({
      ...form,
      specifications: [...form.specifications, specification],
    });
    setSpecification({ name: '', value: '' });
  }, [specification, form]);
  const handleAddQuestion = useCallback(() => {
    setForm({ ...form, questions: [...form.questions, question] });
    setQuestion({ title: '', answer: '' });
  }, [question, form]);
  const handleInputNumberChange = (e) => {
    const { name } = e.target;
    const value = e.target.value.replace(/\D/g, '');
    const numericValue = Number(value);
    if (!isNaN(numericValue)) {
      setForm({ ...form, [name]: numericValue });
    }
  };
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const data = new FormData();
      data.append('name', form.name);
      const findCategory = categories.find((c) => c.name === form.category);
      for (const img of form.images) {
        data.append('images', img);
      }
      data.append('description', form.description);
      data.append('price', form.price);
      data.append('quantity', form.quantity);
      data.append('category', findCategory?._id);
      data.append('status', form.status);
      data.append('specifications', JSON.stringify(form.specifications || []));
      data.append('questions', JSON.stringify(form.questions));
      await postProduct(data);
    },
    [postProduct, form, categories]
  );
  useEffect(() => {
    setForm({
      name: '',
      images: [],
      description: '',
      price: '',
      quantity: '',
      category: '',
      specifications: [],
      questions: [],
      status: '',
    });
  }, [state.visibleAddProductModal]);
  useEffect(() => {
    if (isSuccessPostProduct && postProductData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: postProductData?.message,
        },
      });
    }
    if (isErrorPostProduct && errorPostProduct) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorPostProduct?.data?.message,
        },
      });
    }
  }, [
    isSuccessPostProduct,
    postProductData,
    isErrorPostProduct,
    errorPostProduct,
    setVisibleModal,
  ]);
  return (
    <Modal>
      <section
        style={{ backgroundColor: 'rgba(51,51,51,0.9)' }}
        className={`fixed right-0 top-0 w-full h-full z-[100] flex justify-end overflow-hidden ${
          state.visibleAddProductModal ? 'translate-x-0' : 'translate-x-[100%]'
        } transition-all duration-200`}
        onClick={clickOutside}
      >
        <form
          className='w-full lg:w-1/2 h-full bg-slate-50 flex flex-col gap-12 text-neutral-700'
          ref={modalRef}
          onSubmit={handleSubmit}
        >
          <div className='px-4 py-4 sm:py-6 flex justify-between items-center gap-4 bg-neutral-200'>
            <h1 className='text-xl sm:text-2xl font-bold'>Add Product</h1>
            <button
              type='button'
              aria-label='close-modal'
              onClick={() => setVisibleModal('visibleAddProductModal')}
            >
              <FaXmark className='text-2xl sm:text-3xl' />
            </button>
          </div>
          <div className='flex flex-col gap-6 p-4 overflow-y-auto'>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='images'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Images
              </label>
              <div className='col-span-8 sm:col-span-4 flex flex-col gap-4'>
                <div className='border-2 border-dotted border-neutral-300 rounded-lg'>
                  <div
                    className='w-full h-full p-4 cursor-pointer flex flex-col items-center gap-2'
                    role='presentation'
                    onClick={handleUploadImg}
                  >
                    <IoCloudUploadOutline className='text-2xl text-violet-500' />
                    <p className='font-bold'>Upload your image here</p>
                    <p className='italic text-sm'>
                      (Only *.jpeg, *.webp and *.png images will be accepted)
                    </p>
                  </div>
                  <input
                    ref={imgRef}
                    accept='image/*,.jpeg,.jpg,.png,.webp'
                    type='file'
                    style={{ display: 'none' }}
                    onChange={handleFileSelected}
                    multiple
                  />
                </div>
                <div className='grid grid-cols-4 gap-4'>
                  {form?.images?.map((img, key) => {
                    return (
                      <div
                        className='relative w-[96px] h-[96px]'
                        key={img.name}
                      >
                        {img && (
                          <img
                            className='w-full h-full object-cover'
                            src={URL.createObjectURL(img)}
                            alt={img.name}
                          />
                        )}
                        <button
                          type='button'
                          className='absolute top-1 right-1 border border-red-500 text-red-500 rounded-full p-1'
                          aria-label='remove-img'
                          onClick={() =>
                            setForm({
                              ...form,
                              images: form.images.filter(
                                (_, index) => index !== key
                              ),
                            })
                          }
                        >
                          <FaXmark />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='name'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Name
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <input
                  id='name'
                  name='name'
                  className='block w-full h-12 border px-3 py-1 text-sm leading-5 rounded-md bg-gray-100 focus:border-gray-200 border-gray-200'
                  type='text'
                  placeholder='Enter product name...'
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='description'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Description
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <ReactQuill
                  modules={modules}
                  formats={formats}
                  className='bg-white text-neutral-700 rounded'
                  theme='snow'
                  value={form.description}
                  onChange={(value) => setForm({ ...form, description: value })}
                />
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='price'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Price
              </label>
              <div className='col-span-8 sm:col-span-4 flex items-stretch rounded-md'>
                <div className='flex justify-center items-center border border-gray-200 bg-gray-100 px-2'>
                  đ
                </div>
                <input
                  id='price'
                  name='price'
                  className='block w-full h-12 border px-3 py-1 text-sm leading-5 bg-gray-100 focus:border-gray-200 border-gray-200'
                  type='text'
                  placeholder='Enter product price...'
                  value={formatNumber(form.price)} // Display the formatted value
                  onChange={(e) => {
                    handleInputNumberChange(e);
                    formatAndPreserveCursor(e);
                  }}
                />
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='quantity'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Quantity
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <input
                  id='quantity'
                  name='quantity'
                  className='block w-full h-12 border px-3 py-1 text-sm leading-5 rounded-md bg-gray-100 focus:border-gray-200 border-gray-200'
                  placeholder='Enter product quantity...'
                  type='text'
                  value={formatNumber(form.quantity)} // Display the formatted value
                  onChange={(e) => {
                    handleInputNumberChange(e);
                    formatAndPreserveCursor(e);
                  }}
                />
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='category'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Category
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <select
                  className='focus:outline-none block w-full h-12 border px-3 py-1 text-sm leading-5 rounded-md bg-gray-100 focus:border-gray-200 border-gray-200'
                  name='category'
                  id='category'
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  value={form.category}
                >
                  <option value=''>Category</option>
                  {categories?.map((c) => {
                    return (
                      <option className='capitalize' key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            {/* <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='specification'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Specifications
              </label>
              <div className='col-span-8 sm:col-span-4 flex flex-col gap-4'>
                <div className='flex flex-col gap-4'>
                  <div className='w-full flex items-stretch gap-4'>
                    <input
                      id='specification'
                      name='specification'
                      className='block w-full h-12 border px-3 py-1 text-sm leading-5 rounded-md bg-gray-100 focus:border-gray-200 border-gray-200'
                      type='text'
                      placeholder='Enter SKU code. Example: CAMTEST-2021'
                      value={specification}
                      onChange={(e) => setSpecification(e.target.value)}
                    />
                    <button
                      type='button'
                      className='w-[120px] bg-neutral-700 text-white rounded font-bold'
                      onClick={() => checkSpecification(specification)}
                      disabled={isLoadingSpecification || !specification}
                    >
                      Add
                    </button>
                  </div>
                  {errorMess && (
                    <p className='font-bold text-red-500 text-sm'>
                      {errorMess}
                    </p>
                  )}
                </div>
                {form.specifications.length > 0 && (
                  <ul className='list-decimal p-4 border border-neutral-300 rounded'>
                    {form.specifications?.map((s, index) => {
                      return (
                        <li
                          key={s._id}
                          className='font-bold flex items-center gap-2'
                        >
                          <span>{index + 1}.</span>
                          <p className='w-full'>
                            <span>{s.name}</span> : <span>{s.value}</span>
                          </p>
                          <div className='w-full flex justify-end'>
                            <button
                              type='button'
                              onClick={() =>
                                setForm({
                                  ...form,
                                  specifications: form.specifications.filter(
                                    (sF) => sF._id !== s._id
                                  ),
                                })
                              }
                            >
                              <FaXmark className='text-xl' />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div> */}
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='specifications'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Specifications
              </label>
              <div className='col-span-8 sm:col-span-4 flex flex-col gap-4'>
                <div className='flex flex-col gap-4'>
                  <div className='flex flex-col gap-4'>
                    <input
                      id='specifications'
                      name='specifications'
                      className='block w-full h-12 border px-3 py-1 text-sm leading-5 rounded-md bg-gray-100 focus:border-gray-200 border-gray-200'
                      type='text'
                      placeholder='Enter name specification...'
                      value={specification.name}
                      onChange={(e) =>
                        setSpecification({
                          ...specification,
                          name: e.target.value,
                        })
                      }
                    />
                    <input
                      id='specifications'
                      name='specifications'
                      className='block w-full h-12 border px-3 py-1 text-sm leading-5 rounded-md bg-gray-100 focus:border-gray-200 border-gray-200'
                      type='text'
                      placeholder='Enter value specification...'
                      value={specification.value}
                      onChange={(e) =>
                        setSpecification({
                          ...specification,
                          value: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className='w-full flex justify-end'>
                    <button
                      type='button'
                      className='w-[120px] py-2 bg-neutral-700 text-white rounded font-bold'
                      onClick={handleAddSpecification}
                    >
                      Add
                    </button>
                  </div>
                </div>
                {form?.specifications.length > 0 && (
                  <ul className='p-4 list-decimal text-sm flex flex-col gap-2 border border-neutral-300 rounded'>
                    {form?.specifications?.map((s, index) => {
                      return (
                        <li key={index} className='flex gap-2 overflow-hidden'>
                          <p>{index + 1}.</p>
                          <div className='flex flex-col gap-1'>
                            <p title={s.name} className='w-max truncate'>
                              {s.name}
                            </p>
                            <p title={s.value} className='w-max truncate'>
                              {s.value}
                            </p>
                          </div>
                          <div className='w-full flex justify-end'>
                            <button
                              type='button'
                              className='remove-question'
                              onClick={() =>
                                setForm({
                                  ...form,
                                  specifications: form.specifications.filter(
                                    (_, formIndex) => formIndex !== index
                                  ),
                                })
                              }
                            >
                              <FaXmark className='text-xl' />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='questions'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Questions
              </label>
              <div className='col-span-8 sm:col-span-4 flex flex-col gap-4'>
                <div className='flex flex-col gap-4'>
                  <div className='flex flex-col gap-4'>
                    <input
                      id='questions'
                      name='questions'
                      className='block w-full h-12 border px-3 py-1 text-sm leading-5 rounded-md bg-gray-100 focus:border-gray-200 border-gray-200'
                      type='text'
                      placeholder='Enter question...'
                      value={question.title}
                      onChange={(e) =>
                        setQuestion({ ...question, title: e.target.value })
                      }
                    />
                    <input
                      id='questions'
                      name='questions'
                      className='block w-full h-12 border px-3 py-1 text-sm leading-5 rounded-md bg-gray-100 focus:border-gray-200 border-gray-200'
                      type='text'
                      placeholder='Enter answer...'
                      value={question.answer}
                      onChange={(e) =>
                        setQuestion({ ...question, answer: e.target.value })
                      }
                    />
                  </div>
                  <div className='w-full flex justify-end'>
                    <button
                      type='button'
                      className='w-[120px] py-2 bg-neutral-700 text-white rounded font-bold'
                      onClick={handleAddQuestion}
                    >
                      Add
                    </button>
                  </div>
                </div>
                {form?.questions.length > 0 && (
                  <ul className='p-4 list-decimal text-sm flex flex-col gap-2 border border-neutral-300 rounded'>
                    {form?.questions?.map((q, index) => {
                      return (
                        <li key={index} className='flex gap-2 overflow-hidden'>
                          <p>{index + 1}.</p>
                          <div className='flex flex-col gap-1'>
                            <p title={q.title} className='w-max truncate'>
                              {q.title}
                            </p>
                            <p title={q.answer} className='w-max truncate'>
                              {q.answer}
                            </p>
                          </div>
                          <div className='w-full flex justify-end'>
                            <button
                              type='button'
                              className='remove-question'
                              onClick={() =>
                                setForm({
                                  ...form,
                                  questions: form.questions.filter(
                                    (_, formIndex) => formIndex !== index
                                  ),
                                })
                              }
                            >
                              <FaXmark className='text-xl' />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='status'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Status
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <select
                  className='focus:outline-none block w-full h-12 border px-3 py-1 text-sm leading-5 rounded-md bg-gray-100 focus:border-gray-200 border-gray-200'
                  name='status'
                  id='status'
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  value={form.status}
                >
                  <option value=''>Status</option>
                  <option value='active'>Active</option>
                  <option value='disabled'>Disabled</option>
                </select>
              </div>
            </div>
            <div className='flex justify-end items-stretch gap-4 font-bold'>
              <button
                type='button'
                className='border border-neutral-700 rounded px-4 py-2 hover:border-red-300 hover:text-red-400 transition-colors'
                onClick={() => setVisibleModal('visibleAddProductModal')}
                disabled={isLoadingPostProduct}
              >
                Cancel
              </button>
              <button
                type='submit'
                className='bg-neutral-700 text-white rounded px-4 py-2 hover:bg-violet-500 transition-colors'
                disabled={isLoadingPostProduct}
              >
                Add Product
              </button>
            </div>
          </div>
        </form>
      </section>
    </Modal>
  );
}

export default AddProductModal;
