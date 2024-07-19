export const getAuthToken = () => {
  return window.localStorage.getItem('camera-shop-mern-token');
};
export const deleteToken = () => {
  return window.localStorage.removeItem('camera-shop-mern-token');
};
