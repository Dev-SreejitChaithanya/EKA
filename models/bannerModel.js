const mongoose = require("mongoose");
const { array } = require("../middlewares/fileupload");

//User Schema Creation------------>
const bannerSchema = new mongoose.Schema(
  {
    image: {
      type: Array,
      required: true,
    },
    heading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    }
  }
);

//Model Creation and export for use ---->
module.exports = mongoose.model("Banner", bannerSchema);
