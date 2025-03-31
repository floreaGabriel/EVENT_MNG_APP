import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Link-uri rapide */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Link-uri rapide
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/events" className="text-gray-600 hover:text-blue-600">
                  Evenimente
                </Link>
              </li>
              <li>
                <Link to="/organizers" className="text-gray-600 hover:text-blue-600">
                  Organizatori
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-blue-600">
                  Despre noi
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Contact
            </h3>
            <ul className="space-y-2">
              <li className="text-gray-600">
                <a href="mailto:contact@eventapp.com" className="hover:text-blue-600">
                  contact@eventapp.com
                </a>
              </li>
              <li className="text-gray-600">
                <a href="tel:+40123456789" className="hover:text-blue-600">
                  +40 123 456 789
                </a>
              </li>
              <li className="text-gray-600">
                București, România
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-blue-600">
                  Politica de confidențialitate
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-blue-600">
                  Termeni și condiții
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-600 hover:text-blue-600">
                  Politica de cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} EventApp. Toate drepturile rezervate.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 