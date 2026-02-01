import { PlayCircle, FileText, BookOpen, Code, File, Star, ExternalLink } from 'lucide-react';
import Badge from '@common/Badge';
import Button from '@common/Button';
import { cn } from '@utils/helpers';

/**
 * ResourceList Component
 * Displays learning resources with filtering
 */
const ResourceList = ({ resources }) => {
  const getResourceIcon = (type) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-5 h-5" />;
      case 'article':
        return <FileText className="w-5 h-5" />;
      case 'course':
        return <BookOpen className="w-5 h-5" />;
      case 'practice':
        return <Code className="w-5 h-5" />;
      case 'documentation':
        return <File className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getResourceColor = (type) => {
    switch (type) {
      case 'video':
        return 'text-status-error';
      case 'article':
        return 'text-brand-primary';
      case 'course':
        return 'text-status-success';
      case 'practice':
        return 'text-status-warning';
      case 'documentation':
        return 'text-text-primary';
      default:
        return 'text-text-muted';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      case 'all_levels':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDifficulty = (difficulty) => {
    return difficulty.replace('_', ' ');
  };

  // Separate recommended from other resources
  const recommendedResources = resources.filter((r) => r.recommended);
  const otherResources = resources.filter((r) => !r.recommended);

  return (
    <div className="space-y-6">
      {/* Recommended Resources */}
      {recommendedResources.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-status-warning" />
            <h3 className="font-semibold text-text-primary">Recommended Resources</h3>
          </div>
          <div className="space-y-3">
            {recommendedResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      )}

      {/* Other Resources */}
      {otherResources.length > 0 && (
        <div>
          <h3 className="font-semibold text-text-primary mb-4">
            Additional Resources
          </h3>
          <div className="space-y-3">
            {otherResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ResourceCard Component
 * Individual resource item
 */
const ResourceCard = ({ resource }) => {
  const getResourceIcon = (type) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-5 h-5" />;
      case 'article':
        return <FileText className="w-5 h-5" />;
      case 'course':
        return <BookOpen className="w-5 h-5" />;
      case 'practice':
        return <Code className="w-5 h-5" />;
      case 'documentation':
        return <File className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getResourceColor = (type) => {
    switch (type) {
      case 'video':
        return 'text-status-error';
      case 'article':
        return 'text-brand-primary';
      case 'course':
        return 'text-status-success';
      case 'practice':
        return 'text-status-warning';
      case 'documentation':
        return 'text-text-primary';
      default:
        return 'text-text-muted';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      case 'all_levels':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDifficulty = (difficulty) => {
    return difficulty.replace('_', ' ');
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-all duration-200 hover:shadow-md',
        resource.recommended
          ? 'border-status-warning/30 bg-status-warning/5'
          : 'border-border bg-surface-card'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            resource.recommended ? 'bg-status-warning/10' : 'bg-surface-alt',
            getResourceColor(resource.type)
          )}
        >
          {getResourceIcon(resource.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-text-primary mb-1">
                {resource.title}
              </h4>
              <div className="flex items-center gap-3 text-xs text-text-muted">
                <span>{resource.platform}</span>
                <span>•</span>
                <span>{resource.duration}</span>
                {resource.rating && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-status-warning text-status-warning" />
                      <span>{resource.rating}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <Badge variant={getDifficultyColor(resource.difficulty)} size="sm">
              {formatDifficulty(resource.difficulty)}
            </Badge>
          </div>

          {/* Action Button */}
          <Button
            variant="outline"
            size="sm"
            rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
            onClick={() => window.open(resource.url, '_blank')}
          >
            View Resource
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResourceList;