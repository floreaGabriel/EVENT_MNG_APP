import React, { useState } from 'react';
import { paymentsApi } from '../services/api.service';

const PaymentForm = ({ registration, onSuccess, onCancel }) => {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validare de bază (opțională)
    if (!cardDetails.cardNumber || !cardDetails.cardholderName || !cardDetails.expiryDate || !cardDetails.cvv) {
      setError('Te rugăm să completezi toate câmpurile.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Simulăm un delay pentru procesarea plății
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Procesăm plata și actualizăm statusul plății
      const response = await paymentsApi.processPayment(registration._id, cardDetails);
      
      if (response.success) {
        // Aici se va reflecta schimbarea statusului de plată în PAID
        // Serviciul API va actualiza înregistrarea în backend
        onSuccess(response.data);
      } else {
        setError(response.message || 'A apărut o eroare la procesarea plății.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('A apărut o eroare la procesarea plății. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-6 text-center text-gray-800">Procesare plată</h2>
      
      <div className="mb-6">
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="font-semibold text-blue-800">Detalii comandă</h3>
          <p className="text-sm text-gray-600 mt-2">Eveniment: {registration.event.title}</p>
          <p className="text-sm text-gray-600">Preț: {registration.totalPrice} {registration.currency}</p>
          <p className="text-sm text-gray-600">Tip bilet: {registration.ticketType}</p>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="cardNumber">
            Număr card
          </label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={cardDetails.cardNumber}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            maxLength="19"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="cardholderName">
            Nume deținător card
          </label>
          <input
            type="text"
            id="cardholderName"
            name="cardholderName"
            placeholder="Ioan Popescu"
            value={cardDetails.cardholderName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="expiryDate">
              Data expirării
            </label>
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              placeholder="MM/YY"
              value={cardDetails.expiryDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              maxLength="5"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="cvv">
              CVV/CVC
            </label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              placeholder="123"
              value={cardDetails.cvv}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              maxLength="4"
            />
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={loading}
          >
            Anulează
          </button>
          
          <button
            type="submit"
            className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesare...
              </div>
            ) : (
              'Plătește acum'
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-6">
        <p className="text-xs text-gray-500 text-center">
          Aceasta este o plată simulată. Nu introduce date reale de card.
        </p>
      </div>
    </div>
  );
};

export default PaymentForm;