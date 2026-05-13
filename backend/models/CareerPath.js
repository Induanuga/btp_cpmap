const mongoose = require('mongoose');

const StageSchema = new mongoose.Schema({
  stageName: { type: String, required: true },       // e.g., "10th", "B.Tech"
  education: { type: String, required: true },        // qualification at this stage
  skills: [{ type: String }],                         // skills gained
  experience: { type: String, default: '' },          // job/internship experience
  livingConditions: { type: String, default: '' },    // hostel, home, city etc.
  helpReceived: { type: String, default: '' },        // mentors, scholarships etc.
  suggestions: { type: String, default: '' },         // advice for others at this stage
  ageRange: { type: String, default: '' },            // e.g., "14–16 years"
});

const TransitionSchema = new mongoose.Schema({
  fromStage: { type: String, required: true },
  toStage: { type: String, required: true },
  optionsAvailable: [{ type: String }],               // alternatives that could have been taken
  reasonChosen: { type: String, default: '' },        // why this path was chosen
  mistakes: { type: String, default: '' },            // regrets / mistakes
  advice: { type: String, default: '' },              // advice for others at this transition
});

const CareerPathSchema = new mongoose.Schema(
  {
    // ════════════════════════════════════
    // CAREER INFORMATION (from form meta)
    // ════════════════════════════════════
    title: { type: String, required: true, trim: true },          // e.g., "Software Engineer"
    category: { type: String, required: true, trim: true },       // e.g., "Engineering & Tech"
    description: { type: String, default: '' },                    // Career overview/summary

    // ════════════════════════════════════
    // SUBMITTER PERSONAL INFO (from form personal section)
    // ════════════════════════════════════
    submitterName: { type: String, default: '' },                  // Name of person sharing path
    submitterEmail: { type: String, default: '' },                 // Contact email
    submitterGender: { type: String, default: '' },                // Male, Female, Non-binary, etc.
    submitterEducationHistory: { type: String, default: '' },      // e.g., "10th → 12th MPC → B.Tech CSE"
    submitterSkills: [{ type: String }],                           // All skills (comma-separated in form)
    submitterBackground: { type: String, default: '' },            // Rural, Urban, Semi-Urban, Tribal
    submitterEconomicStatus: { type: String, default: '' },        // Poor, Middle, Rich (childhood)

    // ════════════════════════════════════
    // JOURNEY STRUCTURE
    // ════════════════════════════════════
    stages: [StageSchema],                                         // Major stages of career journey
    transitions: [TransitionSchema],                               // Decision points between stages

    // ════════════════════════════════════
    // METADATA
    // ════════════════════════════════════
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isSeeded: { type: Boolean, default: false },                   // true for auto-seeded data

    // Moderation
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    moderationNote: { type: String, default: '' },
    
  },
  { timestamps: true }
);

// Text index for search
CareerPathSchema.index({
  title: 'text',
  category: 'text',
  description: 'text',
});

module.exports = mongoose.model('CareerPath', CareerPathSchema);
