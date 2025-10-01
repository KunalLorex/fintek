
const LoginView = async (req, res) => {

    res.render("login", {
        title: "Login",
        message: req.query.message || ""
    });
};

export { LoginView };


