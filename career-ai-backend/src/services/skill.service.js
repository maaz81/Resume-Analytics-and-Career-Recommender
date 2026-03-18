// ============================================
// services/skills.service.js
// Skills Extraction & Gap Analysis
// ============================================

import Skill from '../models/Skill.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';
import { analyzeSkillGap as aiAnalyzeSkillGap } from './ai.service.js';
import logger from '../config/logger.js';
import { errors } from '../middleware/errorHandler.js';

export default class SkillsService {
  /**
   * Extract skills from parsed resume data
   */
  static async extractSkillsFromResume(resumeId, userId) {
    const resume = await Resume.findById(resumeId);

    if (!resume || resume.user_id !== userId) {
      throw errors.notFound('Resume not found');
    }

    if (!resume.parsed_data) {
      throw errors.badRequest('Resume not parsed yet');
    }

    const parsedData = resume.parsed_data;
    const skills = [];

    // Extract from skills section
    if (parsedData.skills && Array.isArray(parsedData.skills)) {
      skills.push(
        ...parsedData.skills.map((skill) => ({
          name: typeof skill === 'string' ? skill : skill.name,
          category: skill.category || 'technical',
          proficiency: skill.level || 'intermediate',
          years: skill.years || null,
          confidence: 0.95, // High confidence from dedicated section
        }))
      );
    }

    // Extract from experience section (lower confidence)
    if (parsedData.experience && Array.isArray(parsedData.experience)) {
      parsedData.experience.forEach((exp) => {
        if (exp.technologies || exp.skills) {
          const techSkills = exp.technologies || exp.skills || [];
          skills.push(
            ...techSkills.map((skill) => ({
              name: skill,
              category: 'technical',
              proficiency: 'intermediate',
              confidence: 0.7, // Lower confidence from experience
            }))
          );
        }
      });
    }

    // Remove duplicates (keep highest confidence)
    const uniqueSkills = this.deduplicateSkills(skills);

    // Bulk insert into database
    const inserted = await Skill.bulkInsertUserSkills(userId, resumeId, uniqueSkills);

    logger.info('Skills extracted from resume', {
      userId,
      resumeId,
      skillsCount: inserted.length,
    });

    return inserted;
  }

  /**
   * Remove duplicate skills, keeping highest confidence
   */
  static deduplicateSkills(skills) {
    const skillMap = new Map();

    skills.forEach((skill) => {
      const normalizedName = skill.name.toLowerCase().trim();

      if (!skillMap.has(normalizedName)) {
        skillMap.set(normalizedName, skill);
      } else {
        const existing = skillMap.get(normalizedName);
        // Keep skill with higher confidence
        if (skill.confidence > existing.confidence) {
          skillMap.set(normalizedName, skill);
        }
      }
    });

    return Array.from(skillMap.values());
  }

  /**
   * Perform skill gap analysis
   */
  static async performSkillGapAnalysis(userId) {
    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
      throw errors.notFound('User not found');
    }

    if (!user.target_role) {
      throw errors.badRequest('Target role not set. Please update your profile.');
    }

    // Get user skills
    const userSkills = await Skill.getUserSkills(userId);

    if (userSkills.length === 0) {
      throw errors.badRequest('No skills found. Please upload a resume first.');
    }

    // Get active resume
    const activeResume = await Resume.findActiveByUserId(userId);

    // Call AI service for gap analysis
    const aiAnalysis = await aiAnalyzeSkillGap(
      {
        skills: userSkills.map((us) => ({
          name: us.name,
          category: us.category,
          proficiency: us.proficiency_level,
          years: us.years_of_experience,
        })),
      },
      user.target_role
    );

    // Calculate match percentage
    const matchPercentage = this.calculateMatchPercentage(
      userSkills.length,
      aiAnalysis.missingSkills?.length || 0
    );

    // Calculate gap score (0-100, lower is better)
    const gapScore = Math.max(0, 100 - matchPercentage);

    // Save to database
    const skillGap = await Skill.createSkillGap({
      userId,
      targetRoleId: null, // We'll add job_roles later
      resumeId: activeResume?.id || null,
      missingSkills: aiAnalysis.missingSkills || [],
      resumeSkills: userSkills.map(s => s.name) || [],
      gapScore,
      matchPercentage,
      immediateActions: this.generateImmediateActions(aiAnalysis, userSkills),
      learningPriorities: this.prioritizeSkills(aiAnalysis.missingSkills || []),
      aiModelVersion: aiAnalysis.modelVersion || 'v1.0',
    });

    logger.info('Skill gap analysis completed', {
      userId,
      gapScore,
      matchPercentage,
      missingSkillsCount: aiAnalysis.missingSkills?.length || 0,
    });

    return skillGap;
  }

  /**
   * Calculate match percentage
   */
  static calculateMatchPercentage(userSkillsCount, missingSkillsCount) {
    if (userSkillsCount === 0) return 0;

    const totalRequired = userSkillsCount + missingSkillsCount;
    const percentage = (userSkillsCount / totalRequired) * 100;

    return Math.round(percentage * 100) / 100; // Round to 2 decimals
  }

  /**
   * Generate immediate actions based on analysis
   */
  static generateImmediateActions(analysis, userSkills = []) {
    const actions = [];

    // Top 3 critical skills
    const criticalSkills = (analysis.missingSkills || [])
      .filter((s) => s.priority === 'core')
      .slice(0, 3);

    if (criticalSkills.length > 0) {
      actions.push({
        type: 'learn_skills',
        priority: 'critical',
        title: 'Learn Critical Skills',
        description: `Focus on: ${criticalSkills.map((s) => s.skill_name).join(', ')}`,
        skills: criticalSkills.map((s) => s.skill_name),
      });
    }

    // Skills to improve from resume
    const skillsToImprove = userSkills.slice(0, 2);

    if (skillsToImprove.length > 0) {
      actions.push({
        type: 'improve_skills',
        priority: 'high',
        title: 'Strengthen Existing Skills',
        description: `Improve: ${skillsToImprove.map((s) => s.name).join(', ')}`,
        skills: skillsToImprove.map((s) => s.name),
      });
    }

    // Build projects
    if (criticalSkills.length > 0) {
      actions.push({
        type: 'build_projects',
        priority: 'medium',
        title: 'Build Portfolio Projects',
        description: 'Apply new skills in real projects to demonstrate competency',
      });
    }

    return actions;
  }

  /**
   * Prioritize skills for learning roadmap
   */
  static prioritizeSkills(missingSkills) {
    // Sort by priority: core > nice-to-have > emerging
    const priorityOrder = { core: 0, 'nice-to-have': 1, emerging: 2 };

    return missingSkills
      .sort((a, b) => {
        return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
      })
      .map((s) => s.skill_name);
  }

  /**
   * Get skill recommendations for target role
   */
  static async getSkillRecommendations(targetRole) {
    // This would typically call an AI service or query a skills database
    // For now, returning placeholder
    return {
      coreSkills: [],
      niceToHave: [],
      emerging: [],
    };
  }
}