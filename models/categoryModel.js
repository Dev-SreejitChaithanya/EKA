const mongoose = require("mongoose");
const { array } = require("../middlewares/fileupload");

//User Schema Creation------------>
const categorySchema = new mongoose.Schema({
  name:{
    type: String,
    required: true,
  },
  image:
  {
    type:String,
    rerequired: true

  },
  offer:{
    type: Number,
    default: 0,
  },
  deletedOn:
  {
      type:String
  }
});

//Model Creation and export for use ---->
module.exports = mongoose.model("Category", categorySchema);
