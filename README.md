# MERN Stack Application - API Server

This project is a **backend API** for a tour company, built using **Node.js**, **Express**, and **MongoDB**. It provides robust CRUD operations for tours, users, and reviews, along with advanced features like `JWT-based authentication`, `role-based authorization`, and `comprehensive error handling`. The application employs modern web development practices, including **modular architecture**, **reusable factory functions**, and **middleware**, ensuring maintainability, **scalability**, and **security**. Key security measures such as `data sanitization`, `rate limiting`, and setting `HTTP headers` are implemented to protect against common web vulnerabilities.

 - Publish API Document: (https://documenter.getpostman.com/view/30543767/2sAYBUECo7)
 - Hosted Live API: https://natour-api.vercel.app/
 
<img width="942" alt="Capture" src="https://github.com/user-attachments/assets/b342ed80-3533-492e-b9fa-b6de89718f7d">
<img width="942" alt="Capture2" src="https://github.com/user-attachments/assets/236067b7-624d-4a5b-b2be-fc7c22ddfe5c">

## Core Features & Coding practices:
- **Modular Architecture:** Organized into `models`, `controllers`, `routes`, and `utilities` for scalability and maintainability.  
- **Factory Functions:** Reusable functions for `CRUD` operations to reduce duplication and ensure consistency.  
- **Middleware:** Used for authentication, authorization, error handling, and data sanitization.  
- **Utility Classes:** Tools like `APIFeatures` simplify complex query handling (e.g., `filtering` and `pagination`).  
- **Security:** Includes `data sanitization`, `rate limiting`, and `secure HTTP headers` to prevent vulnerabilities.  
- **Environment Configuration:** Uses environment variables for flexible and secure deployment across environments.

## Achievements
- **CRUD Operations:** Implemented robust CRUD operations for tours, users, and reviews.  
- **Authentication and Authorization:** Developed JWT-based authentication and role-based access control.  
- **Error Handling:** Centralized error handling using custom error classes and middleware.  
- **Data Validation and Sanitization:** Ensured data integrity and security through validation and sanitization.  
- **Pagination, Sorting, and Filtering:** Added advanced query features for listing resources efficiently.  
- **Scalability:** Designed the application to be scalable using best practices and modular architecture.  

## Leveraging Modern Web Development Practices

### 1. Factory Functions

- **Purpose:** Reduce code duplication and ensure consistency across the application.  
- **Example:** The `handlerFactory.js` file contains reusable functions for CRUD operations.  

```javascript
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError(`Cannot find document with id of ${req.params.id}`, 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
```

### 2. Middleware

- **Purpose:** Middleware functions handle tasks such as authentication, authorization, error handling, and data sanitization, promoting modularity and maintainability.  
- **Examples:**

#### Logging Middleware  
Logs requests in development mode for better debugging and monitoring:  

```javascript
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
```

## Leveraging Modern Web Development Practices

### Authentication

- **Purpose:** Secure the application by ensuring only authorized users can access specific resources.  
- **Example:** JWT-based authentication to verify and manage user access.  

#### 3. Authentication Middleware:  

The middleware validates tokens, checks user existence, and attaches the user data to the request for further processing:  

```javascript
const protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }
  // Validate token and attach user info to the request
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does not exist.', 401));
  }
  req.user = currentUser;
  next();
});
```
### 4. Utility Classes

- **Purpose:** The `APIFeatures` class simplifies complex query operations for MongoDB by breaking them into reusable, modular functions. It handles filtering, sorting, field limiting, and pagination of query results.
---
### Explanation of `APIFeatures` Functions

#### 1. **filter()**  
- **Functionality:**  
  Filters query parameters by removing special fields (e.g., `page`, `limit`, `sort`, `fields`) and processes conditions like greater than (`gte`), less than (`lt`), etc.  
- **How It Works:**  
  - Copies the query object and removes fields that are not needed for filtering.  
  - Converts MongoDB-specific operators into a query-friendly format.  
  - Applies the processed filters to the database query.  

```javascript
filter() {
  const queryObj = { ...this.queryString };
  const excludedFields = ['page', 'limit', 'sort', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

  this.query = this.query.find(JSON.parse(queryStr));
  return this;
// ... to be continued in the repo
}
```


## Conclusion
By leveraging modern web development practices such as factory functions, middleware, and utility classes, this project achieves a high level of maintainability, scalability, and readability. The modular architecture ensures that each component is responsible for a specific task, making the codebase easier to manage and extend. The use of security measures and environment configuration further enhances the robustness and flexibility of the application.

## Implementation: Follow these Steps:

The available scripts for the server include:

```plaintext
npm start         # Starts the server in development mode
npm run start:prod # Sets the server in production mode
npm run debug     # Runs the server in debug mode using NDB
```

## Dependencies

The server uses various dependencies:

```plaintext
express:           Web framework for Node.js to handle routes and requests.
mongoose:          ODM library for MongoDB, facilitating interaction with the database.
jsonwebtoken:      Helps in generating and verifying JSON Web Tokens (JWT) for user authentication.
bcryptjs:          A library for hashing passwords.
nodemailer:        Used for sending emails in the application.
dotenv:            Loads environment variables from a .env file into process.env.
```

## Middleware

The server employs several middleware functions:

 - express-rate-limit: Limits repeated requests from the same IP.
 - helmet: Sets various HTTP headers to enhance security.
 - express-mongo-sanitize: Sanitizes data to prevent NoSQL injection attacks.
 - xss-clean: Prevents Cross-Site Scripting (XSS) attacks.
 - hpp: Helps in preventing HTTP Parameter Pollution attacks.

## Environment Variables
```markdown
To set up the server, ensure the following environment variables are configured:


NODE_ENV: Set to development or production.
PORT: Port number for the server.
USER: Your username for the database.
DATABASE: MongoDB connection string.
DATABASE_PASSWORD: Password for the database.
JWT_SECRET: Secret key for JWT token generation.
JWT_EXPIRES_IN: Expiry time for JWT tokens.
JWT_COOKIE_EXPIRES_IN: Expiry time for JWT cookies.
EMAIL_USERNAME: Username for sending emails.
EMAIL_PASSWORD: Password for the email account.
EMAIL_HOSTNAME: SMTP hostname for sending emails.
EMAIL_PORT: Port number for the email service.
```

## Usage

1. Clone this repository: `git clone <repository-url>`
2. Install dependencies: `npm install`
3. Set up environment variables as specified in `.env` file.
4. Start the server:
   - Development Mode: `npm start`
   - Production Mode: `npm run start:prod`
   - Debug Mode: `npm run debug`

## Contribution

Contributions, bug reports, and feature suggestions are welcome. To contribute:
1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`
3. Make changes and commit them: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request.

## License

This project is licensed under the ISC License. Feel free to use, modify, or distribute the code as per the terms of this license.
```

Please replace placeholders like `<PASSWORD>` and `your_username_here` with actual values in your `.env` file and project-specific information.
