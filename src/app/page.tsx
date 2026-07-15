import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Today's Patients</h3>
          <p className="text-4xl font-bold mt-4">42</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Waiting</h3>
          <p className="text-4xl font-bold mt-4">7</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Completed</h3>
          <p className="text-4xl font-bold mt-4">18</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Revenue</h3>
          <p className="text-4xl font-bold mt-4">12,500 EGP</p>
        </div>

      </div>
    </DashboardLayout>
  );
}
