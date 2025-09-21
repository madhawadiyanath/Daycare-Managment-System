const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        default: 'admin',
        enum: ['admin', 'superadmin']
    }
}, { 
    timestamps: true,
});

const Admin = mongoose.model("Admin", adminSchema);

// Create default admin if not exists
const createDefaultAdmin = async () => {
    try {
        const adminExists = await Admin.findOne({ username: 'abcd' });
        if (!adminExists) {
            const defaultAdmin = new Admin({
                username: 'abcd',
                password: '0000abcd',
                role: 'superadmin'
            });
            await defaultAdmin.save();
            console.log('Default admin user created');
        }
    } catch (err) {
        console.error('Error creating default admin:', err);
    }
};

module.exports = {
    Admin,
    createDefaultAdmin
};
