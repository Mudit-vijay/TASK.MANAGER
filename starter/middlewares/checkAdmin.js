const checkAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ msg: "Authentication is required." });
    }
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ msg: "Access denied. Admin only." });
    }
    next();
};

export default checkAdmin;
