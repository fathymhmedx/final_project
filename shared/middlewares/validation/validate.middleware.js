const validate = (schema, source = "body") => {
    const allowedSources = ["body", "params", "query"];

    if (!allowedSources.includes(source)) {
        throw new Error(`Invalid validation source: ${source}`);
    }

    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map((err) => ({
                field: err.path.join("."),
                message: err.message.replace(/"/g, ""),
            }));

            return res.status(400).json({
                success: false,
                errors,
            });
        }

        req[source] = value;

        next();
    };
};

module.exports = validate;