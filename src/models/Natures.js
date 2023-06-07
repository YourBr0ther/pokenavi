const mongoose = require('mongoose');
const { Schema } = mongoose.Schema;

const natureSchema = new Schema({
    Nature: {
        type: String,
        required: true,
      }
});

export default mongoose.model("Nature", natureSchema)