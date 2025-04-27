# This is a project for Web Development Module TU857/2

- Made by Erik Hansen C23399501

## Project Overview

This is a full-stack Pharmacy website built with HTML, CSS, JavaScript, and PHP. The project provides a complete online shopping experience with user authentication, product browsing, shopping cart functionality, and contact management.

## Notes

### Coding Style

- You will notice that there are a lot of files in this project, this is due to me being more accustomed to programming with react and following some object oriented programming concepts.
- Hence there are many files that all have their role in the project.
- Under the PHP files, any "echo XYZ", is used for debugging as it will print the message to the console when it gets triggered.
- Some stuff like the "Render the orders" in the orders.js were done like that simply because I was loosing my mind trying to get it to work in another way (I sorta gave up doing it one way and went with a simpler alternative)

### Files

- You will notice some files that are a bit odd / different to others, those being the gitignore, hintrc, config.php and the cart-sidebar.html.
  - gitignore
    - Used for version control due to me programming in different devices.
  - hintrc
    - Due to some warnings that were annoying me, i chose to disable them by creating the hintrc file (a local config file).
  - config.php
    - File needed to configure the database, instead of having it in each php file, all php files call that config.php file for the database configurations
  - cart-sidebar.html
    - This file is just there to create the component of the side menu whe you add a product to the cart, it is not a full page like the other html files hence I thought it be best to explain it here.
- Also something neat I learned is the use of "?v=2" at the end of a JavaScript link file.
  - Under the cart.html I have a JS link like so:
  ```js
  <script src="JS/cart.js?v=2"></script>
  ```
  - This final bit of "js?v=2" forces the browser to use the latest code rather than looking at the cached code (this was causing me quite some trouble when it came to my cart.html not loading the stuff that were added to the cart-sidebar.html).

### Requirements

The website must contain

1. at least 5 pages
   - Contains 6 pages (technically 7 with the cart-sidebar)
2. appropriate style and style sheet
   - Global CSS file for all styles, contains comments
3. HTML
   - It's there
4. PHP and MySQL Database - Multiple PHP files that connect to HTML files which all is linked to a database
   Follow the nature of the business, user should be able to
5. View contents of the database
   - Home page and Products page does this.
6. Add content to the database
   - Register page, Contact page and Cart Page does this.
7. Edit content to the database
   - Orders page has a button for changing billing address, this gets updated once the user confirms it.
8. Delete content to the database
   - Orders page allows the user to see all their orders and "cancel" any of them, when canceling it deletes the entry from the database.

## Features

- User Authentication
  - Login system
  - Registration system
- Product Management
  - Product listing page
  - Product details
  - Product filtering
- Shopping Cart
  - Add/remove items
  - Cart sidebar
  - Checkout process
- Contact Management
  - Contact form
  - Google maps Iframe (thought it would be funny)
- Orders Page
  - Edit billing address
  - Cancel orders
  - Only person logged in can see their own orders

## Project Structure

```
├── CSS/           # Stylesheets
├── JS/            # JavaScript files
├── PHP/           # Backend logic
├── SQL/           # Database scripts
├── Images/        # Image assets
├── index.html     # Homepage
├── products.html  # Product listing
├── cart.html      # Shopping cart
├── login.html     # Login page
├── register.html  # Registration page
├── contact.html   # Contact page
├── hintrc         # Just for getting rid of some warnings locally
├── gitignore      # For version control
└── README         # Overview of project and it's content
```

## Technologies Used

- Frontend:
  - HTML5
  - CSS3
  - JavaScript
- Backend:
  - PHP
  - SQL Database
- Version Control:
  - Git

## Getting Started

1. Set up a local web server (e.g., XAMPP).
2. Import the SQL database.
3. Configure the database connection in PHP files (This should be the same as it currently is due to localhost).
4. Access the website through your local server.
5. An account should already exist:

- username: testuser, password: test123
- It also already has an order so you can go to the orders tab.
