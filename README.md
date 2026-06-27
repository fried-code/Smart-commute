JECRC Hackathon Project 


SmartComute

Real-Time Bus Tracking & Booking Web App
BusTrack+ is a web application that allows users to:
View available buses in real-time on a map.
Search for routes by source, destination, or bus code.
View bus routes and stops on an interactive Leaflet.js map.
Open a booking modal and see the bus seat arrangement (visual only).
Get trip summaries and bus details.

 Features
Live Map Integration:
Uses Leaflet.js and OpenStreetMap to display routes and bus movement.
Simulated real-time bus movement using OSRM routing API.

Bus Search & Filter:
Search buses by From / To location or by Bus Code.
Route Visualization:
Displays the exact route with stops marked.

Bus Booking Modal:
Passenger name input.
Visual bus seat arrangement (non-selectable by default).
Total price calculation (if seat selection is re-enabled).
Generates a QR code ticket on booking confirmation.

Responsive UI:
Built with Bootstrap 5 for mobile and desktop compatibility.
Includes a user dropdown profile menu.

 Tech Stack
Frontend: HTML5, CSS3, Bootstrap 5
Mapping: Leaflet.js + OpenStreetMap + OSRM Routing API
JavaScript: Vanilla JS (no frameworks required)


 Setup & Usage

Clone or Download this repository.
Place all files in the same directory.
Open index.html in your browser.
The map, buses, and booking features will load automatically.

 No backend required — everything works on the frontend.

 Future Improvements
Add real database for bus schedules & bookings.
Integrate with live GPS data for actual bus locations.
Add payment gateway integration.
Enable real seat selection & booking confirmation.


