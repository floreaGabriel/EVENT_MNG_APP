import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { eventsApi } from "../services/api.service";

const CreateEvent = ({user}) => {


    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // State variables
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        shortDescription: '',
        category: '',
        subcategory: '',
        tags: [],
        location: {
        name: '',
        address: '',
        city: '',
        country: 'Romania',
        coordinates: {
            latitude: '',
            longitude: ''
        }
        },
        dates: {
        start: new Date(),
        end: new Date(Date.now() + 3600000), // Default to 1 hour after start
        doorsOpen: ''
        },
        pricing: {
        isFree: false,
        tickets: [
            {
            type: 'General Admission',
            price: 0,
            currency: 'RON',
            availableQuantity: 100
            }
        ]
        },
        capacity: '',
        status: 'DRAFT',
        visibility: 'PUBLIC',
        media: {
        coverImage: ''
        }
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [coverImagePreview, setCoverImagePreview] = useState('');
    const [coverImageFile, setCoverImageFile] = useState(null);

    // Redirect if not an organizer
    useEffect(() => {

        if (!user || !user.roles || !user.roles.includes('ORGANIZER')) {
            navigate('/login?message=You must be logged in as an organizer to create events');
        }
    }, [user, navigate]);

    // Handle basic input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
        ...prevData,
        [name]: value
        }));
    };

    // Handle nested object properties
    const handleNestedInputChange = (e) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        
        setFormData((prevData) => {
        const newData = { ...prevData };
        let current = newData;
        
        // Navigate to the nested property
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
            current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        // Set the value
        current[keys[keys.length - 1]] = value;
        return newData;
        });
    };

    // Handle checkbox changes for nested objects
    const handleNestedCheckboxChange = (e) => {
        const { name, checked } = e.target;
        const keys = name.split('.');
        
        setFormData((prevData) => {
        const newData = { ...prevData };
        let current = newData;
        
        // Navigate to the nested property
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
            current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        // Set the value
        current[keys[keys.length - 1]] = checked;
        return newData;
        });
    };

    // Handle tags input
    const handleTagsChange = (e) => {
        const tagsString = e.target.value;
        // Split by commas and trim whitespace
        const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        
        setFormData(prevData => ({
        ...prevData,
        tags: tagsArray
        }));
    };

    // Add a new ticket type
    const addTicketType = () => {
        setFormData(prevData => ({
        ...prevData,
        pricing: {
            ...prevData.pricing,
            tickets: [
            ...prevData.pricing.tickets,
            {
                type: '',
                price: 0,
                currency: 'RON',
                availableQuantity: 100
            }
            ]
        }
        }));
    };

    // Remove a ticket type
    const removeTicketType = (index) => {
        setFormData(prevData => ({
        ...prevData,
        pricing: {
            ...prevData.pricing,
            tickets: prevData.pricing.tickets.filter((_, i) => i !== index)
        }
        }));
    };

    // Handle changes to ticket properties
    const handleTicketChange = (index, field, value) => {
        setFormData(prevData => {
        const newTickets = [...prevData.pricing.tickets];
        newTickets[index] = {
            ...newTickets[index],
            [field]: value
        };
        
        return {
            ...prevData,
            pricing: {
            ...prevData.pricing,
            tickets: newTickets
            }
        };
        });
    };

    // Trigger file input click
    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    // Handle cover image upload
    const handleCoverImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
        setError('Image is too large. Maximum size is 5MB.');
        return;
        }

        // Preview the image
        const reader = new FileReader();
        reader.onload = () => {
        setCoverImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        setCoverImageFile(file);
    };

    // Remove cover image
    const removeCoverImage = () => {
        setCoverImagePreview('');
        setCoverImageFile(null);
        if (fileInputRef.current) {
        fileInputRef.current.value = '';
        }
    };

    // Format date for datetime-local input
    const formatDateTimeLocal = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().slice(0, 16);
    };

    // Validate form
    const validateForm = () => {
        // Basic validation
        if (!formData.title.trim()) {
        setError('Event title is required');
        return false;
        }
        if (!formData.description.trim()) {
        setError('Event description is required');
        return false;
        }
        if (!formData.category) {
        setError('Please select a category');
        return false;
        }
        if (!formData.location.name.trim() || !formData.location.address.trim() || !formData.location.city.trim()) {
        setError('Venue name, address, and city are required');
        return false;
        }
        if (!formData.dates.start || !formData.dates.end) {
        setError('Start and end dates are required');
        return false;
        }

        // Validate ticket information if not a free event
        if (!formData.pricing.isFree) {
        if (!formData.pricing.tickets.length) {
            setError('Please add at least one ticket type');
            return false;
        }
        
        // Validate each ticket
        for (let i = 0; i < formData.pricing.tickets.length; i++) {
            const ticket = formData.pricing.tickets[i];
            if (!ticket.type.trim()) {
            setError(`Ticket #${i + 1} needs a name`);
            return false;
            }
            if (ticket.price < 0) {
            setError(`Ticket #${i + 1} price cannot be negative`);
            return false;
            }
        }
        }

        setError('');
        return true;
    };

    // Convert cover image to base64
    const getBase64FromFile = (file) => {
        return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createEvent(false);
    };

    // Function to create event (used for both regular submit and save as draft)
    const createEvent = async (asDraft = false) => {
        try {
            console.log("Handle submit");
            // Prevent multiple submissions
            if (isSubmitting) return;
    
            // Validate form
            if (!validateForm()) return;
    
            setIsSubmitting(true);
    
            // Prepare data for submission
            const eventData = { ...formData };
    
            // Set status if saving as draft
            eventData.status = asDraft ? 'DRAFT' : formData.status;
    
            // Convert dates to ISO format
            if (eventData.dates.start) {
                eventData.dates.start = new Date(eventData.dates.start).toISOString();
            }
            if (eventData.dates.end) {
                eventData.dates.end = new Date(eventData.dates.end).toISOString();
            }
            if (eventData.dates.doorsOpen) {
                eventData.dates.doorsOpen = new Date(eventData.dates.doorsOpen).toISOString();
            }
    
            // Add the cover image file directly to eventData
            if (coverImageFile) {
                eventData.coverImage = coverImageFile; // Pass the File object directly
            }
    
            // Use our API service to create the event
            const data = await eventsApi.createEvent(eventData);
    
            navigate(`/events/${data.data._id}`);
        } catch (error) {
            if (error.response && error.response.status === 403 && 
                error.response.data.message.includes('reached your monthly limit of 5 events')) {
                // Show alert for plan limit error
                alert('You have reached your monthly limit of 5 events for your FREE plan. Please upgrade your plan to create more events.');
                setError('Plan limit reached. Please upgrade your subscription.');
            } else {
                setError(error.message || 'An error occurred while creating the event');
                console.error('Error creating event:', error);
            }
        } finally {
            setIsSubmitting(false);
        }
    };


        return (
    <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Event</h1>
            
            

            <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="bg-gray-50 p-5 rounded-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="col-span-full">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                    </label>
                    <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    required
                    />
                </div>
                
                <div className="col-span-full">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                    </label>
                    <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    required
                    />
                </div>
                
                <div className="col-span-full">
                    <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description (max 200 characters)
                    </label>
                    <textarea
                    id="shortDescription"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    rows={2}
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                    {formData.shortDescription?.length || 0}/200 characters
                    </p>
                </div>
                
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                    </label>
                    <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    required
                    >
                    <option value="" disabled>Select a category</option>
                    <option value="Concert">Concert</option>
                    <option value="Festival">Festival</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Conference">Conference</option>
                    <option value="Party">Party</option>
                    <option value="Exhibition">Exhibition</option>
                    <option value="SportEvent">Sport Event</option>
                    <option value="Charity">Charity</option>
                    <option value="Other">Other</option>
                    </select>
                </div>
                
                <div>
                    <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategory
                    </label>
                    <input
                    type="text"
                    id="subcategory"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    />
                </div>
                
                <div className="col-span-full">
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (separated by commas)
                    </label>
                    <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags?.join(', ')}
                    onChange={handleTagsChange}
                    placeholder="music, outdoor, family-friendly"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    />
                </div>
                </div>
            </div>
            
            {/* Location Section */}
            <div className="bg-gray-50 p-5 rounded-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="col-span-full">
                    <label htmlFor="location.name" className="block text-sm font-medium text-gray-700 mb-1">
                    Venue Name *
                    </label>
                    <input
                    type="text"
                    id="location.name"
                    name="location.name"
                    value={formData.location?.name}
                    onChange={handleNestedInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    required
                    />
                </div>
                
                <div className="col-span-full">
                    <label htmlFor="location.address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                    </label>
                    <input
                    type="text"
                    id="location.address"
                    name="location.address"
                    value={formData.location?.address}
                    onChange={handleNestedInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    required
                    />
                </div>
                
                <div>
                    <label htmlFor="location.city" className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                    </label>
                    <input
                    type="text"
                    id="location.city"
                    name="location.city"
                    value={formData.location?.city}
                    onChange={handleNestedInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    required
                    />
                </div>
                
                <div>
                    <label htmlFor="location.country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                    </label>
                    <input
                    type="text"
                    id="location.country"
                    name="location.country"
                    value={formData.location?.country || 'Romania'}
                    onChange={handleNestedInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    />
                </div>
                
                <div>
                    <label htmlFor="location.coordinates.latitude" className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                    </label>
                    <input
                    type="number"
                    step="0.000001"
                    id="location.coordinates.latitude"
                    name="location.coordinates.latitude"
                    value={formData.location?.coordinates?.latitude || ''}
                    onChange={handleNestedInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    />
                </div>
                
                <div>
                    <label htmlFor="location.coordinates.longitude" className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                    </label>
                    <input
                    type="number"
                    step="0.000001"
                    id="location.coordinates.longitude"
                    name="location.coordinates.longitude"
                    value={formData.location?.coordinates?.longitude || ''}
                    onChange={handleNestedInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    />
                </div>
                </div>
            </div>
            
            {/* Date & Time Section */}
            <div className="bg-gray-50 p-5 rounded-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Date & Time</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                    <label htmlFor="dates.start" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time *
                    </label>
                    <input
                    type="datetime-local"
                    id="dates.start"
                    name="dates.start"
                    value={formatDateTimeLocal(formData.dates?.start)}
                    onChange={handleNestedInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    required
                    />
                </div>
                
                <div>
                    <label htmlFor="dates.end" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time *
                    </label>
                    <input
                    type="datetime-local"
                    id="dates.end"
                    name="dates.end"
                    value={formatDateTimeLocal(formData.dates?.end)}
                    onChange={handleNestedInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    required
                    />
                </div>
                
                <div>
                    <label htmlFor="dates.doorsOpen" className="block text-sm font-medium text-gray-700 mb-1">
                    Doors Open Time
                    </label>
                    <input
                    type="datetime-local"
                    id="dates.doorsOpen"
                    name="dates.doorsOpen"
                    value={formatDateTimeLocal(formData.dates?.doorsOpen)}
                    onChange={handleNestedInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    />
                </div>
                </div>
            </div>
            
            {/* Ticket Information */}
            <div className="bg-gray-50 p-5 rounded-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Ticket Information</h2>
                <div className="grid grid-cols-1 gap-y-4">
                <div className="flex items-center mb-2">
                    <input
                    type="checkbox"
                    id="pricing.isFree"
                    name="pricing.isFree"
                    checked={formData.pricing?.isFree || false}
                    onChange={handleNestedCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="pricing.isFree" className="ml-2 block text-sm font-medium text-gray-700">
                    This is a free event
                    </label>
                </div>
                
                {!formData.pricing?.isFree && (
                    <>
                    <div className="mt-4 mb-2">
                        <button
                        type="button"
                        onClick={addTicketType}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Ticket Type
                        </button>
                    </div>
                    
                    {formData.pricing?.tickets?.map((ticket, index) => (
                        <div key={index} className="border border-gray-200 rounded-md p-4 relative">
                        <button
                            type="button"
                            onClick={() => removeTicketType(index)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                            <div>
                            <label htmlFor={`pricing.tickets.${index}.type`} className="block text-sm font-medium text-gray-700 mb-1">
                                Ticket Type *
                            </label>
                            <input
                                type="text"
                                id={`pricing.tickets.${index}.type`}
                                name={`pricing.tickets.${index}.type`}
                                value={ticket.type || ''}
                                onChange={(e) => handleTicketChange(index, 'type', e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                required
                            />
                            </div>
                            
                            <div>
                            <label htmlFor={`pricing.tickets.${index}.price`} className="block text-sm font-medium text-gray-700 mb-1">
                                Price *
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                id={`pricing.tickets.${index}.price`}
                                name={`pricing.tickets.${index}.price`}
                                value={ticket.price || ''}
                                onChange={(e) => handleTicketChange(index, 'price', parseFloat(e.target.value))}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                required
                            />
                            </div>
                            
                            <div>
                            <label htmlFor={`pricing.tickets.${index}.currency`} className="block text-sm font-medium text-gray-700 mb-1">
                                Currency
                            </label>
                            <select
                                id={`pricing.tickets.${index}.currency`}
                                name={`pricing.tickets.${index}.currency`}
                                value={ticket.currency || 'RON'}
                                onChange={(e) => handleTicketChange(index, 'currency', e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                            >
                                <option value="RON">RON</option>
                                <option value="EUR">EUR</option>
                                <option value="USD">USD</option>
                            </select>
                            </div>
                            
                            <div>
                            <label htmlFor={`pricing.tickets.${index}.availableQuantity`} className="block text-sm font-medium text-gray-700 mb-1">
                                Available Quantity
                            </label>
                            <input
                                type="number"
                                min="0"
                                id={`pricing.tickets.${index}.availableQuantity`}
                                name={`pricing.tickets.${index}.availableQuantity`}
                                value={ticket.availableQuantity || ''}
                                onChange={(e) => handleTicketChange(index, 'availableQuantity', parseInt(e.target.value))}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                            />
                            </div>
                        </div>
                        </div>
                    ))}
                    </>
                )}
                </div>
            </div>
            
            {/* Capacity & Status */}
            <div className="bg-gray-50 p-5 rounded-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Capacity & Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Capacity
                    </label>
                    <input
                    type="number"
                    min="1"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    />
                </div>
                
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Status
                    </label>
                    <select
                    id="status"
                    name="status"
                    value={formData.status || 'DRAFT'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    </select>
                </div>
                
                <div>
                    <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
                    Visibility
                    </label>
                    <select
                    id="visibility"
                    name="visibility"
                    value={formData.visibility || 'PUBLIC'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                    <option value="UNLISTED">Unlisted</option>
                    </select>
                </div>
                </div>
            </div>
            
            {/* Media Section */}
            <div className="bg-gray-50 p-5 rounded-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Media</h2>
                <div className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image
                    </label>
                    
                    {coverImagePreview ? (
                    <div className="mb-4 relative">
                        <img 
                        src={coverImagePreview} 
                        alt="Cover preview" 
                        className="w-full h-48 object-cover rounded-md"
                        />
                        <button
                        type="button"
                        onClick={removeCoverImage}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                        >
                        <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        </button>
                    </div>
                    ) : (
                    <div 
                        onClick={triggerFileInput}
                        className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center cursor-pointer hover:border-blue-500 transition-colors"
                    >
                        <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">Click to upload a cover image</p>
                        <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
                    </div>
                    )}
                    
                    <input
                    type="file"
                    id="coverImage"
                    ref={fileInputRef}
                    onChange={handleCoverImageChange}
                    className="hidden"
                    accept="image/*"
                    />
                </div>
                </div>
            </div>
            
            {/* Submit Section */}
            <div className="flex justify-between items-center pt-6">
                <button
                type="button"
                onClick={() => navigate('/events')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                Cancel
                </button>
                
                <div className="flex space-x-4">
                <button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    className="px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Save as Draft
                </button>
                
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                    </span>
                    ) : 'Create Event'}
                </button>
                </div>
            </div>

            {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
            </div>
            )}
            
            </form>
        </div>
        </div>
    </div>
);
}


export default CreateEvent;