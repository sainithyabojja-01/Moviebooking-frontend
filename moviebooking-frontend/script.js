
const prices = {
    "Avengers Endgame": 250,
    "RRR": 200,
    "Pushpa 2": 220,
    "Devara": 180
};

// Select a movie from the movie card
function selectMovie(movieName) {
    const movieDropdown = document.getElementById("movie");

    movieDropdown.value = movieName;

    updateTotal();

    document.getElementById("booking").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Calculate the total ticket price
function updateTotal() {
    const movieDropdown = document.getElementById("movie");
    const ticketsDropdown = document.getElementById("tickets");
    const totalElement = document.getElementById("total");

    if (!movieDropdown || !ticketsDropdown || !totalElement) {
        return;
    }

    const selectedMovie = movieDropdown.value;
    const numberOfTickets = Number(ticketsDropdown.value);
    const ticketPrice = prices[selectedMovie] || 0;

    totalElement.textContent =
        "₹" + (ticketPrice * numberOfTickets);
}

// Run after the HTML page loads
document.addEventListener("DOMContentLoaded", function () {
    const bookingForm = document.getElementById("bookingForm");
    const movieDropdown = document.getElementById("movie");
    const ticketsDropdown = document.getElementById("tickets");
    const dateInput = document.getElementById("showDate");
    const statusMessage = document.getElementById("status");

    // Set today's date as the minimum booking date
    const now = new Date();

    const today = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];

    dateInput.min = today;

    // Update the price when movie or ticket quantity changes
    movieDropdown.addEventListener("change", updateTotal);
    ticketsDropdown.addEventListener("change", updateTotal);

    // Handle booking form submission
    bookingForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const customerName =
            document.getElementById("customerName").value.trim();

        const movie = movieDropdown.value;
        const showDate = dateInput.value;
        const showTime = document.getElementById("showTime").value;
        const numberOfTickets = Number(ticketsDropdown.value);

        // Validate customer details
        if (
            customerName === "" ||
            movie === "" ||
            showDate === "" ||
            showTime === ""
        ) {
            showMessage("Please fill in all the booking details.");
            return;
        }

        // Validate the selected date
        if (showDate < today) {
            showMessage("Please select today or a future date.");
            return;
        }

        // Validate the ticket quantity
        if (
            !Number.isInteger(numberOfTickets) ||
            numberOfTickets < 1 ||
            numberOfTickets > 10
        ) {
            showMessage("Please select between 1 and 10 tickets.");
            return;
        }

        // Calculate total amount
        const totalAmount = prices[movie] * numberOfTickets;

        // Display booking confirmation
        showMessage(
            "Booking details entered successfully! " +
            "Name: " + customerName +
            " | Movie: " + movie +
            " | Date: " + showDate +
            " | Show Time: " + showTime +
            " | Tickets: " + numberOfTickets +
            " | Total Amount: ₹" + totalAmount +
            ". Demo only: this booking has not been saved to MySQL."
        );
    });

    // Display a message to the user
    function showMessage(message) {
        statusMessage.hidden = false;
        statusMessage.textContent = message;

        statusMessage.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }

    // Show the initial total
    updateTotal();
});