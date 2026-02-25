import { catchAsync } from '../middleware/errorHandler.js';
import User from '../models/User.js';

export const personalInformation = catchAsync(async (req, res) => {

    const userId = req.user.id;

    const user = await User.getPersonalInfo(userId);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    return res.status(200).json({
        success: true,
        data: user,
    });
});