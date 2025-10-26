# Global Countries Data API 🌍

## Overview
This project is a robust RESTful API built with Node.js and Express, designed to manage and serve global country data. It leverages Sequelize ORM for seamless interaction with a MySQL database, providing synchronized data from external sources and dynamic data summaries.

## Features
*   **RESTful API Endpoints**: Comprehensive set of endpoints for retrieving, filtering, and managing country information.
*   **Data Synchronization**: Automatically fetches and updates country data, exchange rates, and calculated GDP from external APIs (REST Countries, Open ER API).
*   **Database Caching**: Stores and manages all country data persistently in a MySQL database using Sequelize.
*   **Dynamic Data Summaries**: Generates a `summary.png` image displaying key statistics, including top countries by estimated GDP, available via a dedicated endpoint.
*   **Filtering & Sorting**: Supports querying countries by region, currency, and sorting by estimated GDP.
*   **Global Error Handling**: Implements centralized error handling for improved API stability and informative responses.

## Getting Started

Follow these steps to set up and run the project locally.

### Installation
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Afaks-11/hng-stage-2-backend.git
    cd HNG-stage-2
    ```

2.  **Install Dependencies**:
    Install all required Node.js packages using npm:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root directory of the project and populate it with the following required environment variables. Refer to the table below for examples.

    ```dotenv
    PORT=3000
    DB_NAME=your_database_name
    DB_USER=your_database_user
    DB_PASS=your_database_password
    DB_HOST=localhost
    EXCHANGE_RATE_API_URL=https://open.er-api.com/v6/latest/USD
    COUNTRIES_API_URL=https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies
    ```

    | Variable               | Description                                            | Example                         |
    | :--------------------- | :----------------------------------------------------- | :------------------------------ |
    | `PORT`                 | The port on which the Express server will listen.      | `3000`                          |
    | `DB_NAME`              | Name of your MySQL database.                           | `country_data_db`               |
    | `DB_USER`              | Username for your MySQL database.                      | `root`                          |
    | `DB_PASS`              | Password for your MySQL database.                      | `your_password`                 |
    | `DB_HOST`              | Hostname or IP address of your MySQL server.           | `localhost`                     |
    | `EXCHANGE_RATE_API_URL`| URL for fetching currency exchange rates.              | `https://open.er-api.com/v6/latest/USD` |
    | `COUNTRIES_API_URL`    | URL for fetching global country data.                  | `https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies` |

### Database Setup
Ensure you have a MySQL server running and accessible with the credentials provided in your `.env` file. The application will automatically synchronize its Sequelize models with the database schema on startup.

### Running the Application
To start the development server (with `nodemon` for auto-restarts):
```bash
npm start
```
For production (without `nodemon`):
```bash
npm run start:prod
```
The server will be running on `http://localhost:[PORT]` (default: `http://localhost:3000`).

## Usage
Once the server is running, you can interact with the API using tools like cURL, Postman, or directly from your browser.

1.  **Verify Server Status**:
    Open your browser or use cURL to confirm the server is operational:
    ```bash
    curl http://localhost:3000/ping
    ```
    Expected output: `{"message": "Server is running!"}`

2.  **Populate Initial Data**:
    The database will be empty initially. To fetch and cache country data, trigger the refresh endpoint:
    ```bash
    curl -X POST http://localhost:3000/countries/refresh
    ```
    This may take a few seconds as it fetches data from external APIs and generates a summary image.

3.  **Explore Country Data**:
    After refreshing, you can retrieve all countries:
    ```bash
    curl http://localhost:3000/countries
    ```

    Or filter and sort:
    ```bash
    curl "http://localhost:3000/countries?region=Africa&sort=gdp_desc"
    ```

## API Documentation

### Base URL
`http://localhost:[PORT]` (where `[PORT]` is your configured port, default `3000`)

### Endpoints

#### `GET /ping`
Checks if the server is alive.
**Request**:
No payload required.

**Response**:
```json
{
  "message": "Server is running!"
}
```

**Errors**:
- `500 Internal Server Error`: An unexpected server error occurred.

#### `GET /status`
Retrieves the total number of cached countries and the timestamp of the last data refresh.
**Request**:
No payload required.

