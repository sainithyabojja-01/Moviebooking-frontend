
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [movies, setMovies] = useState([]);
  const [message, setMessage] = useState("Loading movies...");
  const [customerName, setCustomerName] = useState("");
  const [movieTitle, setMovieTitle] = useState("");
  const [tickets, setTickets] = useState(1);

  const [bookingMessage, setBookingMessage] = useState("");
  const [step, setStep] = useState("booking");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8080/api/movies")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load movies");
        return response.json();
      })
      .then((data) => {
        setMovies(data);
        setMessage(data.length === 0 ? "No movies available." : "");
      })
      .catch(() => {
        setMessage("Cannot connect to backend. Please check Spring Boot.");
      });
  }, []);

  const selectedMovie = movies.find(
    (movie) => movie.title === movieTitle
  );

  const totalPrice = selectedMovie
    ? Number(tickets) * Number(selectedMovie.price)
    : 0;

  function goToPayment(event) {
    event.preventDefault();
    setBookingMessage("");

    if (!customerName.trim()) {
      setBookingMessage("Please enter your name.");
      return;
    }

    if (!selectedMovie) {
      setBookingMessage("Please select a movie.");
      return;
    }

    if (tickets < 1 || tickets > 10) {
      setBookingMessage("Please select between 1 and 10 tickets.");
      return;
    }

    setStep("payment");
  }

  async function completeDemoPayment() {
    if (loading) return;

    setLoading(true);
    setBookingMessage("");

    try {
      const response = await fetch(
        "http://localhost:8080/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerName: customerName.trim(),
            movieTitle: selectedMovie.title,
            numberOfTickets: Number(tickets),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Booking failed");
      }

      const booking = await response.json();

      setConfirmedBooking({
        ...booking,
        movieTitle: booking.movieTitle || selectedMovie.title,
        numberOfTickets:
          booking.numberOfTickets ?? Number(tickets),
        totalPrice,
        paymentMethod,
        paymentStatus: "Demo payment successful",
      });

      setStep("success");
    } catch {
      setBookingMessage(
        "Booking failed. Check that Spring Boot is running and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function startNewBooking() {
    setCustomerName("");
    setMovieTitle("");
    setTickets(1);
    setBookingMessage("");
    setConfirmedBooking(null);
    setStep("booking");
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🎬 Movie Ticket Booking System</h1>
        <p>Book your favourite movies with ease!</p>
      </header>

      {step === "booking" && (
        <>
          <section>
            <h2>🎥 Now Showing</h2>
            {message && <p>{message}</p>}

            <div className="movies">
              {movies.map((movie) => (
                <div className="movie-card" key={movie.id}>
                  <h3>{movie.title}</h3>
                  <p><strong>Genre:</strong> {movie.genre}</p>
                  <p><strong>Language:</strong> {movie.language}</p>
                  <p><strong>Duration:</strong> {movie.duration} minutes</p>
                  <p><strong>Price:</strong> ₹{movie.price}</p>

                  <button
                    type="button"
                    onClick={() => setMovieTitle(movie.title)}
                  >
                    Select Movie
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>🎟️ Book Your Tickets</h2>

            <form onSubmit={goToPayment}>
              <label htmlFor="customerName">Your Name</label>
              <input
                id="customerName"
                type="text"
                placeholder="Enter your name"
                value={customerName}
                onChange={(event) =>
                  setCustomerName(event.target.value)
                }
                required
              />

              <label htmlFor="movieTitle">Select Movie</label>
              <select
                id="movieTitle"
                value={movieTitle}
                onChange={(event) =>
                  setMovieTitle(event.target.value)
                }
                required
              >
                <option value="">Choose a movie</option>
                {movies.map((movie) => (
                  <option key={movie.id} value={movie.title}>
                    {movie.title} - ₹{movie.price}
                  </option>
                ))}
              </select>

              <label htmlFor="tickets">Number of Tickets</label>
              <input
                id="tickets"
                type="number"
                min="1"
                max="10"
                value={tickets}
                onChange={(event) =>
                  setTickets(Number(event.target.value))
                }
                required
              />

              <h3>Total Price: ₹{totalPrice}</h3>

              <button type="submit" disabled={movies.length === 0}>
                Continue to Payment
              </button>

              {bookingMessage && (
                <p role="alert">{bookingMessage}</p>
              )}
            </form>
          </section>
        </>
      )}

      {step === "payment" && (
        <section className="payment-section">
          <h2>💳 Payment</h2>
          <h3>Booking Summary</h3>
          <p><strong>Name:</strong> {customerName}</p>
          <p><strong>Movie:</strong> {selectedMovie?.title}</p>
          <p><strong>Tickets:</strong> {tickets}</p>
          <h2>Total Amount: ₹{totalPrice}</h2>

          <label htmlFor="paymentMethod">Choose Payment Method</label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
          >
            <option value="UPI">UPI (Demo)</option>
            <option value="Card">Debit/Credit Card (Demo)</option>
            <option value="Net Banking">Net Banking (Demo)</option>
            <option value="Cash">Cash at Counter (Demo)</option>
          </select>

          <p>
            This is a demonstration payment. No real money will be
            charged.
          </p>

          <button
            type="button"
            onClick={completeDemoPayment}
            disabled={loading}
          >
            {loading ? "Processing..." : "Pay Now (Demo)"}
          </button>

          <button
            type="button"
            onClick={() => {
              setBookingMessage("");
              setStep("booking");
            }}
            disabled={loading}
          >
            Back to Booking
          </button>

          {bookingMessage && (
            <p role="alert">{bookingMessage}</p>
          )}
        </section>
      )}

      {step === "success" && confirmedBooking && (
        <section className="success-section">
          <h2>✅ Booking Successful!</h2>
          <p>Your movie ticket booking has been confirmed.</p>
          <hr />

          <p>
            <strong>Booking ID:</strong> {confirmedBooking.id}
          </p>
          <p>
            <strong>Name:</strong> {customerName}
          </p>
          <p>
            <strong>Movie:</strong> {confirmedBooking.movieTitle}
          </p>
          <p>
            <strong>Number of Tickets:</strong>{" "}
            {confirmedBooking.numberOfTickets}
          </p>
          <p>
            <strong>Payment Method:</strong>{" "}
            {confirmedBooking.paymentMethod}
          </p>
          <p>
            <strong>Amount:</strong> ₹{confirmedBooking.totalPrice}
          </p>
          <p>
            <strong>Payment Status:</strong>{" "}
            {confirmedBooking.paymentStatus}
          </p>

          <p>🎬 Enjoy your movie!</p>

          <button type="button" onClick={startNewBooking}>
            Book Another Movie
          </button>
        </section>
      )}

      <footer>
        <p>© 2026 Movie Ticket Booking System</p>
      </footer>
    </div>
  );
}

export default App;