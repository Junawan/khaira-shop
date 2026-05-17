const BITESHIP_API =
  "https://api.biteship.com/v1";

export async function createBiteshipOrder(
  payload: any
) {
  const response = await fetch(
    `${BITESHIP_API}/orders`,
    {
      method: "POST",

      headers: {
        Authorization:
          process.env
            .BITESHIP_API_KEY || "",

        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(
        payload
      ),
    }
  );

  const data =
    await response.json();

  return data;
}