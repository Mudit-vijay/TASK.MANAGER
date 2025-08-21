const loginSchema = require('../schemas/customer_Schema.js');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const jwt_S = process.env.JWT
const login = async (req, res) => {
    try {
        console.log("request-1");
        console.log("login request");
        const { email, password } = req.body;
        const user = await loginSchema.findOne({ email });
        console.log("passed findings");
        if (!user) {
            console.log("no one with these credentials");
            return res.status(404).json({
                success: false,
                message: "user not found"
            });
        }
        console.log("passed findings 2");
        const ispasswordvalid = bcrypt.compareSync(password, user.password)
        if (!ispasswordvalid) {
            console.log("password not matched");
            return res.status(400).json({ message: `user not present with that password` })
        }
        console.log("token creation")
        const token = jwt.sign(
            { id: user._id, email: user.email },//, role: user.role
            jwt_S,
            { expiresIn: '1h' }
        )
        console.log("cookie creation");
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'LAX',
            maxAge: 24 * 60 * 60 * 1000,
        })
        console.log("final step")
        return res.json( token );
    }
    catch (err) {
        console.log(`Login error:${err.message}`);
        return res.status(401).json({ message: `invalid credentials` })
    }
};
const createUser = async (req, res) => {
    try {
        console.log("request-2");
        console.log("create user request");
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.status(400).json({ message: "name, email and password can't be empty" })
        }
        const saltRounds = 10;
        const hasshed_password = bcrypt.hashSync(password, saltRounds);
        const user = await loginSchema.create({ name, email, password: hasshed_password  });//{...hasshed_password}, role
        const token = jwt.sign(
            { id: user._id },//required so that groups are connected throught the group id and and can be fetched easily 
            jwt_S,
            { expiresIn: '1h' }
        )
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'LAX',
            maxAge: 24 * 60 * 60 * 1000,
        })
        return res.status(201).json({
            success: true,
            message: "user created successfull"
        })
    }
    catch (err) {
        console.log(`error in creating user: ${err.message}`);
        if (err.code === 11000) {
            return res.status(400).json({ message: "the user is allready exist with that email" })
        }
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}
module.exports = { login, createUser };


