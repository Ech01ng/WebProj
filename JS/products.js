// Purpose of this file is to filter the products based on the category and search term
document.addEventListener('DOMContentLoaded', function() {
    // Get the cart icon
    const categoryFilter = document.getElementById('category-filter');
    // Get the search input
    const searchInput = document.getElementById('search');
    // Get the product cards
    const productCards = document.querySelectorAll('.product-card');

    // Function to filter products
    function filterProducts() {
        // Get the selected category
        const selectedCategory = categoryFilter.value.toLowerCase();
        // Get the search term
        const searchTerm = searchInput.value.toLowerCase();

        // Loop through all product cards
        productCards.forEach(card => {
            // Get the category and title of the current card
            const category = card.querySelector('.product-category').textContent.toLowerCase();
            const title = card.querySelector('.product-title').textContent.toLowerCase();
            // Check if the card matches the selected category and search term
            const matchesCategory = !selectedCategory || category.includes(selectedCategory);
            const matchesSearch = !searchTerm || title.includes(searchTerm);

            // Show/hide based on filters
            if (matchesCategory && matchesSearch) {
                // Show the card if it matches both filters
                card.style.display = '';
            } else {
                // Hide the card if it doesn't match either filter
                card.style.display = 'none';
            }
        });
    }

    // Add event listeners
    categoryFilter.addEventListener('change', filterProducts);
    searchInput.addEventListener('input', filterProducts);

    // Initialize category mapping
    const categoryMap = {
        '1': 'prescription medicines',
        '2': 'over-the-counter',
        '3': 'vitamins and supplements',
        '4': 'personal care',
        '5': 'medical supplies'
    };

    // Update category filter to use the mapping
    categoryFilter.addEventListener('change', function() {
        // Get the selected value
        const selectedValue = this.value;
        // Get the selected category from the mapping
        const selectedCategory = categoryMap[selectedValue] || '';
        
        // Loop through all product cards
        productCards.forEach(card => {
            // Get the category of the current card
            const category = card.querySelector('.product-category').textContent.toLowerCase();
            // Check if the card matches the selected category
            const matchesCategory = !selectedValue || category.includes(selectedCategory);
            // Get the search term
            const searchTerm = searchInput.value.toLowerCase();
            // Get the title of the current card
            const title = card.querySelector('.product-title').textContent.toLowerCase();
            // Check if the card matches the search term
            const matchesSearch = !searchTerm || title.includes(searchTerm);

            // Show/hide based on filters
            if (matchesCategory && matchesSearch) {
                // Show the card if it matches both filters
                card.style.display = '';
            } else {
                // Hide the card if it doesn't match either filter
                card.style.display = 'none';
            }
        });
    });
}); 