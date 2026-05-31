import { OrderManagement } from './OrderManagement';

export const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card bg-primary text-white shadow">
          <div className="card-body">
            <h3 className="text-sm font-semibold">Total Orders</h3>
            <p className="text-3xl font-bold">1,234</p>
          </div>
        </div>
        <div className="card bg-success text-white shadow">
          <div className="card-body">
            <h3 className="text-sm font-semibold">Delivered</h3>
            <p className="text-3xl font-bold">892</p>
          </div>
        </div>
        <div className="card bg-warning text-white shadow">
          <div className="card-body">
            <h3 className="text-sm font-semibold">In Transit</h3>
            <p className="text-3xl font-bold">234</p>
          </div>
        </div>
        <div className="card bg-error text-white shadow">
          <div className="card-body">
            <h3 className="text-sm font-semibold">Pending</h3>
            <p className="text-3xl font-bold">108</p>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <OrderManagement />
        </div>
      </div>
    </div>
  );
};


