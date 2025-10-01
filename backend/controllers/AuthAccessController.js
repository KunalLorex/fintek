import { userAccessModel } from "../models";

export const AuthAccessController = async (req, res) => {
    try {

        const { email, password } = req.body;
        const user = await userAccessModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid password" });
        }
        return res.status(200).json({ message: "Login successful" });
    }
    catch (err) {
        return res.status(400).json({ message: err?.body?.toString() })
    }
};
