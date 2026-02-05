/**
 * asyncHandler is a utility to wrap async route handlers and middleware.
 * It ensures that any errors thrown in async functions are passed to Express error handlers.
 *
 * @param {Function} requestHandler - The async route handler or middleware function
 * @returns {Function} - A function that handles errors from the async function
 */
const asyncHandler = (requestHandler) => {
  // Return a new function that wraps the original request handler
  return (req, res, next) => {
    // Call the request handler and catch any errors
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
