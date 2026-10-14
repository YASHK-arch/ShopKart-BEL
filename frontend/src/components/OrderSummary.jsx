const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

// Read-only review of the current cart, shown alongside the shipping form.
const OrderSummary = ({ items, total, submitting, onPlaceOrder, error }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
    <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.product._id}
          className="flex justify-between gap-4 text-sm text-gray-700"
        >
          <span>
            {item.product.name}{' '}
            <span className="text-gray-400">× {item.quantity}</span>
          </span>
          <span className="font-medium text-gray-900">
            {formatPrice(item.product.price * item.quantity)}
          </span>
        </div>
      ))}
    </div>

    <hr className="my-4" />

    <div className="flex justify-between text-lg font-bold text-gray-900">
      <span>Total:</span>
      <span>{formatPrice(total)}</span>
    </div>

    {error && (
      <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-3">
        {error}
      </p>
    )}

    <button
      type="button"
      onClick={onPlaceOrder}
      disabled={submitting || items.length === 0}
      className="mt-6 w-full bg-primary hover:bg-blue-600 text-white py-3 rounded-md font-medium transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
    >
      {submitting ? 'Processing...' : 'Place Order'}
    </button>
  </div>
);

export default OrderSummary;
