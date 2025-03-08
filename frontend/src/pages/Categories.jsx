import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { categoriesApi } from "../services/api.service";

const Categories = () => {
    const [loading , setLoading] = useState(false);
    const [eventCount, setEventCount] = useState({});
    const navigate = useNavigate();

    const categories = [
        {
            id: 'Concert',
            name: 'Concerts',
            icon: '🎵',
            description: 'Live music performances from your favourite artists',
            color: 'bg-purple-100 text-purple-800',
            hoverColor: 'hover:bg-purple-200'
        },
        { 
            id: 'Festival', 
            name: 'Festivals', 
            icon: '🎪', 
            description: 'Multi-day celebrations of music, art, and culture',
            color: 'bg-pink-100 text-pink-800',
            hoverColor: 'hover:bg-pink-200'
          },
          { 
            id: 'Workshop', 
            name: 'Workshops', 
            icon: '🛠️', 
            description: 'Hands-on learning experiences for various skills',
            color: 'bg-yellow-100 text-yellow-800',
            hoverColor: 'hover:bg-yellow-200'
          },
          { 
            id: 'Conference', 
            name: 'Conferences', 
            icon: '💼', 
            description: 'Professional gatherings for networking and knowledge sharing',
            color: 'bg-blue-100 text-blue-800',
            hoverColor: 'hover:bg-blue-200'
          },
          { 
            id: 'Party', 
            name: 'Parties', 
            icon: '🎉', 
            description: 'Social gatherings for celebration and entertainment',
            color: 'bg-red-100 text-red-800',
            hoverColor: 'hover:bg-red-200'
          },
          { 
            id: 'Exhibition', 
            name: 'Exhibitions', 
            icon: '🖼️', 
            description: 'Showcases of art, products, or ideas',
            color: 'bg-indigo-100 text-indigo-800',
            hoverColor: 'hover:bg-indigo-200'
          },
          { 
            id: 'SportEvent', 
            name: 'Sports Events', 
            icon: '⚽', 
            description: 'Competitive sporting events and tournaments',
            color: 'bg-green-100 text-green-800',
            hoverColor: 'hover:bg-green-200'
          },
          { 
            id: 'Charity', 
            name: 'Charity Events', 
            icon: '💝', 
            description: 'Fundraising and awareness events for good causes',
            color: 'bg-orange-100 text-orange-800',
            hoverColor: 'hover:bg-orange-200'
          },
          { 
            id: 'Other', 
            name: 'Other Events', 
            icon: '✨', 
            description: 'Unique events that don\'t fit in other categories',
            color: 'bg-gray-100 text-gray-800',
            hoverColor: 'hover:bg-gray-200'
          }
    ];

    useEffect(() => {
        const fetchCategoriesCounts = async () => {
            try {
                const count = await categoriesApi.getCategoryCounts();
                console.log("Count: ", count);
                setEventCount(count);
                console.log("concerte: ", eventCount && eventCount['Concert']);
            } catch (error) {
                console.error('Error fetching category counts:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchCategoriesCounts();
    }, []);


    const handleCategoryClick = (categoryId) => {
        navigate(`/events?category=${categoryId}`);
    };

    return (

        <div className="bg-white min-h-screen">

            {/** Hero section */}        
            <div className="bg-blue-600 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                    Event Categories
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-blue-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                    Browse events by category and find the perfect experiences to match your interests.
                </p>
                </div>
            </div>

            {/** Categories section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <div className="flex justify-center mt-10">
                        <span className="loading loading-dots loading-xl"></span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {categories.map((category) => (
                            <div 
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id)}
                                className={`group relative rounded-lg shadow-md overflow-hidden ${category.hoverColor} cursor-pointer transition-all duration-300 transform hover:scale-105`}
                            >
                                <div className=" absolute inset-0 bg-gradient-to-b from-blue-800 opacity-50 group-hover:opacity-90 transition-opacity duration-300"></div>

                                <div className="relative p-6 h-60 flex flex-col justify-between">
                                    <div>
                                        <div className={`inline-flex items-center justify-center p-3 rounded-full ${category.color} mb-4`}>
                                            <span className="text-2xl">{category.icon}</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-black group-hover:text-black mb-2">
                                        {category.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 group-hover:text-gray-600">
                                        {category.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end px-7 pb-3">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${category.color}`}>
                                        {eventCount[category.id] || 0} events
                                    </span>
                                    <span className="text-black group-hover:translate-x-2 transition-transform duration-300">
                                        Browse →
                                    </span>
                                </div>
                                <div className="absolute top-0 right-0 p-4 text-6xl opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                                    {category.icon}
                                </div>
                            </div>
                        ))} 
                    </div>
                )}
            </div>

             {/* Featured Events Teaser */}
            <div className="bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                    Discover Events For You
                    </h2>
                    <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                    Find upcoming events based on your interests
                    </p>
                </div>
                
                <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                    <Link
                    to="/events"
                    className="w-full md:w-auto px-8 py-4 border border-transparent text-base font-medium rounded-md shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    >
                        Browse All Events
                    </Link>
                    
                    <Link
                    to="/events?sortBy=date"
                    className="w-full md:w-auto px-8 py-4 border border-gray-300 text-base font-medium rounded-md shadow-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        Upcoming Events
                    </Link>
                    
                    <Link
                    to="/events?isFree=true"
                    className="w-full md:w-auto px-8 py-4 border border-gray-300 text-base font-medium rounded-md shadow-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        Free Events
                    </Link>
                </div>
                </div>
            </div>
        </div>
    )

}


export default Categories;