**Response**:
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2023-10-27T10:30:00.000Z"
}
```
(If no data has been refreshed yet)
```json
{
  "total_countries": 0,
  "last_refreshed_at": null
}
```

**Errors**:
- `500 Internal Server Error`: An unexpected server error occurred.

#### `GET /countries/image`
Serves a dynamically generated PNG image summarizing key country data (e.g., top 5 countries by GDP).
**Request**:
No payload required.

**Response**:
A binary `image/png` file.

**Errors**:
- `404 Not Found`: `{"error": "Summary image not found"}` (if the image has not been generated or found).
- `500 Internal Server Error`: An unexpected server error occurred.

#### `POST /countries/refresh`
Triggers a full synchronization process: fetches data from external country and exchange rate APIs, updates the database, and regenerates the summary image.
**Request**:
No payload required (empty body).

**Response**:
```json
{
  "status": "success",
  "totalCountries": 250,
  "lastRefreshedAt": "2023-10-27T10:30:00.000Z"
}
```

**Errors**:
- `503 Service Unavailable`: `{"error": "External data source unavailable", "details": "Could not fetch data from Open ER API"}` (if an external API is unreachable or returns an error).
- `503 Service Unavailable`: `{"error": "External data source unavailable", "details": "Could not fetch data from REST Countries"}`.
- `500 Internal Server Error`: An unexpected server error occurred during the refresh process or image generation.

#### `GET /countries`
Retrieves a list of all countries, with optional filtering and sorting.
**Request**:
Query parameters:
- `region` (Optional): Filter countries by their geopolitical region (e.g., `Africa`, `Europe`).
- `currency` (Optional): Filter countries by their currency code (e.g., `NGN`, `USD`).
- `sort` (Optional): Sort order for the results.
    - `gdp_desc`: Sorts countries by `estimated_gdp` in descending order (nulls last).
    - Default: Sorts by `name` in ascending order.

**Response**:
```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 200000000,
    "currency_code": "NGN",
    "exchange_rate": "750.00000000",
    "estimated_gdp": "500000000000.00000000",
    "flag_url": "https://restcountries.com/data/nga.svg",
    "created_at": "2023-10-27T10:00:00.000Z",
    "last_refreshed_at": "2023-10-27T10:30:00.000Z"
  },
  {
    "id": 2,
    "name": "Ghana",
    "capital": "Accra",
    "region": "Africa",
    "population": 30000000,
    "currency_code": "GHS",
    "exchange_rate": "12.00000000",
    "estimated_gdp": "75000000000.00000000",
    "flag_url": "https://restcountries.com/data/gha.svg",
    "created_at": "2023-10-27T10:01:00.000Z",
    "last_refreshed_at": "2023-10-27T10:30:00.000Z"
  }
]
```

**Errors**:
- `500 Internal Server Error`: An unexpected server error occurred.

#### `GET /countries/:name`
Retrieves a single country by its exact name (case-sensitive).
**Request**:
Path parameters:
- `name` (Required): The full name of the country.

**Response**:
```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 200000000,
  "currency_code": "NGN",
  "exchange_rate": "750.00000000",
  "estimated_gdp": "500000000000.00000000",
  "flag_url": "https://restcountries.com/data/nga.svg",
  "created_at": "2023-10-27T10:00:00.000Z",
  "last_refreshed_at": "2023-10-27T10:30:00.000Z"
}
```

**Errors**:
- `404 Not Found`: `{"error": "Country not found"}` (if no country with the specified name exists).
- `500 Internal Server Error`: An unexpected server error occurred.

#### `DELETE /countries/:name`
Deletes a single country by its exact name (case-sensitive).
**Request**:
Path parameters:
- `name` (Required): The full name of the country to delete.

**Response**:
```json
{
  "message": "Country deleted successfully"
}
```

**Errors**:
- `404 Not Found`: `{"error": "Country not found"}` (if no country with the specified name exists).
- `500 Internal Server Error`: An unexpected server error occurred.

## Technologies Used

| Technology  | Description                           | Link                                          |
| :---------- | :------------------------------------ | :-------------------------------------------- |
| Node.js     | JavaScript runtime environment        | [nodejs.org](https://nodejs.org/)             |
| Express.js  | Web framework for Node.js             | [expressjs.com](https://expressjs.com/)       |
| Sequelize   | ORM for Node.js and SQL databases     | [sequelize.org](https://sequelize.org/)       |
| MySQL2      | MySQL client for Node.js              | [npmjs.com/package/mysql2](https://www.npmjs.com/package/mysql2) |
| Axios       | Promise-based HTTP client             | [axios-http.com](https://axios-http.com/)     |
| Jimp        | Image processing for Node.js          | [npmjs.com/package/jimp](https://www.npmjs.com/package/jimp)     |
| Dotenv      | Loads environment variables           | [npmjs.com/package/dotenv](https://www.npmjs.com/package/dotenv) |
| Nodemon     | Monitors for changes (dev dependency) | [npmjs.com/package/nodemon](https://www.npmjs.com/package/nodemon) |


---
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)](https://sequelize.org/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Made with Love](https://img.shields.io/badge/Made%20with-Love-ff69b4?style=for-the-badge)](https://github.com/Elderusr)
[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)
