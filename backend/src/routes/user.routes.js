import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserDetails,
  updateAvatarImage,
  updateCoverImage,
  getAllUsers,
} from '../controllers/user.controllers.js';
import { authRateLimit } from '../middlewares/ratelimit.middleware.js';
import { cache } from '../middlewares/cache.middleware.js';

// Create a router instance
const userRouter = Router();

// Route for user registration
userRouter.route('/register').post(
  authRateLimit,
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1,
    },
    {
      name: 'coverImage',
      maxCount: 1,
    },
  ]),
  registerUser
);

// Route for user login
userRouter.route('/login').post(authRateLimit, loginUser);


// Route for getting all users
userRouter.route('/users', cache(300)).get(getAllUsers);

// ======================================================================
// secured route only for logged in users
// ======================================================================

// Route for user logout
userRouter.route('/logout').post(verifyJWT, logoutUser);

// Route for refreshing access token
userRouter.route('/refresh-token').post(refreshAccessToken);

// Route for getting user profile
userRouter.route('/me').get(cache(300), verifyJWT, getCurrentUser);

// Route for changing password
userRouter.route('/change-password').post(verifyJWT, changeCurrentPassword);

// Route for updating user account details
userRouter.route('/update-account').patch(verifyJWT, updateUserDetails);

// Route for updating user avatar
userRouter
  .route('/avatar')
  .patch(verifyJWT, upload.single('avatar'), updateAvatarImage);

// Route for updating user cover image
userRouter
  .route('/cover-image')
  .patch(verifyJWT, upload.single('coverImage'), updateCoverImage);
export default userRouter;
