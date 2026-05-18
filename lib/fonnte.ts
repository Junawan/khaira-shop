export async function sendWhatsApp(
  target: string,
  message: string
) {
  try {
    const cleanNumber = target
      .replace(/^0/, "62")
      .replace(/\D/g, "");

    const response = await fetch(
      "https://api.fonnte.com/send",
      {
        method: "POST",

        headers: {
          Authorization:
            process.env.FONNTE_TOKEN!,
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          target: cleanNumber,
          message,
          countryCode: "62",
        }),
      }
    );

    const data = await response.json();

    console.log(
      "FONNTE RESPONSE:",
      data
    );

    return data;
  } catch (error) {
    console.log(
      "FONNTE ERROR:",
      error
    );
  }
}