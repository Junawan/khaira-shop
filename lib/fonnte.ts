export async function sendWhatsApp(
  target: string,
  message: string
) {
  const response =
    await fetch(
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
        }),
      }
    );

  return response.json();
}