import React from 'react';
import { Mail, Github, Linkedin, Globe, Layout, Cpu, Sparkles, Zap, Database, ArrowRight } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@common/Card';
import Badge from '@common/Badge';
import YashImg from '../../assets/yash.jpeg';
import MaazImg from '../../assets/maaz.jpg';

const TeamMemberCard = ({ name, role, tags, icon: Icon, delay, socials = [], image }) => (
  <Card className={`relative overflow-hidden group animate-slideInUp border-2 hover:border-brand-primary/50 transition-all duration-500`} style={{ animationDelay: delay }}>
    {/* Subtle Accent Line */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary via-brand-info to-brand-accent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

    <CardContent className="p-8">
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-brand-primary/10 flex items-center justify-center border-4 border-surface-background shadow-md group-hover:scale-105 transition-transform duration-300 overflow-hidden">
             {image ? (
               <img src={image} alt={name} className="w-full h-full object-cover" />
             ) : (
               <span className="text-4xl font-bold text-brand-primary">
                {name.charAt(0)}
               </span>
             )}
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-surface-card rounded-full flex items-center justify-center border border-border shadow-sm text-text-secondary group-hover:text-brand-primary transition-colors">
             <Icon size={20} />
          </div>
        </div>

        {/* Info */}
        <h3 className="text-2xl font-bold text-text-primary mb-1">
          {name}
        </h3>
        <p className="text-brand-primary font-semibold text-sm uppercase tracking-wider mb-6">
          {role}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tags.map((tag, idx) => (
            <Badge key={idx} variant="default" className="bg-surface-alt hover:bg-surface-alt/80 transition-colors">
              {tag}
            </Badge>
          ))}
        </div>

        <hr className="w-full border-border mb-6 group-hover:border-brand-primary/20 transition-colors" />

        {/* Socials */}
        <div className="flex justify-center gap-4">
          {socials.map((social, idx) => {
            const SocialIcon = social.icon;
            return (
              <a key={idx} href={social.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-surface-background flex items-center justify-center text-text-secondary hover:bg-brand-primary hover:text-white transition-all shadow-sm">
                <SocialIcon size={18} />
              </a>
            );
          })}
        </div>
      </div>
    </CardContent>
  </Card>
);

const FeatureSection = ({ icon: Icon, title, desc }) => (
  <div className="flex items-start gap-4 p-6 rounded-2xl bg-surface-background border border-border hover:border-brand-primary/30 transition-colors group">
    <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl group-hover:bg-brand-primary group-hover:text-white transition-colors">
      <Icon size={24} />
    </div>
    <div>
      <h4 className="text-lg font-bold text-text-primary mb-2">{title}</h4>
      <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

const AboutUsPage = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* Header Section */}
      <div className="text-center py-10 animate-fadeIn">
        <Badge variant="primary" className="mb-6 mx-auto bg-brand-primary/10 text-brand-primary border-brand-primary/20 text-sm px-4 py-1.5">
          <Sparkles className="w-4 h-4 mr-2 inline-block" /> Meet The Team
        </Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight mb-4">
          Architects behind <span className="text-brand-primary">Career AI</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          We combined our passion for intelligent analytics and seamless design to build a platform that accelerates your career.
        </p>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <TeamMemberCard 
          name="Yash Bhagwatkar" 
          role="Lead Developer & Designer" 
          tags={['UI/UX Design', 'React Router', 'Tailwind CSS', 'Frontend Systems']}
          icon={Layout}
          delay="0s"
          image={YashImg}
          socials={[
            { icon: Linkedin, url: 'https://www.linkedin.com/in/yash-bhagwatkar-b8432632b' },
            { icon: Github, url: 'https://github.com/YashBhagwatkar' },
            { icon: Mail, url: 'mailto:yashbhagwatkar820@gmail.com' }
          ]}
        />
        <TeamMemberCard 
          name="Maaz Khan" 
          role="AI & Full Stack Developer" 
          tags={['Machine Learning', 'Node.js Backend', 'Python', 'System Architecture']}
          icon={Cpu}
          delay="0.1s"
          image={MaazImg}
          socials={[
            { icon: Linkedin, url: 'https://www.linkedin.com/in/maazak90' },
            { icon: Github, url: 'https://github.com/maaz81' },
            { icon: Globe, url: 'https://maaz-portfolio-xi.vercel.app/' },
            { icon: Mail, url: 'mailto:khanmaazahmad7@gmail.com' }
          ]}
        />
      </div>

      {/* Mission & Features */}
      <Card className="border-border">
        <CardHeader className="border-b border-border bg-surface-alt/30">
          <CardTitle className="text-xl">Our Core Philosophy</CardTitle>
          <p className="text-text-secondary text-sm mt-1">What drives us to build excellent software.</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <FeatureSection 
              icon={Layout} 
              title="Meticulous Design" 
              desc="Every pixel and interaction is carefully crafted. We believe powerful tools should also be a joy to use."
            />
            <FeatureSection 
              icon={Zap} 
              title="Lightning Performance" 
              desc="Optimized for speed. Our services crunch heavy resume data in milliseconds so you never have to wait."
            />
            <FeatureSection 
              icon={Database} 
              title="Data-Driven AI" 
              desc="Leveraging advanced machine learning models to find the perfect semantic match for your career trajectory."
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact CTA */}
      <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Want to collaborate?</h2>
          <p className="text-text-secondary">We are always open to discussing new projects and creative ideas.</p>
        </div>
        <button className="flex-shrink-0 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 group">
          Get in Touch
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
};

export default AboutUsPage;
