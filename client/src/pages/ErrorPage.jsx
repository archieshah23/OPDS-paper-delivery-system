import errorimg from "../assets/errorpage.jpg";
import "../design/error.css";

export const ErrorPage = () => {
  return (
    <div className="error-container">
      <h1 className="error-title">Oops!</h1>
      <p className="error-subtitle">Something went wrong...</p>
      <h2 className="error-code">404 - Page Not Found</h2>

      <img src={errorimg} alt="Error" className="error-image" />

      <a href="/" className="error-btn">
        Go Back Home
      </a>
    </div>
  );
};
