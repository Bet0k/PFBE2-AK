import User from "../dao/classes/users.dao.js"

const userService = new User();

export const getUsers = async (req, res) => {
    try {
        const result = await userService.getUsers();

        if (result.message) {
            return res.status(200).json({
                status: "success",
                message: result.message
            });
        }

        res.status(200).json({
            status: "success",
            payload: result.users
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }
}

export const createUser = async (req, res) => {
    const user = req.body;

    try {
        const result = await userService.createUser(user);

        if (result.error) {
            return res.status(400).json({
                status: "error",
                message: result.error
            });
        }

        res.status(201).json({
            status: "success",
            payload: result.user
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            error: error.message
        });
    }
};


export const loginUser = async (req, res) => {
    const {
        email,
        password
    } = req.body;

    try {
        const result = await userService.loginUser(email, password);

        if (result.error) {
            return res.status(400).json({
                status: "error",
                message: result.error
            });
        }

        res.cookie('token', result.token, {
            httpOnly: true,
            secure: false
        });


        res.status(200).json({
            status: "success",
            payload: result.user,
            token: result.token
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }
}

export const getProfile = async (req, res) => {
    try {

        const result = await userService.getProfile(req.user);

        if (result.error) {
            return res.status(401).json({
                status: "error",
                message: result.error
            });
        }

        res.status(200).json({
            status: "ok",
            payload: result.user
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};


export const getCurrentUser = async (req, res) => {
    try {
        const token = req.cookies["token"];
        const result = await userService.getCurrentUser(token);

        if (result.error) {
            return res.status(401).json({
                status: "error",
                message: result.error
            });
        }

        res.status(200).json({
            status: "success",
            user: result
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};