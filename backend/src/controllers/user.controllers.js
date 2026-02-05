import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { User } from '../models/user.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import jwt from 'jsonwebtoken';

// generate access token and refresh token
/**
 * Generates access and refresh tokens for a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<{accessToken: string, refreshToken: string}>} - The generated tokens.
 */
const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });

    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(
      500,
      'Something went wrong while generating refresh and access token'
    );
  }
};

// user register controller
const registerUser = asyncHandler(async (req, res, next) => {
  // Get user data from frontend
  const { email, password, fullName } = req.body;

  // Validate user data: all fields must be non-empty
  if (
    [fullName, email, password].some(
      (field) => !field || field.trim() === ''
    )
  ) {
    throw new ApiError(400, 'All fields are required');
  }

  // Check if user already exists (by email)
  const existingUser = await User.findOne({
    email
  });
  if (existingUser) {
    throw new ApiError(409, 'User already exists');
  }

  // Check for avatar image
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar is required');
  }

  // Upload avatar to Cloudinary
  const avatar = await uploadToCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(500, 'Failed to upload avatar');
  }

  // Create user object and save in database
  const user = await User.create({
    email,
    fullName,
    password,
    avatar: avatar?.url,
  });

  // Remove password and refreshToken from response
  const createdUserCheck = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  // Check user creation
  if (!createdUserCheck) {
    throw new ApiError(500, 'Failed to create user');
  }

  // Respond to frontend
  return res
    .status(201)
    .json(new ApiResponse(201, createdUserCheck, 'User created successfully'));
});

// user login controller
const loginUser = asyncHandler(async (req, res, next) => {
  // req body -> data
  const { email, password } = req.body;

  // verify if email exists
  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  // find the user
  const user = await User.findOne({
    email
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // password check
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid password');
  }

  // access token and refresh token
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  // send cookie
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  return res
    .status(200)
    .cookie('refreshToken', refreshToken, options)
    .cookie('accessToken', accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        'User logged in successfully'
      )
    );
});

// user logout controller
const logoutUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

// refresh token controller
const refreshAccessToken = asyncHandler(async (req, res, next) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, 'Unauthorized request');
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(404, 'Invalid request');
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, 'Refresh token is expired, please login again');
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          'Access token generated successfully'
        )
      );
  } catch (err) {
    throw new ApiError(
      401,
      err?.message || 'Could not refresh access token, please login again'
    );
  }
});

// change password controller
const changeCurrentPassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Old password is incorrect');
  }

  user.password = newPassword;
  await user.save({
    validateBeforeSave: false,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password changed successfully'));
});

// get current user controller
const getCurrentUser = asyncHandler(async (req, res, next) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'Current user fetched successfully'));
});

// update user details controller
const updateUserDetails = asyncHandler(async (req, res, next) => {
  const { fullName, email } = req.body;

  if (!fullName && !email) {
    throw new ApiError(400, 'At least one field is required to update');
  }

  // Check if email is being updated and if it's unique
  if (email) {
    const existingUser = await User.findOne({ email });
    if (
      existingUser &&
      existingUser._id.toString() !== req.user._id.toString()
    ) {
      throw new ApiError(409, 'Email already exists');
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select('-password');

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, 'User details updated successfully')
    );
});

// update avatar image controller
const updateAvatarImage = asyncHandler(async (req, res) => {
  const avatarImageLocalPath = req?.file?.path;

  if (!avatarImageLocalPath) {
    throw new ApiError(400, 'Avatar image is required');
  }

  const avatar = await uploadToCloudinary(avatarImageLocalPath);

  if (!avatar?.url) {
    throw new ApiError(
      500,
      'Could not upload avatar image, please try again later'
    );
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar?.url,
      },
    },
    {
      new: true,
    }
  ).select('-password');

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, 'Avatar image updated successfully')
    );
});

// get all users controller
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password -refreshToken');

  return res
    .status(200)
    .json(
      new ApiResponse(200, users, 'All users fetched successfully')
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserDetails,
  updateAvatarImage,
  getAllUsers
};
