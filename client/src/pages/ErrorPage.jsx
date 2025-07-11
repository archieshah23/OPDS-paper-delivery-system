import errorimg from "../assets/errorpage.jpg";
export const ErrorPage = () => {
  return (
    <div>
      <h1>Oops!! </h1>
      <h1>something went wrong!!</h1>
      <h2>404 page not found</h2>
      <img src={errorimg} alt="error" />
    </div>
  );
};
