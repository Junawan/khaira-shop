export default function AdminPage() {
  return (
    <main>

      <div className="mb-10">

        <h1 className="text-4xl font-bold">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-3">
          Welcome back admin
        </p>

      </div>

      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-white rounded-3xl p-6 shadow-sm">

          <p className="text-gray-500">
            Total Orders
          </p>

          <h2 className="text-4xl font-black mt-4">
            120
          </h2>

        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">

          <p className="text-gray-500">
            Revenue
          </p>

          <h2 className="text-4xl font-black mt-4">
            Rp12JT
          </h2>

        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">

          <p className="text-gray-500">
            Customers
          </p>

          <h2 className="text-4xl font-black mt-4">
            89
          </h2>

        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">

          <p className="text-gray-500">
            Products
          </p>

          <h2 className="text-4xl font-black mt-4">
            45
          </h2>

        </div>

      </div>

    </main>
  );
}