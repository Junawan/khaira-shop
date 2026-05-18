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
            process.env.FONNTE_TOKEN!,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          target,
          message,
        }),
      }
    );

    const result =
      await response.json();

    console.log(
      "FONNTE RESULT:",
      result
    );

    return result;
  } catch (error) {
    console.log(
      "FONNTE ERROR:",
      error
    );
  }
}