import { mongoose } from "mongoose";

// create user schema
const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email : {
      type: String,
      sparse: true, // null / missing value skip করবে
      trim: true,
     required: function () {
        return !this.phone; // phone না থাকলে email লাগবে
      },
    },

     phone : {
      type: String,
      sparse: true, // null / missing value skip করবে
      trim: true,
      required: function () {
        return !this.email; // email না থাকলে phone লাগবে
      },
    },

    password : {
       type : String,
       required : true,
       trim : true,
    },

    photo: {
      type: String,
      default: null,
      trim: true,
    },

    location: {
      type: String,
      default: null,
      trim: true,
    },

    profession: {
      type: String,
      default: null,
      trim: true,
    },

    bio: {
      type: String,
      default: null,
      trim: true,
    },

    dateOfBirth: {
      type: String,
      default: null,
      trim: true,
    },

    gallery: {
      type: [],
      default: null,
    },

    bloodGroup: {
      type: String,
      default: null,
      trim: true,
    },

    lastDonation: {
      type: String,
      default: null,
      trim: true,
    },

    role: {
      type: String,
      default: "patient",
      enum: ["patient", "donor", "admin"],
    },

    accessToken: {
      type: String,
      default : null,
      trim: true,
    },

    isActivate: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: Boolean,
      default: false,
    },

    trash: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
