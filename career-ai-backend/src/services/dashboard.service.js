// ============================================
// services/dashboard.service.js
// Central Dashboard Data Aggregation
// ============================================

import { query } from '../config/db.js';
import Resume from '../models/Resume.js';
import AtsScore from '../models/AtsScore.js';
import logger from '../config/logger.js';

export default class DashboardService {
  /**
   * Get complete dashboard data for user
   */
  static async getDashboardData(userId) {
    try {
      // Run all queries in parallel for performance
      const [
        userProfile,
        activeResume,
        latestATSScore,
        latestSkillGap,
        activeRoadmap,
        userStats,
      ] = await Promise.all([
        this.getUserProfile(userId),
        this.getActiveResume(userId),
        this.getLatestATSScore(userId),
        this.getLatestSkillGap(userId),
        this.getActiveRoadmap(userId),
        this.getUserStats(userId),
      ]);

      // Build dashboard response
      const overallScore = latestATSScore ? (latestATSScore.overall_score || 0) : 0;
      
      const dashboard = {
        profile: userProfile,
        resume: activeResume
          ? {
              id: activeResume.id,
              version: activeResume.version,
              uploadedAt: activeResume.uploaded_at,
              parsingStatus: activeResume.parsing_status,
            }
          : null,
        atsScore: latestATSScore
          ? {
              overall: overallScore,
              breakdown: {
                formatting: latestATSScore.formatting_score ?? Math.min(100, Math.round(overallScore * 1.05) + 5),
                keywords: latestATSScore.keyword_score || overallScore,
                experience: latestATSScore.experience_score ?? Math.max(10, Math.round(overallScore * 0.95) - 5),
              },
              topIssues: this.getTopIssues(latestATSScore.issues, 3),
              scoredAt: latestATSScore.scored_at,
            }
          : null,
        skillGap: latestSkillGap
          ? {
              gapScore: latestSkillGap.gap_score,
              matchPercentage: latestSkillGap.match_percentage,
              topMissingSkills: this.getTopMissingSkills(latestSkillGap.missing_skills, 5),
              immediateActions: latestSkillGap.immediate_actions,
              analyzedAt: latestSkillGap.analyzed_at,
            }
          : null,
        roadmap: activeRoadmap
          ? {
              id: activeRoadmap.id,
              title: activeRoadmap.title,
              completionPercentage: activeRoadmap.completion_percentage,
              currentMilestone: activeRoadmap.current_milestone,
              status: activeRoadmap.status,
            }
          : null,
        stats: userStats,
        nextAction: this.determineNextAction({
          activeResume,
          latestATSScore,
          latestSkillGap,
          activeRoadmap,
        }),
      };

      return dashboard;
    } catch (error) {
      logger.error('Dashboard data aggregation failed', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Get user profile summary
   */
  static async getUserProfile(userId) {
    const result = await query(
      `SELECT id, email, full_name, current_role, years_of_experience, 
              target_role, industry, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get active resume
   */
  static async getActiveResume(userId) {
    return await Resume.findActiveByUserId(userId);
  }

  /**
   * Get latest ATS score
   */
  static async getLatestATSScore(userId) {
    return await AtsScore.findLatestByUserId(userId);
  }

  /**
   * Get latest skill gap analysis
   */
  static async getLatestSkillGap(userId) {
    const result = await query(
      `SELECT * FROM skill_gaps 
       WHERE user_id = $1 
       ORDER BY analyzed_at DESC 
       LIMIT 1`,
      [userId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get active roadmap
   */
  static async getActiveRoadmap(userId) {
    const result = await query(
      `SELECT * FROM learning_roadmaps 
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userId) {
    const result = await query(
      `SELECT 
        (SELECT COUNT(*) FROM resumes WHERE user_id = $1) as total_resumes,
        (SELECT COUNT(*) FROM ats_scores WHERE user_id = $1) as total_ats_scans,
        (SELECT COUNT(*) FROM skill_gaps WHERE user_id = $1) as total_skill_analyses,
        (SELECT COUNT(*) FROM learning_roadmaps WHERE user_id = $1) as total_roadmaps,
        (SELECT COUNT(*) FROM ai_conversations WHERE user_id = $1) as total_conversations
       FROM users WHERE id = $1`,
      [userId]
    );

    return result.rows[0] || {};
  }

  /**
   * Extract top issues from ATS score
   */
  static getTopIssues(issuesJson, count = 3) {
    if (!issuesJson) return [];

    const issues = Array.isArray(issuesJson) ? issuesJson : [];

    return issues
      .sort((a, b) => {
        // Sort by severity: critical > high > medium > low
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99);
      })
      .slice(0, count)
      .map((issue) => ({
        category: issue.category,
        severity: issue.severity,
        description: issue.description,
        suggestion: issue.suggestion,
      }));
  }

  /**
   * Extract top missing skills
   */
  static getTopMissingSkills(missingSkillsJson, count = 5) {
    if (!missingSkillsJson) return [];

    const skills = Array.isArray(missingSkillsJson) ? missingSkillsJson : [];

    return skills
      .sort((a, b) => {
        // Sort by priority: core > nice-to-have > emerging
        const priorityOrder = { core: 0, 'nice-to-have': 1, emerging: 2 };
        return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
      })
      .slice(0, count)
      .map((skill) => ({
        name: skill.skill_name || skill.name,
        priority: skill.priority,
        category: skill.category,
      }));
  }

  /**
   * Determine next recommended action for user
   */
  static determineNextAction(data) {
    const { activeResume, latestATSScore, latestSkillGap, activeRoadmap } = data;

    // Priority 1: No resume uploaded
    if (!activeResume) {
      return {
        type: 'upload_resume',
        title: 'Upload Your Resume',
        description: 'Get started by uploading your resume for analysis',
        priority: 'critical',
        actionUrl: '/resumes/upload',
      };
    }

    // Priority 2: Resume parsing incomplete
    if (activeResume.parsing_status !== 'completed') {
      return {
        type: 'resume_parsing',
        title: 'Resume Being Processed',
        description: 'Your resume is being analyzed. This usually takes 30-60 seconds.',
        priority: 'info',
        actionUrl: null,
      };
    }

    // Priority 3: No ATS score
    if (!latestATSScore) {
      return {
        type: 'run_ats_score',
        title: 'Run ATS Score Analysis',
        description: 'See how well your resume performs against ATS systems',
        priority: 'high',
        actionUrl: `/ats/score/${activeResume.id}`,
      };
    }

    // Priority 4: Low ATS score
    if (latestATSScore.overall_score < 60) {
      return {
        type: 'improve_ats_score',
        title: 'Improve Your ATS Score',
        description: `Your score is ${latestATSScore.overall_score}/100. Fix critical issues to improve.`,
        priority: 'high',
        actionUrl: '/resume/edit',
      };
    }

    // Priority 5: No skill gap analysis
    if (!latestSkillGap) {
      return {
        type: 'analyze_skills',
        title: 'Analyze Skill Gaps',
        description: 'Find out which skills you need for your target role',
        priority: 'medium',
        actionUrl: '/skills/analyze',
      };
    }

    // Priority 6: No active roadmap
    if (!activeRoadmap && latestSkillGap) {
      return {
        type: 'create_roadmap',
        title: 'Create Learning Roadmap',
        description: 'Get a personalized plan to bridge your skill gaps',
        priority: 'medium',
        actionUrl: '/roadmap/generate',
      };
    }

    // Priority 7: Roadmap in progress
    if (activeRoadmap && activeRoadmap.completion_percentage < 100) {
      return {
        type: 'continue_learning',
        title: 'Continue Your Learning Journey',
        description: `You're ${activeRoadmap.completion_percentage}% complete. Keep going!`,
        priority: 'low',
        actionUrl: `/roadmap/${activeRoadmap.id}`,
      };
    }

    // All good!
    return {
      type: 'all_good',
      title: 'You\'re All Set!',
      description: 'Great job! Your profile is optimized. Chat with AI for career advice.',
      priority: 'info',
      actionUrl: '/ai/chat',
    };
  }

  /**
   * Get resume health summary
   */
  static async getResumeHealth(userId) {
    const activeResume = await this.getActiveResume(userId);
    const latestScore = await this.getLatestATSScore(userId);

    if (!activeResume) {
      return {
        status: 'missing',
        message: 'No resume uploaded',
        color: 'red',
      };
    }

    if (activeResume.parsing_status !== 'completed') {
      return {
        status: 'processing',
        message: 'Resume being analyzed',
        color: 'yellow',
      };
    }

    if (!latestScore) {
      return {
        status: 'unscored',
        message: 'Resume ready for ATS scoring',
        color: 'blue',
      };
    }

    const score = latestScore.overall_score;

    if (score >= 80) {
      return {
        status: 'excellent',
        message: 'Your resume is ATS-optimized',
        color: 'green',
        score,
      };
    } else if (score >= 60) {
      return {
        status: 'good',
        message: 'Good resume, some improvements needed',
        color: 'blue',
        score,
      };
    } else {
      return {
        status: 'needs_work',
        message: 'Your resume needs significant improvements',
        color: 'red',
        score,
      };
    }
  }
}