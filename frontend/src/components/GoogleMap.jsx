// src/components/GoogleMap.jsx
import { useState, useEffect, useRef } from 'react';

const GoogleMap = ({ latitude, longitude, locationName }) => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Check if the Google Maps script is already loaded
    if (!document.getElementById('google-maps-script')) {
      // Replace 'YOUR_API_KEY' with your actual Google Maps API key
      const apiKey = 'AIzaSyCXV6dddPKeOeAOfi0c9l_zNIkjejTuZio';
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }

    return () => {
      // Clean up if needed
      const script = document.getElementById('google-maps-script');
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize map when the script is loaded and coordinates are available
  useEffect(() => {
    if (mapLoaded && latitude && longitude && mapRef.current) {
      const location = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
      
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: location,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      // Add marker for the event location
      const marker = new window.google.maps.Marker({
        position: location,
        map: map,
        title: locationName || 'Event Location'
      });

      // Optional: Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div><strong>${locationName || 'Event Location'}</strong></div>`
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    }
  }, [mapLoaded, latitude, longitude, locationName]);

  // If coordinates are not provided, show a message
  if (!latitude || !longitude) {
    return (
      <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
        <p className="text-gray-500">Location coordinates not available</p>
      </div>
    );
  }

  return (
    <div className="rounded-md overflow-hidden shadow-md">
      <div 
        ref={mapRef} 
        className="h-64 w-full bg-gray-200"
        aria-label="Google Map showing event location"
      >
        {!mapLoaded && (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
      <div className="bg-gray-100 p-3 text-right">
        <a 
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${locationName}, ${latitude},${longitude}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <span>Open in Google Maps</span>
          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
        </a>
      </div>
    </div>
  );
};

export default GoogleMap;