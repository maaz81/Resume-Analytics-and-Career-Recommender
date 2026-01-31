import Card, { CardHeader, CardTitle, CardContent } from '@common/Card';
import { Target } from 'lucide-react';
import { cn } from '@utils/helpers';

/**
 * SkillMatrix Component
 * Visual matrix showing skills grouped by status and category
 */
const SkillMatrix = ({ skillsByCategory }) => {
  const categories = [
    { key: 'core', label: 'Core Skills', color: 'brand' },
    { key: 'niceToHave', label: 'Nice to Have', color: 'info' },
    { key: 'emerging', label: 'Emerging Tech', color: 'success' },
  ];

  const statuses = ['strong', 'weak', 'missing'];

  const getStatusLabel = (status) => {
    switch (status) {
      case 'strong':
        return 'Strong';
      case 'weak':
        return 'Needs Work';
      case 'missing':
        return 'Missing';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'strong':
        return 'bg-status-success/10 border-status-success/30 text-status-success-dark';
      case 'weak':
        return 'bg-status-warning/10 border-status-warning/30 text-status-warning-dark';
      case 'missing':
        return 'bg-status-error/10 border-status-error/30 text-status-error-dark';
      default:
        return 'bg-surface-alt border-border text-text-primary';
    }
  };

  const countByStatus = (skills, status) => {
    return skills.filter((s) => s.status === status).length;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-brand-primary" />
          <CardTitle>Skills Matrix</CardTitle>
        </div>
        <p className="text-sm text-text-muted mt-1">
          Visual overview of your skill coverage
        </p>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left p-3 text-sm font-semibold text-text-primary">
                  Category
                </th>
                {statuses.map((status) => (
                  <th key={status} className="text-center p-3 text-sm font-semibold text-text-primary">
                    {getStatusLabel(status)}
                  </th>
                ))}
                <th className="text-center p-3 text-sm font-semibold text-text-primary">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const skills = skillsByCategory[category.key] || [];
                const total = skills.length;
                
                return (
                  <tr key={category.key} className="border-b border-border hover:bg-surface-alt/50">
                    <td className="p-3">
                      <span className="font-medium text-text-primary">{category.label}</span>
                    </td>
                    {statuses.map((status) => {
                      const count = countByStatus(skills, status);
                      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                      
                      return (
                        <td key={status} className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={cn(
                                'inline-flex items-center justify-center w-12 h-12 rounded-lg border-2 font-bold',
                                getStatusColor(status)
                              )}
                            >
                              {count}
                            </span>
                            <span className="text-xs text-text-muted">{percentage}%</span>
                          </div>
                        </td>
                      );
                    })}
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-lg border-2 border-border bg-surface-alt font-bold text-text-primary">
                          {total}
                        </span>
                        <span className="text-xs text-text-muted">100%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-border">
              <tr className="bg-surface-alt">
                <td className="p-3 font-semibold text-text-primary">Total Skills</td>
                {statuses.map((status) => {
                  const count = categories.reduce(
                    (sum, cat) => sum + countByStatus(skillsByCategory[cat.key] || [], status),
                    0
                  );
                  return (
                    <td key={status} className="p-3 text-center font-semibold text-text-primary">
                      {count}
                    </td>
                  );
                })}
                <td className="p-3 text-center font-semibold text-text-primary">
                  {categories.reduce(
                    (sum, cat) => sum + (skillsByCategory[cat.key] || []).length,
                    0
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillMatrix;