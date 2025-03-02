import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true 
      },
      description: { 
        type: String, 
        required: true 
      },
      shortDescription: { 
        type: String,
        trim: true,
        maxlength: 200 
      },
      category: { 
        type: String, 
        required: true,
        enum: ['Concert', 'Festival', 'Workshop', 'Conference', 'Party', 'Exhibition', 'SportEvent', 'Charity', 'Other']
      },
      subcategory: { 
        type: String,
        trim: true 
      },

      // date despre locatie
      location: {
        name: { 
          type: String,
          required: true,
          trim: true
        },
        address: { 
          type: String,
          required: true,
          trim: true
        },
        city: { 
          type: String, 
          required: true,
          trim: true
        },
        country: { 
          type: String, 
          required: true,
          trim: true,
          default: 'Romania'
        },
        coordinates: {
          latitude: Number,
          longitude: Number
        }
      },
      
      // Datele evenimentului
      dates: {
        start: { 
          type: Date, 
          required: true 
        },
        end: { 
          type: Date, 
          required: true,
          validate: {
            validator: function(value) {
              // validare data
              return this.dates.start <= value;
            },
            message: 'Data de incheiere trebuie sa fie dupa data de inceput!'
          }
        },
        doorsOpen: { 
          type: Date,
          validate: {
            validator: function(value) {
              return !value || value <= this.dates.start;
            },
            message: 'Ora de deschidere trebuie sa fie inainte de inceperea evenimentului!'
          }
        }
      },
      
      // Informații despre prețuri și bilete
      pricing: {
        isFree: { 
          type: Boolean, 
          default: false 
        },
        tickets: [{
          type: { 
            type: String, 
            required: true,
            trim: true 
          },
          price: { 
            type: Number, 
            required: true,
            min: 0 
          },
          currency: { 
            type: String, 
            default: 'RON',
            enum: ['RON', 'EUR', 'USD'] 
          },
          availableQuantity: { 
            type: Number, 
            min: 0 
          }
        }]
      },
      
      // Materiale media asociate evenimentului
      media: {
        coverImage: { 
          type: String,
          default: '../../resources/1.jpg' 
        },
        gallery: [String],
        videos: [String]
      },
      
      // Referință la organizator
      organizer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
      },
      
      // Statusul evenimentului
      status: { 
        type: String, 
        enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'], 
        default: 'DRAFT' 
      },
      
      // Informații despre capacitate
      capacity: { 
        type: Number, 
        min: 1 
      },
      currentAttendees: { 
        type: Number, 
        default: 0,
        min: 0,
        validate: {
          validator: function(value) {
            return !this.capacity || value <= this.capacity;
          },
          message: 'Numarul de participanti nu poate depasi capacitatea!'
        }
      },
      
      // Tag-uri pentru căutare
      tags: [{ 
        type: String,
        trim: true
      }],
      
      // setari de vizibilitate
      visibility: { 
        type: String, 
        enum: ['PUBLIC', 'PRIVATE', 'UNLISTED'], 
        default: 'PUBLIC' 
      }
}, {
    // Opțiuni pentru schema
    timestamps: true, // Actualizează automat câmpurile createdAt și updatedAt
    toJSON: { virtuals: true }, // Include virtuali când convertim în JSON
    toObject: { virtuals: true } // Include virtuali când convertim în obiect
});


const Event = mongoose.model('Event', eventSchema);
export default Event;