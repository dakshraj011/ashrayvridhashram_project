import React from 'react';
import { Link } from 'react-router-dom';
import { PeacockFeatherIcon, AashrayLogo } from './KrishnaAccents';
import { Heart, MapPin, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-maroon text-cream pt-12 pb-6 border-t-4 border-gold mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        {/* About Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <AashrayLogo className="w-12 h-12 border-2 border-gold shadow-md" />
            <h3 className="text-2xl font-bold font-heading text-gold">आश्रय वृद्धाश्रम</h3>
          </div>
          <p className="text-sm text-cream/90 leading-relaxed">
            श्री कृष्ण की कृपा से असहाय, बेघर एवं पूज्य वरिष्ठ नागरिकों की सेवा, सम्मान और देखभाल हेतु समर्पित एक पवित्र धाम।
          </p>

          <div className="flex items-center gap-2 text-gold font-bold text-sm pt-2">
            <PeacockFeatherIcon className="w-5 h-5" />
            <span>॥ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ॥</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xl font-bold text-gold font-heading mb-3 border-b border-gold/30 pb-1">मुख्य लिंक</h4>
          <ul className="space-y-2 text-sm text-cream/90">
            <li><Link to="/" className="hover:text-gold transition-colors">होम पेज</Link></li>
            <li><Link to="/about" className="hover:text-gold transition-colors">हमारे बारे में</Link></li>
            <li><Link to="/needs" className="hover:text-gold transition-colors">वर्तमान आवश्यकताएँ</Link></li>
            <li><Link to="/events" className="hover:text-gold transition-colors">कार्यक्रम एवं गैलरी</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition-colors">संपर्क करें</Link></li>
          </ul>
        </div>

        {/* Support Services */}
        <div>
          <h4 className="text-xl font-bold text-gold font-heading mb-3 border-b border-gold/30 pb-1">सेवाएँ एवं सहयोग</h4>
          <ul className="space-y-2 text-sm text-cream/90">
            <li><Link to="/meal-sponsorship" className="hover:text-gold transition-colors">भोजन प्रायोजन फॉर्म</Link></li>
            <li><Link to="/volunteer-register" className="hover:text-gold transition-colors">स्वयंसेवक पंजीकरण</Link></li>
            <li><Link to="/elderly-assistance" className="hover:text-gold transition-colors">बुजुर्ग सहायता अनुरोध</Link></li>
            <li><Link to="/admin" className="hover:text-gold transition-colors font-bold text-gold">व्यवस्थापक डैशबोर्ड (Admin Dashboard)</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="text-xl font-bold text-gold font-heading mb-3 border-b border-gold/30 pb-1">संपर्क विवरण</h4>
          <p className="text-xs text-cream/90 flex items-start gap-2">
            <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
            <span>आश्रम पता, उरई, जिला जालौन (उत्तर प्रदेश)</span>
          </p>
          <p className="text-xs text-cream/90 flex items-center gap-2">
            <Phone className="w-4 h-4 text-gold flex-shrink-0" />
            <a href="tel:7860437507" className="hover:text-gold underline decoration-gold/40 transition-colors font-bold">
              7860437507
            </a>
          </p>
          <p className="text-xs text-cream/90 flex items-center gap-2">
            <Mail className="w-4 h-4 text-gold flex-shrink-0" />
            <a href="mailto:dakshrajs104@gmail.com" className="hover:text-gold underline decoration-gold/40 transition-colors font-bold">
              dakshrajs104@gmail.com
            </a>
          </p>
        </div>

      </div>

      {/* Footer Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 border-t border-gold/20 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-cream/80 gap-3">
        <p>© 2026 आश्रय वृद्धाश्रम (AASHRAY). सर्वाधिकार सुरक्षित।</p>
        <p className="flex items-center gap-1.5 text-gold font-medium bg-gold/10 px-3.5 py-1 rounded-full border border-gold/30 shadow-sm">
          <PeacockFeatherIcon className="w-4 h-4" />
          <span>Founded & Led by</span>
          <Link
            to="/about#founder"
            className="font-bold text-white hover:text-gold underline decoration-gold/50 underline-offset-2 transition-colors"
          >
            Daksh raj Singh (Founder & CEO)
          </Link>
        </p>
        <p className="flex items-center gap-1">
          <span>वृद्ध सेवा ही नारायण सेवा है</span>
          <Heart className="w-3.5 h-3.5 text-saffron fill-current" />
        </p>
      </div>
    </footer>
  );
};
