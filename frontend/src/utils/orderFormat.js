export const formatOrderDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

// Badge colours for the fulfilment status shown on order cards and details.
export const statusStyles = {
  PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
  PLACED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
};
