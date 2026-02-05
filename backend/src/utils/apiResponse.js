/*
 * apiResponse is a utility to standardize API responses.
 * It ensures a consistent structure for successful and error responses.
 *
 * @param {number} statusCode - The HTTP status code for the response
 * @param {Object} data - The data to include in the response
 * @param {string} [message='Success'] - The response message
 */
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
