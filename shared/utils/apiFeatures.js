class ApiFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
        this.paginationResult = {};
    }

    // SORT
    sort() {
        if (this.queryString.sort) {

            const sortBy =
                this.queryString.sort
                    .split(",")
                    .join(" ");

            this.query =
                this.query.sort(sortBy);

        } else {

            // default newest first
            this.query =
                this.query.sort("-createdAt -_id");
        }

        return this;
    }
    // FILTER
    filter() {
        const queryObj = { ...this.queryString };

        const excludedFields = ["page", "sort", "limit", "fields", "keyword"];
        excludedFields.forEach((field) => delete queryObj[field]);

        let mongoQuery = {};

        for (const key in queryObj) {
            const value = queryObj[key];

            // range filtering: price[gte]=100
            const match = key.match(/^(.+)\[(gte|gt|lte|lt)\]$/);

            if (match) {
                const [, field, operator] = match;

                if (!mongoQuery[field]) mongoQuery[field] = {};
                mongoQuery[field][`$${operator}`] = Number(value);
            } else if (typeof value === "string" && value.includes(",")) {
                // IN filtering: category=motorcycle,parts
                mongoQuery[key] = { $in: value.split(",") };
            } else {
                mongoQuery[key] = value;
            }
        }

        this.query = this.query.find(mongoQuery);
        return this;
    }

    // SEARCH
    search() {
        if (this.queryString.keyword) {
            const keyword = this.queryString.keyword;

            this.query = this.query.find({
                $or: [
                    { title: { $regex: keyword, $options: "i" } },
                    { description: { $regex: keyword, $options: "i" } },
                ],
            });
        }

        return this;
    }

    async paginate() {
        const page = Number(this.queryString.page) || 1;
        const limit = Number(this.queryString.limit) || 10;
        const skip = (page - 1) * limit;

        const totalDocuments = await this.query.clone().countDocuments();
        const numberOfPages = Math.ceil(totalDocuments / limit);

        this.paginationResult = {
            currentPage: page,
            limit,
            totalDocuments,
            numberOfPages,
            next: page < numberOfPages ? page + 1 : null,
            prev: page > 1 ? page - 1 : null
        };

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = ApiFeatures;