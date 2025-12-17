export default function PendingApproval() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-6 rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-2">
          Approval Pending ⏳
        </h2>
        <p className="text-gray-600">
          Your account request has been sent to the SuperAdmin.
          You’ll get access once it’s approved.
        </p>
      </div>
    </div>
  );
}
