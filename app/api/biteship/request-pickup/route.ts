<div className="space-y-5">

  {/* PILIHAN METODE PENGIRIMAN */}

  <div>

    <label className="block mb-3 font-semibold">
      Metode Pengiriman
    </label>

    <div className="grid grid-cols-2 gap-4">

      {/* DROP OFF */}

      <button
        type="button"
        onClick={() =>
          setShippingMethod(
            "dropoff"
          )
        }
        className={`border rounded-2xl p-5 text-left transition ${
          shippingMethod ===
          "dropoff"
            ? "border-black bg-gray-100"
            : "border-gray-300"
        }`}
      >

        <h3 className="font-semibold text-lg">
          Drop Off
        </h3>

        <p className="text-sm text-gray-500 mt-2">
          Antar paket ke agen
          kurir sendiri
        </p>

      </button>

      {/* PICKUP */}

      <button
        type="button"
        onClick={() =>
          setShippingMethod(
            "pickup"
          )
        }
        className={`border rounded-2xl p-5 text-left transition ${
          shippingMethod ===
          "pickup"
            ? "border-black bg-gray-100"
            : "border-gray-300"
        }`}
      >

        <h3 className="font-semibold text-lg">
          Pickup Kurir
        </h3>

        <p className="text-sm text-gray-500 mt-2">
          Kurir pickup langsung
          ke toko
        </p>

      </button>

    </div>

  </div>

  {/* PILIHAN ONGKIR */}

  {shippingOptions.length > 0 && (
    <div className="space-y-3">

      <label className="font-semibold block">
        Pilih Pengiriman
      </label>

      {shippingOptions.map(
        (option, index) => (
          <button
            key={index}
            type="button"
            onClick={() =>
              setSelectedShipping(
                option
              )
            }
            className={`w-full border rounded-2xl p-4 text-left transition ${
              selectedShipping
                ?.courier_name ===
                option.courier_name &&
              selectedShipping?.courier_service_name ===
                option.courier_service_name
                ? "border-black bg-gray-100"
                : "border-gray-300"
            }`}
          >

            <div className="flex justify-between">

              <div>

                <p className="font-semibold">
                  {
                    option.courier_name
                  }
                </p>

                <p className="text-sm text-gray-500">
                  {
                    option.courier_service_name
                  }
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Estimasi{" "}
                  {option.duration}
                </p>

              </div>

              <div className="text-right">

                <p className="font-bold">
                  Rp
                  {option.price.toLocaleString()}
                </p>

              </div>

            </div>

          </button>
        )
      )}

    </div>
  )}

</div>