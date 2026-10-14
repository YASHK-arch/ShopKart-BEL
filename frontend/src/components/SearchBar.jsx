const CATEGORIES = ['Electronics', 'Fashion', 'Books', 'Home'];

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const SearchBar = ({ search, category, sort, onSearchChange, onCategoryChange, onSortChange }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <label htmlFor="product-search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            id="product-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search products..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="product-category"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-primary focus:border-primary"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="product-sort" className="block text-sm font-medium text-gray-700 mb-1">
            Sort
          </label>
          <select
            id="product-sort"
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-primary focus:border-primary"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value || 'default'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
