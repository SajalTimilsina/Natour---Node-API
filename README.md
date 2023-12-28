# MERN Stack Application - API Server

This repository contains the backend code for a MERN (MongoDB, Express, React, Node.js) stack application, specifically the API server. This is designed for a Tour company, where use ca loginIn, Signup, forget the password, and CURD operations regarding Tours and reviews.
 - Publish API Document: https://documenter.getpostman.com/view/30945305/2s9YkuYyCW
 
 ![image](https://github.com/SajalTimilsina/Natour---Node-API/assets/19229631/0f0051e8-fd75-4e3c-825b-1c6f591b7b82)


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

## Project Structure

The project structure is divided into various components:

- `routes`: Contains route handlers for different entities.
- `controllers`: Includes controller functions to handle business logic.
- `models`: Defines the database models using Mongoose.
- `utils`: Houses utility functions and helper modules.
- `middleware`: Stores middleware functions used in the application.

## Scripts

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
