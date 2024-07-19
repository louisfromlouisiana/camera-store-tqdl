export function formatNumberWithDot(number) {
  return number.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
}
