// Presentational shipping form. The parent Checkout page owns the form state and
// validation so the checkout flow's data lives in one place.
const FIELDS = [
  { name: 'fullName', label: 'Full Name', placeholder: 'Aarav Sharma', autoComplete: 'name' },
  { name: 'phone', label: 'Phone', placeholder: '9876543210', autoComplete: 'tel' },
  { name: 'addressLine1', label: 'Address', placeholder: '22 MG Road', autoComplete: 'street-address' },
  { name: 'city', label: 'City', placeholder: 'Bengaluru', autoComplete: 'address-level2' },
  { name: 'state', label: 'State', placeholder: 'Karnataka', autoComplete: 'address-level1' },
  { name: 'pincode', label: 'Pincode', placeholder: '560001', autoComplete: 'postal-code' },
];

const CheckoutForm = ({ values, errors, onChange, disabled }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Details</h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {FIELDS.map((field) => (
        <div
          key={field.name}
          className={field.name === 'addressLine1' ? 'sm:col-span-2' : ''}
        >
          <label
            htmlFor={field.name}
            className="block text-sm font-medium text-gray-700"
          >
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            type="text"
            autoComplete={field.autoComplete}
            value={values[field.name]}
            onChange={onChange}
            disabled={disabled}
            placeholder={field.placeholder}
            className={`mt-1 block w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-gray-100 ${
              errors[field.name] ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors[field.name] && (
            <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default CheckoutForm;
