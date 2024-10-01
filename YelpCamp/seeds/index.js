const mongoose = require('mongoose');
const cities = require('./cities')
const campground = require('../models/campground');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new campground({
            //Your User ID
            author: '66ad548421cd0723f9ba9fde',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Camping is a great way to get away from the hustle and bustle of everyday life and enjoy the peace and quiet of nature. It can be a fun and rewarding experience for people of all ages, and there are many different ways to go camping',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [{
                url: 'https://res.cloudinary.com/deamcmwnd/image/upload/v1726760457/YelpCamp/ogfqibdyktbivy4uuudg.jpg',
                filename: 'YelpCamp/ogfqibdyktbivy4uuudg',
            },
            {
                url: 'https://res.cloudinary.com/deamcmwnd/image/upload/v1726760457/YelpCamp/yz2h0gf0km8154ldiarh.jpg',
                filename: 'YelpCamp/yz2h0gf0km8154ldiarh'
            }]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})