import DashbordImage from "../../assets/images/dashboard.png";

const Greeting = () => {
  return (
    <section>
      <div className="mx-auto d-flex justify-content-center align-items-center">
        <div>
          <h3 className="fw-semibold">Hello!</h3>
          <p className="text-body-secondary">
            Manage users, view registrations, and control access.
          </p>
        </div>

        <div className="col-md-6 d-flex justify-content-center d-none d-md-flex">
          <img
            src={DashbordImage}
            alt="welcome"
            className="img-fluid rounded"
            width={370}
            height={220}
          />
        </div>
      </div>
    </section>
  );
};

export default Greeting;
