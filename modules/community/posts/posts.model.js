const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        content: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: null
        },
        images: [
            {
                url: String
            }
        ],
        location: {
            type: String,
            trim: true,
            maxlength: 100
        },
        hashtags: [
            {
                type: String,
                trim: true,
                lowercase: true,
                index: true
            }
        ],
        likesCount: {
            type: Number,
            default: 0,
            min: 0
        },
        commentsCount: {
            type: Number,
            default: 0,
            min: 0
        },
        sharesCount: {
            type: Number,
            default: 0,
            min: 0
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        bookmarks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        },
        deletedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// Indexes
postSchema.index({ createdAt: -1 });

// Middleware to extract hashtags before saving
postSchema.pre('save', function () {
    if (this.isModified('content') && this.content) {
        const regex = /#[\w-]+/g;
        const matches = this.content.match(regex);
        if (matches) {
            this.hashtags = [...new Set(matches.map(tag => tag.substring(1).toLowerCase()))];
        } else {
            this.hashtags = [];
        }
    }
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
