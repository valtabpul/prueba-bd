import mongoose from "mongoose";

const deletedLogSchema = new mongoose.Schema(
  {
    entity: { type: String, required: true },        
    entityId: { type: Number, required: true },      
    deletedAt: { type: Date, default: Date.now },
    deletedBy: { type: String, default: "system" },  
    snapshot: { type: Object, default: {} },
  },
  { timestamps: true }
);

export const DeletedLog = mongoose.model("deleted_logs", deletedLogSchema);