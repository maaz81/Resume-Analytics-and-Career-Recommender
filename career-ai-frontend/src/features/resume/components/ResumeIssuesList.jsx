import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Lightbulb, ArrowRight } from 'lucide-react';
import Card from '@common/Card';
import Badge from '@common/Badge';
import Button from '@common/Button';
import Tabs from '@common/Tabs';
import { cn } from '@utils/helpers';

/**
 * ResumeIssuesList Component
 * Displays categorized list of resume issues with details
 */
const ResumeIssuesList = ({ issues }) => {
  const [expandedIssue, setExpandedIssue] = useState(null);

  // Group issues by category
  const groupedIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = [];
    }
    acc[issue.category].push(issue);
    return acc;
  }, {});

  // Sort issues by severity
  const sortBySeverity = (issuesList) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return [...issuesList].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      keywords: 'Keywords & SEO',
      content: 'Content Quality',
      formatting: 'Formatting',
      structure: 'Structure',
      ats: 'ATS Compatibility',
    };
    return labels[category] || category;
  };

  const getCategoryIcon = (category) => {
    // Return different icons based on category
    return AlertCircle;
  };

  // Create tabs for each category
  const tabs = Object.keys(groupedIssues).map((category) => {
    const categoryIssues = sortBySeverity(groupedIssues[category]);
    const highCount = categoryIssues.filter((i) => i.severity === 'high').length;

    return {
      id: category,
      label: getCategoryLabel(category),
      badge: highCount > 0 ? highCount : null,
      content: (
        <div className="space-y-3">
          {categoryIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              isExpanded={expandedIssue === issue.id}
              onToggle={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
              getSeverityColor={getSeverityColor}
            />
          ))}
        </div>
      ),
    };
  });

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-6">
          Issues to Fix ({issues.length})
        </h2>
        
        <Tabs tabs={tabs} variant="underline" />
      </div>
    </Card>
  );
};

/**
 * IssueCard Component
 * Individual issue card with expand/collapse
 */
const IssueCard = ({ issue, isExpanded, onToggle, getSeverityColor }) => {
  return (
    <div
      className={cn(
        'rounded-lg border transition-all duration-200',
        isExpanded ? 'border-brand-primary bg-brand-primary/5' : 'border-border bg-surface-card'
      )}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start gap-4 text-left hover:bg-surface-alt/50 transition-colors rounded-lg"
      >
        <div className="flex-1 space-y-2">
          <div className="flex items-start gap-3">
            <Badge variant={getSeverityColor(issue.severity)} size="sm" className="mt-0.5">
              {issue.severity}
            </Badge>
            <div className="flex-1">
              <h4 className="font-semibold text-text-primary">{issue.title}</h4>
              <p className="text-sm text-text-secondary mt-1">{issue.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>Impact: {issue.impact}</span>
            <span>•</span>
            <span>Affects: {issue.affectedSections.join(', ')}</span>
          </div>
        </div>

        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-text-muted flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-muted flex-shrink-0" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border/50 mt-2 pt-4">
          {/* Recommendation */}
          <div className="p-3 rounded-lg bg-status-info-light border border-status-info/20">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-status-info flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-status-info-dark mb-1">
                  Recommendation
                </p>
                <p className="text-sm text-status-info-dark">{issue.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Examples (if available) */}
          {issue.examples && issue.examples.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-primary mb-2">Examples:</p>
              <div className="space-y-2">
                {issue.examples.map((example, index) => (
                  <div key={index} className="p-3 rounded-lg bg-surface-alt space-y-2">
                    {example.weak && (
                      <div>
                        <p className="text-xs text-status-error-dark font-medium mb-1">❌ Weak:</p>
                        <p className="text-sm text-text-secondary">{example.weak}</p>
                      </div>
                    )}
                    {example.strong && (
                      <div>
                        <p className="text-xs text-status-success-dark font-medium mb-1">✅ Strong:</p>
                        <p className="text-sm text-text-secondary">{example.strong}</p>
                      </div>
                    )}
                    {example.current && (
                      <div>
                        <p className="text-xs text-text-secondary font-medium mb-1">Current:</p>
                        <p className="text-sm text-text-secondary">{example.current}</p>
                      </div>
                    )}
                    {example.improved && (
                      <div>
                        <p className="text-xs text-status-success-dark font-medium mb-1">Improved:</p>
                        <p className="text-sm text-text-secondary">{example.improved}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords (if available) */}
          {issue.missingKeywords && issue.missingKeywords.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-primary mb-2">Missing Keywords:</p>
              <div className="flex flex-wrap gap-2">
                {issue.missingKeywords.map((keyword, index) => (
                  <Badge key={index} variant="error" size="sm">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Keywords with low density (if available) */}
          {issue.keywords && issue.keywords.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-primary mb-2">Keywords to repeat:</p>
              <div className="flex flex-wrap gap-2">
                {issue.keywords.map((keyword, index) => (
                  <Badge key={index} variant="warning" size="sm">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          {issue.fixable && (
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Apply Quick Fix
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeIssuesList;