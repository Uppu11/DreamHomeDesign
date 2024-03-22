import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Col, Row } from "antd";
import Staff from "../components/Staff";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/alertsSlice";

function Home() {
  const [staffs, setStaffs] = useState([]);
  const dispatch = useDispatch();

  const getData = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.get("/api/user/get-all-approved-Staffs", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      dispatch(hideLoading());
      if (response.data.success) {
        setStaffs(response.data.data);
      }
    } catch (error) {
      dispatch(hideLoading());
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <Layout>
      <Row gutter={20}>
        {staffs.map((staff) => ( // Adjusted variable name from Staff to staff
          <Col key={staff._id} span={8} xs={24} sm={24} lg={8}> {/* Added key prop */}
            <Staff staff={staff} /> {/* Adjusted prop name from Staff to staff */}
          </Col>
        ))}
      </Row>
    </Layout>
  );
}

export default Home;
