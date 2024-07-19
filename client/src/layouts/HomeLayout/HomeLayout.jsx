import Banner from './components/Banner';
import Category from './components/Category';
import Product from './components/Product';
function HomeLayout() {
  return (
    <div className='flex flex-col gap-8 md:gap-16'>
      <Banner />
      <Category />
      <Product />
    </div>
  );
}

export default HomeLayout;
