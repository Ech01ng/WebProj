// Initialize product filtering functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements for filtering
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('search');
    const productCards = document.querySelectorAll('.product-card');

    // Main function to filter products based on category and search term
    function filterProducts() {
        // Get current filter values
        const selectedCategory = categoryFilter.value.toLowerCase();
        const searchTerm = searchInput.value.toLowerCase();

        // Check each product card against filters
        productCards.forEach(card => {
            // Get product details from card
            const category = card.querySelector('.product-category').textContent.toLowerCase();
            const title = card.querySelector('.product-title').textContent.toLowerCase();
            
            // Check if product matches both filters
            const matchesCategory = !selectedCategory || category.includes(selectedCategory);
            const matchesSearch = !searchTerm || title.includes(searchTerm);

            // Show/hide product based on filter matches
            if (matchesCategory && matchesSearch) {
                card.style.display = ''; // Show product
            } else {
                card.style.display = 'none'; // Hide product
            }
        });
    }

    // Add event listeners for real-time filtering
    categoryFilter.addEventListener('change', filterProducts);
    searchInput.addEventListener('input', filterProducts);

    // Category mapping for filter values to actual category names
    const categoryMap = {
        '1': 'prescription medicines',
        '2': 'over-the-counter',
        '3': 'vitamins and supplements',
        '4': 'personal care',
        '5': 'medical supplies'
    };

    // Enhanced category filter with mapping
    categoryFilter.addEventListener('change', function() {
        // Get selected category value
        const selectedValue = this.value;
        // Convert category ID to actual category name
        const selectedCategory = categoryMap[selectedValue] || '';
        
        // Filter products with mapped category
        productCards.forEach(card => {
            const category = card.querySelector('.product-category').textContent.toLowerCase();
            const matchesCategory = !selectedValue || category.includes(selectedCategory);
            
            // Also check against current search term
            const searchTerm = searchInput.value.toLowerCase();
            const title = card.querySelector('.product-title').textContent.toLowerCase();
            const matchesSearch = !searchTerm || title.includes(searchTerm);

            // Show/hide product based on both filters
            if (matchesCategory && matchesSearch) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
}); 