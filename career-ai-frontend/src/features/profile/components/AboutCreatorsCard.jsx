import React from 'react';
import { Users, ArrowRight, Sparkles } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@common/Card';
import Button from '@common/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';

const AboutCreatorsCard = () => {
  const navigate = useNavigate();

  return (
    <Card className="border border-brand-primary/20 bg-surface-card overflow-hidden relative group">
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/0 via-brand-info/5 to-brand-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
      
      <CardHeader className="bg-surface-alt/30 border-b border-border pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <Users className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Meet the Creators</CardTitle>
            <p className="text-xs text-text-secondary mt-1">The minds behind Career AI</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-3">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              Yash Bhagwatkar <span className="text-text-muted font-normal text-sm">&amp;</span> Maaz Khan
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
              We combined our passion for elegant UI/UX design and powerful Artificial Intelligence to build this platform. Want to learn more about the architecture and our mission?
            </p>
          </div>
          
          <div className="flex-shrink-0 w-full md:w-auto">
             <Button 
               variant="primary" 
               className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg hover:shadow-brand-primary/20 transition-all hover:-translate-y-0.5"
               onClick={() => navigate(ROUTES.ABOUT_US)}
             >
               <Sparkles className="w-4 h-4" />
               View Creator Page
               <ArrowRight className="w-4 h-4 ml-1" />
             </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AboutCreatorsCard;
