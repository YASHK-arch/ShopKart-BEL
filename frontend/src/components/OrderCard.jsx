import { Link } from 'react-router-dom';
import { formatOrderDate, statusStyles } from '../utils/orderFormat';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

const OrderCard = ({ order }) => (
  <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
    <div className="flex justify-between items-start gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Order #{order._id.slice(-8)}
        </h2>
        <p className="text-sm text-gray-500">{formatOrderDate(order.createdAt)}</p>
      </div>
      <span
        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          statusStyles[order.status] || 'bg-gray-100 text-gray-700'
        }`}
      >
        {order.status}
      </span>
    </div>

    <ul className="mt-4 space-y-1 text-sm text-gray-700">
      {order.items.map((item) => (
        <li key={item.product} className="flex justify-between gap-4">
          <span>
            {item.name} <span className="text-gray-400">× {item.quantity}</span>
          </span>
          <span className="font-medium text-gray-900">
            {formatPrice(item.price * item.quantity)}
          </span>
        </li>
      ))}
    </ul>

    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
      <p className="text-lg font-bold text-gray-900">Total: {formatPrice(order.totalAmount)}</p>
      <Link
        to={`/orders/${order._id}`}
        className="text-sm font-medium text-primary hover:text-blue-500"
      >
        View Details
      </Link>
    </div>
  </article>
);

export default OrderCard;
