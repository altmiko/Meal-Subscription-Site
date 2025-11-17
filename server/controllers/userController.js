import { User } from '../models/User.js';

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const fieldsToUpdate = {};
        
        if (name) fieldsToUpdate.name = name;
        if (phone) fieldsToUpdate.phone = phone;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            fieldsToUpdate,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

