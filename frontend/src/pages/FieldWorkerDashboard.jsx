import DashboardLayout from "../layouts/DashboardLayout";

const FieldWorkerDashboard = () => {
  return (
    <DashboardLayout>
      <div>
      <h1>Field Worker Dashboard</h1>

      <ul>
        <li>View assigned dispatches</li>
        <li>Confirm deliveries</li>
        <li>Submit proof (photo/signature)</li>
        <li>Update number of people helped</li>
      </ul>
    </div>
    </DashboardLayout>
  );
};

export default FieldWorkerDashboard;
