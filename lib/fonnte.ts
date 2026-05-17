export async function sendWhatsApp(
  target: string,
  message: string
) {
  try {
    const response = await fetch(
      "https://api.fonnte.com/send",
      {
        method: "POST",

        headers: {
          Authorization:
            process.env
              .FONNTE_TOKEN || "",

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          target,
          message,
          countryCode: "62",
        }),
      }
    );

    const data =
      await response.json();

    console.log(
      "FONNTE:",
      data
    );

    return data;
  } catch (error) {
    console.log(error);
  }
}