import React from "react";
import { useNavigate } from "react-router-dom";

function Staff({ staff }) {
  const navigate = useNavigate();

  if (!staff) {
    return null; // or render a loading indicator or placeholder
  }

  return (
    <div
      className="card p-2 cursor-pointer"
      onClick={() => navigate(`/book-appointment/${staff._id}`)}
    >
      <h1 className="card-title">
        {staff.firstName} {staff.lastName}
      </h1>
      <hr />
      <p>
        <b>Phone Number : </b>
        {staff.phoneNumber}
      </p>
      <p>
        <b>Address : </b>
        {staff.address}
      </p>
      <p>
        <b>Fee per Visit : </b>
        {staff.feePerVisit}
      </p>
      <p>
        <b>Timings : </b>
        {staff.timings && staff.timings.length > 1 ? (
          `${staff.timings[0]} - ${staff.timings[1]}`
        ) : (
          "No timings available"
        )}
      </p>
    </div>
  );
}

export default Staff;
